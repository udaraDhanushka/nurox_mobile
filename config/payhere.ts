export const PAYHERE_CONFIG = {
  merchantId: '1231130', // PayHere Sandbox Merchant ID
  merchantSecret: 'MTQ3NDkyMzE0MjcyODc3MjQ3MzE1OTAyMDMzOTk1MDg1MTEyODY=', // Will be set in environment
  sandboxMode: true, // Set to false for production
  baseURL: {
    sandbox: 'https://sandbox.payhere.lk',
    production: 'https://www.payhere.lk'
  },
  currency: 'LKR',
  country: 'LK',
  returnURL: 'nurox://payments/success',
  cancelURL: 'nurox://payments/cancel',
  notifyURL: 'http://192.168.0.102:3000/api/payments/payhere-webhook', // Updated with actual backend URL
};

export const getPayHereBaseURL = () => {
  return PAYHERE_CONFIG.sandboxMode 
    ? PAYHERE_CONFIG.baseURL.sandbox 
    : PAYHERE_CONFIG.baseURL.production;
};