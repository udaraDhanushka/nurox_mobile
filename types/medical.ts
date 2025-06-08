export type PrescriptionStatus = 'active' | 'completed' | 'cancelled';

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  date: string;
  doctorName: string;
  patientName?: string;
  patientId?: string;
  condition?: string;
  medications: Medication[];
  pharmacy: string;
  refillsRemaining: number;
  status: PrescriptionStatus;
  notes?: string;
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