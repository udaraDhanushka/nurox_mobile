// Updated app/(doctor)/doctor-prescriptions/[id].tsx - Synchronized with New Prescription
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, FileText, Printer, Share, Trash2, Edit } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../../constants/theme';
import { Button } from '@/components/Button';
import ShareModal from '@/components/ShareModal';
import { useMedicalStore } from '../../../store/medicalStore';

// Enhanced mock prescription data matching New Prescription structure
const mockPrescriptions: Record<string, any> = {
  '1': {
    id: '1',
    patientId: '1',
    patientName: 'John Doe',
    patientAge: 42,
    patientImage: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=987&auto=format&fit=crop',
    date: '2023-11-15',
    status: 'active',
    doctorName: 'Dr. Sarah Johnson',
    doctorSignature: 'Dr. Sarah Johnson, MD',
    condition: 'Hypertension and Type 2 Diabetes', // Changed from 'diagnosis' to 'condition'
    medications: [
      {
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        duration: '30 days',
        instructions: 'Take with meals'
      },
      {
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        duration: '30 days',
        instructions: 'Take in the morning'
      }
    ],
    notes: 'Monitor blood pressure and glucose levels. Follow up in 2 weeks.',
    pharmacy: 'City Medical Pharmacy',
    refillsRemaining: 3
  },
  '2': {
    id: '2',
    patientId: '2',
    patientName: 'Emily Johnson',
    patientAge: 35,
    patientImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop',
    date: '2023-11-12',
    status: 'active',
    doctorName: 'Dr. Sarah Johnson',
    doctorSignature: 'Dr. Sarah Johnson, MD',
    condition: 'Diabetes Type 2',
    medications: [
      {
        name: 'Insulin',
        dosage: '10 units',
        frequency: 'Before meals',
        duration: '30 days',
        instructions: 'Inject subcutaneously'
      }
    ],
    notes: 'Continue monitoring blood sugar levels.',
    pharmacy: 'Downtown Pharmacy',
    refillsRemaining: 2
  }
};

export default function PrescriptionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { updatePrescription } = useMedicalStore();
  
  // Local state to manage prescription status and share modal
  const [prescriptionData, setPrescriptionData] = useState(mockPrescriptions[id as string]);
  const [shareModalVisible, setShareModalVisible] = useState(false);

  if (!prescriptionData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Prescription Details</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Prescription not found</Text>
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
      case 'active':
        return COLORS.success;
      case 'cancelled':
        return COLORS.error;
      case 'completed':
        return COLORS.primary;
      default:
        return COLORS.textSecondary;
    }
  };

  const handleCancelPrescription = () => {
    Alert.alert(
      'Cancel Prescription',
      'Are you sure you want to cancel this prescription? This action cannot be undone.',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            // Update the local state to reflect the cancellation
            const updatedPrescription = {
              ...prescriptionData,
              status: 'cancelled'
            };
            setPrescriptionData(updatedPrescription);
            
            // Update the store
            updatePrescription(prescriptionData.id, { status: 'cancelled' });
            
            Alert.alert(
              'Prescription Cancelled', 
              'The prescription has been cancelled successfully.',
              [
                {
                  text: 'OK',
                  onPress: () => router.back()
                }
              ]
            );
          },          
        },
      ]
    );
  };

  const handleEditPrescription = () => {
    // Navigate to edit prescription screen
    router.push({
      pathname: '/(doctor)/doctor-prescriptions/edit/[id]',
      params: { id: prescriptionData.id }
    });
  };

  const handlePrintPrescription = () => {
    Alert.alert('Print Prescription', 'Print functionality would be implemented here.');
  };

  const handleSharePrescription = () => {
    setShareModalVisible(true);
  };

  const handleCreateNewPrescription = () => {
    // Navigate to new prescription with patient data pre-filled
    router.push({
      pathname: '/(doctor)/doctor-prescriptions/new',
      params: { 
        patientId: prescriptionData.patientId,
        patientName: prescriptionData.patientName 
      }
    });
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
        <Text style={styles.headerTitle}>Prescription Details</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleSharePrescription}
          >
            <Share size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handlePrintPrescription}
          >
            <Printer size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Badge */}
        <View style={[
          styles.statusBadgeContainer,
          { backgroundColor: `${getStatusColor(prescriptionData.status)}20` }
        ]}>
          <Text style={[
            styles.statusBadgeText,
            { color: getStatusColor(prescriptionData.status) }
          ]}>
            {prescriptionData.status.charAt(0).toUpperCase() + prescriptionData.status.slice(1)}
          </Text>
        </View>

        {/* Prescription Header */}
        <View style={styles.prescriptionHeader}>
          <Text style={styles.prescriptionTitle}>PRESCRIPTION</Text>
          <Text style={styles.prescriptionDate}>Date: {prescriptionData.date}</Text>
          <Text style={styles.prescriptionId}>ID: #{prescriptionData.id}</Text>
        </View>

        {/* Patient Information */}
        <View style={styles.patientCard}>
          <Image
            source={{ uri: prescriptionData.patientImage }}
            style={styles.patientImage}
          />
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{prescriptionData.patientName}</Text>
            <Text style={styles.patientAge}>Age: {prescriptionData.patientAge}</Text>
            <Text style={styles.patientId}>Patient ID: {prescriptionData.patientId}</Text>
          </View>
        </View>

        {/* Condition/Diagnosis */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Condition/Diagnosis</Text>
          <Text style={styles.conditionText}>{prescriptionData.condition}</Text>
        </View>

        {/* Medications */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Prescribed Medications</Text>
          {prescriptionData.medications.map((medication: any, index: number) => (
            <View key={index} style={[
              styles.medicationItem,
              index === prescriptionData.medications.length - 1 ? styles.lastMedicationItem : null
            ]}>
              <View style={styles.medicationHeader}>
                <Text style={styles.medicationName}>{medication.name}</Text>
                <Text style={styles.medicationDosage}>{medication.dosage}</Text>
              </View>
              <View style={styles.medicationDetails}>
                <Text style={styles.medicationFrequency}>Frequency: {medication.frequency}</Text>
                <Text style={styles.medicationDuration}>Duration: {medication.duration}</Text>
                {medication.instructions && (
                  <Text style={styles.medicationInstructions}>Instructions: {medication.instructions}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Pharmacy Information */}
        {prescriptionData.pharmacy && (
          <View style={styles.detailsCard}>
            <Text style={styles.cardTitle}>Pharmacy Information</Text>
            <Text style={styles.pharmacyText}>{prescriptionData.pharmacy}</Text>
            <Text style={styles.refillsText}>Refills Remaining: {prescriptionData.refillsRemaining}</Text>
          </View>
        )}

        {/* Doctor's Notes */}
        {prescriptionData.notes && (
          <View style={styles.detailsCard}>
            <Text style={styles.cardTitle}>Additional Notes</Text>
            <Text style={styles.notesText}>{prescriptionData.notes}</Text>
          </View>
        )}

        {/* Doctor Signature */}
        <View style={styles.signatureCard}>
          <Text style={styles.signatureLabel}>Prescribed by:</Text>
          <Text style={styles.doctorSignature}>{prescriptionData.doctorSignature}</Text>
          <Text style={styles.signatureDate}>{prescriptionData.date}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {prescriptionData.status === 'active' && (
            <>
              <Button
                title="Edit Prescription"
                onPress={handleEditPrescription}
                style={styles.editButton}
                icon={<Edit size={20} color={COLORS.white} />}
              />
              
              <Button
                title="Create New Prescription"
                variant="outline"
                onPress={handleCreateNewPrescription}
                style={styles.newPrescriptionButton}
                icon={<FileText size={20} color={COLORS.primary} />}
              />
              
              <Button
                title="Cancel Prescription"
                variant="outline"
                onPress={handleCancelPrescription}
                style={styles.cancelButton}
                textStyle={styles.cancelButtonText}
                icon={<Trash2 size={20} color={COLORS.error} />}
              />
            </>
          )}

          {prescriptionData.status === 'cancelled' && (
            <View style={styles.cancelledNotice}>
              <Text style={styles.cancelledText}>This prescription has been cancelled</Text>
              <Button
                title="Create New Prescription"
                onPress={handleCreateNewPrescription}
                style={styles.newPrescriptionButtonSmall}
                icon={<FileText size={20} color={COLORS.white} />}
              />
            </View>
          )}

          {prescriptionData.status === 'completed' && (
            <View style={styles.completedNotice}>
              <Text style={styles.completedText}>This prescription has been completed</Text>
              <Button
                title="Create New Prescription"
                onPress={handleCreateNewPrescription}
                style={styles.newPrescriptionButtonSmall}
                icon={<FileText size={20} color={COLORS.white} />}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Share Modal */}
      <ShareModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        prescription={prescriptionData}
      />
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
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
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
  prescriptionHeader: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    ...SHADOWS.small,
  },
  prescriptionTitle: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  prescriptionDate: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  prescriptionId: {
    fontSize: SIZES.xs,
    color: COLORS.textTertiary,
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  patientImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  patientAge: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  patientId: {
    fontSize: SIZES.xs,
    color: COLORS.textTertiary,
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
    marginBottom: 12,
  },
  conditionText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  medicationItem: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 12,
    marginBottom: 12,
  },
  lastMedicationItem: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicationName: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  medicationDosage: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  medicationDetails: {
    gap: 4,
  },
  medicationFrequency: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  medicationDuration: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  medicationInstructions: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  pharmacyText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  refillsText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  notesText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  signatureCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'flex-end',
    marginBottom: 20,
    ...SHADOWS.small,
  },
  signatureLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  doctorSignature: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  signatureDate: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 24,
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  newPrescriptionButton: {
    borderColor: COLORS.primary,
  },
  newPrescriptionButtonSmall: {
    backgroundColor: COLORS.primary,
    marginTop: 12,
  },
  cancelButton: {
    borderColor: COLORS.error,
  },
  cancelButtonText: {
    color: COLORS.error,
  },
  cancelledNotice: {
    backgroundColor: COLORS.error + '20',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelledText: {
    color: COLORS.error,
    fontSize: SIZES.md,
    fontWeight: '600',
  },
  completedNotice: {
    backgroundColor: COLORS.success + '20',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  completedText: {
    color: COLORS.success,
    fontSize: SIZES.md,
    fontWeight: '600',
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