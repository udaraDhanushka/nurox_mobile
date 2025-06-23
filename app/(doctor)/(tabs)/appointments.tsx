import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, Plus, Filter, User } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../../constants/theme';
import { appointmentService } from '../../../services/appointmentService';
import { useAuthStore } from '../../../store/authStore';
import { API_CONFIG } from '../../../constants/api';

interface DoctorAppointment {
  id: string;
  patientName: string;
  patientImage: string;
  date: string;
  time: string;
  duration: string;
  type: string;
  status: string;
  notes: string;
  patientOrder?: number; // Sequential patient number for the day (1, 2, 3...)
}

export default function DoctorAppointmentsScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  
  // Generate dates starting from today
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };
  
  const availableDates = generateDates();

  useEffect(() => {
    loadAppointments();
  }, [selectedDate, user]);

  const loadAppointments = async () => {
    if (!user || !user.id) return;
    
    try {
      setIsLoading(true);
      
      // Use the new doctor-specific method that only returns confirmed appointments
      const appointments = await appointmentService.getDoctorConfirmedAppointments(user.id, selectedDate);
      
      if (appointments && appointments.length > 0) {
        const doctorAppointments = appointments
          .map((apt, index) => ({
            id: apt.id,
            patientName: apt.patient ? `${apt.patient.firstName} ${apt.patient.lastName}` : 'Unknown Patient',
            patientImage: apt.patient?.profileImage || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=987&auto=format&fit=crop',
            date: new Date(apt.appointmentDate).toISOString().split('T')[0],
            time: new Date(apt.appointmentDate).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit', 
              hour12: true 
            }),
            duration: `${apt.duration || 30} min`,
            type: apt.type.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            status: apt.status.toLowerCase(),
            notes: apt.notes || '',
            patientOrder: index + 1 // Sequential patient number for the day
          }));
        
        setAppointments(doctorAppointments);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error('Failed to load doctor appointments:', error);
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'pending':
        return COLORS.success;
      case 'completed':
        return COLORS.primary;
      case 'canceled':
      case 'cancelled':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const todayAppointments = appointments.filter(apt => apt.date === selectedDate);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Appointments</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Selector */}
      <View style={styles.dateSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
          {availableDates.map((date) => {
            const dateObj = new Date(date);
            const today = new Date().toISOString().split('T')[0];
            const isToday = date === today;
            
            return (
              <TouchableOpacity
                key={date}
                style={[
                  styles.dateItem,
                  selectedDate === date && styles.selectedDateItem
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[
                  styles.dateDay,
                  selectedDate === date && styles.selectedDateText
                ]}>
                  {isToday ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                </Text>
                <Text style={[
                  styles.dateNumber,
                  selectedDate === date && styles.selectedDateText
                ]}>
                  {dateObj.getDate()}
                </Text>
                {isToday && (
                  <View style={styles.todayIndicator} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Appointments List */}
      <ScrollView style={styles.appointmentsList} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>
          {new Date(selectedDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading appointments...</Text>
          </View>
        ) : todayAppointments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Calendar size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No appointments for this date</Text>
          </View>
        ) : (
          todayAppointments.map((appointment) => (
            <TouchableOpacity
              key={appointment.id}
              style={styles.appointmentCard}
              onPress={() => router.push({
                pathname: '/(doctor)/doctor-appointments/[id]',
                params: { id: appointment.id }
              })}
            >
              <View style={styles.timeContainer}>
                <Text style={styles.appointmentTime}>{appointment.time}</Text>
                <Text style={styles.appointmentDuration}>{appointment.duration}</Text>
                {appointment.patientOrder && (
                  <Text style={styles.patientOrder}>Patient #{appointment.patientOrder}</Text>
                )}
              </View>

              <Image source={{ uri: appointment.patientImage }} style={styles.patientImage} />

              <View style={styles.appointmentInfo}>
                <View style={styles.appointmentHeader}>
                  <Text style={styles.patientName}>{appointment.patientName}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(appointment.status) + '20' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(appointment.status) }
                    ]}>
                      {appointment.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.appointmentType}>{appointment.type}</Text>
                <Text style={styles.appointmentNotes}>{appointment.notes}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  dateSelector: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  dateScroll: {
    flexDirection: 'row',
  },
  dateItem: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  selectedDateItem: {
    backgroundColor: COLORS.primary,
  },
  dateDay: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  dateNumber: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  selectedDateText: {
    color: COLORS.white,
  },
  todayIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  appointmentsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  appointmentCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.medium,
  },
  timeContainer: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 60,
  },
  appointmentTime: {
    fontSize: SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  appointmentDuration: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
  },
  patientOrder: {
    fontSize: SIZES.xs,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginTop: 2,
  },
  patientImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  patientName: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: SIZES.xs,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  appointmentType: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  appointmentNotes: {
    fontSize: SIZES.xs,
    color: COLORS.textTertiary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
});