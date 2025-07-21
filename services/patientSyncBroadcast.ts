import AsyncStorage from '@react-native-async-storage/async-storage';
import { patientDataService } from './patientDataService';

interface PatientUpdateEvent {
  patientId: string;
  updatedData: any;
  timestamp: string;
}

class PatientSyncBroadcast {
  private readonly SYNC_KEY = 'patient_sync_events';
  private readonly MAX_EVENTS = 50; // Keep last 50 sync events

  /**
   * Broadcast patient profile update to other app instances
   */
  async broadcastPatientUpdate(patientId: string, updatedData: any): Promise<void> {
    try {
      const event: PatientUpdateEvent = {
        patientId,
        updatedData,
        timestamp: new Date().toISOString()
      };

      // Store in AsyncStorage for cross-app communication
      const existingEvents = await this.getSyncEvents();
      const newEvents = [event, ...existingEvents].slice(0, this.MAX_EVENTS);
      
      await AsyncStorage.setItem(this.SYNC_KEY, JSON.stringify(newEvents));
      
      // Also update the patient data service cache
      if (updatedData.role === 'patient' || updatedData.role === 'PATIENT') {
        patientDataService.cachePatientData({
          id: patientId,
          ...updatedData
        });
      }

      console.log(`Patient sync broadcast: ${patientId} updated at ${event.timestamp}`);
    } catch (error) {
      console.error('Failed to broadcast patient update:', error);
    }
  }

  /**
   * Get recent patient sync events
   */
  async getSyncEvents(): Promise<PatientUpdateEvent[]> {
    try {
      const eventsJson = await AsyncStorage.getItem(this.SYNC_KEY);
      return eventsJson ? JSON.parse(eventsJson) : [];
    } catch (error) {
      console.error('Failed to get sync events:', error);
      return [];
    }
  }

  /**
   * Check for patient updates since last check
   */
  async checkForPatientUpdates(lastCheckTime?: string): Promise<PatientUpdateEvent[]> {
    try {
      const events = await this.getSyncEvents();
      
      if (!lastCheckTime) {
        return events.slice(0, 10); // Return last 10 events if no timestamp
      }

      const lastCheck = new Date(lastCheckTime);
      return events.filter(event => new Date(event.timestamp) > lastCheck);
    } catch (error) {
      console.error('Failed to check for patient updates:', error);
      return [];
    }
  }

  /**
   * Force refresh patient data for all cached patients
   */
  async forceRefreshAllPatients(): Promise<void> {
    try {
      const events = await this.getSyncEvents();
      const uniquePatientIds = [...new Set(events.map(e => e.patientId))];

      for (const patientId of uniquePatientIds) {
        try {
          // Try to fetch fresh data from the database
          const freshData = await patientDataService.getPatientProfile(patientId);
          if (freshData) {
            console.log(`Refreshed patient data for ${patientId}`);
          }
        } catch (error) {
          console.error(`Failed to refresh patient ${patientId}:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to force refresh patients:', error);
    }
  }

  /**
   * Clear old sync events
   */
  async clearOldSyncEvents(): Promise<void> {
    try {
      const events = await this.getSyncEvents();
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const recentEvents = events.filter(event => 
        new Date(event.timestamp) > oneDayAgo
      );

      await AsyncStorage.setItem(this.SYNC_KEY, JSON.stringify(recentEvents));
      console.log(`Cleared ${events.length - recentEvents.length} old sync events`);
    } catch (error) {
      console.error('Failed to clear old sync events:', error);
    }
  }

  /**
   * Get patient's latest update timestamp
   */
  async getPatientLastUpdate(patientId: string): Promise<string | null> {
    try {
      const events = await this.getSyncEvents();
      const patientEvents = events.filter(e => e.patientId === patientId);
      
      return patientEvents.length > 0 ? patientEvents[0].timestamp : null;
    } catch (error) {
      console.error('Failed to get patient last update:', error);
      return null;
    }
  }
}

export const patientSyncBroadcast = new PatientSyncBroadcast();
export default patientSyncBroadcast;