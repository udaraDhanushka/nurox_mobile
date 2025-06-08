import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Medicine {
  id: string;
  name: string;
  description: string;
  category: string;
  addedBy: string; // doctor who added it
  dateAdded: string;
}

interface MedicineStore {
  medicines: Medicine[];
  addMedicine: (medicine: Omit<Medicine, 'id' | 'dateAdded'>) => void;
  searchMedicines: (query: string) => Medicine[];
  getMedicinesByCategory: (category: string) => Medicine[];
}

const defaultMedicines: Medicine[] = [
  {
    id: '1',
    name: 'Lisinopril',
    description: 'ACE inhibitor used to treat high blood pressure and heart failure',
    category: 'Cardiovascular',
    addedBy: 'Dr. Sarah Johnson',
    dateAdded: '2025-01-01'
  },
  {
    id: '2',
    name: 'Metformin',
    description: 'Medication used to treat type 2 diabetes',
    category: 'Diabetes',
    addedBy: 'Dr. Michael Chen',
    dateAdded: '2025-01-01'
  },
  {
    id: '3',
    name: 'Ibuprofen',
    description: 'Nonsteroidal anti-inflammatory drug (NSAID)',
    category: 'Pain Relief',
    addedBy: 'Dr. Emily Rodriguez',
    dateAdded: '2025-01-01'
  },
  {
    id: '4',
    name: 'Albuterol',
    description: 'Bronchodilator used to treat asthma and COPD',
    category: 'Respiratory',
    addedBy: 'Dr. Sarah Johnson',
    dateAdded: '2025-01-01'
  },
  {
    id: '5',
    name: 'Amoxicillin',
    description: 'Antibiotic used to treat bacterial infections',
    category: 'Antibiotics',
    addedBy: 'Dr. Michael Chen',
    dateAdded: '2025-01-01'
  },
  {
    id: '6',
    name: 'Atorvastatin',
    description: 'Statin medication used to prevent cardiovascular disease',
    category: 'Cardiovascular',
    addedBy: 'Dr. Emily Rodriguez',
    dateAdded: '2025-01-01'
  }
];

export const useMedicineStore = create<MedicineStore>()(
  persist(
    (set, get) => ({
      medicines: defaultMedicines,
      
      addMedicine: (medicine) => {
        const newMedicine: Medicine = {
          ...medicine,
          id: Math.random().toString(36).substring(2, 9),
          dateAdded: new Date().toISOString().split('T')[0]
        };
        
        set((state) => ({
          medicines: [...state.medicines, newMedicine]
        }));
      },
      
      searchMedicines: (query: string) => {
        const medicines = get().medicines;
        if (!query.trim()) return medicines;
        
        return medicines.filter(medicine =>
          medicine.name.toLowerCase().includes(query.toLowerCase()) ||
          medicine.description.toLowerCase().includes(query.toLowerCase()) ||
          medicine.category.toLowerCase().includes(query.toLowerCase())
        );
      },
      
      getMedicinesByCategory: (category: string) => {
        return get().medicines.filter(medicine => medicine.category === category);
      }
    }),
    {
      name: 'medicine-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);