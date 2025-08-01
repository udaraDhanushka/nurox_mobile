import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, Plus, X, User, FileText } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../../constants/theme';
import { Button } from '../../../components/Button';
import { useMedicineStore, Medicine } from '@/store/medicineStore';
import { HybridMedicineInput } from '@/components/HybridMedicineInput';
import { useMedicalStore } from '../../../store/medicalStore';
import { useNotificationStore } from '../../../store/notificationStore';

interface SelectedMedicine {
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export default function NewPrescriptionScreen() {
  const router = useRouter();
  const { patientId, patientName } = useLocalSearchParams();
  const { addPrescription } = useMedicalStore();
  const { addNotification } = useNotificationStore();
  
  const [patientNameInput, setPatientNameInput] = useState('');
  const [patientIdInput, setPatientIdInput] = useState('');
  const [condition, setCondition] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedMedicines, setSelectedMedicines] = useState<SelectedMedicine[]>([]);

  // Pre-fill patient information if coming from patient detail screen
  useEffect(() => {
    if (patientName && typeof patientName === 'string') {
      setPatientNameInput(patientName);
    }
    if (patientId && typeof patientId === 'string') {
      setPatientIdInput(patientId);
    }
  }, [patientName, patientId]);

    if (isAlreadySelected) {
      Alert.alert('Medicine Already Added', 'This medicine is already in the prescription.');
      return;
    }

    const newSelection: SelectedMedicine = {
      medicine,
      medicineDisplay,
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    };
    
    setSelectedMedicines([...selectedMedicines, newSelection]);
        ? { ...selected, [field]: value }
        : selected
    ));
  };

  const validateForm = () => {
    if (!patientNameInput.trim()) {
      Alert.alert('Validation Error', 'Please enter patient name.');
      return false;
    }
    if (!patientIdInput.trim()) {
      Alert.alert('Validation Error', 'Please enter patient ID.');
      return false;
    }
    if (!condition.trim()) {
      Alert.alert('Validation Error', 'Please enter the condition being treated.');
      return false;
    }
    if (selectedMedicines.length === 0) {
      Alert.alert('Validation Error', 'Please add at least one medicine.');
      return false;
    }
    
    for (const selected of selectedMedicines) {
      if (!selected.dosage.trim() || !selected.frequency.trim() || !selected.duration.trim()) {
        Alert.alert('Validation Error', `Please fill in all details for ${selected.medicine.name}.`);
        return false;
      }
    }
    
    return true;
  };

  const handleCreatePrescription = () => {
    if (!validateForm()) return;

    const newPrescription = {
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString().split('T')[0],
      doctorName: 'Dr. Sarah Johnson', // This would come from auth context
      patientName: patientNameInput,
      patientId: patientIdInput,
      condition,
      medications: selectedMedicines.map(selected => ({
        dosage: selected.dosage,
        frequency: selected.frequency,
        duration: selected.duration,
        instructions: selected.instructions
      })),
      pharmacy: '', // Will be selected by patient
      refillsRemaining: 3, // Default value
      status: 'active' as const,
      notes
    };

    addPrescription(newPrescription);
    
    // Add notification for the patient
    addNotification({
      title: 'New Prescription',
      message: `Dr. Sarah Johnson has prescribed new medication for ${condition}`,
      type: 'prescription',
      priority: 'high'
    });

    Alert.alert(
      'Prescription Created',
      'The prescription has been successfully created and sent to the patient.',
      [
        {
          text: 'OK',
          onPress: () => {
            // If we came from a patient detail screen, go back to it
            if (patientId) {
              router.push(`/(doctor)/doctor-patients/${patientId}`);
            } else {
              router.back();
            }
          }
        }
      ]
    );
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
        <Text style={styles.headerTitle}>New Prescription</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Patient Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Patient Name *</Text>
            <TextInput
              style={styles.textInput}
              value={patientNameInput}
              onChangeText={setPatientNameInput}
              placeholder="Enter patient name"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Patient ID *</Text>
            <TextInput
              style={styles.textInput}
              value={patientIdInput}
              onChangeText={setPatientIdInput}
              placeholder="Enter patient ID"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Condition/Diagnosis *</Text>
            <TextInput
              style={styles.textInput}
              value={condition}
              onChangeText={setCondition}
              placeholder="Enter condition being treated"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
        </View>

        {/* Medications */}
        <View style={styles.section}>
                  style={styles.removeButton}
                >
                  <X size={20} color={COLORS.error} />
                </TouchableOpacity>
              </View>
              <View style={styles.medicineDetailsForm}>
                <View style={styles.inputRow}>
                  <View style={styles.halfInput}>
                    <Text style={styles.inputLabel}>Dosage *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={selected.dosage}
                      placeholder="e.g., 10mg"
                      placeholderTextColor={COLORS.textSecondary}
                    />
                  </View>
                  
                  <View style={styles.halfInput}>
                    <Text style={styles.inputLabel}>Frequency *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={selected.frequency}
                      placeholder="e.g., Twice daily"
                      placeholderTextColor={COLORS.textSecondary}
                    />
                  </View>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Duration *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={selected.duration}
                    placeholder="e.g., 30 days"
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Instructions</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={selected.instructions}
                    placeholder="Special instructions for taking this medicine"
                    placeholderTextColor={COLORS.textSecondary}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Additional Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional notes or instructions for the patient"
            placeholderTextColor={COLORS.textSecondary}
            multiline
            numberOfLines={4}
          />
        </View>

        <Button
          title="Create Prescription"
          onPress={handleCreatePrescription}
          style={styles.createButton}
        />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: SIZES.sm,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  addMedicineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addMedicineText: {
    color: COLORS.white,
    fontSize: SIZES.sm,
    fontWeight: '500',
  },
  medicineCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.small,
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicineName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  removeButton: {
    padding: 4,
  },
  medicineDescription: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  medicineDetailsForm: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 16,
  },
  createButton: {
    marginBottom: 24,
  },
});