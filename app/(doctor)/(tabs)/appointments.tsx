import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, Plus, Filter, User } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../../constants/theme';

// Mock appointment data for doctors
const mockAppointments = [
  {
    id: '1',
    patientName: 'John Doe',
    patientImage: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=987&auto=format&fit=crop',
    date: '2023-11-15',
    time: '09:00 AM',
    duration: '30 min',
    type: 'Check-up',
    status: 'confirmed',
    notes: 'Regular blood pressure monitoring'
  },
  {
    id: '2',
    patientName: 'Emily Johnson',
    patientImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop',
    date: '2023-11-15',
    time: '10:30 AM',
    duration: '45 min',
    type: 'Follow-up',
    status: 'confirmed',
    notes: 'Diabetes management review'
  },
  {
    id: '3',
    patientName: 'Michael Smith',
    patientImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop',
    date: '2023-11-15',
    time: '01:15 PM',
    duration: '30 min',
    type: 'Consultation',
    status: 'pending',
    notes: 'Joint pain assessment'
  },
  {
    id: '4',
    patientName: 'Sarah Wilson',
    patientImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=1974&auto=format&fit=crop',
    date: '2023-11-16',
    time: '11:00 AM',
    duration: '30 min',
    type: 'Check-up',
    status: 'confirmed',
    notes: 'Asthma medication review'
  }
];

export default function DoctorAppointmentsScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState('2023-11-15');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return COLORS.success;
      case 'pending':
        return COLORS.warning;
      case 'cancelled':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const todayAppointments = mockAppointments.filter(apt => apt.date === selectedDate);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Appointments</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/(doctor)/appointments/new')}
          >
            <Plus size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Selector */}
      <View style={styles.dateSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
          {['2023-11-13', '2023-11-14', '2023-11-15', '2023-11-16', '2023-11-17'].map((date) => (
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
                {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
              </Text>
              <Text style={[
                styles.dateNumber,
                selectedDate === date && styles.selectedDateText
              ]}>
                {new Date(date).getDate()}
              </Text>
            </TouchableOpacity>
          ))}
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

        {todayAppointments.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>No appointments today</Text>
            <Text style={styles.emptyDescription}>Your schedule is clear for this day</Text>
          </View>
        ) : (
          todayAppointments.map((appointment) => (
            <TouchableOpacity
              key={appointment.id}
              style={styles.appointmentCard}
              onPress={() => router.push(`/(doctor)/appointments/${appointment.id}`)}
            >
              <View style={styles.timeContainer}>
                <Text style={styles.appointmentTime}>{appointment.time}</Text>
                <Text style={styles.appointmentDuration}>{appointment.duration}</Text>
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
});