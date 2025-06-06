export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export type AppointmentType = 
  | 'Consultation'
  | 'Follow-up'
  | 'Emergency'
  | 'Routine Checkup'
  | 'Specialist Consultation'
  | 'Vaccination'
  | 'Lab Test'
  | 'Diagnostic'
  | 'Surgery Consultation'
  | 'Mental Health';

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

// Doctor-specific appointment interface for doctor dashboard
export interface DoctorAppointment {
  id: string;
  patientName: string;
  patientImage: string;
  patientAge: number;
  patientPhone: string;
  date: string;
  tokenNumber: number;
  estimatedTime: string;
  duration: string;
  type: string;
  status: string;
  notes: string;
  symptoms: string;
  medicalHistory: string;
  currentMedications: string;
  vitalSigns: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    weight: string;
  };
}