// Removed circular dependency: import { useAuthStore } from '../store/authStore';
import { patientDataService } from './patientDataService';
import { calculateAge } from '../utils/dateUtils';
import { 
  validatePatientSyncData, 
  sanitizePatientSyncData, 
  validateSyncIntegrity,
  createSyncChecksum,
  type PatientSyncData 
} from '../utils/dataSyncValidation';

// Event types for data synchronization
export enum SyncEventType {
  PATIENT_PROFILE_UPDATED = 'patient_profile_updated',
  PATIENT_AGE_UPDATED = 'patient_age_updated',
  PATIENT_BIRTH_DATE_UPDATED = 'patient_birth_date_updated',
  PATIENT_CONTACT_UPDATED = 'patient_contact_updated'
}

export interface SyncEvent {
  type: SyncEventType;
  patientId: string;
  data: any;
  timestamp: string;
  triggeredBy: string; // User ID who made the change
}

// Subscription callback interface
export type SyncEventCallback = (event: SyncEvent) => void;

class DataSyncService {
  private subscribers: Map<SyncEventType, Set<SyncEventCallback>> = new Map();
  private patientCache: Map<string, any> = new Map();
  private lastSyncTimestamp: Map<string, string> = new Map();

  /**
   * Subscribe to specific data sync events
   */
  subscribe(eventType: SyncEventType, callback: SyncEventCallback): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }

    this.subscribers.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.get(eventType)?.delete(callback);
    };
  }

  /**
   * Notify all subscribers of a sync event
   */
  private notifySubscribers(event: SyncEvent): void {
    const callbacks = this.subscribers.get(event.type);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in sync callback:', error);
        }
      });
    }
  }

  /**
   * Handle patient profile update from Patient App
   */
  async onPatientProfileUpdated(patientId: string, updatedData: any, currentUser?: any): Promise<void> {
    if (!currentUser) {
      console.error('No current user provided for profile update sync');
      return;
    }

    // Validate and sanitize updated data
    const syncData: PatientSyncData = { id: patientId, ...updatedData };
    const validation = validatePatientSyncData(syncData);
    
    if (!validation.isValid) {
      console.error('Patient sync data validation failed:', validation.errors);
      return;
    }

    if (validation.warnings.length > 0) {
      console.warn('Patient sync data warnings:', validation.warnings);
    }

    const sanitizedData = sanitizePatientSyncData(syncData);
    
    // Check sync integrity with existing data
    const existingData = this.patientCache.get(patientId);
    if (existingData) {
      const integrityCheck = validateSyncIntegrity(existingData, sanitizedData);
      if (!integrityCheck.isValid) {
        console.error('Sync integrity validation failed:', integrityCheck.errors);
        return;
      }
    }

    // Create checksum for data integrity
    const checksum = createSyncChecksum(sanitizedData);

    // Update local cache with validated data
    this.patientCache.set(patientId, {
      ...this.patientCache.get(patientId),
      ...sanitizedData,
      lastUpdated: new Date().toISOString(),
      syncChecksum: checksum
    });

    // Calculate age if birth date was updated
    let age: number | undefined;
    if (updatedData.dateOfBirth) {
      age = calculateAge(updatedData.dateOfBirth);
    }

    // Notify subscribers based on what was updated
    if (updatedData.dateOfBirth) {
      this.notifySubscribers({
        type: SyncEventType.PATIENT_BIRTH_DATE_UPDATED,
        patientId,
        data: { 
          dateOfBirth: updatedData.dateOfBirth,
          age,
          ...updatedData 
        },
        timestamp: new Date().toISOString(),
        triggeredBy: currentUser.id
      });

      // Also trigger age update event
      this.notifySubscribers({
        type: SyncEventType.PATIENT_AGE_UPDATED,
        patientId,
        data: { 
          age,
          dateOfBirth: updatedData.dateOfBirth 
        },
        timestamp: new Date().toISOString(),
        triggeredBy: currentUser.id
      });
    }

    if (updatedData.phone || updatedData.email) {
      this.notifySubscribers({
        type: SyncEventType.PATIENT_CONTACT_UPDATED,
        patientId,
        data: updatedData,
        timestamp: new Date().toISOString(),
        triggeredBy: currentUser.id
      });
    }

    // General profile update notification
    this.notifySubscribers({
      type: SyncEventType.PATIENT_PROFILE_UPDATED,
      patientId,
      data: updatedData,
      timestamp: new Date().toISOString(),
      triggeredBy: currentUser.id
    });

    console.log(`Data sync: Patient ${patientId} profile updated`, updatedData);
  }

  /**
   * Get cached patient data or fetch fresh if needed
   */
  async getPatientData(patientId: string, forceRefresh: boolean = false): Promise<any> {
    if (!forceRefresh && this.patientCache.has(patientId)) {
      const cached = this.patientCache.get(patientId);
      const lastUpdated = this.lastSyncTimestamp.get(patientId);
      
      // Use cache if it's less than 5 minutes old
      if (lastUpdated && (Date.now() - new Date(lastUpdated).getTime()) < 5 * 60 * 1000) {
        return cached;
      }
    }

    try {
      // Fetch fresh data with retry mechanism
      let patientData = null;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries && !patientData) {
        try {
          patientData = await patientDataService.getPatientProfile(patientId);
          break;
        } catch (error) {
          retryCount++;
          if (retryCount < maxRetries) {
            console.warn(`Patient data fetch attempt ${retryCount} failed, retrying...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
          } else {
            throw error;
          }
        }
      }
      
      if (patientData) {
        this.patientCache.set(patientId, patientData);
        this.lastSyncTimestamp.set(patientId, new Date().toISOString());
      }

      return patientData;
    } catch (error) {
      console.error('Error fetching patient data after retries:', error);
      const cachedData = this.patientCache.get(patientId);
      if (cachedData) {
        console.log('Returning cached data as fallback');
        return cachedData;
      }
      throw new Error(`Unable to fetch patient data for ${patientId}: ${error.message}`);
    }
  }

  /**
   * Clear cache for a specific patient (forces refresh on next access)
   */
  invalidatePatientCache(patientId: string): void {
    this.patientCache.delete(patientId);
    this.lastSyncTimestamp.delete(patientId);
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.patientCache.clear();
    this.lastSyncTimestamp.clear();
  }

  /**
   * Check if patient data needs to be refreshed
   */
  async shouldRefreshPatientData(patientId: string): Promise<boolean> {
    try {
      const lastUpdated = await patientDataService.getPatientLastUpdated(patientId);
      const cachedTimestamp = this.lastSyncTimestamp.get(patientId);
      
      if (!lastUpdated || !cachedTimestamp) {
        return true;
      }

      return new Date(lastUpdated) > new Date(cachedTimestamp);
    } catch (error) {
      console.error('Error checking patient data freshness:', error);
      return true; // Err on the side of caution and refresh
    }
  }

  /**
   * Force refresh patient data across all apps
   */
  async forceRefreshPatientData(patientId: string): Promise<void> {
    this.invalidatePatientCache(patientId);
    
    const freshData = await this.getPatientData(patientId, true);
    
    if (freshData) {
      // Notify all subscribers that data was refreshed
      this.notifySubscribers({
        type: SyncEventType.PATIENT_PROFILE_UPDATED,
        patientId,
        data: freshData,
        timestamp: new Date().toISOString(),
        triggeredBy: 'system_refresh'
      });
    }
  }

  /**
   * Batch update multiple patients (useful for doctor/pharmacist apps)
   */
  async batchUpdatePatients(patientIds: string[]): Promise<void> {
    try {
      const batchData = await patientDataService.getPatientsBatchInfo(patientIds);
      
      batchData.forEach(patientData => {
        this.patientCache.set(patientData.id, patientData);
        this.lastSyncTimestamp.set(patientData.id, new Date().toISOString());
        
        // Notify subscribers for each patient
        this.notifySubscribers({
          type: SyncEventType.PATIENT_PROFILE_UPDATED,
          patientId: patientData.id,
          data: patientData,
          timestamp: new Date().toISOString(),
          triggeredBy: 'batch_update'
        });
      });
    } catch (error) {
      console.error('Error in batch patient update:', error);
      // Don't throw, just log the error to prevent cascade failures
    }
  }

  /**
   * Health check for sync service
   */
  async checkSyncHealth(): Promise<boolean> {
    try {
      // Try to make a simple API call to verify connectivity
      await patientDataService.getPatientProfile('health-check-dummy');
      return true;
    } catch (error) {
      console.warn('Sync service health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const dataSyncService = new DataSyncService();
export default dataSyncService;