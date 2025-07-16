import { api } from './api';
import { User, LoginCredentials, RegisterData } from '../types/auth';

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

class AuthService {
  // User registration
  async register(data: RegisterData & {
    hospitalId?: string;
    pharmacyId?: string;
    laboratoryId?: string;
    insuranceId?: string;
    specialization?: string;
    certifications?: string[];
    specializations?: string[];
  }): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', {
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role.toUpperCase(), // Convert to backend format
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      hospitalId: data.hospitalId,
      pharmacyId: data.pharmacyId,
      laboratoryId: data.laboratoryId,
      insuranceId: data.insuranceId,
      specialization: data.specialization,
      certifications: data.certifications,
      specializations: data.specializations,
    }, false); // No auth required for registration

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Registration failed');
    }

    return response.data;
  }

  // User login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials, false);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Login failed');
    }

    return response.data;
  }

  // User logout
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Even if logout fails on server, we should clear local data
      console.warn('Logout API call failed:', error);
    }
  }

  // Get current user profile
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get user profile');
    }

    return response.data;
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: string }> {
    const response = await api.post<{ accessToken: string; expiresAt: string }>(
      '/auth/refresh-token',
      { refreshToken },
      false
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Token refresh failed');
    }

    return response.data;
  }

  // Forgot password
  async forgotPassword(email: string): Promise<void> {
    const response = await api.post('/auth/forgot-password', { email }, false);

    if (!response.success) {
      throw new Error(response.message || 'Failed to send reset email');
    }
  }

  // Reset password
  async resetPassword(token: string, password: string): Promise<void> {
    const response = await api.post('/auth/reset-password', {
      token,
      password
    }, false);

    if (!response.success) {
      throw new Error(response.message || 'Password reset failed');
    }
  }

  // Change password (for authenticated users)
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword
    });

    if (!response.success) {
      throw new Error(response.message || 'Password change failed');
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<User>): Promise<User> {
    const response = await api.put<User>('/users/profile', updates);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Profile update failed');
    }

    return response.data;
  }

  // Update language preference
  async updateLanguage(language: string): Promise<void> {
    const response = await api.put('/users/language', { language });

    if (!response.success) {
      throw new Error(response.message || 'Language update failed');
    }
  }

  // Update role-specific profiles
  async updatePatientProfile(profileData: any): Promise<any> {
    const response = await api.put('/users/patient-profile', profileData);

    if (!response.success) {
      throw new Error(response.message || 'Patient profile update failed');
    }

    return response.data;
  }

  async updateDoctorProfile(profileData: any): Promise<any> {
    const response = await api.put('/users/doctor-profile', profileData);

    if (!response.success) {
      throw new Error(response.message || 'Doctor profile update failed');
    }

    return response.data;
  }

  async updatePharmacistProfile(profileData: any): Promise<any> {
    const response = await api.put('/users/pharmacist-profile', profileData);

    if (!response.success) {
      throw new Error(response.message || 'Pharmacist profile update failed');
    }

    return response.data;
  }
}

export const authService = new AuthService();
export default authService;