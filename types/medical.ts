export type PrescriptionStatus = 'active' | 'completed' | 'cancelled';

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  date: string;
  doctorName: string;
  patientName?: string;
  patientId?: string;
  condition?: string;
  medications: Medication[];
  pharmacy: string;
  refillsRemaining: number;
  status: PrescriptionStatus;
  notes?: string;
}

export interface LabResult {
  name: string;
  value: string;
  normalRange: string;
  isNormal: boolean;
}

export interface LabReport {
  id: string;
  testName: string;
  date: string;
  labName: string;
  orderedBy: string;
  status: 'pending' | 'completed' | 'cancelled';
  results?: LabResult[];
  notes?: string;
}