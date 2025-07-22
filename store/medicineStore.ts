import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { medicineService, Medicine as APIMedicine } from '../services/medicineService';

export interface Medicine {
  id: string;
  name: string;
  dateAdded: string;
}

interface MedicineStore {
  medicines: Medicine[];

export const useMedicineStore = create<MedicineStore>()(
  persist(
    (set, get) => ({
      },
      
      getMedicinesByCategory: (category: string) => {
        return get().medicines.filter(medicine => medicine.category === category);
      },
      
      refreshMedicines: async () => {
        await get().loadMedicines();
      }
    }),
    {
      name: 'medicine-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);