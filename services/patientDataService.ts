import { api } from './api';
import { User, UserRole } from '../types/auth';
import { calculateAge } from '../utils/dateUtils';

export interface PatientProfile extends User {
  // Additional patient-specific fields that might be in the full profile
  medicalHistory?: string[];
  currentMedications?: string[];
  allergies?: string[];
  bloodType?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
}

class PatientDataService {
  /**
   * Get full patient profile by patient ID
   * Uses real API endpoints with proper fallback handling
   */
  async getPatientProfile(patientId: string): Promise<PatientProfile | null> {
    try {
      // First, check local cache
      const cached = this.getCachedPatientData(patientId);
      if (cached && this.isCacheValid(patientId)) {
        return cached;
      }

      // Try to fetch from user profile endpoint
      try {
        const response = await api.get<PatientProfile>(`/users/${patientId}/profile`);
        if (response.success && response.data) {
          // Cache the fetched data
          this.cachePatientData(response.data);
          return response.data;
        }
      } catch (profileError) {
        console.log('User profile endpoint failed, trying patients endpoint');
      }

      // Try alternative endpoint - patient-specific profile
      try {
        const response = await api.get<PatientProfile>(`/patients/${patientId}/profile`);
        if (response.success && response.data) {
          // Cache the fetched data
          this.cachePatientData(response.data);
          return response.data;
        }
      } catch (patientError) {
        console.log('Patient profile endpoint failed');
      }

      console.warn(`No patient data available for ID: ${patientId}`);
      return cached; // Return cached data even if expired, better than nothing
    } catch (error) {
      console.error('Error fetching patient profile:', error);
      // Return cached data as fallback
      const cached = this.getCachedPatientData(patientId);
      return cached;
    }
  }

  /**
   * Cache patient data locally when we encounter it
   */
  private patientCache: Map<string, PatientProfile> = new Map();
  private cacheTimestamps: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Store patient data in local cache
   */
  cachePatientData(patientData: PatientProfile): void {
    this.patientCache.set(patientData.id, {
      ...patientData,
      age: patientData.dateOfBirth ? calculateAge(patientData.dateOfBirth) : patientData.age
    });
    this.cacheTimestamps.set(patientData.id, Date.now());
  }

  /**
   * Check if cached data is still valid
   */
  private isCacheValid(patientId: string): boolean {
    const timestamp = this.cacheTimestamps.get(patientId);
    if (!timestamp) return false;
    return (Date.now() - timestamp) < this.CACHE_DURATION;
  }

  /**
   * Get cached patient data
   */
  getCachedPatientData(patientId: string): PatientProfile | null {
    return this.patientCache.get(patientId) || null;
  }

  /**
   * Clear cache for specific patient
   */
  clearPatientCache(patientId: string): void {
    this.patientCache.delete(patientId);
    this.cacheTimestamps.delete(patientId);
  }

  /**
   * Clear all cached data
   */
  clearAllCache(): void {
    this.patientCache.clear();
    this.cacheTimestamps.clear();
  }

  /**
   * Get basic patient info (name, age, contact) by patient ID
   * FALLBACK: Use cached data since backend endpoint doesn't exist
   */
  async getPatientBasicInfo(patientId: string): Promise<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    age?: number;
    profileImage?: string;
  } | null> {
    try {
      const cached = this.getCachedPatientData(patientId);
      if (cached) {
        return {
          id: cached.id,
          firstName: cached.firstName,
          lastName: cached.lastName,
          email: cached.email,
          phone: cached.phone,
          dateOfBirth: cached.dateOfBirth,
          age: cached.age,
          profileImage: cached.profileImage
        };
      }

      console.warn(`No cached patient basic info for ID: ${patientId}`);
      return null;
    } catch (error) {
      console.error('Error fetching patient basic info:', error);
      return null;
    }
  }

  /**
   * Get multiple patients' basic info in batch
   * FALLBACK: Use cached data since backend endpoint doesn't exist
   */
  async getPatientsBatchInfo(patientIds: string[]): Promise<Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    age?: number;
    profileImage?: string;
  }>> {
    try {
      const results = [];
      
      for (const patientId of patientIds) {
        const cached = this.getCachedPatientData(patientId);
        if (cached) {
          results.push({
            id: cached.id,
            firstName: cached.firstName,
            lastName: cached.lastName,
            email: cached.email,
            phone: cached.phone,
            dateOfBirth: cached.dateOfBirth,
            age: cached.age,
            profileImage: cached.profileImage
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error fetching patients batch info:', error);
      return [];
    }
  }

  /**
   * Subscribe to patient profile updates
   * This would integrate with WebSocket or Server-Sent Events for real-time updates
   */
  subscribeToPatientUpdates(patientId: string, callback: (updatedPatient: PatientProfile) => void): () => void {
    // TODO: Implement WebSocket subscription for real-time updates
    // For now, return a no-op unsubscribe function
    console.log(`Subscribing to updates for patient ${patientId}`);
    
    return () => {
      console.log(`Unsubscribing from updates for patient ${patientId}`);
    };
  }

  /**
   * Check if patient profile has been recently updated
   * Useful for cache invalidation
   */
  async getPatientLastUpdated(patientId: string): Promise<string | null> {
    try {
      const response = await api.get(`/patients/${patientId}/last-updated`);
      
      if (response.success && response.data) {
        return response.data.lastUpdated;
      }
      
      // Fallback: return current cache timestamp if available
      const cacheTimestamp = this.cacheTimestamps.get(patientId);
      return cacheTimestamp ? new Date(cacheTimestamp).toISOString() : null;
    } catch (error) {
      console.error('Error checking patient last updated:', error);
      // Fallback: return current cache timestamp if available
      const cacheTimestamp = this.cacheTimestamps.get(patientId);
      return cacheTimestamp ? new Date(cacheTimestamp).toISOString() : null;
    }
  }
}

export const patientDataService = new PatientDataService();
export default patientDataService;