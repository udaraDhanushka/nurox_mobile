import { api } from './api';

export interface Medicine {
  id: string;
  name: string;
  genericName?: string;
  brand?: string;
  type: string;
  strength?: string;
  unit?: string;
  description?: string;
  sideEffects?: string[];
  contraindications?: string[];
  manufacturer?: string;
  isControlled: boolean;
  requiresPrescription: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    prescriptionItems: number;
  };
}

export interface MedicineSearchParams {
  search?: string;
  type?: string;
  isControlled?: boolean;
  requiresPrescription?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateMedicineData {
  name: string;
  genericName?: string;
  brand?: string;
  type: string;
  strength?: string;
  unit?: string;
  description?: string;
  sideEffects?: string[];
  contraindications?: string[];
  manufacturer?: string;
  isControlled?: boolean;
  requiresPrescription?: boolean;
}

export interface MedicineResponse {
  success: boolean;
  data: {
    medicines: Medicine[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface SingleMedicineResponse {
  success: boolean;
  data: Medicine;
}

export interface MedicineSuggestionsResponse {
  success: boolean;
  data: Medicine[];
}

class MedicineService {
  async getMedicines(params: MedicineSearchParams = {}): Promise<Medicine[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.search) queryParams.append('search', params.search);
      if (params.type) queryParams.append('type', params.type);
      if (params.isControlled !== undefined) queryParams.append('isControlled', params.isControlled.toString());
      if (params.requiresPrescription !== undefined) queryParams.append('requiresPrescription', params.requiresPrescription.toString());
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const response = await api.get<MedicineResponse>(`/medicines?${queryParams.toString()}`);
      return response.data.medicines;
    } catch (error) {
      console.error('Error fetching medicines:', error);
      throw error;
    }
  }

  async getMedicine(id: string): Promise<Medicine> {
    try {
      const response = await api.get<SingleMedicineResponse>(`/medicines/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching medicine ${id}:`, error);
      throw error;
    }
  }

  async searchMedicines(query: string, limit: number = 20): Promise<Medicine[]> {
    try {
      if (!query || query.length < 2) {
        return [];
      }

      return await this.getMedicines({ search: query, limit });
    } catch (error) {
      console.error('Error searching medicines:', error);
      throw error;
    }
  }

  async getMedicineSuggestions(query: string, limit: number = 10): Promise<Medicine[]> {
    try {
      if (!query || query.length < 2) {
        return [];
      }

      const response = await api.get<MedicineSuggestionsResponse>(
        `/medicines/suggestions?query=${encodeURIComponent(query)}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching medicine suggestions:', error);
      throw error;
    }
  }

  async createMedicine(medicineData: CreateMedicineData): Promise<Medicine> {
    try {
      const response = await api.post<SingleMedicineResponse>('/medicines', medicineData);
      return response.data;
    } catch (error) {
      console.error('Error creating medicine:', error);
      throw error;
    }
  }

  async updateMedicine(id: string, medicineData: Partial<CreateMedicineData>): Promise<Medicine> {
    try {
      const response = await api.put<SingleMedicineResponse>(`/medicines/${id}`, medicineData);
      return response.data;
    } catch (error) {
      console.error(`Error updating medicine ${id}:`, error);
      throw error;
    }
  }

  async deleteMedicine(id: string): Promise<void> {
    try {
      await api.delete(`/medicines/${id}`);
    } catch (error) {
      console.error(`Error deleting medicine ${id}:`, error);
      throw error;
    }
  }

  async checkInteractions(medicineIds: string[]): Promise<any> {
    try {
      const response = await api.post('/medicines/interactions/check', { medicineIds });
      return response.data;
    } catch (error) {
      console.error('Error checking medicine interactions:', error);
      throw error;
    }
  }

  // Utility method to format medicine display name
  formatMedicineName(medicine: Medicine): string {
    let name = medicine.name;
    if (medicine.strength) {
      name += ` ${medicine.strength}`;
      if (medicine.unit) {
        name += medicine.unit;
      }
    }
    if (medicine.brand && medicine.brand !== medicine.name) {
      name += ` (${medicine.brand})`;
    }
    return name;
  }

  // Get medicine types/categories
  getMedicineTypes(): string[] {
    return [
      'Tablet',
      'Capsule',
      'Liquid',
      'Injection',
      'Topical',
      'Inhaler',
      'Drops',
      'Suppository',
      'Patch',
      'Other'
    ];
  }
}

export const medicineService = new MedicineService();