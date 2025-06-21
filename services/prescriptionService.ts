import { api } from './api';
import { Prescription, DetectedMedicine, UploadResult } from '../types/medical';

interface CreatePrescriptionData {
  patientId: string;
  appointmentId?: string;
  diagnosis?: string;
  notes?: string;
  expiryDate?: string;
  items: Array<{
    medicineId: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
    instructions?: string;
  }>;
}

interface PrescriptionQuery {
  status?: string;
  patientId?: string;
  doctorId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

class PrescriptionService {
  // Create new prescription
  async createPrescription(prescriptionData: CreatePrescriptionData): Promise<Prescription> {
    const response = await api.post<Prescription>('/prescriptions', prescriptionData);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create prescription');
    }

    return response.data;
  }

  // Get prescriptions with filtering
  async getPrescriptions(query: PrescriptionQuery = {}): Promise<{
    prescriptions: Prescription[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const queryString = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        queryString.append(key, value.toString());
      }
    });

    const endpoint = queryString.toString() 
      ? `/prescriptions?${queryString.toString()}`
      : '/prescriptions';

    const response = await api.get<{
      prescriptions: Prescription[];
      pagination: any;
    }>(endpoint);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get prescriptions');
    }

    return response.data;
  }

  // Get single prescription by ID
  async getPrescription(id: string): Promise<Prescription> {
    const response = await api.get<Prescription>(`/prescriptions/${id}`);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get prescription');
    }

    return response.data;
  }

  // Update prescription status
  async updatePrescriptionStatus(id: string, status: string, notes?: string): Promise<Prescription> {
    const response = await api.put<Prescription>(`/prescriptions/${id}/status`, {
      status,
      notes
    });

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update prescription status');
    }

    return response.data;
  }

  // Process OCR prescription
  async processOCRPrescription(data: {
    patientId: string;
    imageUrl: string;
    ocrText: string;
    detectedMedicines: DetectedMedicine[];
    confidence: number;
  }): Promise<Prescription> {
    const response = await api.post<Prescription>('/prescriptions/ocr/process', data);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to process OCR prescription');
    }

    return response.data;
  }

  // Upload prescription image for OCR processing
  async uploadPrescriptionImage(file: {
    uri: string;
    name: string;
    type: string;
  }, enhanceImage: boolean = true): Promise<{
    documentId: string;
    extractedText: string;
    confidence: number;
    detectedMedicines: DetectedMedicine[];
    processingTime: number;
    imageUrl: string;
  }> {
    const response = await api.uploadFile<{
      documentId: string;
      extractedText: string;
      confidence: number;
      detectedMedicines: DetectedMedicine[];
      processingTime: number;
      imageUrl: string;
    }>('/ocr/process', file, {
      enhanceImage: enhanceImage.toString()
    });

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to process prescription image');
    }

    return response.data;
  }

  // Validate OCR results
  async validateOCRResults(documentId: string, corrections: any): Promise<void> {
    const response = await api.post('/ocr/validate', {
      documentId,
      corrections
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to validate OCR results');
    }
  }

  // Get OCR processing history
  async getOCRHistory(page: number = 1, limit: number = 20): Promise<{
    documents: any[];
    pagination: any;
  }> {
    const response = await api.get<{
      documents: any[];
      pagination: any;
    }>(`/ocr/history?page=${page}&limit=${limit}`);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get OCR history');
    }

    return response.data;
  }

  // Enhance image quality
  async enhanceImage(imageBase64: string, options: any = {}): Promise<{
    enhancedImage: string;
    originalSize: number;
    enhancedSize: number;
    compressionRatio: string;
  }> {
    const response = await api.post<{
      enhancedImage: string;
      originalSize: number;
      enhancedSize: number;
      compressionRatio: string;
    }>('/ocr/enhance', {
      imageBase64,
      options
    });

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to enhance image');
    }

    return response.data;
  }

  // Get prescription analytics
  async getPrescriptionAnalytics(startDate?: string, endDate?: string): Promise<{
    total: number;
    statusBreakdown: {
      pending: number;
      processing: number;
      ready: number;
      dispensed: number;
      cancelled: number;
    };
  }> {
    const queryString = new URLSearchParams();
    if (startDate) queryString.append('startDate', startDate);
    if (endDate) queryString.append('endDate', endDate);

    const endpoint = queryString.toString() 
      ? `/prescriptions/analytics?${queryString.toString()}`
      : '/prescriptions/analytics';

    const response = await api.get<{
      total: number;
      statusBreakdown: any;
    }>(endpoint);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get prescription analytics');
    }

    return response.data;
  }

  // Dispense prescription item (for pharmacists)
  async dispensePrescriptionItem(itemId: string, dispensedQuantity?: number): Promise<void> {
    const response = await api.put(`/prescriptions/items/${itemId}/dispense`, {
      dispensedQuantity
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to dispense prescription item');
    }
  }

  // Get active prescriptions for patient
  async getActivePrescriptions(): Promise<Prescription[]> {
    const response = await this.getPrescriptions({
      status: 'PENDING,PROCESSING,READY',
      limit: 50
    });

    return response.prescriptions;
  }

  // Get prescription history
  async getPrescriptionHistory(): Promise<Prescription[]> {
    const response = await this.getPrescriptions({
      status: 'DISPENSED,COMPLETED',
      limit: 20
    });

    return response.prescriptions;
  }
}

export const prescriptionService = new PrescriptionService();
export default prescriptionService;