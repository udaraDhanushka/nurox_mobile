import { create } from 'zustand';
import { 
  Hospital, 
  TokenSlot, 
  AppointmentType, 
  Appointment, 
  AppointmentStatus,
  ApiAppointment 
} from '../types/appointment';
import { appointmentService } from '../services/appointmentService';

// Status mapping utility for frontend-backend communication
const mapFrontendToBackendStatus = (frontendStatus: AppointmentStatus): string => {
  switch (frontendStatus) {
    case 'confirmed':
      return 'CONFIRMED';
    case 'completed':
      return 'COMPLETED';
    case 'canceled':
      return 'CANCELLED';
    default:
      return 'CONFIRMED';
  }
};

// Generate deterministic token number based on appointment data
// This ensures token numbers remain stable across app sessions
const generateDeterministicToken = (appointmentId: string, doctorId: string, appointmentDate: string): number => {
  // Create a simple hash from the appointment data
  const hashString = `${appointmentId}-${doctorId}-${appointmentDate}`;
  let hash = 0;
  
  for (let i = 0; i < hashString.length; i++) {
    const char = hashString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to positive number and map to token range (1-30)
  const positiveHash = Math.abs(hash);
  return (positiveHash % 30) + 1;
};

// Hospital address mapping based on hospitalAffiliation
const getHospitalAddress = (hospitalAffiliation?: string): { name: string; address: string; id: string } => {
  const hospitalMap: { [key: string]: { name: string; address: string; id: string } } = {
    'City General Hospital': { 
      name: 'City General Hospital', 
      address: '123 Main Street, Downtown, City', 
      id: 'h1' 
    },
    'Heart Care Institute': { 
      name: 'Heart Care Institute', 
      address: '456 Heart Lane, Medical District, City', 
      id: 'h2' 
    },
    'Children\'s Hospital': { 
      name: 'Children\'s Hospital', 
      address: '789 Kids Avenue, Family District, City', 
      id: 'h3' 
    },
    'Downtown Medical Center': { 
      name: 'Downtown Medical Center', 
      address: '321 Medical Plaza, Central District, City', 
      id: 'h4' 
    },
    'Westside Clinic': { 
      name: 'Westside Clinic', 
      address: '654 West Street, Westside District, City', 
      id: 'h5' 
    }
  };

  return hospitalMap[hospitalAffiliation || ''] || {
    name: hospitalAffiliation || 'General Hospital',
    address: '123 Hospital Street, Medical District, City',
    id: 'h1'
  };
};

interface AppointmentState {
  appointments: Appointment[];
  hospitals: Hospital[];
  appointmentTypes: AppointmentType[];
  isLoading: boolean;
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  cancelAppointment: (id: string) => void;
  getAppointmentById: (id: string) => Appointment | undefined;
  getHospitalsByDoctorId: (doctorId: string) => Hospital[];
  // Token availability is now handled by tokenService for patients only
  getAppointmentTypes: () => AppointmentType[];
  loadAppointmentsFromAPI: () => Promise<void>;
  syncAppointmentWithAPI: (id: string) => Promise<void>;
}

// Available appointment types
const appointmentTypes: AppointmentType[] = [
  'Consultation',
  'Follow-up',
  'Emergency',
  'Routine Checkup',
  'Specialist Visit'
];

// Mock hospitals data
const mockHospitals: Hospital[] = [
  {
    id: 'h1',
    name: 'City General Hospital',
    address: '123 Main Street, Downtown, City',
    phone: '+1 (555) 123-4567',
    totalTokens: 30
  },
  {
    id: 'h2',
    name: 'Heart Care Institute',
    address: '456 Heart Lane, Medical District, City',
    phone: '+1 (555) 234-5678',
    totalTokens: 35
  },
  {
    id: 'h3',
    name: 'Children\'s Hospital',
    address: '789 Kids Avenue, Family District, City',
    phone: '+1 (555) 345-6789',
    totalTokens: 20
  },
  {
    id: 'h4',
    name: 'Downtown Medical Center',
    address: '321 Medical Plaza, Central District, City',
    phone: '+1 (555) 456-7890',
    totalTokens: 25
  },
  {
    id: 'h5',
    name: 'Westside Clinic',
    address: '654 West Street, Westside District, City',
    phone: '+1 (555) 567-8901',
    totalTokens: 15
  }
];

// Generate estimated times for tokens (starting from 9 AM, 15 minutes per token)
const generateEstimatedTime = (tokenNumber: number): string => {
  const startHour = 9;
  const minutesPerToken = 15;
  const totalMinutes = (tokenNumber - 1) * minutesPerToken;
  const hours = startHour + Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  const period = hours >= 12 ? 'PM' : 'AM';
  let displayHour = hours > 12 ? hours - 12 : hours;
  
  // Fix midnight display: 0 should be 12
  if (displayHour === 0) {
    displayHour = 12;
  }
  
  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  hospitals: mockHospitals,
  appointmentTypes,
  isLoading: false,
  
  // Start with empty appointments - all data will be loaded from API
  appointments: [],
  
  addAppointment: (appointment) => {
    set((state) => ({
      appointments: [...state.appointments, appointment]
    }));
    
    // If this appointment has a token number, mark it as booked
    if (appointment.tokenNumber) {
      console.log(`Token ${appointment.tokenNumber} has been booked for appointment ${appointment.id}`);
    }
  },
  
  updateAppointment: (id, updates) => {
    // Update local state immediately
    set((state) => ({
      appointments: state.appointments.map((appointment) => 
        appointment.id === id ? { ...appointment, ...updates } : appointment
      )
    }));
    
    // If status is being updated, also update backend with proper format
    if (updates.status) {
      const backendStatus = mapFrontendToBackendStatus(updates.status);
      appointmentService.updateAppointment(id, {
        status: backendStatus as any,
        notes: updates.notes
      }).catch(error => {
        console.error('Failed to update appointment status in backend:', error);
        // Could revert local state here if needed
      });
    }
  },
  
  cancelAppointment: (id) => {
    // Update local state
    set((state) => ({
      appointments: state.appointments.map((appointment) => 
        appointment.id === id ? { ...appointment, status: 'canceled' } : appointment
      )
    }));
    
    // Update backend with proper status format
    appointmentService.updateAppointment(id, {
      status: 'CANCELLED' as any
    }).catch(error => {
      console.error('Failed to cancel appointment in backend:', error);
    });
  },

  getAppointmentById: (id) => {
    const state = get();
    return state.appointments.find(appointment => appointment.id === id);
  },

  getHospitalsByDoctorId: (doctorId) => {
    const state = get();
    
    // First, try to get hospitals from real doctor data in appointments
    const doctorFromAppointments = state.appointments
      .map(apt => apt.doctor)
      .find(doctor => doctor?.id === doctorId);
    
    if (doctorFromAppointments?.doctorProfile?.hospitalAffiliations) {
      // Use real hospital affiliations from doctor profile
      return doctorFromAppointments.doctorProfile.hospitalAffiliations.map(affiliation => ({
        id: affiliation.id || `h-${doctorId}-${affiliation.name.replace(/\s+/g, '').toLowerCase()}`,
        name: affiliation.name,
        address: affiliation.address || '123 Hospital Street, Medical District, City',
        phone: '+1 (555) 123-4567', // Default phone
        totalTokens: 30 // Default token count
      }));
    }
    
    // Fallback to mock logic: different doctors practice at different hospitals
    const doctorHospitalMap: { [key: string]: string[] } = {
      '1': ['h1', 'h4'], // Dr. Sarah Johnson - Cardiologist
      '2': ['h2', 'h5'], // Dr. Michael Chen - Dermatologist  
      '3': ['h3', 'h1'], // Dr. Emily Rodriguez - Pediatrician
      '4': ['h1', 'h2'], // Dr. James Wilson - Orthopedic
    };
    
    const hospitalIds = doctorHospitalMap[doctorId] || ['h1'];
    return state.hospitals.filter(hospital => hospitalIds.includes(hospital.id));
  },

  // Token availability is now handled by tokenService for patients only

  getAppointmentTypes: () => {
    return appointmentTypes;
  },

  loadAppointmentsFromAPI: async () => {
    try {
      set({ isLoading: true });
      console.log('Loading appointments from API...');
      
      const response = await appointmentService.getAppointments();
      console.log('Appointments API response received:', {
        hasAppointments: !!response.appointments,
        count: response.appointments?.length || 0
      });
      
      if (response.appointments) {
        // Transform API appointments to local format
        const transformedAppointments = response.appointments.map((apiAppointment: ApiAppointment) => {
          // Get hospital information from doctor's affiliation
          const hospitalInfo = getHospitalAddress(apiAppointment.doctor?.doctorProfile?.hospitalAffiliation);
          
          return {
            id: apiAppointment.id,
            doctorId: apiAppointment.doctorId,
            doctorName: apiAppointment.doctor ? `${apiAppointment.doctor.firstName} ${apiAppointment.doctor.lastName}` : 'Unknown Doctor',
            specialty: apiAppointment.doctor?.doctorProfile?.specialization || 'General Practice',
            hospitalId: hospitalInfo.id,
            hospitalName: hospitalInfo.name,
            hospitalAddress: hospitalInfo.address,
            date: new Date(apiAppointment.appointmentDate).toISOString().split('T')[0],
            tokenNumber: apiAppointment.tokenNumber || generateDeterministicToken(
              apiAppointment.id,
              apiAppointment.doctorId,
              apiAppointment.appointmentDate
            ),
            estimatedTime: apiAppointment.tokenNumber 
              ? generateEstimatedTime(apiAppointment.tokenNumber)
              : new Date(apiAppointment.appointmentDate).toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit', 
                  hour12: true 
                }),
            duration: `${apiAppointment.duration || 30} min`,
            status: (() => {
              const backendStatus = apiAppointment.status.toUpperCase();
              // Map backend status to frontend status
              switch (backendStatus) {
                case 'PENDING':
                  // PENDING status means payment not completed yet, show as confirmed for UI
                  return 'confirmed' as AppointmentStatus;
                case 'CONFIRMED':
                  return 'confirmed' as AppointmentStatus;
                case 'COMPLETED':
                  return 'completed' as AppointmentStatus;
                case 'CANCELED':
                  return 'canceled' as AppointmentStatus;
                default:
                  return 'confirmed' as AppointmentStatus;
              }
            })(),
            type: (() => {
              const transformed = apiAppointment.type.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              // Handle special case for Follow-up (with hyphen)
              return transformed === 'Follow Up' ? 'Follow-up' : transformed;
            })() as AppointmentType,
            notes: apiAppointment.notes || '',
            doctorImage: apiAppointment.doctor?.profileImage || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop',
            rating: apiAppointment.doctor?.doctorProfile?.rating || 4.8,
            experience: apiAppointment.doctor?.doctorProfile?.experience ? `${apiAppointment.doctor.doctorProfile.experience} years` : '5 years',
            paymentId: undefined, // Will be set when payment is made
            isReschedule: apiAppointment.isReschedule || false
          };
        });
        
        console.log('Transformed appointments:', transformedAppointments.length);
        set({ appointments: transformedAppointments });
      }
    } catch (error) {
      console.error('Failed to load appointments from API:', error);
      
      // If it's an authentication error, handle it specifically
      if (error instanceof Error) {
        if (error.message.includes('Authentication required') || 
            error.message.includes('Session expired') ||
            error.message.includes('Invalid or expired token')) {
          console.log('Authentication error detected - forcing logout');
          
          // Force logout to clear invalid tokens
          const { useAuthStore } = await import('./authStore');
          const { forceLogout } = useAuthStore.getState();
          await forceLogout();
        }
      }
      
      // Keep existing local appointments as fallback
    } finally {
      set({ isLoading: false });
    }
  },

  syncAppointmentWithAPI: async (id: string) => {
    try {
      const apiAppointment = await appointmentService.getAppointment(id);
      const state = get();
      
      // Update the specific appointment with API data
      const updatedAppointments = state.appointments.map(appointment => {
        if (appointment.id === id) {
          return {
            ...appointment,
            status: (() => {
              const backendStatus = apiAppointment.status.toUpperCase();
              switch (backendStatus) {
                case 'PENDING':
                case 'CONFIRMED':
                case 'IN_PROGRESS':
                  return 'confirmed' as AppointmentStatus;
                case 'COMPLETED':
                  return 'completed' as AppointmentStatus;
                case 'CANCELLED':
                case 'NO_SHOW':
                  return 'canceled' as AppointmentStatus;
                default:
                  return 'confirmed' as AppointmentStatus;
              }
            })(),
            notes: apiAppointment.notes || appointment.notes,
            // Update other fields as needed
          };
        }
        return appointment;
      });
      
      set({ appointments: updatedAppointments });
    } catch (error) {
      console.error(`Failed to sync appointment ${id} with API:`, error);
    }
  }
}));