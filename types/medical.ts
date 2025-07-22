export type PrescriptionStatus = 'active' | 'processing' | 'completed' | 'cancelled';

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

// Enhanced types for detected medicines from prescription uploads
export interface DetectedMedicine {
  id?: string;
  name: string;
  dosage: string;
  frequency: string;
  confidence: number;
  detected: boolean;
  isVerified?: boolean;
  notes?: string;
  boundingBox?: BoundingBox;
  editHistory?: MedicineEdit[];
  source: 'prescription' | 'detected' | 'manual';
  createdAt?: string;
  updatedAt?: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MedicineEdit {
  field: keyof DetectedMedicine;
  oldValue: any;
  newValue: any;
  editedAt: string;
  editedBy?: string;
}

export interface UploadedPrescription {
  id: string;
  type: 'photo' | 'gallery' | 'pdf';
  timestamp: string;
  fileName: string;
  fileSize: number;
  uri: string;
  originalUri?: string;
  enhancedUri?: string;
  thumbnailUri?: string;
  uploadStatus: 'uploading' | 'processing' | 'completed' | 'failed';
  processingOptions?: ProcessingOptions;
  analysisResult?: AnalysisResult;
  metadata?: FileMetadata;
}

export interface ProcessingOptions {
  enhanceImage?: boolean;
  cropToContent?: boolean;
  adjustBrightness?: number;
  adjustContrast?: number;
  rotation?: number;
  compressionQuality?: number;
}

export interface AnalysisResult {
  detectedMedicines: DetectedMedicine[];
  confidence: number;
  processingTime: number;
  imageQuality: ImageQuality;
  ocrConfidence?: number;
  error?: string;
  warnings?: string[];
  suggestions?: string[];
}

export interface ImageQuality {
  clarity: number;
  lighting: number;
  angle: number;
  overall: number;
  issues?: QualityIssue[];
}

export interface QualityIssue {
  type: 'blur' | 'darkness' | 'glare' | 'angle' | 'partial';
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestion: string;
}

export interface FileMetadata {
  originalName: string;
  mimeType: string;
  dimensions?: {
    width: number;
    height: number;
  };
  exifData?: any;
  checksum?: string;
}

// Enhanced Prescription interface
export interface Prescription {
  id: string;
  date: string;
  doctorName: string;
  patientName?: string;
  patientId?: string;
  condition?: string;
  medications: Medication[];
  pharmacy?: string; // Made optional since it can be "Not selected"
  refillsRemaining: number;
  status: PrescriptionStatus;
  notes?: string;
  
  // Upload-related fields
  detectedMedicines?: DetectedMedicine[];
  uploadedPrescriptions?: UploadedPrescription[];
  uploadHistory?: UploadHistoryEntry[];
  lastUpdated?: string;
  
  // Verification and validation
  isVerified?: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  validationErrors?: ValidationError[];
  
  // Additional metadata
  prescriptionNumber?: string;
  issueLocation?: string;
  emergencyContact?: string;
  allergies?: string[];
  drugInteractions?: DrugInteraction[];
}

export interface UploadHistoryEntry {
  id: string;
  timestamp: string;
  action: 'upload' | 'edit' | 'verify' | 'delete';
  details: any;
  userId?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  suggestion?: string;
}

export interface DrugInteraction {
  medicineA: string;
  medicineB: string;
  severity: 'minor' | 'moderate' | 'major';
  description: string;
  recommendation: string;
}

// FIXED: Upload result types - Added missing analysisResult property
export interface UploadResult {
  type: 'photo' | 'gallery' | 'pdf';
  uri: string;
  fileName: string;
  detectedMedicines: DetectedMedicine[];
  confidence: number;
  processingTime: number;
  uploadedPrescription: UploadedPrescription;
  analysisResult: AnalysisResult;
}

// Enhanced Pharmacy related types
export interface PharmacyMedicine {
  id: string;
  medicineName: string;
  genericName?: string;
  brand?: string;
  price: number;
  inStock: boolean;
  quantity?: number;
  expiryDate?: string;
  batchNumber?: string;
  manufacturer?: string;
  ndcNumber?: string; // National Drug Code
}

export interface PharmacyService {
  name: string;
  description: string;
  available: boolean;
  price?: number;
}

export interface PharmacyFeature {
  name: string;
  icon: string;
  available: boolean;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  distance: number;
  rating: number;
  reviews: number;
  phone: string;
  email?: string;
  website?: string;
  isOpen: boolean;
  workingHours: {
    open: string;
    close: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  medicines: PharmacyMedicine[];
  services?: PharmacyService[];
  insurance?: string[];
  features?: PharmacyFeature[];
}

// Enhanced Send prescription modal types
export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  copay?: number;
}

export interface SendPrescriptionDetails {
  pharmacy: Pharmacy;
  prescriptionMedicines: string[];
  detectedMedicines?: DetectedMedicine[];
  specialInstructions?: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  notifyWhenReady: boolean;
  deliveryOption?: 'pickup' | 'delivery';
  deliveryAddress?: string;
  preferredTime?: string;
  insuranceInfo?: InsuranceInfo;
}

// Camera and capture types
export interface CameraSettings {
  flashMode: 'on' | 'off' | 'auto';
  focusMode: 'auto' | 'manual';
  showGrid: boolean;
  quality: 'low' | 'medium' | 'high';
  imageFormat: 'jpeg' | 'png';
}

export interface CaptureResult {
  uri: string;
  width: number;
  height: number;
  base64?: string;
  exif?: any;
  timestamp: string;
}

// Analysis and processing types
export interface ProcessingStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  duration?: number;
  error?: string;
}

export interface OCRResult {
  text: string;
  confidence: number;
  boundingBoxes: Array<{
    text: string;
    boundingBox: BoundingBox;
    confidence: number;
  }>;
  language?: string;
  orientation?: number;
}

export interface MLAnalysisResult {
  medicines: DetectedMedicine[];
  confidence: number;
  processingModel: string;
  modelVersion: string;
  alternatives?: Array<{
    medicine: DetectedMedicine;
    probability: number;
  }>;
}

// Lab result types
export interface LabResult {
  name: string;
  value: string;
  normalRange: string;
  isNormal: boolean;
  unit?: string;
  flag?: 'Normal' | 'High' | 'Low' | 'Critical';
  previousValue?: string;
  trend?: 'up' | 'down' | 'stable';
  comments?: string;
}

// Enhanced result types with more detail
export interface DetailedLabResult extends LabResult {
  unit?: string;
  flag?: 'Normal' | 'High' | 'Low' | 'Critical';
  previousValue?: string;
  trend?: 'up' | 'down' | 'stable';
  comments?: string;
}

export interface TestCenter {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance: number;
  rating: number;
  reviews: number;
  isOpen: boolean;
  openHours: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  availableTests: Array<{
    name: string;
    price: number;
    duration: string;
    availableSlots: number;
  }>;
  nextAvailableSlot: string;
}

export interface BookingDetails {
  testCenter: {
    id: string;
    name: string;
    address: string;
    phone: string;
  };
  testName: string;
  date: string;
  time: string;
  dateLabel?: string;
  dateDisplay?: string;
  patientInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  bookingId: string;
  bookingTime: string;
}

export interface Notification {
  id: string;
  type: 'booking_confirmed' | 'reminder' | 'results_ready' | 'test_completed' | 'prescription_ready' | 'upload_complete' | 'verification_needed';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  relatedId?: string; // ID of related lab report or prescription
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
  category: 'prescription' | 'lab' | 'appointment' | 'general';
}

export interface LabReport {
  id: string;
  testName: string;
  date: string;
  labName: string;
  orderedBy: string;
  status: 'pending' | 'completed' | 'cancelled';
  results?: LabResult[];
  notes?: string;
  bookingDetails?: BookingDetails;
  notifications?: Notification[];
}

// Enhanced lab report with more comprehensive data
export interface DetailedLabReport extends LabReport {
  results?: DetailedLabResult[];
  referenceDoctor?: {
    name: string;
    specialization: string;
    phone?: string;
    email?: string;
  };
  testCategory?: 'blood' | 'urine' | 'imaging' | 'biopsy' | 'other';
  fastingRequired?: boolean;
  preparationInstructions?: string[];
  estimatedDuration?: string;
  priority?: 'routine' | 'urgent' | 'stat';
  uploadedNotes?: LabNoteUpload[];
}

// Enhanced prescription with more comprehensive data
export interface DetailedPrescription extends Prescription {
  prescriptionImage?: string;
  qrCode?: string;
  verificationCode?: string;
  pharmacyHistory?: Array<{
    pharmacyName: string;
    fillDate: string;
    cost: number;
  }>;
  sideEffects?: string[];
  drugInteractions?: DrugInteraction[];
  allergies?: string[];
  prescriptionUploads?: PrescriptionUpload[];
}

// Sharing related types (enhanced)
export interface ShareSettings {
  includePersonalInfo: boolean;
  sharePrivately: boolean;
  expiresAfter?: string; // For secure links
  customMessage?: string;
  includeDetectedMedicines?: boolean;
  includeUploadHistory?: boolean;
  includeAnalysisResults?: boolean;
  watermarkImage?: boolean;
  passwordProtect?: boolean;
}

export interface ShareData {
  type: 'lab-report' | 'prescription';
  data: LabReport | Prescription;
  method: 'email' | 'sms' | 'secure-link' | 'pdf' | 'native' | 'whatsapp';
  recipient?: string;
  settings: ShareSettings;
  shareId?: string;
  createdAt: string;
  expiresAt?: string;
}

// Test Center related types
export interface TestCenterFilter {
  sortBy: 'distance' | 'price' | 'rating';
  maxDistance?: number;
  maxPrice?: number;
  minRating?: number;
  openNow?: boolean;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  booked?: boolean;
}

export interface AvailableSlots {
  [date: string]: TimeSlot[];
}

// Upload related types
export interface LabNoteUpload {
  id: string;
  type: 'photo' | 'pdf' | 'document';
  fileName: string;
  fileSize: number;
  uploadDate: string;
  labReportId: string;
  url?: string; // For accessing the uploaded file
}

export interface PrescriptionUpload {
  id: string;
  type: 'photo' | 'gallery' | 'pdf';
  fileName: string;
  fileSize: number;
  uploadDate: string;
  prescriptionId: string;
  detectedMedicines: DetectedMedicine[];
  url?: string;
  analysisStatus: 'pending' | 'completed' | 'failed';
}

// Enhanced Location related types
export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

// Modal component props types
export interface ShareModalProps {
  visible: boolean;
  prescription?: any; // Keep for backward compatibility
  onClose: () => void;
  type: 'prescription' | 'lab-report';
  data: Prescription | LabReport;
}

export interface SendPrescriptionModalProps {
  visible: boolean;
  pharmacy: Pharmacy | null;
  prescriptionMedicines: string[];
  detectedMedicines?: DetectedMedicine[];
  onConfirm: (details: SendPrescriptionDetails) => void;
  onCancel: () => void;
}

export interface BookingModalProps {
  visible: boolean;
  testCenter: TestCenter | null;
  testName: string;
  onConfirm: (details: BookingDetails) => void;
  onCancel: () => void;
}

export interface UploadPrescriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onUploadComplete: (result: UploadResult) => void;
  prescriptionId: string;
  existingMedicines?: Medication[];
}

// Enhanced Store types
export interface UploadQueueItem {
  id: string;
  prescriptionId: string;
  file: {
    uri: string;
    name: string;
    type: string;
    size: number;
  };
  priority: 'low' | 'normal' | 'high';
  addedAt: string;
  estimatedProcessingTime?: number;
}

export interface ProcessingUpload {
  id: string;
  prescriptionId: string;
  fileName: string;
  status: 'uploading' | 'processing' | 'analyzing' | 'finalizing';
  progress: number;
  currentStep?: ProcessingStep;
  startedAt: string;
  estimatedCompletion?: string;
}

export interface AnalysisPreferences {
  autoEnhanceImages: boolean;
  confidenceThreshold: number;
  enableMedicineValidation: boolean;
  includeAlternativeNames: boolean;
  detectDosageInstructions: boolean;
  flagInteractions: boolean;
}

export interface PrivacySettings {
  shareAnalyticsData: boolean;
  saveProcessedImages: boolean;
  allowCloudBackup: boolean;
  requirePasswordForSensitiveActions: boolean;
  dataRetentionPeriod: number; // days
}

export interface MedicalStoreState {
  prescriptions: Prescription[];
  labReports: LabReport[];
  notifications: Notification[];
  userLocation: UserLocation | null;
  nearbyPharmacies: Pharmacy[];
  nearbyTestCenters: TestCenter[];
  
  // Upload-related state
  uploadQueue: UploadQueueItem[];
  processingUploads: ProcessingUpload[];
  uploadHistory: UploadHistoryEntry[];
  
  // Settings and preferences
  cameraSettings: CameraSettings;
  analysisPreferences: AnalysisPreferences;
  privacySettings: PrivacySettings;
}

// Enhanced Store action types
export interface MedicalStoreActions {
  // Prescription actions
  addPrescription: (prescription: Prescription) => void;
  updatePrescription: (id: string, updates: Partial<Prescription>) => void;
  deletePrescription: (id: string) => void;
  verifyPrescription: (id: string, verifiedBy: string) => void;
  
  // Upload actions
  addUploadToQueue: (item: UploadQueueItem) => void;
  removeFromUploadQueue: (id: string) => void;
  startProcessingUpload: (queueItemId: string) => void;
  updateProcessingStatus: (id: string, status: ProcessingUpload['status'], progress: number) => void;
  completeUpload: (id: string, result: UploadResult) => void;
  failUpload: (id: string, error: string) => void;
  
  // Medicine actions
  addDetectedMedicine: (prescriptionId: string, medicine: DetectedMedicine) => void;
  updateDetectedMedicine: (prescriptionId: string, medicineId: string, updates: Partial<DetectedMedicine>) => void;
  removeDetectedMedicine: (prescriptionId: string, medicineId: string) => void;
  verifyDetectedMedicine: (prescriptionId: string, medicineId: string, verified: boolean) => void;
  
  // Lab report actions
  addLabReport: (labReport: LabReport) => void;
  updateLabReport: (id: string, updates: Partial<LabReport>) => void;
  deleteLabReport: (id: string) => void;
  
  // Notification actions
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  
  // Location actions
  updateUserLocation: (location: UserLocation) => void;
  
  // Pharmacy actions
  updateNearbyPharmacies: (pharmacies: Pharmacy[]) => void;
  
  // Test center actions
  updateNearbyTestCenters: (testCenters: TestCenter[]) => void;
  
  // Settings actions
  updateCameraSettings: (settings: Partial<CameraSettings>) => void;
  updateAnalysisPreferences: (preferences: Partial<AnalysisPreferences>) => void;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;
  
  // History actions
  addToUploadHistory: (entry: UploadHistoryEntry) => void;
  clearUploadHistory: (prescriptionId?: string) => void;
}

// Lab Test Request types
export interface LabTestRequest {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  requestedTests: string[];
  priority: 'routine' | 'urgent' | 'stat';
  clinicalNotes?: string;
  symptoms?: string;
  requestDate: string;
  expectedDate?: string;
  status: 'pending' | 'approved' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  assignedTestCenter?: {
    id: string;
    name: string;
    address: string;
  };
  labReportId?: string; // Links to the actual lab report when completed
  createdAt: string;
  updatedAt?: string;
}

export interface LabTestTemplate {
  id: string;
  name: string;
  tests: string[];
  description: string;
  category: string;
  preparationInstructions?: string[];
  fastingRequired?: boolean;
  estimatedTime?: string;
  price?: number;
}

export interface LabTestRequestData {
  patientId: string;
  patientName: string;
  requestedTests: string[];
  priority: 'routine' | 'urgent' | 'stat';
  clinicalNotes?: string;
  symptoms?: string;
  expectedDate?: string;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  userId?: string;
  context?: string;
}

// API response types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: AppError;
  message?: string;
  timestamp: string;
}

// Configuration types
export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
  };
  upload: {
    maxFileSize: number;
    allowedTypes: string[];
    compressionQuality: number;
    processingTimeout: number;
  };
  camera: {
    defaultQuality: number;
    maxResolution: {
      width: number;
      height: number;
    };
  };
  analytics: {
    enabled: boolean;
    endpoint?: string;
  };
}