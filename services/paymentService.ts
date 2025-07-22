import { API_ENDPOINTS } from '@/constants/api';
import api from './api';

// Real payment history response from backend
export interface PaymentHistoryItem {
  id: string;
  userId: string;
  appointmentId?: string;
  prescriptionId?: string;
  claimId?: string;
  amount: number;
  method: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  transactionId?: string;
  description: string;
  paidAt?: string;
  refundedAt?: string;
  refundAmount?: number;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  appointment?: {
    id: string;
    appointmentDate: string;
    type: string;
    doctor: {
      firstName: string;
      lastName: string;
    };
  };
  prescription?: {
    id: string;
    prescriptionNumber: string;
    doctor: {
      firstName: string;
      lastName: string;
    };
  };
  claim?: {
    id: string;
    claimNumber: string;
    insuranceProvider: string;
  };
}

export interface PaymentHistoryResponse {
  success: boolean;
  data: {
    payments: PaymentHistoryItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface PayHerePaymentData {
  orderId: string;
  amount: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  hash: string;
  items?: string;
}

export interface PaymentConfirmation {
  success: boolean;
  payment: {
    id: string;
    status: string;
    amount: number;
    transactionId: string;
  };
}

export interface CreatePaymentRequest {
  amount: number;
  currency?: string;
  appointmentId?: string;
  prescriptionId?: string;
  description: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country?: string;
  };
  metadata?: Record<string, any>;
}

export interface ConfirmPaymentRequest {
  orderId: string;
  paymentId: string;
  payhereData?: any;
}

class PaymentService {
  async createPayHerePayment(data: CreatePaymentRequest): Promise<PayHerePaymentData> {
    try {
      const response = await api.post<PayHerePaymentData>(API_ENDPOINTS.PAYMENTS.PAYHERE_CREATE, {
        ...data,
        currency: data.currency || 'LKR',
      });
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create PayHere payment');
      }
      
      return response.data;
    } catch (error) {
      console.error('PayHere payment creation error:', error);
      throw error;
    }
  }

  async confirmPayment(data: ConfirmPaymentRequest): Promise<PaymentConfirmation> {
    try {
      const response = await api.post<PaymentConfirmation>(API_ENDPOINTS.PAYMENTS.CONFIRM, data);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to confirm payment');
      }
      
      return response.data;
    } catch (error) {
      console.error('Payment confirmation error:', error);
      throw error;
    }
  }

  async getPaymentHistory(filters?: {
    status?: string;
    method?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaymentHistoryResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const endpoint = `${API_ENDPOINTS.PAYMENTS.BASE}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get<PaymentHistoryResponse['data']>(endpoint);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch payment history');
      }

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Payment history fetch error:', error);
      throw error;
    }
  }

  async getPaymentDetails(paymentId: string) {
    try {
      const response = await api.get(API_ENDPOINTS.PAYMENTS.BY_ID(paymentId));
      return response;
    } catch (error) {
      console.error('Payment details fetch error:', error);
      throw error;
    }
  }

  async requestRefund(paymentId: string, reason?: string) {
    try {
      const response = await api.post(API_ENDPOINTS.PAYMENTS.REFUND(paymentId), { reason });
      return response;
    } catch (error) {
      console.error('Refund request error:', error);
      throw error;
    }
  }

  async getPaymentAnalytics() {
    try {
      const response = await api.get(API_ENDPOINTS.PAYMENTS.ANALYTICS);
      return response;
    } catch (error) {
      console.error('Payment analytics fetch error:', error);
      throw error;
    }
  }
}

export default new PaymentService();