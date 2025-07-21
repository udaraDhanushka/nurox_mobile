import { Language } from '@/store/languageStore';

export type UserRole = 'patient' | 'doctor' | 'pharmacist';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profileImage?: string;
  language?: Language;
<<<<<<< Updated upstream
=======
  phone?: string;
  dateOfBirth: string;
  age?: number; // Calculated from dateOfBirth
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
>>>>>>> Stashed changes
  
  // Doctor-specific fields
  specialization?: string;
  licenseNumber?: string;
  hospitalAffiliation?: string;
  
  // Pharmacist-specific fields
  pharmacyAffiliation?: string;
}

<<<<<<< Updated upstream
=======
export interface PatientProfile {
  id: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  bloodType?: string;
  height?: number;
  weight?: number;
  occupation?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
}

export interface DoctorProfile {
  id: string;
  specialization: string;
  licenseNumber: string;
  hospitalAffiliation?: string;
  clinicAddress?: string;
  consultationFee?: number;
  experience?: number;
  qualifications: string[];
  availableHours?: any;
  rating?: number;
  reviewCount: number;
  isVerified: boolean;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVIEW';
  verificationDocuments: string[];
  rejectionReason?: string;
  approvedAt?: string;
}

export interface PharmacistProfile {
  id: string;
  licenseNumber: string;
  pharmacyAffiliation?: string;
  pharmacyAddress?: string;
  workingHours?: any;
  isVerified: boolean;
}

export interface MLTProfile {
  id: string;
  licenseNumber: string;
  certifications: string[];
  specializations: string[];
  workingHours?: any;
  isVerified: boolean;
}

// Enhanced hospital affiliation interface
export interface HospitalAffiliation {
  id: string;
  name: string;
  address?: string;
  position?: string; // e.g., Consultant, Registrar, Doctor
  department?: string; // e.g., Cardiology, Emergency
}

>>>>>>> Stashed changes
export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
<<<<<<< Updated upstream
=======
  phone?: string;
  dateOfBirth: string;
  
  // Organization selections
  hospitalId?: string;
  pharmacyId?: string;
  laboratoryId?: string;
  insuranceId?: string;
  
  // Role-specific data
  specialization?: string;
  certifications?: string[];
  specializations?: string[];
>>>>>>> Stashed changes
}

export interface ResetPasswordData {
  email: string;
}

export interface NewPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}