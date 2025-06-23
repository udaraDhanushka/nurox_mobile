import { api } from './api';
import { LabTestRequest, LabTestRequestData, LabTestTemplate } from '../types/medical';

interface LabRequestQuery {
  status?: string;
  patientId?: string;
  doctorId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

class LabRequestService {
  // Create new lab test request
  async createLabRequest(requestData: LabTestRequestData): Promise<LabTestRequest> {
    const response = await api.post<LabTestRequest>('/lab-requests', requestData);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create lab test request');
    }

    return response.data;
  }

  // Get lab test requests with filtering
  async getLabRequests(query: LabRequestQuery = {}): Promise<{
    requests: LabTestRequest[];
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
      ? `/lab-requests?${queryString.toString()}`
      : '/lab-requests';

    const response = await api.get<{
      requests: LabTestRequest[];
      pagination: any;
    }>(endpoint);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get lab test requests');
    }

    return response.data;
  }

  // Get single lab request by ID
  async getLabRequest(id: string): Promise<LabTestRequest> {
    const response = await api.get<LabTestRequest>(`/lab-requests/${id}`);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get lab test request');
    }

    return response.data;
  }

  // Update lab request status
  async updateLabRequestStatus(id: string, status: string, notes?: string): Promise<LabTestRequest> {
    const response = await api.put<LabTestRequest>(`/lab-requests/${id}/status`, {
      status,
      notes
    });

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update lab request status');
    }

    return response.data;
  }

  // Cancel lab request
  async cancelLabRequest(id: string, reason?: string): Promise<LabTestRequest> {
    const response = await api.put<LabTestRequest>(`/lab-requests/${id}/cancel`, {
      reason
    });

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to cancel lab request');
    }

    return response.data;
  }

  // Get lab test templates
  async getLabTestTemplates(): Promise<LabTestTemplate[]> {
    const response = await api.get<LabTestTemplate[]>('/lab-test-templates');

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get lab test templates');
    }

    return response.data;
  }

  // Get lab test templates by category
  async getLabTestTemplatesByCategory(category: string): Promise<LabTestTemplate[]> {
    const response = await api.get<LabTestTemplate[]>(`/lab-test-templates?category=${category}`);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get lab test templates by category');
    }

    return response.data;
  }

  // Assign test center to lab request
  async assignTestCenter(requestId: string, testCenterId: string): Promise<LabTestRequest> {
    const response = await api.put<LabTestRequest>(`/lab-requests/${requestId}/assign-center`, {
      testCenterId
    });

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to assign test center');
    }

    return response.data;
  }

  // Schedule lab test appointment
  async scheduleLabTest(requestId: string, appointmentData: {
    testCenterId: string;
    date: string;
    time: string;
    patientInfo: {
      name: string;
      phone: string;
      email?: string;
    };
  }): Promise<LabTestRequest> {
    const response = await api.put<LabTestRequest>(`/lab-requests/${requestId}/schedule`, appointmentData);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to schedule lab test');
    }

    return response.data;
  }

  // Get lab requests for a specific patient
  async getPatientLabRequests(patientId: string): Promise<LabTestRequest[]> {
    const response = await this.getLabRequests({
      patientId,
      limit: 50
    });

    return response.requests;
  }

  // Get pending lab requests for doctor
  async getPendingLabRequests(): Promise<LabTestRequest[]> {
    const response = await this.getLabRequests({
      status: 'pending,approved,scheduled',
      limit: 50
    });

    return response.requests;
  }

  // Get lab request analytics
  async getLabRequestAnalytics(startDate?: string, endDate?: string): Promise<{
    total: number;
    statusBreakdown: {
      pending: number;
      approved: number;
      scheduled: number;
      in_progress: number;
      completed: number;
      cancelled: number;
    };
    byCategory: Array<{
      category: string;
      count: number;
    }>;
  }> {
    const queryString = new URLSearchParams();
    if (startDate) queryString.append('startDate', startDate);
    if (endDate) queryString.append('endDate', endDate);

    const endpoint = queryString.toString() 
      ? `/lab-requests/analytics?${queryString.toString()}`
      : '/lab-requests/analytics';

    const response = await api.get<{
      total: number;
      statusBreakdown: any;
      byCategory: Array<{ category: string; count: number }>;
    }>(endpoint);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get lab request analytics');
    }

    return response.data;
  }

  // Create lab report from completed request
  async createLabReportFromRequest(requestId: string, results: any): Promise<void> {
    const response = await api.post(`/lab-requests/${requestId}/create-report`, {
      results
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to create lab report from request');
    }
  }
}

export const labRequestService = new LabRequestService();
export default labRequestService;