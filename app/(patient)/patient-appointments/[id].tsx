import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Clock, MapPin, Phone, MessageCircle, Edit, X, Hash, Building } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../../constants/theme';
import { Button } from '../../../components/Button';
import { useAppointmentStore } from '../../../store/appointmentStore';

export default function AppointmentDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { appointments, updateAppointment } = useAppointmentStore();
  
  const appointment = appointments.find(apt => apt.id === id);

  if (!appointment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Appointment Details</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Appointment not found</Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            style={styles.goBackButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return COLORS.success;
      case 'pending':
        return COLORS.warning;
      case 'cancelled':
        return COLORS.error;
      case 'completed':
        return COLORS.primary;
      default:
        return COLORS.textSecondary;
    }
  };

  const handleCancelAppointment = () => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        {
          text: 'No',
          style: 'cancel'
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            updateAppointment(appointment.id, { status: 'cancelled' });
            Alert.alert('Appointment Cancelled', 'Your appointment has been cancelled.');
            router.back();
          }
        }
      ]
    );
  };

  const handleReschedule = () => {
    Alert.alert('Reschedule', 'Reschedule functionality would be implemented here.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appointment Details</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={handleReschedule}
        >
          <Edit size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Badge */}
        <View style={[
          styles.statusBadgeContainer,
          { backgroundColor: `${getStatusColor(appointment.status)}20` }
        ]}>
          <Text style={[
            styles.statusBadgeText,
            { color: getStatusColor(appointment.status) }
          ]}>
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </Text>
        </View>

        {/* Token Information */}
        <View style={styles.tokenCard}>
          <View style={styles.tokenHeader}>
            <Hash size={24} color={COLORS.primary} />
            <Text style={styles.tokenTitle}>Token Number</Text>
          </View>
          <Text style={styles.tokenNumber}>{appointment.tokenNumber}</Text>
          <Text style={styles.estimatedTime}>Estimated Time: {appointment.estimatedTime}</Text>
        </View>

        {/* Doctor Information */}
        <View style={styles.doctorCard}>
          <Image 
            source={{ uri: appointment.doctorImage }} 
            style={styles.doctorImage}
          />
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{appointment.doctorName}</Text>
            <Text style={styles.doctorSpecialty}>{appointment.specialty}</Text>
            <Text style={styles.doctorRating}>⭐ {appointment.rating} • {appointment.experience}</Text>
          </View>
          <View style={styles.doctorActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push(`/(patient)/chat?doctorId=${appointment.doctorId}&doctorName=${appointment.doctorName}`)}
            >
              <MessageCircle size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Phone size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Appointment Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Appointment Information</Text>
          
          <View style={styles.detailItem}>
            <Building size={20} color={COLORS.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Hospital</Text>
              <Text style={styles.detailValue}>{appointment.hospitalName}</Text>
              <Text style={styles.detailSubValue}>{appointment.hospitalAddress}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Calendar size={20} color={COLORS.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>
                {new Date(appointment.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Hash size={20} color={COLORS.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Token & Time</Text>
              <Text style={styles.detailValue}>Token #{appointment.tokenNumber}</Text>
              <Text style={styles.detailSubValue}>Estimated: {appointment.estimatedTime}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Clock size={20} color={COLORS.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{appointment.duration}</Text>
            </View>
          </View>
        </View>

        {/* Appointment Type & Notes */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Visit Details</Text>
          
          <View style={styles.typeContainer}>
            <Text style={styles.typeLabel}>Appointment Type</Text>
            <Text style={styles.typeValue}>{appointment.type}</Text>
          </View>

          {appointment.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Notes</Text>
              <Text style={styles.notesText}>{appointment.notes}</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {appointment.status === 'confirmed' && (
            <>
              <Button
                title="Reschedule"
                variant="outline"
                onPress={handleReschedule}
                style={styles.rescheduleButton}
                icon={<Edit size={20} color={COLORS.primary} />}
              />
              
              <Button
                title="Cancel Appointment"
                variant="outline"
                onPress={handleCancelAppointment}
                style={styles.cancelButton}
                icon={<X size={20} color={COLORS.error} />}
              />
            </>
          )}

          {appointment.status === 'pending' && (
            <Button
              title="Cancel Request"
              variant="outline"
              onPress={handleCancelAppointment}
              style={styles.cancelButton}
              icon={<X size={20} color={COLORS.error} />}
            />
          )}

          {appointment.status === 'completed' && (
            <Button
              title="Book Follow-up"
              onPress={() => router.push('/(patient)/patient-appointments/new')}
              style={styles.followUpButton}
            />
          )}
        </View>
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  editButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusBadgeContainer: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusBadgeText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
  },
  tokenCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    ...SHADOWS.medium,
  },
  tokenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tokenTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  tokenNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  estimatedTime: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.medium,
  },
  doctorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  doctorRating: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  doctorActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.transparentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  cardTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailContent: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  detailSubValue: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  typeContainer: {
    marginBottom: 16,
  },
  typeLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  typeValue: {
    fontSize: SIZES.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  notesContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 16,
  },
  notesLabel: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  notesText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 24,
  },
  rescheduleButton: {
    borderColor: COLORS.primary,
  },
  cancelButton: {
    borderColor: COLORS.error,
  },
  followUpButton: {
    backgroundColor: COLORS.primary,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: SIZES.lg,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  goBackButton: {
    width: 200,
  },
});