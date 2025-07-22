import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { medicineService, Medicine as APIMedicine } from '../services/medicineService';

export interface Medicine {
  id: string;
  name: string;
  description?: string;
  category?: string;
  genericName?: string;
  brand?: string;
  type: string;
  strength?: string;
  unit?: string;
  isControlled: boolean;
  requiresPrescription: boolean;
  addedBy?: string;
  dateAdded: string;
}

interface MedicineStore {
  medicines: Medicine[];
  isLoading: boolean;
  error: string | null;
  loadMedicines: () => Promise<void>;
  addMedicine: (medicine: Omit<Medicine, 'id' | 'dateAdded'>) => Promise<void>;
  searchMedicines: (query: string) => Promise<Medicine[]>;
  getMedicinesByCategory: (category: string) => Medicine[];
  refreshMedicines: () => Promise<void>;
}

// Helper function to convert API medicine to store medicine
const convertAPIMedicine = (apiMedicine: APIMedicine): Medicine => ({
  id: apiMedicine.id,
  name: apiMedicine.name,
  description: apiMedicine.description,
  category: apiMedicine.type, // Map type to category for backward compatibility
  genericName: apiMedicine.genericName,
  brand: apiMedicine.brand,
  type: apiMedicine.type,
  strength: apiMedicine.strength,
  unit: apiMedicine.unit,
  isControlled: apiMedicine.isControlled,
  requiresPrescription: apiMedicine.requiresPrescription,
  dateAdded: new Date(apiMedicine.createdAt).toISOString().split('T')[0]
});

export const useMedicineStore = create<MedicineStore>()(
  persist(
    (set, get) => ({
      medicines: [],
      isLoading: false,
      error: null,
      
      loadMedicines: async () => {
        set({ isLoading: true, error: null });
        try {
          const apiMedicines = await medicineService.getMedicines({ limit: 100 });
          const medicines = apiMedicines.map(convertAPIMedicine);
          set({ medicines, isLoading: false });
        } catch (error) {
          console.error('Failed to load medicines:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load medicines',
            isLoading: false 
          });
        }
      },
      
      addMedicine: async (medicineData) => {
        set({ isLoading: true, error: null });
        try {
          const apiMedicine = await medicineService.createMedicine({
            name: medicineData.name,
            description: medicineData.description,
            type: medicineData.type,
            genericName: medicineData.genericName,
            brand: medicineData.brand,
            strength: medicineData.strength,
            unit: medicineData.unit,
            isControlled: medicineData.isControlled,
            requiresPrescription: medicineData.requiresPrescription
          });
          
          const newMedicine = convertAPIMedicine(apiMedicine);
          set((state) => ({
            medicines: [...state.medicines, newMedicine],
            isLoading: false
          }));
        } catch (error) {
          console.error('Failed to add medicine:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add medicine',
            isLoading: false 
          });
          throw error;
        }
      },
      
      searchMedicines: async (query: string): Promise<Medicine[]> => {
        if (!query.trim()) {
          return get().medicines;
        }
        
        try {
          const apiMedicines = await medicineService.searchMedicines(query, 50);
          return apiMedicines.map(convertAPIMedicine);
        } catch (error) {
          console.error('Failed to search medicines:', error);
          // Fallback to local search if API fails
          const medicines = get().medicines;
          return medicines.filter(medicine =>
            medicine.name.toLowerCase().includes(query.toLowerCase()) ||
            (medicine.description && medicine.description.toLowerCase().includes(query.toLowerCase())) ||
            (medicine.category && medicine.category.toLowerCase().includes(query.toLowerCase())) ||
            (medicine.genericName && medicine.genericName.toLowerCase().includes(query.toLowerCase()))
          );
        }
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