import { api } from './api';
import { Appointment, AppointmentType, AppointmentStatus } from '../types/appointment';

interface CreateAppointmentData {
  doctorId: string;
  type: AppointmentType;
  title: string;
  description?: string;
  appointmentDate: string;
  duration?: number;
  location?: string;
  isVirtual?: boolean;
  notes?: string;
}

interface AppointmentQuery {
  status?: AppointmentStatus;
  type?: AppointmentType;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  doctorProfile?: {
    specialization: string;
    licenseNumber: string;
    hospitalAffiliation?: string;
    consultationFee?: number;
    experience?: number;
    rating?: number;
    reviewCount: number;
  };
}

class AppointmentService {
  // Create new appointment
  async createAppointment(appointmentData: CreateAppointmentData): Promise<Appointment> {
    const response = await api.post<Appointment>('/appointments', appointmentData);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create appointment');
    }

    return response.data;
  }

  // Get appointments with filtering
  async getAppointments(query: AppointmentQuery = {}): Promise<{
    appointments: Appointment[];
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
      ? `/appointments?${queryString.toString()}`
      : '/appointments';

    const response = await api.get<{
      appointments: Appointment[];
      pagination: any;
    }>(endpoint);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get appointments');
    }

    return response.data;
  }

  // Get single appointment by ID
  async getAppointment(id: string): Promise<Appointment> {
    const response = await api.get<Appointment>(`/appointments/${id}`);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get appointment');
    }

    return response.data;
  }

  // Update appointment
  async updateAppointment(id: string, updates: {
    status?: AppointmentStatus;
    notes?: string;
    meetingLink?: string;
  }): Promise<Appointment> {
    const response = await api.put<Appointment>(`/appointments/${id}`, updates);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update appointment');
    }

    return response.data;
  }

  // Cancel appointment
  async cancelAppointment(id: string): Promise<void> {
    const response = await api.delete(`/appointments/${id}`);

    if (!response.success) {
      throw new Error(response.message || 'Failed to cancel appointment');
    }
  }

  // Get available doctors
  async getDoctors(query: {
    specialization?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    doctors: Doctor[];
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
      ? `/appointments/doctors/list?${queryString.toString()}`
      : '/appointments/doctors/list';

    const response = await api.get<{
      doctors: Doctor[];
      pagination: any;
    }>(endpoint);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get doctors');
    }

    return response.data;
  }

  // Get doctor availability for a specific date
  async getDoctorAvailability(doctorId: string, date: string): Promise<{
    date: string;
    appointments: number;
    bookedSlots: Array<{
      appointmentDate: string;
      duration: number;
    }>;
  }> {
    const response = await api.get<{
      date: string;
      appointments: number;
      bookedSlots: any[];
    }>(`/appointments/doctors/${doctorId}/availability?date=${date}`);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get doctor availability');
    }

    return response.data;
  }

  // Get upcoming appointments
  async getUpcomingAppointments(): Promise<Appointment[]> {
    const today = new Date().toISOString().split('T')[0];
    const response = await this.getAppointments({
      startDate: today,
      status: 'confirmed',
      limit: 10
    });

    return response.appointments;
  }

  // Get appointment history
  async getAppointmentHistory(): Promise<Appointment[]> {
    const today = new Date().toISOString().split('T')[0];
    const response = await this.getAppointments({
      endDate: today,
      status: 'completed',
      limit: 20
    });

    return response.appointments;
  }

  // Reschedule appointment
  async rescheduleAppointment(
    id: string, 
    newDate: string, 
    newTime?: string
  ): Promise<Appointment> {
    const appointmentDateTime = newTime 
      ? `${newDate}T${newTime}:00.000Z`
      : newDate;

    return this.updateAppointment(id, {
      status: 'pending', // Reset to pending after reschedule
      notes: `Rescheduled to ${new Date(appointmentDateTime).toLocaleString()}`
    });
  }

  // Confirm appointment
  async confirmAppointment(id: string): Promise<Appointment> {
    return this.updateAppointment(id, { status: 'confirmed' });
  }

  // Complete appointment
  async completeAppointment(id: string, notes?: string): Promise<Appointment> {
    return this.updateAppointment(id, { 
      status: 'completed',
      notes: notes || 'Appointment completed'
    });
  }
}

export const appointmentService = new AppointmentService();
export default appointmentService;