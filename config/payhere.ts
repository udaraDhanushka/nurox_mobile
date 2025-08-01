export const PAYHERE_CONFIG = {
  merchantId: '1231130', // PayHere Sandbox Merchant ID
  merchantSecret: 'MTQ3NDkyMzE0MjcyODc3MjQ3MzE1OTAyMDMzOTk1MDg1MTEyODY=', // Will be set in environment
  sandboxMode: true, // Set to false for production
  baseURL: {
    sandbox: 'https://sandbox.payhere.lk/pay/checkout',
    // production: 'https://www.payhere.lk'
  },
  currency: 'LKR',
  country: 'LK',
  returnURL: 'nurox://payments/success',
  cancelURL: 'nurox://payments/cancel',
};

export const getPayHereBaseURL = () => {
  if (PAYHERE_CONFIG.sandboxMode) {
    return PAYHERE_CONFIG.baseURL.sandbox;
  }
  // return PAYHERE_CONFIG.baseURL.production;
};