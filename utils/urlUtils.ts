/**
 * Utility functions for handling deep links and URL parameters
 */

export interface PaymentUrlParams {
  transactionId?: string;
  amount?: string;
  doctorName?: string;
  specialty?: string;
  hospitalName?: string;
  date?: string;
  time?: string;
  tokenNumber?: string;
  appointmentId?: string;
  paymentMethod?: string;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Parse URL parameters from a deep link URL
 * @param url The full URL string (e.g., "nurox://payments/success?param1=value1&param2=value2")
 * @returns Object containing parsed parameters
 */
export const parseUrlParams = (url: string): PaymentUrlParams => {
  try {
    const urlObj = new URL(url);
    const params: PaymentUrlParams = {};
    
    urlObj.searchParams.forEach((value, key) => {
      (params as any)[key] = decodeURIComponent(value);
    });
    
    return params;
  } catch (error) {
    console.warn('Failed to parse URL parameters:', error);
    return {};
  }
};

/**
 * Build a payment success deep link URL with parameters
 * @param params Payment parameters
 * @returns Complete deep link URL
 */
export const buildPaymentSuccessUrl = (params: PaymentUrlParams): string => {
  const baseUrl = 'nurox://payments/success';
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, encodeURIComponent(value.toString()));
    }
  });
  
  return `${baseUrl}?${searchParams.toString()}`;
};

/**
 * Build a payment failure deep link URL with parameters
 * @param params Payment parameters
 * @returns Complete deep link URL
 */
export const buildPaymentFailureUrl = (params: PaymentUrlParams): string => {
  const baseUrl = 'nurox://payments/failure';
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, encodeURIComponent(value.toString()));
    }
  });
  
  return `${baseUrl}?${searchParams.toString()}`;
};

/**
 * Check if a URL is a payment-related deep link
 * @param url The URL to check
 * @returns boolean indicating if it's a payment deep link
 */
export const isPaymentDeepLink = (url: string): boolean => {
  return url.includes('://payments/');
};

/**
 * Extract the route path from a deep link URL
 * @param url The deep link URL
 * @returns The route path (e.g., "/payments/success")
 */
export const getRouteFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname;
  } catch (error) {
    console.warn('Failed to extract route from URL:', error);
    return '';
  }
};