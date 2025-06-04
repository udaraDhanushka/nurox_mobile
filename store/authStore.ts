import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, LoginCredentials, RegisterData, ResetPasswordData, NewPasswordData, User, UserRole } from '../types/auth';
import { Language } from './languageStore';

// Mock API functions (replace with actual API calls)
const mockLogin = async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock users for different roles with role-specific data
  const users: Record<string, User> = {
    'patient@example.com': {
      id: 'p1',
      email: 'patient@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'patient' as UserRole,
      profileImage: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=987&auto=format&fit=crop',
      language: 'en'
    },
    'doctor@example.com': {
      id: 'd1',
      email: 'doctor@example.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'doctor' as UserRole,
      profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop',
      specialization: 'Internal Medicine',
      licenseNumber: 'MD123456',
      hospitalAffiliation: 'City General Hospital',
      language: 'en'
    },
    'pharmacist@example.com': {
      id: 'ph1',
      email: 'pharmacist@example.com',
      firstName: 'Michael',
      lastName: 'Chen',
      role: 'pharmacist' as UserRole,
      profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1964&auto=format&fit=crop',
      licenseNumber: 'PH789012',
      pharmacyAffiliation: 'HealthCare Pharmacy',
      language: 'en'
    }
  };
  
  const user = users[credentials.email];
  
  if (!user || credentials.password !== 'password123') {
    throw new Error('Invalid email or password');
  }
  
  return {
    user,
    token: 'mock-jwt-token-' + user.role
  };
};

const mockRegister = async (data: RegisterData): Promise<{ user: User; token: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // In a real app, this would create a new user in the database
  const user: User = {
    id: 'new-' + Math.random().toString(36).substring(2, 9),
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    role: data.role,
    profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1780&auto=format&fit=crop',
    language: 'en'
  };
  
  // Add role-specific default data
  if (data.role === 'doctor') {
    user.specialization = 'General Practice';
    user.hospitalAffiliation = 'General Hospital';
  } else if (data.role === 'pharmacist') {
    user.pharmacyAffiliation = 'Community Pharmacy';
  }
  
  return {
    user,
    token: 'mock-jwt-token-' + user.role
  };
};

const mockResetPassword = async (data: ResetPasswordData): Promise<void> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In a real app, this would send a reset email
  if (data.email.includes('@')) {
    return;
  }
  
  throw new Error('Invalid email address');
};

const mockSetNewPassword = async (data: NewPasswordData): Promise<void> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In a real app, this would update the password in the database
  if (data.password !== data.confirmPassword) {
    throw new Error('Passwords do not match');
  }
  
  if (data.password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
  
  return;
};

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  setNewPassword: (data: NewPasswordData) => Promise<void>;
  updateUser: (user: User) => void;
  updateLanguage: (language: Language) => void;
  clearError: () => void;
  // Role-based helpers
  isPatient: () => boolean;
  isDoctor: () => boolean;
  isPharmacist: () => boolean;
  getUserDisplayName: () => string;
  getUserRole: () => UserRole | null;
  getUserLanguage: () => Language | undefined;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await mockLogin(credentials);
          set({ user, token, isLoading: false });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'An unknown error occurred' 
          });
        }
      },
      
      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await mockRegister(data);
          set({ user, token, isLoading: false });
          return Promise.resolve();
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'An unknown error occurred' 
          });
          return Promise.reject(error);
        }
      },
      
      logout: async () => {
        try {
          // Clear all auth data
          set({ user: null, token: null, error: null, isLoading: false });
          
          // Clear the persisted storage completely
          await AsyncStorage.removeItem('auth-storage');
          
          // Small delay to ensure storage is cleared
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error('Logout error:', error);
          // Even if there's an error clearing storage, clear the state
          set({ user: null, token: null, error: null, isLoading: false });
        }
      },
      
      resetPassword: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await mockResetPassword(data);
          set({ isLoading: false });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'An unknown error occurred' 
          });
        }
      },
      
      setNewPassword: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await mockSetNewPassword(data);
          set({ isLoading: false });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'An unknown error occurred' 
          });
        }
      },

      updateUser: (updatedUser) => {
        set({ user: updatedUser });
      },
      
      updateLanguage: (language) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, language } });
        }
      },
      
      clearError: () => {
        set({ error: null });
      },

      // Role-based helpers
      isPatient: () => {
        const { user } = get();
        return user?.role === 'patient';
      },

      isDoctor: () => {
        const { user } = get();
        return user?.role === 'doctor';
      },

      isPharmacist: () => {
        const { user } = get();
        return user?.role === 'pharmacist';
      },

      getUserDisplayName: () => {
        const { user } = get();
        if (!user) return '';
        
        if (user.role === 'doctor') {
          return `Dr. ${user.firstName} ${user.lastName}`;
        }
        return `${user.firstName} ${user.lastName}`;
      },

      getUserRole: () => {
        const { user } = get();
        return user?.role || null;
      },
      
      getUserLanguage: () => {
        const { user } = get();
        return user?.language;
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);