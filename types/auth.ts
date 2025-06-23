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
  phone?: string; // Phone number for all user types
  
  // Doctor-specific fields
  specialization?: string; // Primary specialization for backward compatibility
  specializations?: string[]; // Multiple specializations
  licenseNumber?: string;
  hospitalAffiliation?: string; // Primary affiliation for backward compatibility
  hospitalAffiliations?: HospitalAffiliation[]; // Multiple affiliations
  
  // Pharmacist-specific fields
  pharmacyAffiliation?: string;
}

// Enhanced hospital affiliation interface
export interface HospitalAffiliation {
  id: string;
  name: string;
  address?: string;
  position?: string; // e.g., Consultant, Registrar, Doctor
  department?: string; // e.g., Cardiology, Emergency
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
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
}

export interface ResetPasswordData {
  email: string;
}

export interface NewPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}