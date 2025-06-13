export type PrescriptionStatus = 'active' | 'processing' | 'completed' | 'cancelled';

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

// Types for detected medicines from prescription uploads
export interface DetectedMedicine {
  name: string;
  dosage: string;
  frequency: string;
  detected: boolean;
}

export interface UploadedPrescription {
  type: 'photo' | 'gallery' | 'pdf';
  timestamp: string;
  fileName?: string;
  fileSize?: number;
  url?: string;
}

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
  detectedMedicines?: DetectedMedicine[]; // For uploaded prescription analysis
  uploadedPrescription?: UploadedPrescription; // For tracking uploads
}

// Pharmacy related types
export interface PharmacyMedicine {
  id: string;
  medicineName: string;
  price: number;
  inStock: boolean;
  quantity?: number;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  distance: number;
  rating: number;
  reviews: number;
  phone: string;
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
}

// Send prescription modal types
export interface SendPrescriptionDetails {
  pharmacy: Pharmacy;
  prescriptionMedicines: string[];
  specialInstructions?: string;
  urgency?: 'routine' | 'urgent';
  notifyWhenReady?: boolean;
}

export interface LabResult {
  name: string;
  value: string;
  normalRange: string;
  isNormal: boolean;
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
  type: 'booking_confirmed' | 'reminder' | 'results_ready' | 'test_completed' | 'prescription_ready';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  relatedId?: string; // ID of related lab report or prescription
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

// Sharing related types
export interface ShareSettings {
  includePersonalInfo: boolean;
  sharePrivately: boolean;
  expiresAfter?: string; // For secure links
  customMessage?: string;
}

export interface ShareData {
  type: 'lab-report' | 'prescription';
  data: LabReport | Prescription;
  method: 'email' | 'sms' | 'secure-link' | 'pdf' | 'native';
  recipient?: string;
  settings: ShareSettings;
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

// Location related types
export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: string;
}

// Enhanced result types with more detail
export interface DetailedLabResult extends LabResult {
  unit?: string;
  flag?: 'Normal' | 'High' | 'Low' | 'Critical';
  previousValue?: string;
  trend?: 'up' | 'down' | 'stable';
  comments?: string;
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
  drugInteractions?: string[];
  allergies?: string[];
  uploadHistory?: PrescriptionUpload[];
}

// Modal component props types
export interface ShareModalProps {
  visible: boolean;
  prescription: any,
  onClose: () => void;
  type: 'prescription' | 'lab-report';
  data: Prescription | LabReport;
}

export interface SendPrescriptionModalProps {
  visible: boolean;
  pharmacy: Pharmacy | null;
  prescriptionMedicines: string[];
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

// Store action types
export interface MedicalStoreState {
  prescriptions: Prescription[];
  labReports: LabReport[];
  notifications: Notification[];
  userLocation: UserLocation | null;
  nearbyPharmacies: Pharmacy[];
  nearbyTestCenters: TestCenter[];
}

export interface MedicalStoreActions {
  // Prescription actions
  addPrescription: (prescription: Prescription) => void;
  updatePrescription: (id: string, updates: Partial<Prescription>) => void;
  deletePrescription: (id: string) => void;
  
  // Lab report actions
  addLabReport: (labReport: LabReport) => void;
  updateLabReport: (id: string, updates: Partial<LabReport>) => void;
  deleteLabReport: (id: string) => void;
  
  // Notification actions
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  
  // Location actions
  updateUserLocation: (location: UserLocation) => void;
  
  // Pharmacy actions
  updateNearbyPharmacies: (pharmacies: Pharmacy[]) => void;
  
  // Test center actions
  updateNearbyTestCenters: (testCenters: TestCenter[]) => void;
}