import CryptoJS from 'crypto-js';
import { PAYHERE_CONFIG } from '@/config/payhere';

/**
 * Debug utility to test PayHere hash generation with known test data
 */
export const debugPayHereIntegration = () => {
  console.log('=== PayHere Integration Debug ===');
  
  // Test data from PayHere documentation
  const testData = {
    merchantId: PAYHERE_CONFIG.merchantId,
    orderId: 'ORDER_001',
    amount: 1000,
    currency: 'LKR',
    merchantSecret: PAYHERE_CONFIG.merchantSecret
  };
  
  console.log('Test Data:', {
    merchantId: testData.merchantId,
    orderId: testData.orderId,
    amount: testData.amount,
    currency: testData.currency,
    merchantSecretLength: testData.merchantSecret.length,
    merchantSecretStart: testData.merchantSecret.substring(0, 10) + '...'
  });
  
  // Step 1: Format amount
  const amountFormatted = parseFloat(testData.amount.toString())
    .toLocaleString('en-us', { minimumFractionDigits: 2 })
    .replaceAll(',', '');
  
  console.log('Formatted Amount:', amountFormatted);
  
  // Step 2: Hash merchant secret
  const hashedSecret = CryptoJS.MD5(testData.merchantSecret).toString().toUpperCase();
  console.log('Hashed Secret (first 10 chars):', hashedSecret.substring(0, 10) + '...');
  
  // Step 3: Create hash string
  const hashString = testData.merchantId + testData.orderId + amountFormatted + testData.currency + hashedSecret;
  console.log('Hash String Components:', {
    merchantId: testData.merchantId,
    orderId: testData.orderId,
    amountFormatted: amountFormatted,
    currency: testData.currency,
    hashedSecretStart: hashedSecret.substring(0, 10) + '...'
  });
  
  // Step 4: Generate final hash
  const finalHash = CryptoJS.MD5(hashString).toString().toUpperCase();
  console.log('Final Hash:', finalHash);
  
  // Check if merchant secret might be base64 encoded
  try {
    const decodedSecret = atob(testData.merchantSecret);
    console.log('Decoded Merchant Secret Length:', decodedSecret.length);
    
    // Try with decoded secret
    const hashedDecodedSecret = CryptoJS.MD5(decodedSecret).toString().toUpperCase();
    const hashStringDecoded = testData.merchantId + testData.orderId + amountFormatted + testData.currency + hashedDecodedSecret;
    const finalHashDecoded = CryptoJS.MD5(hashStringDecoded).toString().toUpperCase();
    
    console.log('With Decoded Secret - Final Hash:', finalHashDecoded);
  } catch (e) {
    console.log('Merchant secret is not base64 encoded');
  }
  
  console.log('=== End Debug ===');
  
  return {
    originalHash: finalHash,
    testData,
    amountFormatted
  };
};

/**
 * Validate PayHere form data format
 */
export const validatePayHereFormData = (formData: any) => {
  const requiredFields = [
    'merchant_id',
    'return_url',
    'cancel_url',
    'notify_url',
    'first_name',
    'last_name',
    'email',
    'phone',
    'address',
    'city',
    'country',
    'order_id',
    'items',
    'currency',
    'amount',
    'hash'
  ];
  
  console.log('=== PayHere Form Data Validation ===');
  
  const missing = [];
  const present = [];
  
  requiredFields.forEach(field => {
    if (formData[field]) {
      present.push(field);
    } else {
      missing.push(field);
    }
  });
  
  console.log('Present Fields:', present);
  console.log('Missing Fields:', missing);
  
  // Validate specific field formats
  const validations = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email || ''),
    phone: (formData.phone || '').length >= 10,
    amount: !isNaN(parseFloat(formData.amount || '0')),
    currency: formData.currency === 'LKR',
    hash: (formData.hash || '').length === 32 // MD5 hash is 32 characters
  };
  
  console.log('Field Validations:', validations);
  console.log('=== End Validation ===');
  
  return {
    isValid: missing.length === 0 && Object.values(validations).every(v => v),
    missing,
    validations
  };
};