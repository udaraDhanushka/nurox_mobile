import payhereService, { 
  type PayHereNotification, 
  type PaymentVerificationResult 
} from './payhereService';
import paymentService from './paymentService';
import appointmentService from './appointmentService';

// Enhanced payment status type
export type PaymentStatus = 
  | 'PENDING' 
  | 'SUCCESS' 
  | 'FAILED' 
  | 'CANCELED' 
  | 'CHARGEDBACK' 
  | 'PROCESSING' 
  | 'EXPIRED';

export interface PaymentStatusUpdate {
  paymentId: string;
  orderId: string;
  appointmentId?: string;
  status: PaymentStatus;
  transactionId?: string;
  amount?: number;
  currency?: string;
  verificationResult: PaymentVerificationResult;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface PaymentVerificationError {
  code: string;
  message: string;
  details?: any;
}

class PaymentVerificationService {
  private readonly VERIFICATION_TIMEOUT = 30000; // 30 seconds
  private verificationAttempts = new Map<string, number>();

  /**
   * Process PayHere payment notification webhook
   * This method should be called when receiving webhook notifications
   */
  async processPayHereNotification(
    notification: PayHereNotification
  ): Promise<PaymentStatusUpdate> {
    try {
      console.log('Processing PayHere notification for order:', notification.order_id);

      // Step 1: Verify the payment notification signature
      const verificationResult = payhereService.verifyPaymentNotification(notification);
      
      if (!verificationResult.isValid) {
        throw new Error(`Payment verification failed: ${verificationResult.error}`);
      }

      // Step 2: Extract appointment ID from custom fields or order ID
      const appointmentId = notification.custom_1 || this.extractAppointmentId(notification.order_id);
      
      // Step 3: Create payment status update
      const statusUpdate: PaymentStatusUpdate = {
        paymentId: notification.payment_id,
        orderId: notification.order_id,
        appointmentId,
        status: verificationResult.status,
        transactionId: notification.payment_id,
        amount: verificationResult.transactionAmount,
        currency: notification.payhere_currency,
        verificationResult,
        timestamp: new Date().toISOString(),
        metadata: {
          method: notification.method,
          statusMessage: notification.status_message,
          cardInfo: notification.card_no ? {
            holderName: notification.card_holder_name,
            maskedNumber: notification.card_no,
            expiry: notification.card_expiry
          } : undefined
        }
      };

      // Step 4: Update payment status in our system
      await this.updatePaymentStatus(statusUpdate);

      // Step 5: Update appointment status if payment successful
      if (verificationResult.status === 'SUCCESS' && appointmentId) {
        await this.updateAppointmentPaymentStatus(appointmentId, statusUpdate);
      }

      // Step 6: Handle failed payments
      if (['FAILED', 'CANCELED', 'CHARGEDBACK'].includes(verificationResult.status)) {
        await this.handleFailedPayment(statusUpdate);
      }

      console.log('PayHere notification processed successfully:', {
        orderId: notification.order_id,
        status: verificationResult.status,
        appointmentId
      });

      return statusUpdate;
    } catch (error) {
      console.error('Error processing PayHere notification:', error);
      throw error;
    }
  }

  /**
   * Verify payment status by polling PayHere or our backend
   * Use this for client-side payment status checking
   */
  async verifyPaymentStatus(
    orderId: string, 
    maxAttempts: number = 10,
    intervalMs: number = 3000
  ): Promise<PaymentStatusUpdate> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const attemptKey = `${orderId}_${Date.now()}`;
      this.verificationAttempts.set(attemptKey, 0);

      const checkStatus = async () => {
        try {
          attempts++;
          this.verificationAttempts.set(attemptKey, attempts);

          // Check payment status from our backend
          const paymentDetails = await this.getPaymentByOrderId(orderId);
          
          if (paymentDetails && paymentDetails.status !== 'PENDING') {
            this.verificationAttempts.delete(attemptKey);
            resolve(paymentDetails);
            return;
          }

          if (attempts >= maxAttempts) {
            this.verificationAttempts.delete(attemptKey);
            reject(new Error('Payment verification timeout - status still pending'));
            return;
          }

          // Continue polling
          setTimeout(checkStatus, intervalMs);
        } catch (error) {
          console.error(`Payment verification attempt ${attempts} failed:`, error);
          
          if (attempts >= maxAttempts) {
            this.verificationAttempts.delete(attemptKey);
            reject(error);
            return;
          }

          // Retry with exponential backoff
          const nextInterval = Math.min(intervalMs * Math.pow(1.5, attempts - 1), 10000);
          setTimeout(checkStatus, nextInterval);
        }
      };

      // Start verification
      checkStatus();

      // Set overall timeout
      setTimeout(() => {
        if (this.verificationAttempts.has(attemptKey)) {
          this.verificationAttempts.delete(attemptKey);
          reject(new Error('Payment verification timeout'));
        }
      }, this.VERIFICATION_TIMEOUT);
    });
  }

  /**
   * Update payment status in our system
   */
  private async updatePaymentStatus(statusUpdate: PaymentStatusUpdate): Promise<void> {
    try {
      await paymentService.confirmPayment({
        orderId: statusUpdate.orderId,
        paymentId: statusUpdate.paymentId,
        payhereData: {
          status: statusUpdate.status,
          transactionId: statusUpdate.transactionId,
          amount: statusUpdate.amount,
          currency: statusUpdate.currency,
          verificationResult: statusUpdate.verificationResult,
          metadata: statusUpdate.metadata
        }
      });

      console.log('Payment status updated successfully:', {
        orderId: statusUpdate.orderId,
        status: statusUpdate.status
      });
    } catch (error) {
      console.error('Failed to update payment status:', error);
      throw new Error('Payment status update failed');
    }
  }

  /**
   * Update appointment status when payment is successful
   */
  private async updateAppointmentPaymentStatus(
    appointmentId: string, 
    statusUpdate: PaymentStatusUpdate
  ): Promise<void> {
    try {
      if (statusUpdate.status === 'SUCCESS') {
        // Mark appointment as paid/confirmed
        await appointmentService.updateAppointmentStatus(appointmentId, 'CONFIRMED', {
          paymentId: statusUpdate.paymentId,
          transactionId: statusUpdate.transactionId,
          paidAmount: statusUpdate.amount,
          paymentDate: statusUpdate.timestamp
        });

        console.log('Appointment status updated to CONFIRMED:', appointmentId);
      } else if (['FAILED', 'CANCELED'].includes(statusUpdate.status)) {
        // Mark appointment as payment failed - may need manual review
        await appointmentService.updateAppointmentStatus(appointmentId, 'PAYMENT_FAILED', {
          failureReason: statusUpdate.status,
          paymentId: statusUpdate.paymentId
        });

        console.log('Appointment status updated to PAYMENT_FAILED:', appointmentId);
      }
    } catch (error) {
      console.error('Failed to update appointment status:', error);
      // Don't throw here - payment was successful, appointment update is secondary
    }
  }

  /**
   * Handle failed payment scenarios
   */
  private async handleFailedPayment(statusUpdate: PaymentStatusUpdate): Promise<void> {
    try {
      console.log('Handling failed payment:', {
        orderId: statusUpdate.orderId,
        status: statusUpdate.status,
        reason: statusUpdate.metadata?.statusMessage
      });

      // Log failed payment for analysis
      await this.logPaymentFailure(statusUpdate);

      // Could add notification to patient about failed payment
      // Could trigger automatic retry mechanisms
      // Could update appointment to require new payment

    } catch (error) {
      console.error('Error handling failed payment:', error);
    }
  }

  /**
   * Log payment failures for analysis and debugging
   */
  private async logPaymentFailure(statusUpdate: PaymentStatusUpdate): Promise<void> {
    try {
      // This could integrate with logging service or analytics
      console.warn('Payment Failure Log:', {
        timestamp: statusUpdate.timestamp,
        orderId: statusUpdate.orderId,
        appointmentId: statusUpdate.appointmentId,
        status: statusUpdate.status,
        amount: statusUpdate.amount,
        failureReason: statusUpdate.metadata?.statusMessage,
        paymentMethod: statusUpdate.metadata?.method
      });

      // Could also save to local storage for offline analysis
      // Could send to analytics service
    } catch (error) {
      console.error('Error logging payment failure:', error);
    }
  }

  /**
   * Get payment details by order ID from our backend
   */
  private async getPaymentByOrderId(orderId: string): Promise<PaymentStatusUpdate | null> {
    try {
      // This would typically call our backend API
      // For now, we'll use the existing payment service
      const response = await paymentService.getPaymentHistory({
        page: 1,
        limit: 1
        // Note: Real implementation would filter by orderId
      });

      if (response.success && response.data.payments.length > 0) {
        const payment = response.data.payments[0];
        
        // Transform to our expected format
        return {
          paymentId: payment.id,
          orderId: orderId, // Would come from payment record
          appointmentId: payment.appointmentId,
          status: this.mapPaymentStatus(payment.status),
          transactionId: payment.transactionId,
          amount: payment.amount,
          currency: 'LKR',
          verificationResult: {
            isValid: true,
            status: this.mapPaymentStatus(payment.status)
          },
          timestamp: payment.updatedAt,
          metadata: payment.metadata
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting payment by order ID:', error);
      throw error;
    }
  }

  /**
   * Extract appointment ID from order ID format
   */
  private extractAppointmentId(orderId: string): string | undefined {
    try {
      // Order ID format: APT_{appointmentId}_{timestamp}
      const matches = orderId.match(/^APT_([^_]+)_\d+$/);
      return matches?.[1];
    } catch (error) {
      console.error('Error extracting appointment ID from order ID:', orderId);
      return undefined;
    }
  }

  /**
   * Map our payment status to PayHere status format
   */
  private mapPaymentStatus(status: string): PaymentStatus {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'SUCCESS';
      case 'pending':
        return 'PENDING';
      case 'failed':
        return 'FAILED';
      case 'refunded':
        return 'CHARGEDBACK';
      default:
        return 'FAILED';
    }
  }

  /**
   * Cancel ongoing payment verification
   */
  cancelVerification(orderId: string): void {
    const keys = Array.from(this.verificationAttempts.keys()).filter(key => 
      key.startsWith(orderId)
    );
    keys.forEach(key => this.verificationAttempts.delete(key));
  }

  /**
   * Get verification attempt count for debugging
   */
  getVerificationAttempts(orderId: string): number {
    const keys = Array.from(this.verificationAttempts.keys()).filter(key => 
      key.startsWith(orderId)
    );
    return keys.reduce((total, key) => 
      total + (this.verificationAttempts.get(key) || 0), 0
    );
  }
}

export default new PaymentVerificationService();