import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Prescription,
  LabReport,
  Notification,
  UserLocation,
  Pharmacy,
  TestCenter,
  DetectedMedicine,
  UploadedPrescription,
  UploadQueueItem,
  ProcessingUpload,
  UploadHistoryEntry,
  CameraSettings,
  AnalysisPreferences,
  PrivacySettings,
  UploadResult,
  MedicalStoreState,
  MedicalStoreActions,
  AppError,
  LabTestRequest,
  LabTestTemplate,
} from '@/types/medical';

// Export status types for use in other components
export type PrescriptionStatus = 'active' | 'processing' | 'completed' | 'cancelled';
export type LabReportStatus = 'pending' | 'completed' | 'cancelled';

// Extended LabReport interface to include booking details (keeping from original)
export interface ExtendedLabReport extends LabReport {
  bookingDetails?: {
    testCenter: {
      id: string;
      name: string;
      address: string;
      phone: string;
    };
    testName: string;
    date: string;
    time: string;
    dateLabel?: string;
    dateDisplay?: string;
    patientInfo: {
      name: string;
      phone: string;
      email?: string;
    };
    bookingId: string;
    bookingTime: string;
  };
  notifications?: Notification[]; // Use the full Notification type
}

// Re-export types from types/medical.ts
export { Prescription, LabReport };

// Default settings
const defaultCameraSettings: CameraSettings = {
  flashMode: 'auto',
  focusMode: 'auto',
  showGrid: true,
  quality: 'high',
  imageFormat: 'jpeg',
};

const defaultAnalysisPreferences: AnalysisPreferences = {
  autoEnhanceImages: true,
  confidenceThreshold: 0.7,
  enableMedicineValidation: true,
  includeAlternativeNames: true,
  detectDosageInstructions: true,
  flagInteractions: true,
};

const defaultPrivacySettings: PrivacySettings = {
  shareAnalyticsData: true,
  saveProcessedImages: true,
  allowCloudBackup: false,
  requirePasswordForSensitiveActions: false,
  dataRetentionPeriod: 90,
};

// Enhanced store interface combining original and new features
interface ExtendedMedicalStoreState extends MedicalStoreState {
  // Original state (keeping ExtendedLabReport for compatibility)
  labReports: ExtendedLabReport[];
  
  // Lab test requests (doctor-created)
  labTestRequests: LabTestRequest[];
  labTestTemplates: LabTestTemplate[];
  
  // Upload state
  uploadQueue: UploadQueueItem[];
  processingUploads: ProcessingUpload[];
  uploadHistory: UploadHistoryEntry[];
  
  // Settings
  cameraSettings: CameraSettings;
  analysisPreferences: AnalysisPreferences;
  privacySettings: PrivacySettings;
  
  // Error handling
  errors: AppError[];
  
  // Loading states
  isUploading: boolean;
  isProcessing: boolean;
  
  // Statistics
  totalUploads: number;
  successfulUploads: number;
  failedUploads: number;
}

interface ExtendedMedicalStoreActions extends Omit<MedicalStoreActions, 'addLabReport' | 'updateLabReport' | 'updateProcessingStatus'> {
  // Override lab report actions to work with ExtendedLabReport
  addLabReport: (labReport: ExtendedLabReport) => void;
  updateLabReport: (id: string, updates: Partial<ExtendedLabReport>) => void;
  
  // Override updateProcessingStatus to match our implementation
  updateProcessingStatus: (id: string, progress: number, currentStep?: string) => void;
  
  // Upload queue management
  addUploadToQueue: (item: UploadQueueItem) => void;
  removeFromUploadQueue: (id: string) => void;
  clearUploadQueue: () => void;
  
  // Processing management
  startProcessingUpload: (queueItemId: string) => void;
  completeUpload: (id: string, result: UploadResult) => void;
  failUpload: (id: string, error: string) => void;
  
  // Enhanced prescription management
  addDetectedMedicine: (prescriptionId: string, medicine: DetectedMedicine) => void;
  updateDetectedMedicine: (prescriptionId: string, medicineId: string, updates: Partial<DetectedMedicine>) => void;
  removeDetectedMedicine: (prescriptionId: string, medicineId: string) => void;
  verifyDetectedMedicine: (prescriptionId: string, medicineId: string, verified: boolean) => void;
  verifyPrescription: (id: string, verifiedBy: string) => void;
  
  // Lab test request management
  addLabTestRequest: (request: LabTestRequest) => void;
  updateLabTestRequest: (id: string, updates: Partial<LabTestRequest>) => void;
  deleteLabTestRequest: (id: string) => void;
  getLabTestRequestsByPatient: (patientId: string) => LabTestRequest[];
  getLabTestRequestsByStatus: (status: string) => LabTestRequest[];
  
  // Lab test templates
  addLabTestTemplate: (template: LabTestTemplate) => void;
  getLabTestTemplates: () => LabTestTemplate[];
  getLabTestTemplatesByCategory: (category: string) => LabTestTemplate[];
  
  // Lab request to report conversion
  convertLabRequestToReport: (requestId: string, results: any[]) => void;
  
  // Upload history
  addToUploadHistory: (entry: UploadHistoryEntry) => void;
  getUploadHistory: (prescriptionId?: string) => UploadHistoryEntry[];
  clearUploadHistory: (prescriptionId?: string) => void;
  
  // Settings management
  updateCameraSettings: (settings: Partial<CameraSettings>) => void;
  updateAnalysisPreferences: (preferences: Partial<AnalysisPreferences>) => void;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;
  
  // Error management
  addError: (error: AppError) => void;
  removeError: (errorId: string) => void;
  clearErrors: () => void;
  
  // Statistics
  updateUploadStats: (type: 'success' | 'failure') => void;
  getUploadStats: () => { total: number; success: number; failure: number; successRate: number };
  
  // Original methods (keeping from the original store)
  simulateTestCompletion: (reportId: string) => void;
  
  // Utility functions
  findPrescriptionById: (id: string) => Prescription | undefined;
  getMedicinesForPrescription: (prescriptionId: string) => (DetectedMedicine | undefined)[];
  isUploadInProgress: (prescriptionId: string) => boolean;
  getProcessingUpload: (prescriptionId: string) => ProcessingUpload | undefined;
}

type MedicalStore = ExtendedMedicalStoreState & ExtendedMedicalStoreActions;

export const useMedicalStore = create<MedicalStore>()(
  persist(
    (set, get) => ({
      // Initial state with sample data (from original file)
      prescriptions: [
        {
          id: '1',
          date: '2025-05-15',
          doctorName: 'Dr. Sarah Johnson',
          medications: [
            {
              name: 'Lisinopril',
              dosage: '10mg',
              frequency: 'Once daily',
              duration: '30 days',
              instructions: 'Take in the morning with food'
            }
          ],
          pharmacy: 'MedPlus Pharmacy',
          refillsRemaining: 2,
          status: 'active'
        },
        {
          id: '2',
          date: '2025-05-10',
          doctorName: 'Dr. Michael Chen',
          medications: [
            {
              name: 'Tretinoin Cream',
              dosage: '0.025%',
              frequency: 'Once daily',
              duration: '60 days',
              instructions: 'Apply a pea-sized amount to affected areas at night'
            },
            {
              name: 'Clindamycin',
              dosage: '1%',
              frequency: 'Twice daily',
              duration: '30 days',
              instructions: 'Apply to affected areas in the morning and evening'
            }
          ],
          pharmacy: 'HealthRx Pharmacy',
          refillsRemaining: 1,
          status: 'active'
        },
        {
          id: '3',
          date: '2025-04-20',
          doctorName: 'Dr. Emily Rodriguez',
          medications: [
            {
              name: 'Sumatriptan',
              dosage: '50mg',
              frequency: 'As needed',
              duration: '90 days',
              instructions: 'Take at first sign of migraine, may repeat after 2 hours if needed'
            }
          ],
          pharmacy: 'MedPlus Pharmacy',
          refillsRemaining: 0,
          status: 'completed'
        }
      ],
      
      labReports: [
        {
          id: '1',
          testName: 'Complete Blood Count (CBC)',
          date: '2025-05-12',
          labName: 'Central Diagnostics',
          orderedBy: 'Dr. Sarah Johnson',
          status: 'completed',
          results: [
            {
              name: 'White Blood Cells',
              value: '7.5 x10^9/L',
              normalRange: '4.0-11.0 x10^9/L',
              isNormal: true
            },
            {
              name: 'Red Blood Cells',
              value: '4.8 x10^12/L',
              normalRange: '4.5-5.5 x10^12/L',
              isNormal: true
            },
            {
              name: 'Hemoglobin',
              value: '14.2 g/dL',
              normalRange: '13.5-17.5 g/dL',
              isNormal: true
            },
            {
              name: 'Platelets',
              value: '250 x10^9/L',
              normalRange: '150-450 x10^9/L',
              isNormal: true
            }
          ],
          notes: 'All values within normal range. No significant abnormalities detected.'
        },
        {
          id: '2',
          testName: 'Lipid Panel',
          date: '2025-05-12',
          labName: 'Central Diagnostics',
          orderedBy: 'Dr. Sarah Johnson',
          status: 'completed',
          results: [
            {
              name: 'Total Cholesterol',
              value: '210 mg/dL',
              normalRange: '<200 mg/dL',
              isNormal: false
            },
            {
              name: 'HDL Cholesterol',
              value: '45 mg/dL',
              normalRange: '>40 mg/dL',
              isNormal: true
            },
            {
              name: 'LDL Cholesterol',
              value: '130 mg/dL',
              normalRange: '<100 mg/dL',
              isNormal: false
            },
            {
              name: 'Triglycerides',
              value: '150 mg/dL',
              normalRange: '<150 mg/dL',
              isNormal: true
            }
          ],
          notes: 'Slightly elevated total and LDL cholesterol. Recommend lifestyle modifications and follow-up in 3 months.'
        },
        {
          id: '3',
          testName: 'Thyroid Function Test',
          date: '2025-04-05',
          labName: 'LifeLabs',
          orderedBy: 'Dr. Emily Rodriguez',
          status: 'completed',
          results: [
            {
              name: 'TSH',
              value: '2.5 mIU/L',
              normalRange: '0.4-4.0 mIU/L',
              isNormal: true
            },
            {
              name: 'Free T4',
              value: '1.2 ng/dL',
              normalRange: '0.8-1.8 ng/dL',
              isNormal: true
            },
            {
              name: 'Free T3',
              value: '3.1 pg/mL',
              normalRange: '2.3-4.2 pg/mL',
              isNormal: true
            }
          ],
          notes: 'Thyroid function is normal.'
        },
        {
          id: '4',
          testName: 'Vitamin D Level',
          date: '2025-05-25',
          labName: 'HealthLabs',
          orderedBy: 'Dr. Michael Chen',
          status: 'pending'
        },
        {
          id: '5',
          testName: 'Complete Blood Count (CBC)',
          date: '2025-06-10',
          labName: 'Metro Diagnostic Center',
          orderedBy: 'Dr. Sarah Johnson',
          status: 'pending',
          bookingDetails: {
            testCenter: {
              id: '4',
              name: 'Metro Diagnostic Center',
              address: '321 Union Place, Colombo 02',
              phone: '+94 11 567 8901'
            },
            testName: 'Complete Blood Count (CBC)',
            date: '2025-06-10',
            time: '09:30',
            dateLabel: 'Tomorrow',
            dateDisplay: 'Jun 10',
            patientInfo: {
              name: 'John Doe',
              phone: '+94 77 123 4567',
              email: 'john.doe@email.com'
            },
            bookingId: 'BK1717804200000',
            bookingTime: '2025-06-08T10:30:00.000Z'
          },
          notifications: [
            {
              id: 'n1',
              type: 'booking_confirmed',
              title: 'Booking Confirmed',
              message: 'Your CBC test has been booked for tomorrow at 9:30 AM at Metro Diagnostic Center.',
              timestamp: '2025-06-08T10:30:00.000Z',
              read: false,
              priority: 'medium',
              category: 'lab'
            }
          ]
        }
      ],

      notifications: [
        {
          id: 'n1',
          type: 'booking_confirmed',
          title: 'Test Booked Successfully',
          message: 'Your Complete Blood Count test has been scheduled for tomorrow at 9:30 AM.',
          timestamp: '2025-06-08T10:30:00.000Z',
          read: false,
          relatedId: '5',
          priority: 'medium',
          category: 'lab'
        },
        {
          id: 'n2',
          type: 'reminder',
          title: 'Test Reminder',
          message: 'Your CBC test is scheduled for tomorrow at 9:30 AM. Please arrive 15 minutes early.',
          timestamp: '2025-06-08T20:00:00.000Z',
          read: false,
          relatedId: '5',
          priority: 'high',
          category: 'lab'
        },
        {
          id: 'n3',
          type: 'results_ready',
          title: 'Test Results Available',
          message: 'Your Lipid Panel results are now available. Tap to view.',
          timestamp: '2025-06-07T14:30:00.000Z',
          read: true,
          relatedId: '2',
          priority: 'medium',
          category: 'lab'
        }
      ],

      // Enhanced state
      userLocation: null,
      nearbyPharmacies: [],
      nearbyTestCenters: [],
      
      // Lab test requests and templates
      labTestRequests: [],
      labTestTemplates: [
        {
          id: '1',
          name: 'Complete Blood Count (CBC)',
          tests: ['White Blood Cell Count', 'Red Blood Cell Count', 'Hemoglobin', 'Hematocrit', 'Platelet Count'],
          description: 'Comprehensive blood analysis to detect infections, anemia, and blood disorders',
          category: 'Blood Tests',
          preparationInstructions: ['No special preparation required'],
          fastingRequired: false,
          estimatedTime: '30 minutes',
          price: 45
        },
        {
          id: '2',
          name: 'Lipid Panel',
          tests: ['Total Cholesterol', 'HDL Cholesterol', 'LDL Cholesterol', 'Triglycerides'],
          description: 'Measures cholesterol and triglyceride levels to assess cardiovascular risk',
          category: 'Blood Tests',
          preparationInstructions: ['Fast for 9-12 hours before test', 'Only water is allowed during fasting'],
          fastingRequired: true,
          estimatedTime: '15 minutes',
          price: 55
        },
        {
          id: '3',
          name: 'Thyroid Function Panel',
          tests: ['TSH', 'Free T4', 'Free T3'],
          description: 'Evaluates thyroid gland function and metabolism',
          category: 'Blood Tests',
          preparationInstructions: ['Take medications as usual unless instructed otherwise'],
          fastingRequired: false,
          estimatedTime: '15 minutes',
          price: 65
        },
        {
          id: '4',
          name: 'Liver Function Tests',
          tests: ['ALT', 'AST', 'Bilirubin', 'Alkaline Phosphatase', 'Albumin'],
          description: 'Assesses liver health and function',
          category: 'Blood Tests',
          preparationInstructions: ['Avoid alcohol 24 hours before test'],
          fastingRequired: false,
          estimatedTime: '20 minutes',
          price: 50
        },
        {
          id: '5',
          name: 'Basic Metabolic Panel',
          tests: ['Glucose', 'Sodium', 'Potassium', 'Chloride', 'BUN', 'Creatinine'],
          description: 'Evaluates kidney function, blood sugar, and electrolyte balance',
          category: 'Blood Tests',
          preparationInstructions: ['Fast for 8-12 hours if glucose is included'],
          fastingRequired: true,
          estimatedTime: '15 minutes',
          price: 40
        }
      ],
      
      // Upload state
      uploadQueue: [],
      processingUploads: [],
      uploadHistory: [],
      
      // Settings
      cameraSettings: defaultCameraSettings,
      analysisPreferences: defaultAnalysisPreferences,
      privacySettings: defaultPrivacySettings,
      
      // Error handling
      errors: [],
      
      // Loading states
      isUploading: false,
      isProcessing: false,
      
      // Statistics
      totalUploads: 0,
      successfulUploads: 0,
      failedUploads: 0,

      // Prescription actions
      addPrescription: (prescription: Prescription) =>
        set((state) => ({
          prescriptions: [...state.prescriptions, prescription],
        })),

      updatePrescription: (id: string, updates: Partial<Prescription>) =>
        set((state) => ({
          prescriptions: state.prescriptions.map((p) =>
            p.id === id ? { ...p, ...updates, lastUpdated: new Date().toISOString() } : p
          ),
        })),

      deletePrescription: (id: string) =>
        set((state) => ({
          prescriptions: state.prescriptions.filter((p) => p.id !== id),
          uploadHistory: state.uploadHistory.filter((h) => h.details.prescriptionId !== id),
        })),

      verifyPrescription: (id: string, verifiedBy: string) =>
        set((state) => ({
          prescriptions: state.prescriptions.map((p) =>
            p.id === id
              ? {
                  ...p,
                  isVerified: true,
                  verifiedBy,
                  verifiedAt: new Date().toISOString(),
                }
              : p
          ),
        })),

      // Upload queue management
      addUploadToQueue: (item: UploadQueueItem) =>
        set((state) => ({
          uploadQueue: [...state.uploadQueue, item],
        })),

      removeFromUploadQueue: (id: string) =>
        set((state) => ({
          uploadQueue: state.uploadQueue.filter((item) => item.id !== id),
        })),

      clearUploadQueue: () =>
        set(() => ({
          uploadQueue: [],
        })),

      // Processing management
      startProcessingUpload: (queueItemId: string) =>
        set((state) => {
          const queueItem = state.uploadQueue.find((item) => item.id === queueItemId);
          if (!queueItem) return state;

          const processingUpload: ProcessingUpload = {
            id: queueItem.id,
            prescriptionId: queueItem.prescriptionId,
            fileName: queueItem.file.name,
            status: 'uploading',
            progress: 0,
            startedAt: new Date().toISOString(),
          };

          return {
            uploadQueue: state.uploadQueue.filter((item) => item.id !== queueItemId),
            processingUploads: [...state.processingUploads, processingUpload],
            isProcessing: true,
          };
        }),

      updateProcessingStatus: (id: string, progress: number, currentStep?: string) =>
        set((state) => ({
          processingUploads: state.processingUploads.map((upload) =>
            upload.id === id
              ? {
                  ...upload,
                  progress,
                  currentStep: currentStep ? { 
                    id: currentStep, 
                    name: currentStep, 
                    description: '', 
                    status: 'processing' as const, 
                    progress 
                  } : upload.currentStep,
                }
              : upload
          ),
        })),

      completeUpload: (id: string, result: UploadResult) =>
        set((state) => {
          const upload = state.processingUploads.find((u) => u.id === id);
          if (!upload) return state;

          // Update prescription with detected medicines
          const updatedPrescriptions = state.prescriptions.map((p) =>
            p.id === upload.prescriptionId
              ? {
                  ...p,
                  detectedMedicines: [
                    ...(p.detectedMedicines || []),
                    ...result.detectedMedicines,
                  ],
                  uploadedPrescriptions: [
                    ...(p.uploadedPrescriptions || []),
                    result.uploadedPrescription,
                  ],
                  lastUpdated: new Date().toISOString(),
                }
              : p
          );

          // Add to history
          const historyEntry: UploadHistoryEntry = {
            id: `history_${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: 'upload',
            details: {
              prescriptionId: upload.prescriptionId,
              fileName: upload.fileName,
              medicinesDetected: result.detectedMedicines.length,
              confidence: result.confidence,
              processingTime: result.processingTime,
            },
          };

          return {
            prescriptions: updatedPrescriptions,
            processingUploads: state.processingUploads.filter((u) => u.id !== id),
            uploadHistory: [...state.uploadHistory, historyEntry],
            isProcessing: state.processingUploads.length <= 1,
            totalUploads: state.totalUploads + 1,
            successfulUploads: state.successfulUploads + 1,
          };
        }),

      failUpload: (id: string, error: string) =>
        set((state) => {
          const upload = state.processingUploads.find((u) => u.id === id);
          if (!upload) return state;

          const errorEntry: AppError = {
            code: 'UPLOAD_FAILED',
            message: error,
            timestamp: new Date().toISOString(),
            context: `Upload ${id}`,
            details: { uploadId: id, prescriptionId: upload.prescriptionId },
          };

          return {
            processingUploads: state.processingUploads.filter((u) => u.id !== id),
            errors: [...state.errors, errorEntry],
            isProcessing: state.processingUploads.length <= 1,
            totalUploads: state.totalUploads + 1,
            failedUploads: state.failedUploads + 1,
          };
        }),

      // Detected medicine management
      addDetectedMedicine: (prescriptionId: string, medicine: DetectedMedicine) =>
        set((state) => ({
          prescriptions: state.prescriptions.map((p) =>
            p.id === prescriptionId
              ? {
                  ...p,
                  detectedMedicines: [
                    ...(p.detectedMedicines || []),
                    {
                      ...medicine,
                      id: medicine.id || `medicine_${Date.now()}`,
                      createdAt: new Date().toISOString(),
                    },
                  ],
                  lastUpdated: new Date().toISOString(),
                }
              : p
          ),
        })),

      updateDetectedMedicine: (prescriptionId: string, medicineId: string, updates: Partial<DetectedMedicine>) =>
        set((state) => ({
          prescriptions: state.prescriptions.map((p) =>
            p.id === prescriptionId
              ? {
                  ...p,
                  detectedMedicines: p.detectedMedicines?.map((m) =>
                    m.id === medicineId
                      ? {
                          ...m,
                          ...updates,
                          updatedAt: new Date().toISOString(),
                          editHistory: [
                            ...(m.editHistory || []),
                            ...Object.entries(updates).map(([field, newValue]) => ({
                              field: field as keyof DetectedMedicine,
                              oldValue: (m as any)[field],
                              newValue,
                              editedAt: new Date().toISOString(),
                            })),
                          ],
                        }
                      : m
                  ),
                  lastUpdated: new Date().toISOString(),
                }
              : p
          ),
        })),

      removeDetectedMedicine: (prescriptionId: string, medicineId: string) =>
        set((state) => ({
          prescriptions: state.prescriptions.map((p) =>
            p.id === prescriptionId
              ? {
                  ...p,
                  detectedMedicines: p.detectedMedicines?.filter((m) => m.id !== medicineId),
                  lastUpdated: new Date().toISOString(),
                }
              : p
          ),
        })),

      verifyDetectedMedicine: (prescriptionId: string, medicineId: string, verified: boolean) =>
        set((state) => ({
          prescriptions: state.prescriptions.map((p) =>
            p.id === prescriptionId
              ? {
                  ...p,
                  detectedMedicines: p.detectedMedicines?.map((m) =>
                    m.id === medicineId
                      ? { ...m, isVerified: verified, updatedAt: new Date().toISOString() }
                      : m
                  ),
                  lastUpdated: new Date().toISOString(),
                }
              : p
          ),
        })),

      // Upload history
      addToUploadHistory: (entry: UploadHistoryEntry) =>
        set((state) => ({
          uploadHistory: [...state.uploadHistory, entry],
        })),

      getUploadHistory: (prescriptionId?: string) => {
        const state = get();
        return prescriptionId
          ? state.uploadHistory.filter((h) => h.details.prescriptionId === prescriptionId)
          : state.uploadHistory;
      },

      clearUploadHistory: (prescriptionId?: string) =>
        set((state) => ({
          uploadHistory: prescriptionId
            ? state.uploadHistory.filter((h) => h.details.prescriptionId !== prescriptionId)
            : [],
        })),

      // Settings management
      updateCameraSettings: (settings: Partial<CameraSettings>) =>
        set((state) => ({
          cameraSettings: { ...state.cameraSettings, ...settings },
        })),

      updateAnalysisPreferences: (preferences: Partial<AnalysisPreferences>) =>
        set((state) => ({
          analysisPreferences: { ...state.analysisPreferences, ...preferences },
        })),

      updatePrivacySettings: (settings: Partial<PrivacySettings>) =>
        set((state) => ({
          privacySettings: { ...state.privacySettings, ...settings },
        })),

      // Error management
      addError: (error: AppError) =>
        set((state) => ({
          errors: [...state.errors, error],
        })),

      removeError: (errorId: string) =>
        set((state) => ({
          errors: state.errors.filter((e) => e.code !== errorId),
        })),

      clearErrors: () =>
        set(() => ({
          errors: [],
        })),

      // Statistics
      updateUploadStats: (type: 'success' | 'failure') =>
        set((state) => ({
          totalUploads: state.totalUploads + 1,
          successfulUploads: type === 'success' ? state.successfulUploads + 1 : state.successfulUploads,
          failedUploads: type === 'failure' ? state.failedUploads + 1 : state.failedUploads,
        })),

      getUploadStats: () => {
        const state = get();
        return {
          total: state.totalUploads,
          success: state.successfulUploads,
          failure: state.failedUploads,
          successRate: state.totalUploads > 0 ? (state.successfulUploads / state.totalUploads) * 100 : 0,
        };
      },

      // Utility functions
      findPrescriptionById: (id: string) => {
        const state = get();
        return state.prescriptions.find((p) => p.id === id);
      },

      getMedicinesForPrescription: (prescriptionId: string) => {
        const state = get();
        const prescription = state.prescriptions.find((p) => p.id === prescriptionId);
        return prescription?.detectedMedicines || [];
      },

      isUploadInProgress: (prescriptionId: string) => {
        const state = get();
        return state.processingUploads.some((upload) => upload.prescriptionId === prescriptionId);
      },

      getProcessingUpload: (prescriptionId: string) => {
        const state = get();
        return state.processingUploads.find((upload) => upload.prescriptionId === prescriptionId);
      },

      // Lab report actions
      addLabReport: (labReport: ExtendedLabReport) =>
        set((state) => ({
          labReports: [...state.labReports, labReport],
        })),

      updateLabReport: (id: string, updates: Partial<ExtendedLabReport>) =>
        set((state) => {
          const updatedReports = state.labReports.map((report) => 
            report.id === id ? { ...report, ...updates } : report
          );

          // If booking details are being added, create a notification (from original logic)
          if (updates.bookingDetails && !state.labReports.find(r => r.id === id)?.bookingDetails) {
            const newNotification: Notification = {
              id: `n_${Date.now()}`,
              type: 'booking_confirmed',
              title: 'Test Booked Successfully',
              message: `Your ${updates.bookingDetails.testName} has been booked for ${updates.bookingDetails.dateLabel} at ${updates.bookingDetails.time}.`,
              timestamp: new Date().toISOString(),
              read: false,
              relatedId: id,
              priority: 'medium',
              category: 'lab'
            };

            return {
              labReports: updatedReports,
              notifications: [...state.notifications, newNotification]
            };
          }

          return {
            labReports: updatedReports
          };
        }),

      deleteLabReport: (id: string) =>
        set((state) => ({
          labReports: state.labReports.filter((r) => r.id !== id),
        })),

      // Original simulate test completion method
      simulateTestCompletion: (reportId: string) => set((state) => {
        // Find the report
        const report = state.labReports.find(r => r.id === reportId);
        if (!report || report.status === 'completed') return state;

        // Generate mock results based on test type (from original logic)
        const generateMockResults = (testName: string) => {
          if (testName.toLowerCase().includes('cbc') || testName.toLowerCase().includes('blood count')) {
            return [
              {
                name: 'White Blood Cells',
                value: '6.8 x10^9/L',
                normalRange: '4.0-11.0 x10^9/L',
                isNormal: true
              },
              {
                name: 'Red Blood Cells',
                value: '4.9 x10^12/L',
                normalRange: '4.5-5.5 x10^12/L',
                isNormal: true
              },
              {
                name: 'Hemoglobin',
                value: '14.8 g/dL',
                normalRange: '13.5-17.5 g/dL',
                isNormal: true
              },
              {
                name: 'Platelets',
                value: '280 x10^9/L',
                normalRange: '150-450 x10^9/L',
                isNormal: true
              }
            ];
          } else if (testName.toLowerCase().includes('vitamin d')) {
            return [
              {
                name: 'Vitamin D (25-OH)',
                value: '32 ng/mL',
                normalRange: '30-100 ng/mL',
                isNormal: true
              }
            ];
          }
          return [];
        };

        const mockResults = generateMockResults(report.testName);
        
        // Update the report with completed status and results
        const updatedReports = state.labReports.map((r) => 
          r.id === reportId ? {
            ...r,
            status: 'completed' as const,
            results: mockResults,
            notes: 'Test completed successfully. All values within normal range.'
          } : r
        );

        // Create a notification for completed results
        const resultNotification: Notification = {
          id: `n_results_${Date.now()}`,
          type: 'results_ready',
          title: 'Test Results Available',
          message: `Your ${report.testName} results are now ready. Tap to view.`,
          timestamp: new Date().toISOString(),
          read: false,
          relatedId: reportId,
          priority: 'medium',
          category: 'lab'
        };

        return {
          labReports: updatedReports,
          notifications: [...state.notifications, resultNotification]
        };
      }),

      // Notification actions
      addNotification: (notification: Notification) =>
        set((state) => ({
          notifications: [...state.notifications, notification],
        })),

      markNotificationAsRead: (id: string) =>
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),

      deleteNotification: (id: string) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      markAllNotificationsAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      // Location and nearby services
      updateUserLocation: (location: UserLocation) =>
        set(() => ({
          userLocation: location,
        })),

      updateNearbyPharmacies: (pharmacies: Pharmacy[]) =>
        set(() => ({
          nearbyPharmacies: pharmacies,
        })),

      updateNearbyTestCenters: (testCenters: TestCenter[]) =>
        set(() => ({
          nearbyTestCenters: testCenters,
        })),

      // Lab test request actions
      addLabTestRequest: (request: LabTestRequest) =>
        set((state) => ({
          labTestRequests: [...state.labTestRequests, request],
        })),

      updateLabTestRequest: (id: string, updates: Partial<LabTestRequest>) =>
        set((state) => ({
          labTestRequests: state.labTestRequests.map((request) =>
            request.id === id
              ? { ...request, ...updates, updatedAt: new Date().toISOString() }
              : request
          ),
        })),

      deleteLabTestRequest: (id: string) =>
        set((state) => ({
          labTestRequests: state.labTestRequests.filter((request) => request.id !== id),
        })),

      getLabTestRequestsByPatient: (patientId: string) => {
        const state = get();
        return state.labTestRequests.filter((request) => request.patientId === patientId);
      },

      getLabTestRequestsByStatus: (status: string) => {
        const state = get();
        return state.labTestRequests.filter((request) => request.status === status);
      },

      // Lab test template actions
      addLabTestTemplate: (template: LabTestTemplate) =>
        set((state) => ({
          labTestTemplates: [...state.labTestTemplates, template],
        })),

      getLabTestTemplates: () => {
        const state = get();
        return state.labTestTemplates;
      },

      getLabTestTemplatesByCategory: (category: string) => {
        const state = get();
        return state.labTestTemplates.filter((template) => template.category === category);
      },

      // Convert lab request to lab report when completed
      convertLabRequestToReport: (requestId: string, results: any[]) => {
        const state = get();
        const request = state.labTestRequests.find(r => r.id === requestId);
        
        if (!request) return;

        // Create lab report from completed request
        const newLabReport: ExtendedLabReport = {
          id: `lab_report_${Date.now()}`,
          testName: request.requestedTests.join(', '),
          date: new Date().toISOString().split('T')[0],
          labName: request.assignedTestCenter?.name || 'Lab Center',
          orderedBy: request.doctorName,
          status: 'completed',
          results: results || [],
          notes: `Lab test completed. Originally requested on ${new Date(request.requestDate).toLocaleDateString()}.`,
        };

        // Update request status and link to lab report
        const updatedRequest = {
          ...request,
          status: 'completed' as const,
          labReportId: newLabReport.id,
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          labReports: [...state.labReports, newLabReport],
          labTestRequests: state.labTestRequests.map(r => 
            r.id === requestId ? updatedRequest : r
          ),
        }));

        // Create notification for patient
        const notification = {
          id: `lab_result_${Date.now()}`,
          type: 'results_ready' as const,
          title: 'Lab Results Available',
          message: `Your lab results for ${request.requestedTests.slice(0, 2).join(', ')} are now available.`,
          timestamp: new Date().toISOString(),
          read: false,
          relatedId: newLabReport.id,
          priority: 'medium' as const,
          category: 'lab' as const,
        };

        set((state) => ({
          notifications: [...state.notifications, notification],
        }));
      },
    }),
    {
      name: 'medical-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Persist only essential data
        prescriptions: state.prescriptions,
        labReports: state.labReports,
        labTestRequests: state.labTestRequests,
        labTestTemplates: state.labTestTemplates,
        notifications: state.notifications.filter(n => !n.read), // Only keep unread notifications
        uploadHistory: state.uploadHistory.slice(-50), // Keep last 50 entries
        cameraSettings: state.cameraSettings,
        analysisPreferences: state.analysisPreferences,
        privacySettings: state.privacySettings,
        totalUploads: state.totalUploads,
        successfulUploads: state.successfulUploads,
        failedUploads: state.failedUploads,
      }),
    }
  )
);

// Hook for upload-specific operations
export const useUploadOperations = () => {
  const store = useMedicalStore();
  
  return {
    // Queue operations
    addToQueue: store.addUploadToQueue,
    removeFromQueue: store.removeFromUploadQueue,
    clearQueue: store.clearUploadQueue,
    
    // Processing operations
    startProcessing: store.startProcessingUpload,
    updateProgress: store.updateProcessingStatus,
    completeUpload: store.completeUpload,
    failUpload: store.failUpload,
    
    // Medicine operations
    addMedicine: store.addDetectedMedicine,
    updateMedicine: store.updateDetectedMedicine,
    removeMedicine: store.removeDetectedMedicine,
    verifyMedicine: store.verifyDetectedMedicine,
    
    // Getters
    getUploadQueue: () => store.uploadQueue,
    getProcessingUploads: () => store.processingUploads,
    isProcessing: () => store.isProcessing,
    getUploadHistory: store.getUploadHistory,
    getUploadStats: store.getUploadStats,
    
    // Utilities
    findPrescription: store.findPrescriptionById,
    isUploadInProgress: store.isUploadInProgress,
    getProcessingUpload: store.getProcessingUpload,
  };
};

// Hook for lab request operations
export const useLabRequestOperations = () => {
  const store = useMedicalStore();
  
  return {
    // Lab request operations
    addLabRequest: store.addLabTestRequest,
    updateLabRequest: store.updateLabTestRequest,
    deleteLabRequest: store.deleteLabTestRequest,
    getRequestsByPatient: store.getLabTestRequestsByPatient,
    getRequestsByStatus: store.getLabTestRequestsByStatus,
    
    // Template operations
    getTemplates: store.getLabTestTemplates,
    getTemplatesByCategory: store.getLabTestTemplatesByCategory,
    
    // Conversion operations
    convertToReport: store.convertLabRequestToReport,
    
    // Getters
    getAllRequests: () => store.labTestRequests,
    getAllTemplates: () => store.labTestTemplates,
  };
};

export default useMedicalStore;