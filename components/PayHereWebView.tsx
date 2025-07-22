import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { PAYHERE_CONFIG, getPayHereBaseURL } from '@/config/payhere';
import { COLORS } from '@/constants/theme';

export interface PayHerePaymentData {
  orderId?: string;
  order_id?: string;
  amount: number | string;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  hash: string;
  items?: string;
  currency?: string;
  return_url?: string;
  cancel_url?: string;
  notify_url?: string;
  recurrence?: string;
  duration?: string;
  startupFee?: number;
}

interface PayHereWebViewProps {
  paymentData: PayHerePaymentData;
  onSuccess: (paymentId: string, orderId: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
  onClose: () => void;
}

export default function PayHereWebView({ 
  paymentData, 
  onSuccess, 
  onError, 
  onCancel, 
  onClose 
}: PayHereWebViewProps) {
  const [loading, setLoading] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);
  
  // Debug: Log the received payment data
  console.log('PayHereWebView received payment data:', JSON.stringify(paymentData, null, 2));
  
  // Validate payment data on mount
  useEffect(() => {
    const amount = typeof paymentData.amount === 'string' ? parseFloat(paymentData.amount) : paymentData.amount;
    if (!amount || isNaN(amount) || amount <= 0) {
      console.error('PayHere: Invalid amount data', paymentData);
      setValidationError('Invalid payment amount');
    } else {
      setValidationError(null);
    }
  }, [paymentData]);
  
  // Call onError when validation fails
  useEffect(() => {
    if (validationError) {
      onError(validationError);
    }
  }, [validationError, onError]);

  const generatePaymentForm = () => {
    const baseURL = getPayHereBaseURL();
    
    // Return empty string if validation failed
    if (validationError) {
      return '';
    }
    
    // Parse amount (already validated in useEffect)
    const amount = typeof paymentData.amount === 'string' ? parseFloat(paymentData.amount) : paymentData.amount;
    
    // The backend is already returning PayHere form fields, so use them directly
    // But fix the undefined notify_url issue
    const formData = {
      merchant_id: PAYHERE_CONFIG.merchantId,
      return_url: paymentData.return_url || PAYHERE_CONFIG.returnURL,
      cancel_url: paymentData.cancel_url || PAYHERE_CONFIG.cancelURL,
      notify_url: PAYHERE_CONFIG.notifyURL, // Always use our config for notify_url
      order_id: paymentData.order_id || paymentData.orderId,
      items: paymentData.items || 'Medical Services',
      currency: paymentData.currency || PAYHERE_CONFIG.currency,
      amount: amount.toFixed(2),
      first_name: paymentData.first_name || paymentData.firstName,
      last_name: paymentData.last_name || paymentData.lastName,
      email: paymentData.email,
      phone: paymentData.phone,
      address: paymentData.address,
      city: paymentData.city,
      country: paymentData.country,
      hash: paymentData.hash,
      ...(paymentData.recurrence && { recurrence: paymentData.recurrence }),
      ...(paymentData.duration && { duration: paymentData.duration }),
      ...(paymentData.startupFee && { startup_fee: paymentData.startupFee.toFixed(2) }),
    };

    const formFields = Object.entries(formData)
      .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}" />`)
      .join('\n');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PayHere Payment</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 400px;
            width: 100%;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #007AFF;
            margin-bottom: 16px;
          }
          .amount {
            font-size: 32px;
            font-weight: bold;
            color: #333;
            margin: 16px 0;
          }
          .currency {
            font-size: 18px;
            color: #666;
          }
          .submit-btn {
            background: #007AFF;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 16px 32px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            margin-top: 24px;
          }
          .submit-btn:hover {
            background: #0056CC;
          }
          .loader {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #007AFF;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">PayHere Payment</div>
          <div class="amount">
            <span class="currency">Rs. </span>${amount.toLocaleString('en-LK')}
          </div>
          <form id="payhere-form" action="${baseURL}/pay" method="post">
            ${formFields}
            <button type="submit" class="submit-btn">Pay Now</button>
          </form>
        </div>
      </body>
      </html>
    `;
  };

  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;
    
    if (url.includes(PAYHERE_CONFIG.returnURL)) {
      // Extract payment parameters from URL
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const paymentId = urlParams.get('payment_id');
      const orderId = urlParams.get('order_id');
      const statusCode = urlParams.get('status_code');
      
      if (statusCode === '2' && paymentId && orderId) {
        onSuccess(paymentId, orderId);
      } else {
        onError('Payment was not successful');
      }
    } else if (url.includes(PAYHERE_CONFIG.cancelURL)) {
      onCancel();
    }
  };

  const handleError = (error: any) => {
    console.error('PayHere WebView error:', error);
    onError('Payment process failed. Please try again.');
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'payment_success') {
        onSuccess(data.payment_id, data.order_id);
      } else if (data.type === 'payment_error') {
        onError(data.message || 'Payment failed');
      } else if (data.type === 'payment_cancel') {
        onCancel();
      }
    } catch (e) {
      console.log('PayHere message parsing error:', e);
    }
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ html: generatePaymentForm() }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={handleError}
        onMessage={handleMessage}
        onNavigationStateChange={handleNavigationStateChange}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        mixedContentMode="compatibility"
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        originWhitelist={['*']}
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    zIndex: 1000,
  },
});