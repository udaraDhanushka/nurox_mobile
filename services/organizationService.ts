import { api } from './api';

export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  specialties: string[];
  bedCount?: number;
  emergencyServices: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED';
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  operatingHours?: any;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED';
  hospitalId?: string;
}

export interface Laboratory {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  testTypes: string[];
  operatingHours?: any;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED';
  hospitalId?: string;
}

export interface InsuranceCompany {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  coverageTypes: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED';
}

class OrganizationService {
  // Hospital methods
  async getHospitals(params?: { status?: string; page?: number; limit?: number }): Promise<Hospital[]> {
    const response = await api.get<{ hospitals: Hospital[]; pagination: any }>('/organizations/hospitals', params);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get hospitals');
    }

    return response.data.hospitals;
  }

  async getHospitalById(id: string): Promise<Hospital> {
    const response = await api.get<Hospital>(`/organizations/hospitals/${id}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get hospital');
    }

    return response.data;
  }

  async getAvailableHospitals(): Promise<Hospital[]> {
    return this.getHospitals({ status: 'ACTIVE' });
  }

  // Pharmacy methods
  async getPharmacies(params?: { status?: string; page?: number; limit?: number }): Promise<Pharmacy[]> {
    const response = await api.get<{ pharmacies: Pharmacy[]; pagination: any }>('/organizations/pharmacies', params);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get pharmacies');
    }

    return response.data.pharmacies;
  }

  async getNearbyPharmacies(latitude: number, longitude: number, radius: number = 10): Promise<Pharmacy[]> {
    // For now, get all active pharmacies
    // In the future, implement geolocation-based filtering
    return this.getPharmacies({ status: 'ACTIVE' });
  }

  // Laboratory methods
  async getLaboratories(params?: { status?: string; page?: number; limit?: number }): Promise<Laboratory[]> {
    const response = await api.get<{ laboratories: Laboratory[]; pagination: any }>('/organizations/laboratories', params);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get laboratories');
    }

    return response.data.laboratories;
  }

  async getNearbyLaboratories(latitude: number, longitude: number, radius: number = 10): Promise<Laboratory[]> {
    // For now, get all active laboratories
    // In the future, implement geolocation-based filtering
    return this.getLaboratories({ status: 'ACTIVE' });
  }

  // Insurance methods
  async getInsuranceCompanies(params?: { status?: string; page?: number; limit?: number }): Promise<InsuranceCompany[]> {
    const response = await api.get<{ insuranceCompanies: InsuranceCompany[]; pagination: any }>('/organizations/insurance-companies', params);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get insurance companies');
    }

    return response.data.insuranceCompanies;
  }

  async getAvailableInsuranceCompanies(): Promise<InsuranceCompany[]> {
    return this.getInsuranceCompanies({ status: 'ACTIVE' });
  }

  // Doctor verification methods (for doctor users)
  async requestHospitalAffiliation(hospitalId: string, data: {
    specialization: string;
    licenseNumber: string;
    qualifications: string[];
    experience: number;
    verificationDocuments: string[];
  }): Promise<void> {
    const response = await api.post(`/organizations/hospitals/${hospitalId}/doctor-requests`, data);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to request hospital affiliation');
    }
  }

  async getDoctorVerificationStatus(userId: string): Promise<{
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVIEW';
    hospitalId?: string;
    hospitalName?: string;
    rejectionReason?: string;
    approvedAt?: string;
  }> {
    const response = await api.get(`/users/${userId}/verification-status`);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get verification status');
    }

    return response.data;
  }
}

export const organizationService = new OrganizationService();
export default organizationService;