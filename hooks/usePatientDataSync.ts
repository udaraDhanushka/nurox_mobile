import { useEffect, useState, useCallback } from 'react';
import { dataSyncService, SyncEventType, SyncEvent } from '../services/dataSyncService';

export interface PatientData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  age?: number;
  profileImage?: string;
  lastUpdated?: string;
}

/**
 * Hook for managing patient data with real-time synchronization
 * @param patientId - The patient ID to monitor
 * @param autoRefresh - Whether to automatically refresh data when sync events occur
 */
export function usePatientDataSync(patientId: string | null, autoRefresh: boolean = true) {
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Force refresh patient data
  const refreshPatientData = useCallback(async () => {
    if (!patientId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await dataSyncService.getPatientData(patientId, true);
      setPatientData(data);
      setLastSyncTime(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch patient data');
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

  // Handle sync events
  const handleSyncEvent = useCallback((event: SyncEvent) => {
    if (event.patientId === patientId && autoRefresh) {
      console.log('Patient data sync event received:', event.type);
      
      // Update local data immediately with the sync event data
      setPatientData(prevData => {
        if (!prevData) return null;
        
        return {
          ...prevData,
          ...event.data,
          lastUpdated: event.timestamp
        };
      });
      
      setLastSyncTime(event.timestamp);
    }
  }, [patientId, autoRefresh]);

  // Initial data load
  useEffect(() => {
    if (patientId) {
      refreshPatientData();
    } else {
      setPatientData(null);
      setError(null);
    }
  }, [patientId, refreshPatientData]);

  // Subscribe to sync events
  useEffect(() => {
    if (!patientId || !autoRefresh) return;

    const unsubscribeCallbacks = [
      dataSyncService.subscribe(SyncEventType.PATIENT_PROFILE_UPDATED, handleSyncEvent),
      dataSyncService.subscribe(SyncEventType.PATIENT_AGE_UPDATED, handleSyncEvent),
      dataSyncService.subscribe(SyncEventType.PATIENT_BIRTH_DATE_UPDATED, handleSyncEvent),
      dataSyncService.subscribe(SyncEventType.PATIENT_CONTACT_UPDATED, handleSyncEvent),
    ];

    return () => {
      unsubscribeCallbacks.forEach(unsubscribe => unsubscribe());
    };
  }, [patientId, autoRefresh, handleSyncEvent]);

  return {
    patientData,
    isLoading,
    error,
    lastSyncTime,
    refreshPatientData,
    isDataStale: patientData && lastSyncTime ? 
      (Date.now() - new Date(lastSyncTime).getTime()) > 5 * 60 * 1000 : false
  };
}

/**
 * Hook for batch patient data management (useful for patient lists)
 * @param patientIds - Array of patient IDs to monitor
 */
export function useBatchPatientDataSync(patientIds: string[]) {
  const [patientsData, setPatientsData] = useState<Map<string, PatientData>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshBatchData = useCallback(async () => {
    if (patientIds.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      await dataSyncService.batchUpdatePatients(patientIds);
      
      // Get updated data for all patients
      const updatedData = new Map<string, PatientData>();
      
      for (const patientId of patientIds) {
        const data = await dataSyncService.getPatientData(patientId);
        if (data) {
          updatedData.set(patientId, data);
        }
      }
      
      setPatientsData(updatedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch patients data');
    } finally {
      setIsLoading(false);
    }
  }, [patientIds]);

  // Handle sync events for any patient in the batch
  const handleBatchSyncEvent = useCallback((event: SyncEvent) => {
    if (patientIds.includes(event.patientId)) {
      setPatientsData(prevData => {
        const newData = new Map(prevData);
        const existingPatient = newData.get(event.patientId);
        
        if (existingPatient) {
          newData.set(event.patientId, {
            ...existingPatient,
            ...event.data,
            lastUpdated: event.timestamp
          });
        }
        
        return newData;
      });
    }
  }, [patientIds]);

  useEffect(() => {
    refreshBatchData();
  }, [refreshBatchData]);

  useEffect(() => {
    const unsubscribeCallbacks = [
      dataSyncService.subscribe(SyncEventType.PATIENT_PROFILE_UPDATED, handleBatchSyncEvent),
      dataSyncService.subscribe(SyncEventType.PATIENT_AGE_UPDATED, handleBatchSyncEvent),
      dataSyncService.subscribe(SyncEventType.PATIENT_BIRTH_DATE_UPDATED, handleBatchSyncEvent),
      dataSyncService.subscribe(SyncEventType.PATIENT_CONTACT_UPDATED, handleBatchSyncEvent),
    ];

    return () => {
      unsubscribeCallbacks.forEach(unsubscribe => unsubscribe());
    };
  }, [handleBatchSyncEvent]);

  return {
    patientsData,
    isLoading,
    error,
    refreshBatchData,
    getPatientData: (patientId: string) => patientsData.get(patientId) || null
  };
}