import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Clock, MapPin, Phone, MessageCircle, Edit, X } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../../constants/theme';
import { Button } from '../../../components/Button';

// Define the appointment type
interface DoctorAppointment {
  id: string;
  patientName: string;
  patientImage: string;
  patientAge: number;
  patientPhone: string;
  date: string;
  tokenNumber: number;
  time: string;
  duration: string;
  type: string;
  status: string;
  notes: string;
  symptoms: string;
  medicalHistory: string;
  currentMedications: string;
  vitalSigns: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    weight: string;
  };
}

// Mock doctor appointments data
const mockDoctorAppointments: Record<string, DoctorAppointment> = {
  '1': {
    id: '1',
    patientName: 'John Smith',
    patientImage: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=987&auto=format&fit=crop',
    patientAge: 45,
    patientPhone: '+1 (555) 123-4567',
    date: '2024-01-15',
    tokenNumber: 1,
    time: '10:00 AM',
    duration: '30 minutes',
    type: 'Follow-up',
    status: 'confirmed',
    notes: 'Patient reports improvement in symptoms. Continue current medication.',
    symptoms: 'Mild headaches, improved sleep',
    medicalHistory: 'Hypertension, Type 2 Diabetes',
    currentMedications: 'Metformin 500mg, Lisinopril 10mg',
    vitalSigns: {
      bloodPressure: '130/85 mmHg',
      heartRate: '72 bpm',
      temperature: '98.6°F',
      weight: '180 lbs'
    }
  },
  '2': {
    id: '2',
    patientName: 'Emily Johnson',
    patientImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=987&auto=format&fit=crop',
    patientAge: 32,
    patientPhone: '+1 (555) 987-6543',
    date: '2024-01-16',
    tokenNumber: 2,
    time: '2:30 PM',
    duration: '45 minutes',
    type: 'Consultation',
    status: 'pending',
    notes: 'New patient consultation for chronic fatigue.',
    symptoms: 'Chronic fatigue, muscle weakness',
    medicalHistory: 'No significant medical history',
    currentMedications: 'Vitamin D supplements',
    vitalSigns: {
      bloodPressure: '120/80 mmHg',
      heartRate: '68 bpm',
      temperature: '98.4°F',
      weight: '140 lbs'
    }
  },
  '3': {
    id: '3',
    patientName: 'Robert Davis',
    patientImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=987&auto=format&fit=crop',
    patientAge: 58,
    patientPhone: '+1 (555) 456-7890',
    date: '2024-01-17',
    tokenNumber: 3,
    time: '11:15 AM',
    duration: '60 minutes',
    type: 'Annual Check-up',
    status: 'completed',
    notes: 'Annual physical examination completed. All vitals normal.',
    symptoms: 'No current symptoms',
    medicalHistory: 'High cholesterol, previous heart surgery',
    currentMedications: 'Atorvastatin 20mg, Aspirin 81mg',
    vitalSigns: {
      bloodPressure: '125/82 mmHg',
      heartRate: '75 bpm',
      temperature: '98.7°F',
      weight: '195 lbs'
    }
  }
};

export default function DoctorAppointmentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const appointment = mockDoctorAppointments[id as string];

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
            Alert.alert('Appointment Cancelled', 'The appointment has been cancelled.');
            router.back();
          }
        }
      ]
    );
  };

  const handleReschedule = () => {
    Alert.alert('Reschedule', 'Reschedule functionality would be implemented here.');
  };

  const handleStartConsultation = () => {
    Alert.alert('Start Consultation', 'Video consultation would start here.');
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

        {/* Patient Information */}
        <View style={styles.patientCard}>
          <Image 
            source={{ uri: appointment.patientImage }} 
            style={styles.patientImage}
          />
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{appointment.patientName}</Text>
            <Text style={styles.patientAge}>Age: {appointment.patientAge}</Text>
            <Text style={styles.patientPhone}>{appointment.patientPhone}</Text>
          </View>
          <View style={styles.patientActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push(`/(doctor)/doctor-chat?patientId=${appointment.id}&patientName=${appointment.patientName}`)}
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
            <Calendar size={20} color={COLORS.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date & Time</Text>
              <Text style={styles.detailValue}>
                {new Date(appointment.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Text>
              <Text style={styles.detailValue}>{appointment.time}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Clock size={20} color={COLORS.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{appointment.duration}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Appointment Type</Text>
              <Text style={styles.detailValue}>{appointment.type}</Text>
            </View>
          </View>
        </View>

        {/* Medical Information */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Medical Information</Text>
          
          <View style={styles.medicalSection}>
            <Text style={styles.medicalLabel}>Current Symptoms</Text>
            <Text style={styles.medicalText}>{appointment.symptoms}</Text>
          </View>

          <View style={styles.medicalSection}>
            <Text style={styles.medicalLabel}>Medical History</Text>
            <Text style={styles.medicalText}>{appointment.medicalHistory}</Text>
          </View>

          <View style={styles.medicalSection}>
            <Text style={styles.medicalLabel}>Current Medications</Text>
            <Text style={styles.medicalText}>{appointment.currentMedications}</Text>
          </View>
        </View>

        {/* Vital Signs */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Vital Signs</Text>
          
          <View style={styles.vitalsGrid}>
            <View style={styles.vitalItem}>
              <Text style={styles.vitalLabel}>Blood Pressure</Text>
              <Text style={styles.vitalValue}>{appointment.vitalSigns.bloodPressure}</Text>
            </View>
            <View style={styles.vitalItem}>
              <Text style={styles.vitalLabel}>Heart Rate</Text>
              <Text style={styles.vitalValue}>{appointment.vitalSigns.heartRate}</Text>
            </View>
            <View style={styles.vitalItem}>
              <Text style={styles.vitalLabel}>Temperature</Text>
              <Text style={styles.vitalValue}>{appointment.vitalSigns.temperature}</Text>
            </View>
            <View style={styles.vitalItem}>
              <Text style={styles.vitalLabel}>Weight</Text>
              <Text style={styles.vitalValue}>{appointment.vitalSigns.weight}</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {appointment.notes && (
          <View style={styles.detailsCard}>
            <Text style={styles.cardTitle}>Notes</Text>
            <Text style={styles.notesText}>{appointment.notes}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {appointment.status === 'confirmed' && (
            <>
              <Button
                title="Start Consultation"
                onPress={handleStartConsultation}
                style={styles.consultationButton}
              />
              
              {/* <Button
                title="Reschedule"
                variant="outline"
                onPress={handleReschedule}
                style={styles.rescheduleButton}
                icon={<Edit size={20} color={COLORS.primary} />}
              /> */}
              
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
            <>
              <Button
                title="Confirm Appointment"
                onPress={() => Alert.alert('Confirmed', 'Appointment has been confirmed.')}
                style={styles.confirmButton}
              />
              
              <Button
                title="Decline"
                variant="outline"
                onPress={handleCancelAppointment}
                style={styles.cancelButton}
                icon={<X size={20} color={COLORS.error} />}
              />
            </>
          )}

          {appointment.status === 'completed' && (
            <Button
              title="View Patient Records"
              onPress={() => router.push(`/(doctor)/doctor-patients/doctor-patient-[id]`)}
              style={styles.recordsButton}
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
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.medium,
  },
  patientImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  patientAge: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  patientPhone: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  patientActions: {
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
  medicalSection: {
    marginBottom: 16,
  },
  medicalLabel: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  medicalText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  vitalItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
  },
  vitalLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  vitalValue: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
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
  consultationButton: {
    backgroundColor: COLORS.success,
  },
  confirmButton: {
    backgroundColor: COLORS.success,
  },
  rescheduleButton: {
    borderColor: COLORS.primary,
  },
  cancelButton: {
    borderColor: COLORS.error,
  },
  recordsButton: {
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