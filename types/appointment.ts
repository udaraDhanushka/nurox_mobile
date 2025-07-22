export type AppointmentStatus = 'confirmed' | 'completed' | 'canceled';

export type AppointmentType = 
  | 'Consultation'
  | 'Follow-up'
  | 'Emergency'
  | 'Routine Checkup'
  | 'Specialist Visit';

export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  totalTokens: number;
}

export interface TokenSlot {
  tokenNumber: number;
  isBooked: boolean;
  patientName?: string;
  time: string; // Estimated time for this token
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  hospitalId: string;
  hospitalName: string;
  hospitalAddress: string;
  date: string;
  tokenNumber: number;
  estimatedTime: string;
  duration: string;
  status: AppointmentStatus;
  type: AppointmentType;
  notes: string;
  doctorImage: string;
  rating: number;
  experience: string;
  paymentId?: string;
  isReschedule?: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  experience: string;
  image: string;
  hospitals: string[]; // Array of hospital IDs where doctor practices
}

export interface AppointmentDate {
  id: string;
  date: string;
  day: string;
  dayNum: number;
}

export interface AppointmentTime {
  id: string;
  time: string;
}

// API response interface for appointments from backend
export interface ApiAppointment {
  id: string;
  patientId: string;
  doctorId: string;
  type: string; // Backend enum format (e.g., "CONSULTATION")
  status: string; // Backend enum format (e.g., "CONFIRMED")
  title: string;
  description?: string;
  appointmentDate: string; // ISO string
  duration: number;
  location?: string;
  isVirtual: boolean;
  meetingLink?: string;
  fee?: number;
  notes?: string;
  tokenNumber?: number; // Token number selected by user
  isReschedule?: boolean; // Track if appointment was rescheduled
  createdAt: string;
  updatedAt: string;
  doctor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    profileImage?: string;
    doctorProfile?: {
      specialization: string; // Primary specialization
      specializations?: string[]; // Multiple specializations
      licenseNumber: string;
      hospitalAffiliation?: string; // Primary affiliation
      hospitalAffiliations?: Array<{
        id: string;
        name: string;
        address?: string;
        position?: string;
        department?: string;
      }>; // Multiple affiliations
      consultationFee?: number;
      experience?: number;
      rating?: number;
      reviewCount: number;
    };
  };
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    profileImage?: string;
  };
}

// Doctor-specific appointment interface for doctor dashboard
export interface DoctorAppointment {
  id: string;
  patientName: string;
  patientImage: string;
  patientAge: number;
  patientPhone: string;
  date: string;
  time: string;
  duration: string;
  type: string;
  status: string;
  notes: string;
  symptoms: string;
  medicalHistory: string;
  currentMedications: string;
  patientOrder?: number; // Sequential patient number for the day (1, 2, 3...)
  vitalSigns: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    weight: string;
  };
}

// Enhanced Patient interface for doctor's patient management
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  name: string; // Full name for display
  email: string;
  phone?: string;
  profileImage?: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  lastVisit?: string;
  nextAppointment?: string;
  conditions?: string[];
  status: 'active' | 'stable' | 'monitoring' | 'critical';
  appointmentCount?: number;
}

// Detailed patient interface with full medical information
export interface DetailedPatient extends Patient {
  bloodType?: string;
  medicalHistory?: string[];
  currentMedications?: string[];
  allergies?: string[];
  vitalSigns?: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    weight: string;
    height?: string;
  };
  emergencyContactDetails?: {
    name: string;
    relationship: string;
    phone: string;
  };
  appointmentHistory?: {
    id: string;
    date: string;
    type: string;
    notes: string;
    status: string;
  }[];
  upcomingAppointments?: {
    id: string;
    date: string;
    time: string;
    type: string;
    status: string;
  }[];
}