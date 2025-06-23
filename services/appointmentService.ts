import { api } from './api';
import { Appointment, AppointmentType, AppointmentStatus, ApiAppointment } from '../types/appointment';

interface CreateAppointmentData {
  // patientId is NOT sent - backend gets it from authenticated user (req.user.id)
  doctorId: string;
  type: AppointmentType;
  title: string;
  description?: string;
  appointmentDate: string;
  duration?: number;
  location?: string;
  isVirtual?: boolean;
  notes?: string;
  tokenNumber?: number;
  [key: string]: any; // Allow additional properties for backend compatibility
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
  // Validate appointment data before sending to API
  private validateAppointmentData(data: CreateAppointmentData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // patientId is not validated here - backend gets it from authenticated user
    
    if (!data.doctorId || typeof data.doctorId !== 'string') {
      errors.push('Valid doctor ID is required');
    }
    
    if (!data.appointmentDate || isNaN(new Date(data.appointmentDate).getTime())) {
      errors.push('Valid appointment date is required');
    }
    
    if (!data.type || typeof data.type !== 'string') {
      errors.push('Appointment type is required');
    }
    
    if (!data.title || typeof data.title !== 'string') {
      errors.push('Appointment title is required');
    }
    
    if (data.tokenNumber && (typeof data.tokenNumber !== 'number' || data.tokenNumber < 1)) {
      errors.push('Valid token number is required');
    }
    
    if (data.duration && (typeof data.duration !== 'number' || data.duration < 1)) {
      errors.push('Valid duration is required');
    }
    
    // Check if appointment date is not in the past
    const appointmentDate = new Date(data.appointmentDate);
    const now = new Date();
    if (appointmentDate < new Date(now.getTime() - 24 * 60 * 60 * 1000)) {
      errors.push('Appointment date cannot be in the past');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Create new appointment
  async createAppointment(appointmentData: CreateAppointmentData): Promise<Appointment> {
    try {
      console.log('AppointmentService: Creating appointment with data:', JSON.stringify(appointmentData, null, 2));
      console.log('AppointmentService: patientId will be automatically set by backend from authenticated user');
      
      // Validate appointment data before sending to API
      const validation = this.validateAppointmentData(appointmentData);
      if (!validation.isValid) {
        const errorMessage = `Validation failed: ${validation.errors.join(', ')}`;
        console.error('AppointmentService: Validation errors:', validation.errors);
        throw new Error(errorMessage);
      }
      
      // Verify doctor exists in database (for mobile-API-database synchronization)
      const doctorExists = await this.verifyDoctorExists(appointmentData.doctorId);
      if (!doctorExists) {
        throw new Error('Selected doctor is not available. Please refresh and select another doctor.');
      }
      
      // Log request details for debugging
      console.log('AppointmentService: Request validation:', {
        // patientId will be set by backend from authenticated user
        hasDoctorId: !!appointmentData.doctorId,
        appointmentType: appointmentData.type,
        appointmentDate: appointmentData.appointmentDate,
        tokenNumber: appointmentData.tokenNumber,
        isValidDate: !isNaN(new Date(appointmentData.appointmentDate).getTime()),
        hasTitle: !!appointmentData.title,
        hasDescription: !!appointmentData.description,
        duration: appointmentData.duration,
        isVirtual: appointmentData.isVirtual,
        location: appointmentData.location,
        status: appointmentData.status
      });
      
      const response = await api.post<Appointment>('/appointments', appointmentData);
      
      console.log('AppointmentService: Raw API response:', JSON.stringify(response, null, 2));

      if (!response.success || !response.data) {
        const errorMessage = response.message || response.error || 'Failed to create appointment';
        console.error('AppointmentService: Creation failed with message:', errorMessage);
        console.error('AppointmentService: Full response:', response);
        throw new Error(errorMessage);
      }

      console.log('AppointmentService: Appointment created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('AppointmentService: Error creating appointment:', error);
      console.error('AppointmentService: Error details:', {
        message: error.message,
        status: error.status,
        response: error.response,
        stack: error.stack
      });
      
      // Provide more specific error messages based on common backend validation issues
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        
        if (message.includes('401') || message.includes('unauthorized')) {
          throw new Error('Authentication required. Please log in again.');
        } else if (message.includes('400') || message.includes('bad request')) {
          throw new Error('Invalid appointment data. Please check doctor ID, date format, and required fields.');
        } else if (message.includes('409') || message.includes('conflict')) {
          throw new Error('This time slot is no longer available. Please select another token.');
        } else if (message.includes('422') || message.includes('unprocessable')) {
          throw new Error('Unable to process appointment. Please verify doctor availability and token selection.');
        } else if (message.includes('500') || message.includes('server')) {
          throw new Error('Database or server error. Please try again later or contact support.');
        } else if (message.includes('network') || message.includes('timeout')) {
          throw new Error('Network error. Please check your connection and try again.');
        } else if (message.includes('validation')) {
          throw new Error('Data validation failed. Please check all required fields and try again.');
        } else if (message.includes('foreign key') || message.includes('constraint')) {
          throw new Error('Database constraint error. Doctor or patient ID may be invalid.');
        } else if (message.includes('duplicate') || message.includes('unique')) {
          throw new Error('Duplicate appointment detected. This token may already be booked.');
        }
      }
      
      // If no specific error pattern matched, throw the original error with more context
      throw new Error(`Appointment booking failed: ${error.message || 'Unknown error occurred'}`);
    }
  }

  // Get appointments with filtering (returns raw API data)
  async getAppointments(query: AppointmentQuery = {}): Promise<{
    appointments: ApiAppointment[];
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
      appointments: ApiAppointment[];
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

  // Get token availability for a specific doctor and date
  async getTokenAvailability(doctorId: string, date: string): Promise<{
    date: string;
    doctorId: string;
    bookedTokens: number[];
    totalBooked: number;
  }> {
    try {
      const response = await api.get<{
        date: string;
        doctorId: string;
        bookedTokens: number[];
        totalBooked: number;
      }>(`/appointments/doctors/${doctorId}/tokens?date=${date}`);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to get token availability');
      }

      return response.data;
    } catch (error) {
      // Fallback to appointments endpoint when token endpoint is not available
      console.log('Token endpoint not available, using appointments fallback');
      const appointmentsResponse = await this.getAppointments({
        startDate: date,
        endDate: date
      });

      const existingAppointments = appointmentsResponse.appointments.filter(
        apt => apt.doctorId === doctorId && 
               new Date(apt.appointmentDate).toISOString().split('T')[0] === date &&
               apt.status !== 'CANCELLED'
      );

      const bookedTokens = existingAppointments
        .map(apt => apt.tokenNumber)
        .filter(token => token !== undefined && token !== null) as number[];

      return {
        date,
        doctorId,
        bookedTokens,
        totalBooked: bookedTokens.length
      };
    }
  }

  // Get upcoming appointments (these methods should be handled by the store for transformation)
  async getUpcomingAppointments(): Promise<ApiAppointment[]> {
    const today = new Date().toISOString().split('T')[0];
    const response = await this.getAppointments({
      startDate: today,
      // Use backend status format
      status: 'CONFIRMED' as any,
      limit: 10
    });

    return response.appointments;
  }

  // Verify doctor exists and is available (for database synchronization)
  async verifyDoctorExists(doctorId: string): Promise<boolean> {
    try {
      const response = await this.getDoctors();
      const doctor = response.doctors.find(d => d.id === doctorId);
      if (doctor) {
        console.log('AppointmentService: Doctor verified:', {
          id: doctor.id,
          name: `${doctor.firstName} ${doctor.lastName}`,
          specialization: doctor.doctorProfile?.specialization
        });
        return true;
      } else {
        console.error('AppointmentService: Doctor not found in database:', doctorId);
        return false;
      }
    } catch (error) {
      console.error('AppointmentService: Error verifying doctor:', error);
      return false;
    }
  }

  // Get doctor's confirmed appointments only (no pending/unpaid appointments)
  async getDoctorConfirmedAppointments(doctorId: string, date?: string): Promise<ApiAppointment[]> {
    try {
      const query: any = {
        // Only show confirmed and completed appointments to doctors
        status: 'CONFIRMED' as any,
        limit: 50
      };

      if (date) {
        query.startDate = date;
        query.endDate = date;
      }

      const response = await this.getAppointments(query);
      
      // Filter by doctor ID and ensure only confirmed/completed appointments
      const doctorAppointments = response.appointments.filter(apt => {
        const status = apt.status.toUpperCase();
        return apt.doctorId === doctorId && 
               (status === 'CONFIRMED' || status === 'COMPLETED');
      });

      return doctorAppointments;
    } catch (error) {
      console.error('Failed to get doctor confirmed appointments:', error);
      return [];
    }
  }

  // Get appointment history (these methods should be handled by the store for transformation)
  async getAppointmentHistory(): Promise<ApiAppointment[]> {
    const today = new Date().toISOString().split('T')[0];
    const response = await this.getAppointments({
      endDate: today,
      // Use backend status format
      status: 'COMPLETED' as any,
      limit: 20
    });

    return response.appointments;
  }

  // Confirm appointment
  async confirmAppointment(id: string): Promise<Appointment> {
    return this.updateAppointment(id, { status: 'CONFIRMED' as any });
  }

  // Complete appointment
  async completeAppointment(id: string, notes?: string): Promise<Appointment> {
    return this.updateAppointment(id, { 
      status: 'COMPLETED' as any,
      notes: notes || 'Appointment completed'
    });
  }

  // Reschedule appointment
  async rescheduleAppointment(
    id: string, 
    newAppointmentDate: string, 
    tokenNumber?: number,
    notes?: string
  ): Promise<Appointment> {
    const rescheduleData: any = {
      newAppointmentDate
    };
    
    if (tokenNumber !== undefined) rescheduleData.tokenNumber = tokenNumber;
    if (notes !== undefined) rescheduleData.notes = notes;

    const response = await api.put<Appointment>(`/appointments/${id}/reschedule`, rescheduleData);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to reschedule appointment');
    }

    return response.data;
  }
}

export const appointmentService = new AppointmentService();
export default appointmentService;