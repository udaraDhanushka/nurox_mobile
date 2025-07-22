import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { WebView } from 'react-native-webview';
import { X, CreditCard, Shield, Clock } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { Button } from '@/components/Button';
import type { 
  AppointmentPaymentData, 
  PayHereCheckoutData 
} from '@/services/payhereService';
import paymentService from '@/services/paymentService';
import { validatePayHereFormData } from '@/utils/payhereDebug';

interface PaymentCheckoutProps {
  visible: boolean;
  appointmentData: AppointmentPaymentData;
  onSuccess: (paymentData: any) => void;
  onCancel: () => void;
  onError: (error: string) => void;
}

interface PaymentSummary {
  consultationFee: number;
  hospitalFee: number;
  serviceFee: number;
  tax: number;
  totalAmount: number;
}

export const PaymentCheckout: React.FC<PaymentCheckoutProps> = ({
  visible,
  appointmentData,
  onSuccess,
  onCancel,
  onError
}) => {
  const [currentStep, setCurrentStep] = useState<'summary' | 'payment' | 'processing'>('summary');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);
  const [payhereData, setPayhereData] = useState<PayHereCheckoutData | null>(null);
  const [webViewKey, setWebViewKey] = useState(0); // For WebView refresh
  const webViewRef = useRef<WebView>(null);

  // Calculate payment summary when modal opens
  useEffect(() => {
    if (visible && !paymentSummary) {
      // Simple fee calculation without external service
      const consultationFee = appointmentData.consultationFee || 2500;
      const hospitalFee = appointmentData.hospitalFee || 0;
      const serviceFeePercentage = 0.02; // 2% service fee
      const taxPercentage = 0.0; // No tax for healthcare

      const subtotal = consultationFee + hospitalFee;
      const serviceFee = Math.round(subtotal * serviceFeePercentage);
      const tax = Math.round(subtotal * taxPercentage);
      const totalAmount = subtotal + serviceFee + tax;

      const summary = {
        consultationFee,
        hospitalFee,
        serviceFee,
        tax,
        totalAmount
      };
      
      setPaymentSummary(summary);
    }
  }, [visible, appointmentData, paymentSummary]);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setCurrentStep('summary');
      setIsLoading(false);
      setPaymentSummary(null);
      setPayhereData(null);
      setWebViewKey(prev => prev + 1);
    }
  }, [visible]);

  const handleProceedToPayment = async () => {
    if (!paymentSummary) return;

    try {
      setIsLoading(true);
      
      // Create payment record in our system - this will return the correct PayHere data
      console.log('Creating PayHere payment via backend API...');
      
      const backendPayHereResponse = await paymentService.createPayHerePayment({
        amount: paymentSummary.totalAmount,
        currency: 'LKR',
        appointmentId: appointmentData.appointmentId,
        description: `Consultation with Dr. ${appointmentData.doctorName}`,
        customerInfo: appointmentData.patientInfo,
        metadata: {
          doctorId: appointmentData.doctorId,
          doctorName: appointmentData.doctorName,
          specialty: appointmentData.specialty,
          appointmentDate: appointmentData.appointmentDate,
          appointmentTime: appointmentData.appointmentTime
        }
      });

      console.log('Backend PayHere Response:', backendPayHereResponse);

      // Use the backend-generated PayHere data (this has the correct hash)
      // Backend returns PayHere checkout format directly (cast as unknown first to avoid TS error)
      const payhereCheckoutData: PayHereCheckoutData = backendPayHereResponse as unknown as PayHereCheckoutData;
      
      // Validate the backend-generated form data
      const validation = validatePayHereFormData(payhereCheckoutData);
      console.log('Backend PayHere Form Validation Result:', validation);

      console.log('Using Backend PayHere Data (Correct Hash):', {
        merchant_id: payhereCheckoutData.merchant_id,
        order_id: payhereCheckoutData.order_id,
        amount: payhereCheckoutData.amount,
        currency: payhereCheckoutData.currency,
        hash: payhereCheckoutData.hash.substring(0, 8) + '...',
        itemsDescription: payhereCheckoutData.items,
        customerName: `${payhereCheckoutData.first_name} ${payhereCheckoutData.last_name}`
      });

      setPayhereData(payhereCheckoutData);
      setCurrentStep('payment');
    } catch (error) {
      console.error('Error creating payment:', error);
      onError(error instanceof Error ? error.message : 'Failed to initiate payment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWebViewNavigation = (url: string) => {
    console.log('PayHere WebView navigation:', url);
    
    // Check for success/cancel URLs
    if (url.includes('nurox://payments/success')) {
      setCurrentStep('processing');
      
      // Extract payment parameters from URL if available
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const paymentId = urlParams.get('payment_id');
      
      setTimeout(() => {
        onSuccess({
          paymentId,
          orderId: payhereData?.order_id,
          amount: paymentSummary?.totalAmount,
          status: 'SUCCESS'
        });
      }, 2000);
      
      return false; // Prevent navigation
    }
    
    if (url.includes('nurox://payments/cancel')) {
      onCancel();
      return false; // Prevent navigation
    }
    
    return true; // Allow navigation
  };

  const generatePaymentHTML = (data: PayHereCheckoutData): string => {
    // Create form fields with proper escaping
    const formFields = Object.entries(data)
      .map(([key, value]) => `<input type="hidden" name="${key}" value="${String(value).replace(/"/g, '&quot;')}" />`)
      .join('\n');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PayHere Payment</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8f9fa;
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          .payment-form {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 400px;
            width: 100%;
          }
          .loading {
            color: #007AFF;
            margin-bottom: 20px;
          }
          .amount {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 20px;
          }
          .submit-btn {
            background: #007AFF;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
          }
          .submit-btn:hover {
            background: #0056b3;
          }
          .debug-info {
            font-size: 12px;
            color: #666;
            margin-top: 20px;
            text-align: left;
          }
        </style>
      </head>
      <body>
        <div class="payment-form">
          <div class="loading">🔒 Redirecting to PayHere...</div>
          <div class="amount">LKR ${data.amount}</div>
          <div class="debug-info">
            <strong>Debug Info:</strong><br>
            Merchant ID: ${data.merchant_id}<br>
            Order ID: ${data.order_id}<br>
            Amount: ${data.amount}<br>
            Hash: ${data.hash.substring(0, 8)}...<br>
          </div>
          <form id="payhere-form" action="https://sandbox.payhere.lk/pay/checkout" method="post">
            ${formFields}
            <button type="submit" class="submit-btn">
              Proceed to Payment
            </button>
          </form>
        </div>
        
        <script>
          console.log('PayHere Form Data:', {
            merchant_id: '${data.merchant_id}',
            order_id: '${data.order_id}',
            amount: '${data.amount}',
            currency: '${data.currency}',
            hash: '${data.hash.substring(0, 8)}...'
          });
          
          // Auto-submit form after a short delay
          setTimeout(() => {
            console.log('Submitting PayHere form...');
            document.getElementById('payhere-form').submit();
          }, 2000); // Increased delay to see debug info
        </script>
      </body>
      </html>
    `;
  };

  const renderPaymentSummary = () => (
    <ScrollView style={styles.summaryContainer} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.summaryHeader}>
        <View style={styles.headerIconContainer}>
          <CreditCard size={24} color={COLORS.primary} />
        </View>
        <Text style={styles.summaryTitle}>Payment Summary</Text>
        <Text style={styles.summarySubtitle}>
          Appointment with Dr. {appointmentData.doctorName}
        </Text>
      </View>

      {/* Appointment Details */}
      <View style={styles.appointmentDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Doctor:</Text>
          <Text style={styles.detailValue}>{appointmentData.doctorName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Specialty:</Text>
          <Text style={styles.detailValue}>{appointmentData.specialty}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date:</Text>
          <Text style={styles.detailValue}>{appointmentData.appointmentDate}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Time:</Text>
          <Text style={styles.detailValue}>{appointmentData.appointmentTime}</Text>
        </View>
      </View>

      {/* Fee Breakdown */}
      {paymentSummary && (
        <View style={styles.feeBreakdown}>
          <Text style={styles.breakdownTitle}>Fee Breakdown</Text>
          
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Consultation Fee</Text>
            <Text style={styles.feeValue}>LKR {paymentSummary.consultationFee.toLocaleString()}</Text>
          </View>
          
          {paymentSummary.hospitalFee > 0 && (
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Hospital Fee</Text>
              <Text style={styles.feeValue}>LKR {paymentSummary.hospitalFee.toLocaleString()}</Text>
            </View>
          )}
          
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Service Fee</Text>
            <Text style={styles.feeValue}>LKR {paymentSummary.serviceFee.toLocaleString()}</Text>
          </View>
          
          {paymentSummary.tax > 0 && (
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Tax</Text>
              <Text style={styles.feeValue}>LKR {paymentSummary.tax.toLocaleString()}</Text>
            </View>
          )}
          
          <View style={[styles.feeRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>LKR {paymentSummary.totalAmount.toLocaleString()}</Text>
          </View>
        </View>
      )}

      {/* Security Info */}
      <View style={styles.securityInfo}>
        <Shield size={16} color={COLORS.success} />
        <Text style={styles.securityText}>
          Secured by PayHere - Your payment information is encrypted and secure
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          title="Cancel"
          variant="outline"
          onPress={onCancel}
          style={styles.cancelButton}
        />
        <Button
          title="Proceed to Payment"
          onPress={handleProceedToPayment}
          isLoading={isLoading}
          style={styles.proceedButton}
        />
      </View>
    </ScrollView>
  );

  const renderPaymentWebView = () => (
    <View style={styles.webViewContainer}>
      <View style={styles.webViewHeader}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onCancel}
        >
          <X size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.webViewTitle}>PayHere Payment</Text>
        <View style={{ width: 40 }} />
      </View>
      
      {payhereData && (
        <WebView
          key={webViewKey}
          ref={webViewRef}
          source={{ html: generatePaymentHTML(payhereData) }}
          onNavigationStateChange={(navState) => {
            const shouldNavigate = handleWebViewNavigation(navState.url);
            if (!shouldNavigate && webViewRef.current) {
              webViewRef.current.stopLoading();
            }
          }}
          onError={(error) => {
            console.error('PayHere WebView error:', error);
            onError('Payment page failed to load. Please try again.');
          }}
          style={styles.webView}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.webViewLoading}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading Payment Gateway...</Text>
            </View>
          )}
        />
      )}
    </View>
  );

  const renderProcessing = () => (
    <View style={styles.processingContainer}>
      <View style={styles.processingContent}>
        <Clock size={48} color={COLORS.primary} />
        <Text style={styles.processingTitle}>Processing Payment...</Text>
        <Text style={styles.processingSubtitle}>
          Please wait while we confirm your payment
        </Text>
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.processingSpinner} />
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onCancel}
    >
      <SafeAreaView style={styles.container}>
        {currentStep === 'summary' && renderPaymentSummary()}
        {currentStep === 'payment' && renderPaymentWebView()}
        {currentStep === 'processing' && renderProcessing()}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  summaryContainer: {
    flex: 1,
    padding: 20,
  },
  summaryHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.transparentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  summarySubtitle: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  appointmentDetails: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    ...SHADOWS.small,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  feeBreakdown: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    ...SHADOWS.small,
  },
  breakdownTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  feeLabel: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
  },
  feeValue: {
    fontSize: SIZES.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 12,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.transparentPrimary,
    padding: 16,
    borderRadius: 8,
    marginBottom: 30,
  },
  securityText: {
    fontSize: SIZES.sm,
    color: COLORS.success,
    marginLeft: 8,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
  },
  proceedButton: {
    flex: 2,
  },
  webViewContainer: {
    flex: 1,
  },
  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webViewTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  webView: {
    flex: 1,
  },
  webViewLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  processingContent: {
    alignItems: 'center',
  },
  processingTitle: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 24,
    marginBottom: 8,
  },
  processingSubtitle: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  processingSpinner: {
    marginTop: 32,
  },
});