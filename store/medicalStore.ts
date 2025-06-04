import { create } from 'zustand';
import { Prescription, LabReport } from '@/types/medical';

// Export status types for use in other components
export type PrescriptionStatus = 'active' | 'completed' | 'expired' | 'cancelled';
export type LabReportStatus = 'pending' | 'completed' | 'cancelled';

// Re-export types from types/medical.ts
export { Prescription, LabReport };

interface MedicalState {
  prescriptions: Prescription[];
  labReports: LabReport[];
  addPrescription: (prescription: Prescription) => void;
  updatePrescription: (id: string, updates: Partial<Prescription>) => void;
  addLabReport: (report: LabReport) => void;
  updateLabReport: (id: string, updates: Partial<LabReport>) => void;
}

export const useMedicalStore = create<MedicalState>((set) => ({
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
          instructions: 'Apply a pea-sized amount to affected areas at night'
        },
        {
          name: 'Clindamycin',
          dosage: '1%',
          frequency: 'Twice daily',
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
  
  updateLabReport: (id, updates) => set((state) => ({
    labReports: state.labReports.map((report) => 
      report.id === id ? { ...report, ...updates } : report
    )
  }))
}));