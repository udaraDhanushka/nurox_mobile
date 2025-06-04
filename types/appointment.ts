export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

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

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  experience: string;
  image: string;
}

export interface AppointmentDate {
  id: string;
  date: string;
  day: string;
  dayNum: number;
}

export interface AppointmentTime {
  id: string;
  time: string;
}