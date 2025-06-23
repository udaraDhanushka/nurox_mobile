// API Configuration Constants
export const API_CONFIG = {
  // Base URLs
  DEV_BASE_URL: 'http://192.168.0.102:3000/api',
  PROD_BASE_URL: 'https://your-production-api.com/api',
  
  // Feature flags for data sources
  USE_MOCK_DATA: false, // Set to true only for development testing
  FORCE_REAL_DATA: true, // Always use real API data
  
  // Socket URLs
  DEV_SOCKET_URL: 'http://192.168.0.102:3000',
  PROD_SOCKET_URL: 'https://your-production-api.com',
  
  // Request timeouts (in milliseconds)
  TIMEOUT: 30000,
  UPLOAD_TIMEOUT: 60000,
  
  // File upload limits
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  SUPPORTED_DOCUMENT_TYPES: ['application/pdf'],
  
  // Retry configuration
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  
  // Cache configuration
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  
  // API rate limits
  RATE_LIMIT_WINDOW: 60000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 100,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    ME: '/auth/me',
  },
  
  // Users
  USERS: {
    PROFILE: '/users/profile',
    PATIENT_PROFILE: '/users/patient-profile',
    DOCTOR_PROFILE: '/users/doctor-profile',
    PHARMACIST_PROFILE: '/users/pharmacist-profile',
    LANGUAGE: '/users/language',
    ROLE_DATA: '/users/role-data',
    DELETE_ACCOUNT: '/users/account',
  },
  
  // Appointments
  APPOINTMENTS: {
    BASE: '/appointments',
    DOCTORS: '/appointments/doctors/list',
    DOCTOR_AVAILABILITY: (doctorId: string) => `/appointments/doctors/${doctorId}/availability`,
    BY_ID: (id: string) => `/appointments/${id}`,
  },
  
  // Prescriptions
  PRESCRIPTIONS: {
    BASE: '/prescriptions',
    BY_ID: (id: string) => `/prescriptions/${id}`,
    STATUS: (id: string) => `/prescriptions/${id}/status`,
    DISPENSE_ITEM: (itemId: string) => `/prescriptions/items/${itemId}/dispense`,
    OCR_PROCESS: '/prescriptions/ocr/process',
    ANALYTICS: '/prescriptions/analytics',
  },
  
  // Medicines
  MEDICINES: {
    BASE: '/medicines',
    BY_ID: (id: string) => `/medicines/${id}`,
    SUGGESTIONS: '/medicines/suggestions',
    INTERACTIONS_CHECK: '/medicines/interactions/check',
    INTERACTIONS: '/medicines/interactions',
    ANALYTICS: '/medicines/analytics',
  },
  
  // Lab Results
  LAB_RESULTS: {
    BASE: '/lab-results',
    BY_ID: (id: string) => `/lab-results/${id}`,
    AVAILABLE_TESTS: '/lab-results/available-tests',
    ANALYTICS: '/lab-results/analytics',
  },
  
  // Pharmacy
  PHARMACY: {
    NEARBY: '/pharmacies/nearby',
    INVENTORY: '/pharmacies/inventory',
    INVENTORY_ITEM: (id: string) => `/pharmacies/inventory/${id}`,
    LOW_STOCK_ALERTS: '/pharmacies/alerts/low-stock',
    EXPIRING_ALERTS: '/pharmacies/alerts/expiring',
    ANALYTICS: '/pharmacies/analytics',
  },
  
  // Notifications
  NOTIFICATIONS: {
    BASE: '/notifications',
    BY_ID: (id: string) => `/notifications/${id}`,
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    DELETE_ALL_READ: '/notifications/read/all',
    PREFERENCES: '/notifications/preferences',
    BULK: '/notifications/bulk',
  },
  
  // Chat
  CHAT: {
    SEND: '/chat/send',
    CONVERSATIONS: '/chat/conversations',
    PARTICIPANTS: '/chat/participants',
    MESSAGES: (userId: string) => `/chat/${userId}/messages`,
    MARK_READ: (messageId: string) => `/chat/messages/${messageId}/read`,
    DELETE_MESSAGE: (messageId: string) => `/chat/messages/${messageId}`,
  },
  
  // Files
  FILES: {
    UPLOAD: '/files/upload',
    BASE: '/files',
    DOWNLOAD: (id: string) => `/files/${id}/download`,
    THUMBNAIL: (id: string) => `/files/${id}/thumbnail`,
    BY_ID: (id: string) => `/files/${id}`,
    ANALYTICS: '/files/analytics',
  },
  
  // OCR
  OCR: {
    PROCESS: '/ocr/process',
    VALIDATE: '/ocr/validate',
    ENHANCE: '/ocr/enhance',
    HISTORY: '/ocr/history',
    ANALYTICS: '/ocr/analytics',
  },
  
  // Payments
  PAYMENTS: {
    BASE: '/payments',
    INTENT: '/payments/intent',
    CONFIRM: '/payments/confirm',
    BY_ID: (id: string) => `/payments/${id}`,
    REFUND: (id: string) => `/payments/${id}/refund`,
    WEBHOOK: '/payments/webhook',
    ANALYTICS: '/payments/analytics',
  },
  
  // Analytics
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    ACTIVITY: '/analytics/activity',
    HEALTH: '/analytics/health',
    DOCTOR: '/analytics/doctor',
    PHARMACY: '/analytics/pharmacy',
    SYSTEM: '/analytics/system',
  },
  
  // Health Check
  HEALTH: '/health',
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  UNAUTHORIZED: 'Please log in to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  CONFLICT: 'This resource already exists.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN_ERROR: 'An unknown error occurred. Please try again.',
};

// Socket Events
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  JOIN: 'join',
  
  // Notifications
  NEW_NOTIFICATION: 'new_notification',
  SEND_NOTIFICATION: 'send_notification',
  
  // Chat
  NEW_MESSAGE: 'new_message',
  SEND_MESSAGE: 'send_message',
  
  // Prescription Updates
  PRESCRIPTION_UPDATED: 'prescription_updated',
  PRESCRIPTION_UPDATE: 'prescription_update',
};