import { create } from 'zustand';
import { Hospital, TokenSlot, AppointmentType } from '../types/appointment';
import { appointmentService } from '../services/appointmentService';

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Appointment {
  paymentId?: string;
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  hospitalId: string;
  hospitalName: string;
  hospitalAddress: string;
  date: string;
  tokenNumber: number;
  estimatedTime: string;
  duration: string;
  status: AppointmentStatus;
  type: AppointmentType;
  notes: string;
  doctorImage: string;
  rating: number;
  experience: string;
}

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
  getTokenAvailability: (doctorId: string, hospitalId: string, date: string) => TokenSlot[];
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
  'Specialist Consultation',
  'Vaccination',
  'Lab Test',
  'Diagnostic',
  'Surgery Consultation',
  'Mental Health'
];

// Mock hospitals data
const mockHospitals: Hospital[] = [
  {
    id: 'h1',
    name: 'City General Hospital',
    address: '123 Main St, Downtown',
    phone: '+1 (555) 123-4567',
    totalTokens: 30
  },
  {
    id: 'h2',
    name: 'Medical Center Downtown',
    address: '456 Oak Ave, Midtown',
    phone: '+1 (555) 234-5678',
    totalTokens: 25
  },
  {
    id: 'h3',
    name: 'Children\'s Hospital',
    address: '789 Pine St, Uptown',
    phone: '+1 (555) 345-6789',
    totalTokens: 20
  },
  {
    id: 'h4',
    name: 'Heart Care Institute',
    address: '321 Cedar Blvd, West Side',
    phone: '+1 (555) 456-7890',
    totalTokens: 35
  },
  {
    id: 'h5',
    name: 'Skin & Beauty Clinic',
    address: '654 Maple Dr, East Side',
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
  const displayHour = hours > 12 ? hours - 12 : hours;
  
  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  hospitals: mockHospitals,
  appointmentTypes,
  isLoading: false,
  
  appointments: [
    {
      id: '1',
      doctorId: '1',
      doctorName: 'Dr. Sarah Johnson',
      specialty: 'Cardiologist',
      hospitalId: 'h1',
      hospitalName: 'City General Hospital',
      hospitalAddress: '123 Main St, Downtown',
      date: '2025-06-02',
      tokenNumber: 5,
      estimatedTime: '10:00 AM',
      duration: '30 minutes',
      status: 'confirmed',
      type: 'Consultation',
      notes: 'Annual heart checkup',
      doctorImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop',
      rating: 4.8,
      experience: '15 years'
    },
    {
      id: '2',
      doctorId: '2',
      doctorName: 'Dr. Michael Chen',
      specialty: 'Dermatologist',
      hospitalId: 'h2',
      hospitalName: 'Medical Center Downtown',
      hospitalAddress: '456 Oak Ave, Midtown',
      date: '2025-06-10',
      tokenNumber: 12,
      estimatedTime: '11:45 AM',
      duration: '45 minutes',
      status: 'pending',
      type: 'Follow-up',
      notes: 'Skin condition follow-up',
      doctorImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop',
      rating: 4.6,
      experience: '12 years'
    },
    {
      id: '3',
      doctorId: '3',
      doctorName: 'Dr. Emily Rodriguez',
      specialty: 'Pediatrician',
      hospitalId: 'h3',
      hospitalName: 'Children\'s Hospital',
      hospitalAddress: '789 Pine St, Uptown',
      date: '2025-05-20',
      tokenNumber: 8,
      estimatedTime: '10:45 AM',
      duration: '60 minutes',
      status: 'completed',
      type: 'Consultation',
      notes: 'Routine checkup',
      doctorImage: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=987&auto=format&fit=crop',
      rating: 4.9,
      experience: '18 years'
    }
  ],
  
  addAppointment: (appointment) => set((state) => ({
    appointments: [...state.appointments, appointment]
  })),
  
  updateAppointment: (id, updates) => set((state) => ({
    appointments: state.appointments.map((appointment) => 
      appointment.id === id ? { ...appointment, ...updates } : appointment
    )
  })),
  
  cancelAppointment: (id) => set((state) => ({
    appointments: state.appointments.map((appointment) => 
      appointment.id === id ? { ...appointment, status: 'cancelled' } : appointment
    )
  })),

  getAppointmentById: (id) => {
    const state = get();
    return state.appointments.find(appointment => appointment.id === id);
  },

  getHospitalsByDoctorId: (doctorId) => {
    // Mock logic: different doctors practice at different hospitals
    const doctorHospitalMap: { [key: string]: string[] } = {
      '1': ['h1', 'h4'], // Dr. Sarah Johnson - Cardiologist
      '2': ['h2', 'h5'], // Dr. Michael Chen - Dermatologist  
      '3': ['h3', 'h1'], // Dr. Emily Rodriguez - Pediatrician
      '4': ['h1', 'h2'], // Dr. James Wilson - Orthopedic
    };
    
    const hospitalIds = doctorHospitalMap[doctorId] || ['h1'];
    const state = get();
    return state.hospitals.filter(hospital => hospitalIds.includes(hospital.id));
  },

  getTokenAvailability: (doctorId, hospitalId, date) => {
    const state = get();
    const hospital = state.hospitals.find(h => h.id === hospitalId);
    if (!hospital) return [];

    // Get existing appointments for this doctor, hospital, and date
    const existingAppointments = state.appointments.filter(
      apt => apt.doctorId === doctorId && 
             apt.hospitalId === hospitalId && 
             apt.date === date &&
             apt.status !== 'cancelled'
    );

    const bookedTokens = existingAppointments.map(apt => apt.tokenNumber);

    // Generate token slots
    const tokens: TokenSlot[] = [];
    for (let i = 1; i <= hospital.totalTokens; i++) {
      const isBooked = bookedTokens.includes(i);
      const bookedAppointment = existingAppointments.find(apt => apt.tokenNumber === i);
      
      tokens.push({
        tokenNumber: i,
        isBooked,
        patientName: isBooked ? bookedAppointment?.notes || 'Booked' : undefined,
        time: generateEstimatedTime(i)
      });
    }

    return tokens;
  },

  getAppointmentTypes: () => {
    return appointmentTypes;
  },

  loadAppointmentsFromAPI: async () => {
    try {
      set({ isLoading: true });
      const response = await appointmentService.getAppointments();
      
      if (response.appointments) {
        // Transform API appointments to local format
        const transformedAppointments = response.appointments.map(apiAppointment => ({
          id: apiAppointment.id,
          doctorId: apiAppointment.doctor?.id || '',
          doctorName: apiAppointment.doctor ? `${apiAppointment.doctor.firstName} ${apiAppointment.doctor.lastName}` : 'Unknown Doctor',
          specialty: apiAppointment.doctor?.doctorProfile?.specialization || 'General Practice',
          hospitalId: 'h1', // Default hospital
          hospitalName: 'General Hospital',
          hospitalAddress: apiAppointment.location || 'Hospital Address',
          date: new Date(apiAppointment.appointmentDate).toISOString().split('T')[0],
          tokenNumber: Math.floor(Math.random() * 30) + 1, // Generate random token for UI
          estimatedTime: new Date(apiAppointment.appointmentDate).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          }),
          duration: `${apiAppointment.duration || 30} min`,
          status: apiAppointment.status.toLowerCase() as AppointmentStatus,
          type: apiAppointment.type.toLowerCase().replace(/_/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase()) as AppointmentType,
          notes: apiAppointment.notes || '',
          doctorImage: apiAppointment.doctor?.profileImage || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop',
          rating: apiAppointment.doctor?.doctorProfile?.rating || 4.8,
          experience: apiAppointment.doctor?.doctorProfile?.experience ? `${apiAppointment.doctor.doctorProfile.experience} years` : '5 years'
        }));
        
        set({ appointments: transformedAppointments });
      }
    } catch (error) {
      console.error('Failed to load appointments from API:', error);
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
            status: apiAppointment.status.toLowerCase() as AppointmentStatus,
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