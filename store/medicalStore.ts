import { create } from 'zustand';
import { Prescription, LabReport } from '@/types/medical';

// Export status types for use in other components
export type PrescriptionStatus = 'active' | 'completed' | 'expired' | 'cancelled';
export type LabReportStatus = 'pending' | 'completed' | 'cancelled';

// Extended LabReport interface to include booking details
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
  notifications?: Array<{
    id: string;
    type: 'booking_confirmed' | 'reminder' | 'results_ready' | 'test_completed';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
  }>;
}

// Re-export types from types/medical.ts
// Re-export types from types/medical.ts
export { Prescription, LabReport };

interface MedicalState {
  prescriptions: Prescription[];
  labReports: ExtendedLabReport[];
  notifications: Array<{
    id: string;
    type: 'booking_confirmed' | 'reminder' | 'results_ready' | 'test_completed' | 'prescription_ready';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    relatedId?: string; // ID of related lab report or prescription
  }>;
  addPrescription: (prescription: Prescription) => void;
  updatePrescription: (id: string, updates: Partial<Prescription>) => void;
  addLabReport: (report: ExtendedLabReport) => void;
  updateLabReport: (id: string, updates: Partial<ExtendedLabReport>) => void;
  addNotification: (notification: any) => void;
  markNotificationAsRead: (id: string) => void;
  simulateTestCompletion: (reportId: string) => void;
}

export const useMedicalStore = create<MedicalState>((set, get) => ({
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
          read: false
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
      relatedId: '5'
    },
    {
      id: 'n2',
      type: 'reminder',
      title: 'Test Reminder',
      message: 'Your CBC test is scheduled for tomorrow at 9:30 AM. Please arrive 15 minutes early.',
      timestamp: '2025-06-08T20:00:00.000Z',
      read: false,
      relatedId: '5'
    },
    {
      id: 'n3',
      type: 'results_ready',
      title: 'Test Results Available',
      message: 'Your Lipid Panel results are now available. Tap to view.',
      timestamp: '2025-06-07T14:30:00.000Z',
      read: true,
      relatedId: '2'
    }
  ],
  
  addPrescription: (prescription) => set((state) => ({
    prescriptions: [...state.prescriptions, prescription]
  })),
  
  updatePrescription: (id, updates) => set((state) => ({
    prescriptions: state.prescriptions.map((prescription) => 
      prescription.id === id ? { ...prescription, ...updates } : prescription
    )
  })),
  
  addLabReport: (report) => set((state) => ({
    labReports: [...state.labReports, report]
  })),
  
  updateLabReport: (id, updates) => set((state) => {
    const updatedReports = state.labReports.map((report) => 
      report.id === id ? { ...report, ...updates } : report
    );

    // If booking details are being added, create a notification
    if (updates.bookingDetails && !state.labReports.find(r => r.id === id)?.bookingDetails) {
      const newNotification = {
        id: `n_${Date.now()}`,
        type: 'booking_confirmed' as const,
        title: 'Test Booked Successfully',
        message: `Your ${updates.bookingDetails.testName} has been booked for ${updates.bookingDetails.dateLabel} at ${updates.bookingDetails.time}.`,
        timestamp: new Date().toISOString(),
        read: false,
        relatedId: id
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

  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, { ...notification, id: notification.id || `n_${Date.now()}` }]
  })),

  markNotificationAsRead: (id) => set((state) => ({
    notifications: state.notifications.map((notification) =>
      notification.id === id ? { ...notification, read: true } : notification
    )
  })),

  simulateTestCompletion: (reportId) => set((state) => {
    // Find the report
    const report = state.labReports.find(r => r.id === reportId);
    if (!report || report.status === 'completed') return state;

    // Generate mock results based on test type
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
    const resultNotification = {
      id: `n_results_${Date.now()}`,
      type: 'results_ready' as const,
      title: 'Test Results Available',
      message: `Your ${report.testName} results are now ready. Tap to view.`,
      timestamp: new Date().toISOString(),
      read: false,
      relatedId: reportId
    };

    return {
      labReports: updatedReports,
      notifications: [...state.notifications, resultNotification]
    };
  })
}));