import CryptoJS from 'crypto-js';
import { PAYHERE_CONFIG } from '@/config/payhere';

// PayHere API interfaces based on official documentation
export interface PayHereCheckoutData {
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  order_id: string;
  items: string;
  currency: string;
  amount: string; // Formatted amount as string
  hash: string;
  // Optional parameters
  delivery_address?: string;
  delivery_city?: string;
  delivery_country?: string;
  custom_1?: string;
  custom_2?: string;
  platform?: string;
}

export interface PayHereNotification {
  merchant_id: string;
  order_id: string;
  payment_id: string;
  payhere_amount: string;
  payhere_currency: string;
  status_code: string; // '2' = success, '0' = pending, '-1' = canceled, '-2' = failed, '-3' = chargedback
  md5sig: string;
  custom_1?: string;
  custom_2?: string;
  method?: string;
  status_message?: string;
  card_holder_name?: string;
  card_no?: string;
  card_expiry?: string;
}

export interface AppointmentPaymentData {
  appointmentId: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  appointmentDate: string;
  appointmentTime: string;
  consultationFee: number;
  hospitalFee?: number;
  serviceFee?: number;
  tax?: number;
  totalAmount: number;
  patientInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country?: string;
  };
}

export interface PaymentVerificationResult {
  isValid: boolean;
  status: 'SUCCESS' | 'PENDING' | 'CANCELED' | 'FAILED' | 'CHARGEDBACK';
  paymentId?: string;
  transactionAmount?: number;
  error?: string;
}

class PayHereService {
  private merchantId: string;
  private merchantSecret: string;
  private baseURL: string;

  constructor() {
    this.merchantId = PAYHERE_CONFIG.merchantId;
    
    // Try to decode merchant secret if it's base64 encoded
    try {
      // Check if merchant secret is base64 encoded
      const decoded = atob(PAYHERE_CONFIG.merchantSecret);
      // If successful and looks like a reasonable secret, use decoded version
      if (decoded.length > 10 && decoded.length < 200) {
        console.log('Using decoded merchant secret');
        this.merchantSecret = decoded;
      } else {
        console.log('Using original merchant secret');
        this.merchantSecret = PAYHERE_CONFIG.merchantSecret;
      }
    } catch (e) {
      console.log('Merchant secret is not base64 encoded, using as-is');
      this.merchantSecret = PAYHERE_CONFIG.merchantSecret;
    }
    
    this.baseURL = PAYHERE_CONFIG.baseURL.sandbox; // Use sandbox for development
  }

  /**
   * Generate MD5 hash for PayHere payment according to official documentation
   * hash = MD5(merchant_id + order_id + amount + currency + MD5(merchant_secret).toUpperCase()).toUpperCase()
   */
  private generatePaymentHash(
    merchantId: string,
    orderId: string,
    amount: number,
    currency: string,
    merchantSecret: string
  ): string {
    try {
      // Format amount with 2 decimal places and remove commas
      const amountFormatted = parseFloat(amount.toString())
        .toLocaleString('en-us', { minimumFractionDigits: 2 })
        .replaceAll(',', '');

      // Step 1: Hash the merchant secret and convert to uppercase
      const hashedSecret = CryptoJS.MD5(merchantSecret).toString().toUpperCase();

      // Step 2: Create the hash string
      const hashString = merchantId + orderId + amountFormatted + currency + hashedSecret;

      // Step 3: Hash the combined string and convert to uppercase
      const hash = CryptoJS.MD5(hashString).toString().toUpperCase();

      console.log('PayHere Hash Generation Debug:', {
        merchantId,
        orderId,
        amountFormatted,
        currency,
        merchantSecretLength: merchantSecret.length,
        hashedSecret: hashedSecret.substring(0, 8) + '...', // Show first 8 chars only
        hashString: `${merchantId}${orderId}${amountFormatted}${currency}${hashedSecret.substring(0, 8)}...`,
        finalHash: hash
      });

      return hash;
    } catch (error) {
      console.error('Error generating PayHere hash:', error);
      throw new Error('Failed to generate payment hash');
    }
  }

  /**
   * Generate MD5 signature for payment verification according to official documentation
   * md5sig = MD5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + MD5(merchant_secret).toUpperCase()).toUpperCase()
   */
  private generateVerificationSignature(
    merchantId: string,
    orderId: string,
    payhereAmount: string,
    payhereCurrency: string,
    statusCode: string,
    merchantSecret: string
  ): string {
    try {
      // Step 1: Hash the merchant secret and convert to uppercase
      const hashedSecret = CryptoJS.MD5(merchantSecret).toString().toUpperCase();

      // Step 2: Create the signature string
      const signatureString = merchantId + orderId + payhereAmount + payhereCurrency + statusCode + hashedSecret;

      // Step 3: Hash the combined string and convert to uppercase
      const signature = CryptoJS.MD5(signatureString).toString().toUpperCase();

      return signature;
    } catch (error) {
      console.error('Error generating verification signature:', error);
      throw new Error('Failed to generate verification signature');
    }
  }

  /**
   * Create PayHere checkout data for appointment payment
   */
  async createAppointmentPayment(appointmentData: AppointmentPaymentData): Promise<PayHereCheckoutData> {
    try {
      const orderId = `APT_${appointmentData.appointmentId}_${Date.now()}`;
      
      // Format amount to ensure 2 decimal places
      const formattedAmount = parseFloat(appointmentData.totalAmount.toString())
        .toLocaleString('en-us', { minimumFractionDigits: 2 })
        .replaceAll(',', '');

      // Generate payment hash
      const hash = this.generatePaymentHash(
        this.merchantId,
        orderId,
        appointmentData.totalAmount,
        PAYHERE_CONFIG.currency,
        this.merchantSecret
      );

      // Create items description
      const items = `Consultation with Dr. ${appointmentData.doctorName} - ${appointmentData.specialty}`;

      const payHereData: PayHereCheckoutData = {
        merchant_id: this.merchantId,
        return_url: PAYHERE_CONFIG.returnURL,
        cancel_url: PAYHERE_CONFIG.cancelURL,
        notify_url: PAYHERE_CONFIG.notifyURL,
        first_name: appointmentData.patientInfo.firstName,
        last_name: appointmentData.patientInfo.lastName,
        email: appointmentData.patientInfo.email,
        phone: appointmentData.patientInfo.phone,
        address: appointmentData.patientInfo.address,
        city: appointmentData.patientInfo.city,
        country: appointmentData.patientInfo.country || PAYHERE_CONFIG.country,
        order_id: orderId,
        items: items,
        currency: PAYHERE_CONFIG.currency,
        amount: formattedAmount,
        hash: hash,
        custom_1: appointmentData.appointmentId, // Store appointment ID for reference
        custom_2: appointmentData.doctorId, // Store doctor ID for reference
        platform: 'Mobile App'
      };

      console.log('PayHere checkout data created:', {
        ...payHereData,
        hash: '***HASH***' // Hide hash in logs
      });

      return payHereData;
    } catch (error) {
      console.error('Error creating PayHere payment:', error);
      throw new Error('Failed to create PayHere payment');
    }
  }

  /**
   * Verify payment notification from PayHere webhook
   */
  verifyPaymentNotification(notification: PayHereNotification): PaymentVerificationResult {
    try {
      console.log('Verifying PayHere notification:', {
        ...notification,
        md5sig: '***SIG***'
      });

      // Generate local signature for verification
      const expectedSignature = this.generateVerificationSignature(
        notification.merchant_id,
        notification.order_id,
        notification.payhere_amount,
        notification.payhere_currency,
        notification.status_code,
        this.merchantSecret
      );

      // Verify signature
      const isValid = expectedSignature === notification.md5sig;

      if (!isValid) {
        console.error('PayHere signature verification failed:', {
          expected: expectedSignature,
          received: notification.md5sig
        });
        return {
          isValid: false,
          status: 'FAILED',
          error: 'Invalid signature - payment notification verification failed'
        };
      }

      // Map status codes to readable statuses
      let status: PaymentVerificationResult['status'];
      switch (notification.status_code) {
        case '2':
          status = 'SUCCESS';
          break;
        case '0':
          status = 'PENDING';
          break;
        case '-1':
          status = 'CANCELED';
          break;
        case '-2':
          status = 'FAILED';
          break;
        case '-3':
          status = 'CHARGEDBACK';
          break;
        default:
          status = 'FAILED';
      }

      return {
        isValid: true,
        status,
        paymentId: notification.payment_id,
        transactionAmount: parseFloat(notification.payhere_amount)
      };
    } catch (error) {
      console.error('Error verifying PayHere notification:', error);
      return {
        isValid: false,
        status: 'FAILED',
        error: 'Payment verification failed due to technical error'
      };
    }
  }

  /**
   * Get PayHere checkout URL for redirecting users
   */
  getCheckoutURL(): string {
    return this.baseURL;
  }

  /**
   * Format form data for PayHere HTML form submission
   */
  formatFormData(checkoutData: PayHereCheckoutData): Record<string, string> {
    return Object.keys(checkoutData).reduce((formData, key) => {
      const value = checkoutData[key as keyof PayHereCheckoutData];
      if (value !== undefined) {
        formData[key] = value.toString();
      }
      return formData;
    }, {} as Record<string, string>);
  }

  /**
   * Calculate total appointment fee including taxes and service charges
   */
  calculateAppointmentFee(baseConsultationFee: number, options?: {
    hospitalFee?: number;
    serviceFeePercentage?: number;
    taxPercentage?: number;
  }): {
    consultationFee: number;
    hospitalFee: number;
    serviceFee: number;
    tax: number;
    totalAmount: number;
  } {
    const consultationFee = baseConsultationFee;
    const hospitalFee = options?.hospitalFee || 0;
    const serviceFeePercentage = options?.serviceFeePercentage || 0.02; // 2% default
    const taxPercentage = options?.taxPercentage || 0.0; // No tax by default

    const subtotal = consultationFee + hospitalFee;
    const serviceFee = Math.round(subtotal * serviceFeePercentage);
    const tax = Math.round(subtotal * taxPercentage);
    const totalAmount = subtotal + serviceFee + tax;

    return {
      consultationFee,
      hospitalFee,
      serviceFee,
      tax,
      totalAmount
    };
  }
}

export default new PayHereService();