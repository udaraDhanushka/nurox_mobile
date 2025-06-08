import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Phone, MessageCircle, Calendar, FileText, Plus, User, Mail, MapPin, Clock } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../../constants/theme';
import { Button } from '../../../components/Button';

// Mock patient details
const mockPatientDetails: Record<string, any> = {
  '1': {
    id: '1',
    name: 'John Doe',
    age: 42,
    gender: 'Male',
    phone: '+1 (555) 123-4567',
    email: 'john.doe@email.com',
    address: '123 Main St, New York, NY 10001',
    image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=987&auto=format&fit=crop',
    dateOfBirth: '1981-05-15',
    bloodType: 'O+',
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'Wife',
      phone: '+1 (555) 123-4568'
    },
    medicalHistory: [
      'Hypertension (2020)',
      'Type 2 Diabetes (2019)',
      'High Cholesterol (2018)'
    ],
    currentMedications: [
      'Lisinopril 10mg - Once daily',
      'Metformin 500mg - Twice daily',
      'Atorvastatin 20mg - Once daily'
    ],
    allergies: ['Penicillin', 'Shellfish'],
    recentVisits: [
      {
        date: '2023-11-10',
        type: 'Follow-up',
        notes: 'Blood pressure stable, continue current medication'
      },
      {
        date: '2023-10-15',
        type: 'Check-up',
        notes: 'Regular diabetes monitoring, HbA1c improved'
      }
    ],
    upcomingAppointments: [
      {
        id: '1',
        date: '2023-11-15',
        time: '09:00 AM',
        type: 'Check-up',
        status: 'confirmed'
      }
    ],
    vitalSigns: {
      bloodPressure: '140/90 mmHg',
      heartRate: '78 bpm',
      temperature: '98.6°F',
      weight: '185 lbs',
      height: '5\'10"'
    }
  },
  '2': {
    id: '2',
    name: 'Emily Johnson',
    age: 35,
    gender: 'Female',
    phone: '+1 (555) 987-6543',
    email: 'emily.johnson@email.com',
    address: '456 Oak Ave, Los Angeles, CA 90210',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop',
    dateOfBirth: '1988-09-22',
    bloodType: 'A+',
    emergencyContact: {
      name: 'Robert Johnson',
      relationship: 'Husband',
      phone: '+1 (555) 987-6544'
    },
    medicalHistory: [
      'Type 2 Diabetes (2019)',
      'High Cholesterol (2020)'
    ],
    currentMedications: [
      'Metformin 1000mg - Twice daily',
      'Atorvastatin 20mg - Once daily'
    ],
    allergies: ['Latex'],
    recentVisits: [
      {
        date: '2023-11-08',
        type: 'Follow-up',
        notes: 'Diabetes management review, medication adjustment needed'
      }
    ],
    upcomingAppointments: [
      {
        id: '2',
        date: '2023-11-15',
        time: '10:30 AM',
        type: 'Follow-up',
        status: 'confirmed'
      }
    ],
    vitalSigns: {
      bloodPressure: '125/80 mmHg',
      heartRate: '72 bpm',
      temperature: '98.4°F',
      weight: '165 lbs',
      height: '5\'6"'
    }
  },
  '3': {
    id: '3',
    name: 'Michael Smith',
    age: 28,
    gender: 'Male',
    phone: '+1 (555) 456-7890',
    email: 'michael.smith@email.com',
    address: '789 Pine St, Chicago, IL 60601',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop',
    dateOfBirth: '1995-03-10',
    bloodType: 'B+',
    emergencyContact: {
      name: 'Mary Smith',
      relationship: 'Mother',
      phone: '+1 (555) 456-7891'
    },
    medicalHistory: [
      'Joint Pain (2023)'
    ],
    currentMedications: [
      'Ibuprofen 400mg - As needed'
    ],
    allergies: ['None known'],
    recentVisits: [
      {
        date: '2023-11-05',
        type: 'Consultation',
        notes: 'Knee pain assessment, physical therapy recommended'
      }
    ],
    upcomingAppointments: [
      {
        id: '3',
        date: '2023-11-15',
        time: '01:15 PM',
        type: 'Consultation',
        status: 'pending'
      }
    ],
    vitalSigns: {
      bloodPressure: '120/75 mmHg',
      heartRate: '68 bpm',
      temperature: '98.2°F',
      weight: '175 lbs',
      height: '6\'0"'
    }
  },
  '4': {
    id: '4',
    name: 'Sarah Wilson',
    age: 28,
    gender: 'Male',
    phone: '+1 (555) 456-7890',
    email: 'michael.smith@email.com',
    address: '789 Pine St, Chicago, IL 60601',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop',
    dateOfBirth: '1995-03-10',
    bloodType: 'B+',
    emergencyContact: {
      name: 'Mary Smith',
      relationship: 'Mother',
      phone: '+1 (555) 456-7891'
    },
    medicalHistory: [
      'Joint Pain (2023)'
    ],
    currentMedications: [
      'Ibuprofen 400mg - As needed'
    ],
    allergies: ['None known'],
    recentVisits: [
      {
        date: '2023-11-05',
        type: 'Consultation',
        notes: 'Knee pain assessment, physical therapy recommended'
      }
    ],
    upcomingAppointments: [
      {
        id: '3',
        date: '2023-11-15',
        time: '01:15 PM',
        type: 'Consultation',
        status: 'pending'
      }
    ],
    vitalSigns: {
      bloodPressure: '120/75 mmHg',
      heartRate: '68 bpm',
      temperature: '98.2°F',
      weight: '175 lbs',
      height: '6\'0"'
    }
  }
};

export default function DoctorPatientDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const patientId = Array.isArray(id) ? id[0] : id;
  const patient = patientId ? mockPatientDetails[patientId] : undefined;

  if (!patient) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Patient Details</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Patient not found</Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            style={styles.goBackButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Patient Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Patient Header */}
        <View style={styles.patientHeader}>
          <Image source={{ uri: patient.image }} style={styles.patientImage} />
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{patient.name}</Text>
            <Text style={styles.patientDetails}>{patient.age} years old • {patient.gender}</Text>
            <Text style={styles.patientContact}>{patient.phone}</Text>
            <Text style={styles.patientEmail}>{patient.email}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push(`/(doctor)/doctor-chat?patientId=${patient.id}&patientName=${patient.name}`)}
            >
              <MessageCircle size={20} color={COLORS.primary} />
            </TouchableOpacity>
            {/* <TouchableOpacity style={styles.actionButton}>
              <Phone size={20} color={COLORS.primary} />
            </TouchableOpacity> */}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push(`/(doctor)/doctor-prescriptions/new?patientId=${patient.id}&patientName=${patient.name}`)}
          >
            <FileText size={20} color={COLORS.primary} />
            <Text style={styles.quickActionText}>New Prescription</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => Alert.alert('Schedule Appointment', 'Appointment scheduling would be implemented here.')}
          >
            <Calendar size={20} color={COLORS.primary} />
            <Text style={styles.quickActionText}>Schedule Appointment</Text>
          </TouchableOpacity>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <User size={16} color={COLORS.textSecondary} />
              <Text style={styles.infoLabel}>Date of Birth</Text>
              <Text style={styles.infoValue}>{new Date(patient.dateOfBirth).toLocaleDateString()}</Text>
            </View>
            <View style={styles.infoRow}>
              <FileText size={16} color={COLORS.textSecondary} />
              <Text style={styles.infoLabel}>Blood Type</Text>
              <Text style={styles.infoValue}>{patient.bloodType}</Text>
            </View>
            <View style={styles.infoRow}>
              <MapPin size={16} color={COLORS.textSecondary} />
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{patient.address}</Text>
            </View>
          </View>
        </View>

        {/* Emergency Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <User size={16} color={COLORS.textSecondary} />
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{patient.emergencyContact.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <FileText size={16} color={COLORS.textSecondary} />
              <Text style={styles.infoLabel}>Relationship</Text>
              <Text style={styles.infoValue}>{patient.emergencyContact.relationship}</Text>
            </View>
            <View style={styles.infoRow}>
              <Phone size={16} color={COLORS.textSecondary} />
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{patient.emergencyContact.phone}</Text>
            </View>
          </View>
        </View>

        {/* Vital Signs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Latest Vital Signs</Text>
          <View style={styles.vitalsGrid}>
            <View style={styles.vitalCard}>
              <Text style={styles.vitalLabel}>Blood Pressure</Text>
              <Text style={styles.vitalValue}>{patient.vitalSigns.bloodPressure}</Text>
            </View>
            <View style={styles.vitalCard}>
              <Text style={styles.vitalLabel}>Heart Rate</Text>
              <Text style={styles.vitalValue}>{patient.vitalSigns.heartRate}</Text>
            </View>
            <View style={styles.vitalCard}>
              <Text style={styles.vitalLabel}>Temperature</Text>
              <Text style={styles.vitalValue}>{patient.vitalSigns.temperature}</Text>
            </View>
            <View style={styles.vitalCard}>
              <Text style={styles.vitalLabel}>Weight</Text>
              <Text style={styles.vitalValue}>{patient.vitalSigns.weight}</Text>
            </View>
          </View>
        </View>

        {/* Medical History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical History</Text>
          <View style={styles.listCard}>
            {patient.medicalHistory.map((item: string, index: number) => (
              <Text key={index} style={styles.listItem}>• {item}</Text>
            ))}
          </View>
        </View>

        {/* Current Medications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Medications</Text>
          <View style={styles.listCard}>
            {patient.currentMedications.map((medication: string, index: number) => (
              <Text key={index} style={styles.listItem}>• {medication}</Text>
            ))}
          </View>
        </View>

        {/* Allergies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Allergies</Text>
          <View style={styles.listCard}>
            {patient.allergies.map((allergy: string, index: number) => (
              <Text key={index} style={styles.listItem}>• {allergy}</Text>
            ))}
          </View>
        </View>

        {/* Recent Visits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Visits</Text>
          {patient.recentVisits.map((visit: any, index: number) => (
            <View key={index} style={styles.visitCard}>
              <View style={styles.visitHeader}>
                <Text style={styles.visitDate}>{new Date(visit.date).toLocaleDateString()}</Text>
                <Text style={styles.visitType}>{visit.type}</Text>
              </View>
              <Text style={styles.visitNotes}>{visit.notes}</Text>
            </View>
          ))}
        </View>

        {/* Upcoming Appointments */}
        <View style={[styles.section, { marginBottom: 20 }]}>
          <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
          {patient.upcomingAppointments.map((appointment: any, index: number) => (
            <TouchableOpacity 
              key={index} 
              style={styles.appointmentCard}
              onPress={() => router.push(`/(doctor)/doctor-appointments/${appointment.id}`)}
            >
              <View style={styles.appointmentHeader}>
                <Text style={styles.appointmentDate}>
                  {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                </Text>
                <View style={[
                  styles.appointmentStatus,
                  { backgroundColor: appointment.status === 'confirmed' ? COLORS.success : COLORS.warning }
                ]}>
                  <Text style={styles.appointmentStatusText}>{appointment.status}</Text>
                </View>
              </View>
              <Text style={styles.appointmentType}>{appointment.type}</Text>
            </TouchableOpacity>
          ))}
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
  content: {
    flex: 1,
    padding: 16,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.medium,
  },
  patientImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  patientDetails: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  patientContact: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  patientEmail: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  headerActions: {
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
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    ...SHADOWS.small,
  },
  quickActionText: {
    fontSize: SIZES.sm,
    fontWeight: '500',
    color: COLORS.primary,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    ...SHADOWS.small,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: 12,
    flex: 1,
  },
  infoValue: {
    fontSize: SIZES.sm,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vitalCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  vitalLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  vitalValue: {
    fontSize: SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  listCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    ...SHADOWS.small,
  },
  listItem: {
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
    marginBottom: 8,
    lineHeight: 20,
  },
  visitCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    ...SHADOWS.small,
  },
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  visitDate: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  visitType: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  visitNotes: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  appointmentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    ...SHADOWS.small,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentDate: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  appointmentStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  appointmentStatusText: {
    fontSize: SIZES.xs,
    color: COLORS.white,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  appointmentType: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
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