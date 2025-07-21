import { useEffect, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { patientSyncBroadcast } from '../services/patientSyncBroadcast';
import { patientDataService } from '../services/patientDataService';

interface PatientUpdateEvent {
  patientId: string;
  updatedData: any;
  timestamp: string;
}

export function usePatientSyncListener() {
  const [lastCheckTime, setLastCheckTime] = useState<string | null>(null);
  const [recentUpdates, setRecentUpdates] = useState<PatientUpdateEvent[]>([]);

  // Check for patient updates
  const checkForUpdates = useCallback(async () => {
    try {
      const updates = await patientSyncBroadcast.checkForPatientUpdates(lastCheckTime || undefined);
      
      if (updates.length > 0) {
        console.log(`Found ${updates.length} patient updates`);
        setRecentUpdates(updates);
        
        // Update last check time to latest update
        const latestUpdate = updates[0];
        setLastCheckTime(latestUpdate.timestamp);

        // Force refresh patient data service cache for updated patients
        const updatedPatientIds = [...new Set(updates.map(u => u.patientId))];
        for (const patientId of updatedPatientIds) {
          try {
            // Try to fetch fresh data from database
            await patientDataService.getPatientProfile(patientId);
          } catch (error) {
            console.error(`Failed to refresh patient ${patientId}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Failed to check for patient updates:', error);
    }
  }, [lastCheckTime]);

  // Initial check
  useEffect(() => {
    checkForUpdates();
    setLastCheckTime(new Date().toISOString());
  }, []);

  // Listen for app state changes and check for updates when app becomes active
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log('App became active, checking for patient updates...');
        checkForUpdates();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => subscription?.remove();
  }, [checkForUpdates]);

  // Periodic check every 30 seconds when app is active
  useEffect(() => {
    const interval = setInterval(() => {
      if (AppState.currentState === 'active') {
        checkForUpdates();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [checkForUpdates]);

  // Manual refresh function
  const refreshPatientData = useCallback(async () => {
    await patientSyncBroadcast.forceRefreshAllPatients();
    await checkForUpdates();
  }, [checkForUpdates]);

  // Clear old sync events periodically
  useEffect(() => {
    const clearOldEvents = async () => {
      await patientSyncBroadcast.clearOldSyncEvents();
    };

    // Clear old events on mount and then every hour
    clearOldEvents();
    const interval = setInterval(clearOldEvents, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    recentUpdates,
    refreshPatientData,
    lastCheckTime,
    hasUpdates: recentUpdates.length > 0
  };
}

/**
 * Hook specifically for listening to a single patient's updates
 */
export function useSpecificPatientSync(patientId: string | null) {
  const [patientData, setPatientData] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const { recentUpdates } = usePatientSyncListener();

  // Check if this specific patient has been updated
  useEffect(() => {
    if (!patientId) return;

    const patientUpdate = recentUpdates.find(update => update.patientId === patientId);
    
    if (patientUpdate) {
      console.log(`Patient ${patientId} has been updated`);
      setPatientData(patientUpdate.updatedData);
      setLastUpdate(patientUpdate.timestamp);
    }
  }, [patientId, recentUpdates]);

  // Load initial patient data
  useEffect(() => {
    if (!patientId) return;

    const loadPatientData = async () => {
      try {
        const data = await patientDataService.getPatientProfile(patientId);
        if (data) {
          setPatientData(data);
        }
      } catch (error) {
        console.error(`Failed to load patient ${patientId}:`, error);
      }
    };

    loadPatientData();
  }, [patientId]);

  return {
    patientData,
    lastUpdate,
    isDataFresh: lastUpdate ? (Date.now() - new Date(lastUpdate).getTime()) < 5 * 60 * 1000 : false
  };
}