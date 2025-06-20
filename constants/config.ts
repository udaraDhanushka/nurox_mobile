import { Platform } from 'react-native';
import { AppConfig, CameraSettings, AnalysisPreferences } from '@/types/medical';

// Environment-based configuration
const isDevelopment = __DEV__;
const isProduction = !__DEV__;

// API Configuration
export const API_CONFIG = {
  BASE_URL: isDevelopment 
    ? 'https://dev-api.medapp.com'
    : 'https://api.medapp.com',
  
  ENDPOINTS: {
    UPLOAD: '/prescriptions/upload',
    ANALYZE: '/prescriptions/analyze',
    OCR: '/ocr/process',
    VALIDATE: '/medicines/validate',
    DOWNLOAD: '/prescriptions/download',
  },
  
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-API-Version': '1.0',
  },
};

// Upload Configuration
export const UPLOAD_CONFIG = {
  // File size limits (in bytes)
  MAX_FILE_SIZE: {
    IMAGE: 10 * 1024 * 1024, // 10MB
    PDF: 25 * 1024 * 1024,   // 25MB
  },
  
  // Supported file types
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif'],
    DOCUMENTS: ['application/pdf'],
  },
  
  // Mime type mapping
  MIME_TYPES: {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'heic': 'image/heic',
    'heif': 'image/heif',
    'pdf': 'application/pdf',
  },
  
  // Image processing
  IMAGE_PROCESSING: {
    DEFAULT_COMPRESSION: 0.8,
    MAX_RESOLUTION: {
      width: 2048,
      height: 2048,
    },
    THUMBNAIL_SIZE: {
      width: 300,
      height: 200,
    },
    SUPPORTED_FORMATS: ['jpeg', 'png'],
  },
  
  // Processing timeouts
  TIMEOUTS: {
    UPLOAD: 60000,      // 1 minute
    PROCESSING: 120000, // 2 minutes
    ANALYSIS: 180000,   // 3 minutes
  },
  
  // Queue settings
  QUEUE: {
    MAX_CONCURRENT_UPLOADS: 2,
    MAX_QUEUE_SIZE: 10,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 5000, // 5 seconds
  },
};

// Camera Configuration
export const CAMERA_CONFIG = {
  DEFAULT_SETTINGS: {
    flashMode: 'auto' as const,
    focusMode: 'auto' as const,
    showGrid: true,
    quality: 'high' as const,
    imageFormat: 'jpeg' as const,
  },
  
  QUALITY_SETTINGS: {
    low: 0.3,
    medium: 0.6,
    high: 0.8,
  },
  
  ASPECT_RATIOS: {
    '4:3': 4 / 3,
    '16:9': 16 / 9,
    '1:1': 1,
  },
  
  // Platform-specific settings
  IOS: {
    preferredTimescale: 30,
    videoStabilizationMode: 'auto',
  },
  
  ANDROID: {
    pictureSize: 'high',
    autoFocus: 'on',
  },
};

// Analysis Configuration
export const ANALYSIS_CONFIG = {
  // Confidence thresholds
  CONFIDENCE_LEVELS: {
    HIGH: 0.9,
    MEDIUM: 0.7,
    LOW: 0.5,
    MINIMUM: 0.3,
  },
  
  // OCR settings
  OCR: {
    LANGUAGE: 'en',
    ENGINE: 'tesseract',
    PSM: 6, // Page segmentation mode
    OEM: 3, // OCR Engine mode
    CONFIDENCE_THRESHOLD: 0.6,
  },
  
  // Medicine detection
  MEDICINE_DETECTION: {
    MIN_TEXT_LENGTH: 3,
    MAX_TEXT_LENGTH: 50,
    COMMON_DOSAGE_UNITS: ['mg', 'g', 'ml', 'mcg', 'IU', 'units'],
    FREQUENCY_PATTERNS: [
      'once daily', 'twice daily', 'three times daily',
      'every 4 hours', 'every 6 hours', 'every 8 hours', 'every 12 hours',
      'as needed', 'before meals', 'after meals', 'at bedtime'
    ],
  },
  
  // Image quality assessment
  IMAGE_QUALITY: {
    MIN_CLARITY: 0.6,
    MIN_LIGHTING: 0.5,
    MIN_ANGLE: 0.7,
    BLUR_THRESHOLD: 0.8,
    BRIGHTNESS_RANGE: [50, 200], // 0-255 scale
  },
  
  // Processing steps
  PROCESSING_STEPS: [
    {
      id: 'preprocess',
      name: 'Image Preprocessing',
      description: 'Enhancing image quality and removing noise',
      estimatedDuration: 2000,
    },
    {
      id: 'ocr',
      name: 'Text Recognition',
      description: 'Extracting text from prescription image',
      estimatedDuration: 3000,
    },
    {
      id: 'nlp',
      name: 'Medical Text Analysis',
      description: 'Identifying medicine names and dosages',
      estimatedDuration: 2500,
    },
    {
      id: 'validation',
      name: 'Medicine Validation',
      description: 'Verifying against medical database',
      estimatedDuration: 1500,
    },
    {
      id: 'results',
      name: 'Generating Results',
      description: 'Compiling detected medicines',
      estimatedDuration: 1000,
    },
  ],
};

// Storage Configuration
export const STORAGE_CONFIG = {
  // AsyncStorage keys
  KEYS: {
    PRESCRIPTIONS: 'medical_prescriptions',
    UPLOAD_HISTORY: 'upload_history',
    CAMERA_SETTINGS: 'camera_settings',
    ANALYSIS_PREFERENCES: 'analysis_preferences',
    PRIVACY_SETTINGS: 'privacy_settings',
    USER_PREFERENCES: 'user_preferences',
  },
  
  // Cache settings
  CACHE: {
    MAX_SIZE: 50 * 1024 * 1024, // 50MB
    CLEANUP_THRESHOLD: 0.8, // 80% full
    DEFAULT_TTL: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  
  // File storage
  FILE_STORAGE: {
    UPLOAD_FOLDER: 'uploads',
    PROCESSED_FOLDER: 'processed',
    THUMBNAILS_FOLDER: 'thumbnails',
    TEMP_FOLDER: 'temp',
  },
};

// UI Configuration
export const UI_CONFIG = {
  // Animation durations
  ANIMATIONS: {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500,
    VERY_SLOW: 1000,
  },
  
  // Haptic feedback
  HAPTICS: {
    ENABLED: Platform.OS === 'ios',
    LIGHT: 'light',
    MEDIUM: 'medium',
    HEAVY: 'heavy',
  },
  
  // Progress indicators
  PROGRESS: {
    UPDATE_INTERVAL: 100, // ms
    SMOOTH_FACTOR: 0.1,
  },
  
  // Modals
  MODALS: {
    ANIMATION_TYPE: 'slide' as const,
    PRESENTATION_STYLE: Platform.OS === 'ios' ? 'pageSheet' : 'overFullScreen',
  },
  
  // Lists
  LISTS: {
    INITIAL_NUM_TO_RENDER: 10,
    MAX_TO_RENDER_PER_BATCH: 5,
    WINDOW_SIZE: 10,
  },
};

// Error Configuration
export const ERROR_CONFIG = {
  // Error codes
  CODES: {
    NETWORK_ERROR: 'NETWORK_ERROR',
    UPLOAD_FAILED: 'UPLOAD_FAILED',
    PROCESSING_FAILED: 'PROCESSING_FAILED',
    ANALYSIS_FAILED: 'ANALYSIS_FAILED',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    FILE_TOO_LARGE: 'FILE_TOO_LARGE',
    INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
    QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
    TIMEOUT: 'TIMEOUT',
  },
  
  // Error messages
  MESSAGES: {
    NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
    UPLOAD_FAILED: 'Failed to upload file. Please try again.',
    PROCESSING_FAILED: 'Failed to process the prescription. Please try with a clearer image.',
    ANALYSIS_FAILED: 'Failed to analyze the prescription. Please try again.',
    PERMISSION_DENIED: 'Permission denied. Please grant the required permissions.',
    FILE_TOO_LARGE: 'File is too large. Please select a smaller file.',
    INVALID_FILE_TYPE: 'Invalid file type. Please select a valid image or PDF file.',
    QUOTA_EXCEEDED: 'Upload quota exceeded. Please try again later.',
    TIMEOUT: 'Request timed out. Please try again.',
  },
  
  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAYS: [1000, 2000, 5000], // Progressive delays in ms
    RETRIABLE_CODES: ['NETWORK_ERROR', 'TIMEOUT', 'UPLOAD_FAILED'],
  },
};

// Analytics Configuration
export const ANALYTICS_CONFIG = {
  ENABLED: !isDevelopment,
  
  // Event names
  EVENTS: {
    UPLOAD_STARTED: 'prescription_upload_started',
    UPLOAD_COMPLETED: 'prescription_upload_completed',
    UPLOAD_FAILED: 'prescription_upload_failed',
    MEDICINE_DETECTED: 'medicine_detected',
    MEDICINE_VERIFIED: 'medicine_verified',
    CAMERA_OPENED: 'camera_opened',
    IMAGE_ENHANCED: 'image_enhanced',
    ANALYSIS_COMPLETED: 'analysis_completed',
    ERROR_OCCURRED: 'error_occurred',
  },
  
  // Properties to track
  PROPERTIES: {
    USER_ID: 'user_id',
    SESSION_ID: 'session_id',
    DEVICE_TYPE: 'device_type',
    OS_VERSION: 'os_version',
    APP_VERSION: 'app_version',
    UPLOAD_TYPE: 'upload_type',
    FILE_SIZE: 'file_size',
    PROCESSING_TIME: 'processing_time',
    CONFIDENCE_SCORE: 'confidence_score',
    MEDICINES_COUNT: 'medicines_count',
    ERROR_CODE: 'error_code',
  },
};

// Feature Flags
export const FEATURE_FLAGS = {
  // Core features
  CAMERA_UPLOAD: true,
  GALLERY_UPLOAD: true,
  PDF_UPLOAD: true,
  
  // Enhancement features
  IMAGE_ENHANCEMENT: true,
  AUTO_CROP: true,
  BRIGHTNESS_ADJUSTMENT: true,
  CONTRAST_ADJUSTMENT: true,
  
  // Analysis features
  OCR_PROCESSING: true,
  MEDICINE_VALIDATION: true,
  DRUG_INTERACTION_CHECK: true,
  ALTERNATIVE_NAMES: true,
  
  // UI features
  PROGRESS_ANIMATIONS: true,
  HAPTIC_FEEDBACK: Platform.OS === 'ios',
  DARK_MODE: true,
  
  // Advanced features
  BATCH_UPLOAD: false,
  CLOUD_SYNC: false,
  OFFLINE_MODE: true,
  
  // Debug features
  DEBUG_MODE: isDevelopment,
  MOCK_API: isDevelopment,
  VERBOSE_LOGGING: isDevelopment,
};

// Performance Configuration
export const PERFORMANCE_CONFIG = {
  // Memory management
  MEMORY: {
    IMAGE_CACHE_SIZE: 20 * 1024 * 1024, // 20MB
    RESULT_CACHE_SIZE: 5 * 1024 * 1024,  // 5MB
    CLEANUP_INTERVAL: 5 * 60 * 1000,     // 5 minutes
  },
  
  // Processing limits
  PROCESSING: {
    MAX_CONCURRENT_OPERATIONS: 2,
    THROTTLE_DELAY: 100, // ms
    DEBOUNCE_DELAY: 300, // ms
  },
  
  // Network optimization
  NETWORK: {
    CONNECTION_TIMEOUT: 10000, // 10 seconds
    READ_TIMEOUT: 30000,       // 30 seconds
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,         // 1 second
  },
};

// Accessibility Configuration
export const ACCESSIBILITY_CONFIG = {
  // Screen reader support
  SCREEN_READER: {
    ENABLED: true,
    ANNOUNCEMENT_DELAY: 500, // ms
  },
  
  // Keyboard navigation
  KEYBOARD_NAVIGATION: {
    ENABLED: Platform.OS === 'web',
    TAB_ORDER: true,
  },
  
  // Visual accessibility
  VISUAL: {
    HIGH_CONTRAST_MODE: false,
    LARGE_TEXT_MODE: false,
    REDUCE_MOTION: false,
  },
  
  // Audio feedback
  AUDIO: {
    SUCCESS_SOUND: true,
    ERROR_SOUND: true,
    PROGRESS_SOUND: false,
  },
};

// Development Configuration
export const DEV_CONFIG = {
  // Logging
  LOGGING: {
    LEVEL: isDevelopment ? 'debug' : 'error',
    INCLUDE_STACK_TRACE: isDevelopment,
    LOG_API_CALLS: isDevelopment,
    LOG_PERFORMANCE: isDevelopment,
  },
  
  // Mock data
  MOCK: {
    ENABLE_MOCK_API: isDevelopment,
    MOCK_DELAY: 1000, // ms
    MOCK_SUCCESS_RATE: 0.9, // 90% success rate
  },
  
  // Debug features
  DEBUG: {
    SHOW_PERFORMANCE_OVERLAY: false,
    ENABLE_FLIPPER: isDevelopment,
    ENABLE_REACTOTRON: isDevelopment,
  },
};

// Complete app configuration
export const APP_CONFIG: AppConfig = {
  api: {
    baseUrl: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    retryAttempts: API_CONFIG.RETRY_ATTEMPTS,
  },
  
  upload: {
    maxFileSize: UPLOAD_CONFIG.MAX_FILE_SIZE.IMAGE,
    allowedTypes: [...UPLOAD_CONFIG.ALLOWED_TYPES.IMAGES, ...UPLOAD_CONFIG.ALLOWED_TYPES.DOCUMENTS],
    compressionQuality: UPLOAD_CONFIG.IMAGE_PROCESSING.DEFAULT_COMPRESSION,
    processingTimeout: UPLOAD_CONFIG.TIMEOUTS.PROCESSING,
  },
  
  camera: {
    defaultQuality: CAMERA_CONFIG.QUALITY_SETTINGS.high,
    maxResolution: UPLOAD_CONFIG.IMAGE_PROCESSING.MAX_RESOLUTION,
  },
  
  analytics: {
    enabled: ANALYTICS_CONFIG.ENABLED,
    endpoint: isDevelopment ? undefined : 'https://analytics.medapp.com',
  },
};

// Utility functions
export const getFileTypeFromMimeType = (mimeType: string): 'image' | 'pdf' | 'unknown' => {
  if (UPLOAD_CONFIG.ALLOWED_TYPES.IMAGES.includes(mimeType)) {
    return 'image';
  }
  if (UPLOAD_CONFIG.ALLOWED_TYPES.DOCUMENTS.includes(mimeType)) {
    return 'pdf';
  }
  return 'unknown';
};

export const isValidFileSize = (size: number, type: 'image' | 'pdf'): boolean => {
  const maxSize = type === 'image' 
    ? UPLOAD_CONFIG.MAX_FILE_SIZE.IMAGE 
    : UPLOAD_CONFIG.MAX_FILE_SIZE.PDF;
  return size <= maxSize;
};

export const getQualityFromSettings = (quality: 'low' | 'medium' | 'high'): number => {
  return CAMERA_CONFIG.QUALITY_SETTINGS[quality];
};

export const isFeatureEnabled = (feature: keyof typeof FEATURE_FLAGS): boolean => {
  return FEATURE_FLAGS[feature];
};

export const getErrorMessage = (errorCode: string): string => {
  return ERROR_CONFIG.MESSAGES[errorCode as keyof typeof ERROR_CONFIG.MESSAGES] || 'An unexpected error occurred.';
};

// Export all configurations
export default {
  API_CONFIG,
  UPLOAD_CONFIG,
  CAMERA_CONFIG,
  ANALYSIS_CONFIG,
  STORAGE_CONFIG,
  UI_CONFIG,
  ERROR_CONFIG,
  ANALYTICS_CONFIG,
  FEATURE_FLAGS,
  PERFORMANCE_CONFIG,
  ACCESSIBILITY_CONFIG,
  DEV_CONFIG,
  APP_CONFIG,
};