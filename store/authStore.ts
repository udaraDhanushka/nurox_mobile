import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, LoginCredentials, RegisterData, ResetPasswordData, NewPasswordData, User, UserRole } from '../types/auth';
import { Language } from './languageStore';
import { authService } from '../services/authService';

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  setNewPassword: (data: NewPasswordData) => Promise<void>;
  updateUser: (user: Partial<User>) => Promise<void>;
  updateLanguage: (language: Language) => void;
  clearError: () => void;
  // Role-based helpers
  isPatient: () => boolean;
  isDoctor: () => boolean;
  isPharmacist: () => boolean;
  getUserDisplayName: () => string;
  getUserRole: () => UserRole | null;
  getUserLanguage: () => Language | undefined;
  // Auth status helpers
  isAuthenticated: () => boolean;
  forceLogout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      error: null,
      
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Auth Store: Starting login process...');
          const authResponse = await authService.login(credentials);
          console.log('Auth Store: Login response received:', {
            user: authResponse.user ? { id: authResponse.user.id, role: authResponse.user.role } : null,
            hasToken: !!authResponse.accessToken
          });
          set({ 
            user: authResponse.user, 
            token: authResponse.accessToken, 
            refreshToken: authResponse.refreshToken,
            isLoading: false 
          });
          console.log('Auth Store: State updated successfully');
        } catch (error) {
          console.error('Auth Store: Login error:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'An unknown error occurred' 
          });
        }
      },
      
      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const authResponse = await authService.register(data);
          set({ 
            user: authResponse.user, 
            token: authResponse.accessToken, 
            refreshToken: authResponse.refreshToken,
            isLoading: false 
          });
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
          // Call backend logout
          await authService.logout();
          
          // Clear all auth data
          set({ user: null, token: null, refreshToken: null, error: null, isLoading: false });
          
          // Clear the persisted storage completely
          await AsyncStorage.removeItem('auth-storage');
          
          // Small delay to ensure storage is cleared
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error('Logout error:', error);
          // Even if there's an error clearing storage, clear the state
          set({ user: null, token: null, refreshToken: null, error: null, isLoading: false });
        }
      },
      
      resetPassword: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await authService.forgotPassword(data.email);
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
          if (data.password !== data.confirmPassword) {
            throw new Error('Passwords do not match');
          }
          await authService.resetPassword(data.token, data.password);
          set({ isLoading: false });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'An unknown error occurred' 
          });
        }
      },

      updateUser: async (updatedUser) => {
        try {
          const updated = await authService.updateProfile(updatedUser);
          set({ user: updated });
        } catch (error) {
          console.error('Update user error:', error);
          throw error;
        }
      },
      
      updateLanguage: async (language) => {
        try {
          await authService.updateLanguage(language);
          const { user } = get();
          if (user) {
            set({ user: { ...user, language } });
          }
        } catch (error) {
          console.error('Update language error:', error);
        }
      },
      
      clearError: () => {
        set({ error: null });
      },

      // Role-based helpers
      isPatient: () => {
        const { user } = get();
        return user?.role?.toLowerCase() === 'patient';
      },

      isDoctor: () => {
        const { user } = get();
        return user?.role?.toLowerCase() === 'doctor';
      },

      isPharmacist: () => {
        const { user } = get();
        return user?.role?.toLowerCase() === 'pharmacist';
      },

      getUserDisplayName: () => {
        const { user } = get();
        if (!user) return '';
        
        if (user.role?.toLowerCase() === 'doctor') {
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
      },

      // Check if user is properly authenticated (matches app layout logic)
      isAuthenticated: () => {
        const { user, token } = get();
        return !!(user && token);
      },

      // Force logout and clear all data (useful for debugging)
      forceLogout: async () => {
        try {
          console.log('Force logout initiated');
          
          // Clear all auth data
          set({ user: null, token: null, refreshToken: null, error: null, isLoading: false });
          
          // Clear the persisted storage completely
          await AsyncStorage.removeItem('auth-storage');
          
          console.log('Force logout completed');
        } catch (error) {
          console.error('Force logout error:', error);
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, token: state.token, refreshToken: state.refreshToken }),
    }
  )
);