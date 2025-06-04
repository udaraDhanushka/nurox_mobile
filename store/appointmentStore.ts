import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppointmentStatus = 'confirmed' | 'pending' | 'cancelled';

export interface Appointment {
    id: string;
    doctorName: string;
    specialty: string;
    date: string;
    time: string;
    location: string;
    status: AppointmentStatus;
    notes: string;
    doctorImage: string;
}

interface AppointmentState {
    appointments: Appointment[];
    addAppointment: (appointment: Appointment) => void;
    updateAppointment: (id: string, updatedAppointment: Partial<Appointment>) => void;
    cancelAppointment: (id: string) => void;
    getAppointmentById: (id: string) => Appointment | undefined;
}

export const useAppointmentStore = create<AppointmentState>()(
    persist(
        (set, get) => ({
            appointments: [
                {
                    id: '1',
                    doctorName: 'Dr. Sarah Johnson',
                    specialty: 'cardiologist',
                    date: '2023-11-15',
                    time: '10:00 AM',
                    location: 'Heart Care Center, Building A, Room 305',
                    status: 'confirmed',
                    notes: 'Bring previous ECG reports and medication list',
                    doctorImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop'
                },
                {
                    id: '2',
                    doctorName: 'Dr. Michael Chen',
                    specialty: 'neurologist',
                    date: '2023-11-20',
                    time: '2:30 PM',
                    location: 'Neurology Associates, Building B, Room 210',
                    status: 'pending',
                    notes: 'Follow-up appointment for headache evaluation',
                    doctorImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop'
                },
                {
                    id: '3',
                    doctorName: 'Dr. Emily Rodriguez',
                    specialty: 'dermatologist',
                    date: '2023-11-10',
                    time: '9:15 AM',
                    location: 'Skin Health Clinic, Suite 150',
                    status: 'cancelled',
                    notes: 'Annual skin check',
                    doctorImage: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=2787&auto=format&fit=crop'
                }
            ],
            addAppointment: (appointment) => set((state) => ({
                appointments: [...state.appointments, appointment]
            })),
            updateAppointment: (id, updatedAppointment) => set((state) => ({
                appointments: state.appointments.map((appointment) =>
                    appointment.id === id ? { ...appointment, ...updatedAppointment } : appointment
                )
            })),
            cancelAppointment: (id) => set((state) => ({
                appointments: state.appointments.map((appointment) =>
                    appointment.id === id ? { ...appointment, status: 'cancelled' } : appointment
                )
            })),
            getAppointmentById: (id) => {
                return get().appointments.find((appointment) => appointment.id === id);
            }
        }),
        {
            name: 'appointment-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);