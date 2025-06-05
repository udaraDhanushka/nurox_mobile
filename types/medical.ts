export interface Medication {
    duration: string;
    name: string;
    dosage: string;
    frequency: string;
    instructions: string;
  }
  
  export interface Prescription {
    id: string;
    date: string;
    doctorName: string;
    medications: Medication[];
    pharmacy: string;
    refillsRemaining: number;
    status: 'active' | 'completed' | 'expired' | 'cancelled';
  }
  
  export interface LabReport {
    id: string;
    testName: string;
    date: string;
    labName: string;
    orderedBy: string;
    status: 'pending' | 'completed' | 'cancelled';
    results?: {
      name: string;
      value: string;
      normalRange: string;
      isNormal: boolean;
    }[];
    notes?: string;
    pdfUrl?: string;
  }