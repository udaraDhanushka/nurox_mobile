import CryptoJS from 'crypto-js';

/**
 * Test PayHere integration with official test data
 * Based on PayHere documentation examples
 */
export const testPayHereIntegration = () => {
  console.log('=== PayHere Official Test ===');
  
  // Test with PayHere's official sandbox test data
  const testConfigs = [
    {
      name: 'Current Config',
      merchantId: '1231130',
      merchantSecret: 'MTQ3NDkyMzE0MjcyODc3MjQ3MzE1OTAyMDMzOTk1MDg1MTEyODY=',
      isBase64: true
    },
    {
      name: 'PayHere Default Sandbox',
      merchantId: '1213775',
      merchantSecret: 'sandbox_secret_key',
      isBase64: false
    }
  ];
  
  const testOrder = {
    orderId: 'ORDER_12345',
    amount: 1000.00,
    currency: 'LKR'
  };
  
  testConfigs.forEach(config => {
    console.log(`\n--- Testing ${config.name} ---`);
    
    let merchantSecret = config.merchantSecret;
    
    // Try to decode if base64
    if (config.isBase64) {
      try {
        const decoded = atob(config.merchantSecret);
        console.log('Base64 decoded secret length:', decoded.length);
        merchantSecret = decoded;
      } catch (e) {
        console.log('Failed to decode base64, using original');
      }
    }
    
    // Format amount
    const amountFormatted = parseFloat(testOrder.amount.toString())
      .toLocaleString('en-us', { minimumFractionDigits: 2 })
      .replaceAll(',', '');
    
    // Generate hash
    const hashedSecret = CryptoJS.MD5(merchantSecret).toString().toUpperCase();
    const hashString = config.merchantId + testOrder.orderId + amountFormatted + testOrder.currency + hashedSecret;
    const finalHash = CryptoJS.MD5(hashString).toString().toUpperCase();
    
    console.log({
      merchantId: config.merchantId,
      orderId: testOrder.orderId,
      amount: amountFormatted,
      currency: testOrder.currency,
      merchantSecretLength: merchantSecret.length,
      hashedSecretPrefix: hashedSecret.substring(0, 8) + '...',
      finalHash: finalHash
    });
    
    // Create test form data
    const formData = {
      merchant_id: config.merchantId,
      return_url: 'nurox://payments/success',
      cancel_url: 'nurox://payments/cancel',
      notify_url: 'http://localhost:3000/webhook',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone: '0771234567',
      address: '123 Test Street',
      city: 'Colombo',
      country: 'LK',
      order_id: testOrder.orderId,
      items: 'Test Payment',
      currency: testOrder.currency,
      amount: amountFormatted,
      hash: finalHash
    };
    
    // Validate required fields
    const requiredFields = [
      'merchant_id', 'return_url', 'cancel_url', 'notify_url',
      'first_name', 'last_name', 'email', 'phone', 'address',
      'city', 'country', 'order_id', 'items', 'currency', 'amount', 'hash'
    ];
    
    const missing = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    console.log('Form validation:', {
      allFieldsPresent: missing.length === 0,
      missingFields: missing,
      hashLength: finalHash.length,
      emailValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    });
  });
  
  console.log('=== End Test ===');
};

/**
 * Generate a minimal test HTML page for PayHere
 */
export const generateTestHTML = (merchantId: string, merchantSecret: string) => {
  const testData = {
    orderId: 'TEST_' + Date.now(),
    amount: 100.00,
    currency: 'LKR'
  };
  
  // Generate hash
  const amountFormatted = testData.amount.toFixed(2);
  const hashedSecret = CryptoJS.MD5(merchantSecret).toString().toUpperCase();
  const hashString = merchantId + testData.orderId + amountFormatted + testData.currency + hashedSecret;
  const finalHash = CryptoJS.MD5(hashString).toString().toUpperCase();
  
  return `
<!DOCTYPE html>
<html>
<head>
    <title>PayHere Test</title>
    <meta charset="utf-8">
</head>
<body>
    <h2>PayHere Payment Test</h2>
    <p>Merchant ID: ${merchantId}</p>
    <p>Order ID: ${testData.orderId}</p>
    <p>Amount: LKR ${amountFormatted}</p>
    <p>Hash: ${finalHash}</p>
    
    <form method="post" action="https://sandbox.payhere.lk/pay/checkout">
        <input type="hidden" name="merchant_id" value="${merchantId}">
        <input type="hidden" name="return_url" value="http://localhost:3000/return">
        <input type="hidden" name="cancel_url" value="http://localhost:3000/cancel">
        <input type="hidden" name="notify_url" value="http://localhost:3000/notify">
        <input type="hidden" name="order_id" value="${testData.orderId}">
        <input type="hidden" name="items" value="Test Item">
        <input type="hidden" name="currency" value="LKR">
        <input type="hidden" name="amount" value="${amountFormatted}">
        <input type="hidden" name="first_name" value="John">
        <input type="hidden" name="last_name" value="Doe">
        <input type="hidden" name="email" value="john@test.com">
        <input type="hidden" name="phone" value="0771234567">
        <input type="hidden" name="address" value="No.1, Test Street">
        <input type="hidden" name="city" value="Colombo">
        <input type="hidden" name="country" value="LK">
        <input type="hidden" name="hash" value="${finalHash}">
        
        <input type="submit" value="Pay with PayHere">
    </form>
    
    <script>
        console.log('Test payment data:', {
            merchantId: '${merchantId}',
            orderId: '${testData.orderId}',
            amount: '${amountFormatted}',
            hash: '${finalHash}'
        });
    </script>
</body>
</html>`;
};