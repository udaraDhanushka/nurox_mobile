import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Plus, Hash, Clock, MapPin } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../../constants/theme';
import { AppointmentCard } from '../../../components/ui/AppointmentCard';
import { useAppointmentStore } from '../../../store/appointmentStore';
import { useFocusEffect } from '@react-navigation/native';

export default function AppointmentsScreen() {
  const router = useRouter();
  const { appointments, loadAppointmentsFromAPI, isLoading } = useAppointmentStore();
  const [selectedFilter, setSelectedFilter] = useState('upcoming');

  // Load appointments from API when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadAppointmentsFromAPI();
    }, [loadAppointmentsFromAPI])
  );

  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate comparison
    appointmentDate.setHours(0, 0, 0, 0);
    
    switch (selectedFilter) {
      case 'upcoming':
        return appointmentDate >= today && appointment.status === 'confirmed';
      case 'past':
        return (appointmentDate < today && appointment.status === 'confirmed') || 
               appointment.status === 'completed';
      case 'canceled':
        return appointment.status === 'canceled';
      default:
        return true;
    }
  });

  // Sort appointments by date (newest first for past, oldest first for upcoming)
  const sortedAppointments = filteredAppointments.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    
    if (selectedFilter === 'past') {
      return dateB.getTime() - dateA.getTime(); // Newest first for past
    }
    return dateA.getTime() - dateB.getTime(); // Oldest first for upcoming
  });

  const getFilterCount = (filter: string) => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      appointmentDate.setHours(0, 0, 0, 0);
      
      switch (filter) {
        case 'upcoming':
          return appointmentDate >= today && appointment.status === 'confirmed';
        case 'past':
          return appointmentDate < today || appointment.status === 'completed';
        case 'canceled':
          return appointment.status === 'canceled';
        default:
          return true;
      }
    }).length;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Appointments</Text>
          <Text style={styles.headerSubtitle}>
            {appointments.length} total appointments
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/(patient)/patient-appointments/new')}
        >
          <Plus size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {[
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'past', label: 'Past' },
          { key: 'canceled', label: 'Canceled' }
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              selectedFilter === filter.key && styles.activeFilterTab
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === filter.key && styles.activeFilterText
            ]}>
              {filter.label}
            </Text>
            <View style={[
              styles.filterBadge,
              selectedFilter === filter.key && styles.activeFilterBadge
            ]}>
              <Text style={[
                styles.filterBadgeText,
                selectedFilter === filter.key && styles.activeFilterBadgeText
              ]}>
                {getFilterCount(filter.key)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading appointments...</Text>
          </View>
        ) : (
          <>
            {sortedAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onPress={() => router.push(`/(patient)/patient-appointments/${appointment.id}`)}
              />
            ))}

            {sortedAppointments.length === 0 && (
              <View style={styles.emptyState}>
                <Calendar size={48} color={COLORS.textSecondary} />
                <Text style={styles.emptyStateText}>
                  {selectedFilter === 'upcoming' ? 'No upcoming appointments' : 
                   selectedFilter === 'past' ? 'No past appointments' : 
                   'No canceled appointments'}
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  {selectedFilter === 'upcoming' 
                    ? 'Schedule your first appointment to get started'
                    : selectedFilter === 'past'
                    ? 'Your completed appointments will appear here'
                    : 'Your canceled appointments will appear here'
                  }
                </Text>
                {selectedFilter === 'upcoming' && (
                  <TouchableOpacity
                    style={styles.scheduleButton}
                    onPress={() => router.push('/(patient)/patient-appointments/new')}
                  >
                    <Text style={styles.scheduleButtonText}>Schedule Appointment</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    gap: 6,
  },
  activeFilterTab: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activeFilterText: {
    color: COLORS.white,
  },
  filterBadge: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  activeFilterBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterBadgeText: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  activeFilterBadgeText: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  scheduleButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  scheduleButtonText: {
    color: COLORS.white,
    fontSize: SIZES.md,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});