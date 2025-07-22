import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Phone, MessageCircle, Calendar, FileText, Plus, User, Mail, MapPin, Clock } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../../constants/theme';
import { Button } from '../../../components/Button';
import { patientService } from '../../../services/patientService';
import { useAuthStore } from '../../../store/authStore';
import { DetailedPatient } from '../../../types/appointment';
import { calculateAge, formatAge } from '../../../utils/dateUtils';
import { usePatientDataSync } from '../../../hooks/usePatientDataSync';
import { useSpecificPatientSync } from '../../../hooks/usePatientSyncListener';

// Mock data removed - now using real patient data from API via patientService

export default function DoctorPatientDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuthStore();
  const [patient, setPatient] = useState<DetailedPatient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const patientId = Array.isArray(id) ? id[0] : id;
  
  useEffect(() => {
    if (patientId && user?.id) {
      loadPatientDetails();
    }
  }, [patientId, user]);
  
  const loadPatientDetails = async () => {
    if (!patientId || !user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const patientDetails = await patientService.getPatientById(patientId, user.id);
      if (patientDetails) {
      } else {
        setError('Patient not found or not associated with your appointments');
      }
    } catch (err) {
      console.error('Failed to load patient details:', err);
      setError('Failed to load patient details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
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
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading patient details...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (error || !patient) {
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
          <Text style={styles.notFoundText}>{error || 'Patient not found'}</Text>
          <Button
            title="Try Again"
            onPress={loadPatientDetails}
            style={styles.goBackButton}
          />
          <Button
            title="Go Back"
            variant="outline"
            onPress={() => router.back()}
            style={[styles.goBackButton, { marginTop: 12 }]}
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
          <Image 
            source={{ uri: patient.profileImage || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=987&auto=format&fit=crop' }} 
            style={styles.patientImage} 
          />
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{patient.name}</Text>
            <Text style={styles.patientDetails}>
              {patient.gender && ` • ${patient.gender}`}
            </Text>
            {patient.phone && <Text style={styles.patientContact}>{patient.phone}</Text>}
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
            onPress={() => router.push(`/(doctor)/doctor-lab-requests/new?patientId=${patient.id}&patientName=${patient.name}`)}
          >
            <Plus size={20} color={COLORS.primary} />
            <Text style={styles.quickActionText}>Lab Request</Text>
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
            {patient.dateOfBirth && (
            )}
            {patient.bloodType && (
              <View style={styles.infoRow}>
                <FileText size={16} color={COLORS.textSecondary} />
                <Text style={styles.infoLabel}>Blood Type</Text>
                <Text style={styles.infoValue}>{patient.bloodType}</Text>
              </View>
            )}
            {patient.address && (
              <View style={styles.infoRow}>
                <MapPin size={16} color={COLORS.textSecondary} />
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>{patient.address}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Emergency Contact */}
        {patient.emergencyContactDetails && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Contact</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <User size={16} color={COLORS.textSecondary} />
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{patient.emergencyContactDetails.name}</Text>
              </View>
              <View style={styles.infoRow}>
                <FileText size={16} color={COLORS.textSecondary} />
                <Text style={styles.infoLabel}>Relationship</Text>
                <Text style={styles.infoValue}>{patient.emergencyContactDetails.relationship}</Text>
              </View>
              <View style={styles.infoRow}>
                <Phone size={16} color={COLORS.textSecondary} />
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{patient.emergencyContactDetails.phone}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Vital Signs */}
        {patient.vitalSigns && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Latest Vital Signs</Text>
            <View style={styles.vitalsGrid}>
              {patient.vitalSigns.bloodPressure && (
                <View style={styles.vitalCard}>
                  <Text style={styles.vitalLabel}>Blood Pressure</Text>
                  <Text style={styles.vitalValue}>{patient.vitalSigns.bloodPressure}</Text>
                </View>
              )}
              {patient.vitalSigns.heartRate && (
                <View style={styles.vitalCard}>
                  <Text style={styles.vitalLabel}>Heart Rate</Text>
                  <Text style={styles.vitalValue}>{patient.vitalSigns.heartRate}</Text>
                </View>
              )}
              {patient.vitalSigns.temperature && (
                <View style={styles.vitalCard}>
                  <Text style={styles.vitalLabel}>Temperature</Text>
                  <Text style={styles.vitalValue}>{patient.vitalSigns.temperature}</Text>
                </View>
              )}
              {patient.vitalSigns.weight && (
                <View style={styles.vitalCard}>
                  <Text style={styles.vitalLabel}>Weight</Text>
                  <Text style={styles.vitalValue}>{patient.vitalSigns.weight}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Conditions */}
        {patient.conditions && patient.conditions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Conditions</Text>
            <View style={styles.listCard}>
              {patient.conditions.map((condition: string, index: number) => (
                <Text key={index} style={styles.listItem}>• {condition}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Medical History */}
        {patient.medicalHistory && patient.medicalHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Medical History</Text>
            <View style={styles.listCard}>
              {patient.medicalHistory.map((item: string, index: number) => (
                <Text key={index} style={styles.listItem}>• {item}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Current Medications */}
        {patient.currentMedications && patient.currentMedications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Medications</Text>
            <View style={styles.listCard}>
              {patient.currentMedications.map((medication: string, index: number) => (
                <Text key={index} style={styles.listItem}>• {medication}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Allergies */}
        {patient.allergies && patient.allergies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Allergies</Text>
            <View style={styles.listCard}>
              {patient.allergies.map((allergy: string, index: number) => (
                <Text key={index} style={styles.listItem}>• {allergy}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Appointment History */}
        {patient.appointmentHistory && patient.appointmentHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Visits</Text>
            {patient.appointmentHistory.slice(0, 5).map((visit: any, index: number) => (
              <View key={index} style={styles.visitCard}>
                <View style={styles.visitHeader}>
                  <Text style={styles.visitDate}>{new Date(visit.date).toLocaleDateString()}</Text>
                  <Text style={styles.visitType}>{visit.type}</Text>
                </View>
                <Text style={styles.visitNotes}>{visit.notes}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Upcoming Appointments */}
        {patient.upcomingAppointments && patient.upcomingAppointments.length > 0 && (
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
});