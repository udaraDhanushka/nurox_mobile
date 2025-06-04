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
  
  // Doctor-specific fields
  specialization?: string;
  licenseNumber?: string;
  hospitalAffiliation?: string;
  
  // Pharmacist-specific fields
  pharmacyAffiliation?: string;
}

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
}

export interface ResetPasswordData {
  email: string;
}

export interface NewPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}