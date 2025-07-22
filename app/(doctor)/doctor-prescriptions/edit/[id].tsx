// File: app/(doctor)/doctor-prescriptions/edit/[id].tsx
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../../../constants/theme';
import { Button } from '../../../../components/Button';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

// Mock prescription data matching the structure from New Prescription
const mockPrescriptions: Record<string, any> = {
  '1': {
    id: '1',
    patientId: '1',
    patientName: 'John Doe',
    patientAge: 42,
    date: '2023-11-15',
    status: 'active',
    doctorName: 'Dr. Sarah Johnson',
    condition: 'Hypertension and Type 2 Diabetes',
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
    date: '2023-11-12',
    status: 'active',
    doctorName: 'Dr. Sarah Johnson',
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

export default function EditPrescriptionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const originalPrescription = mockPrescriptions[id as string];
  
  const [patientName, setPatientName] = useState(originalPrescription?.patientName || '');
  const [patientId, setPatientId] = useState(originalPrescription?.patientId || '');
  const [condition, setCondition] = useState(originalPrescription?.condition || '');
  const [medications, setMedications] = useState<Medication[]>(originalPrescription?.medications || []);
  const [notes, setNotes] = useState(originalPrescription?.notes || '');
  const [pharmacy, setPharmacy] = useState(originalPrescription?.pharmacy || '');
  const [refillsRemaining, setRefillsRemaining] = useState(originalPrescription?.refillsRemaining?.toString() || '3');
  const [hasChanges, setHasChanges] = useState(false);

  if (!originalPrescription) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Prescription</Text>
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

  const handleMedicationChange = (index: number, field: keyof Medication, value: string) => {
    const newMedications = [...medications];
    newMedications[index] = { ...newMedications[index], [field]: value };
    setMedications(newMedications);
    setHasChanges(true);
  };

  const addMedication = () => {
    setMedications([...medications, {
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    }]);
    setHasChanges(true);
  };

  const removeMedication = (index: number) => {
    Alert.alert(
      'Remove Medication',
      'Are you sure you want to remove this medication?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const newMedications = medications.filter((_, i) => i !== index);
            setMedications(newMedications);
            setHasChanges(true);
          }
        }
      ]
    );
  };

  const handleSave = () => {
    // Validate required fields
    if (!patientName.trim()) {
      Alert.alert('Validation Error', 'Please enter patient name.');
      return;
    }

    if (!patientId.trim()) {
      Alert.alert('Validation Error', 'Please enter patient ID.');
      return;
    }

    if (!condition.trim()) {
      Alert.alert('Validation Error', 'Please enter condition/diagnosis.');
      return;
    }

    if (medications.length === 0) {
      Alert.alert('Validation Error', 'Please add at least one medication.');
      return;
    }

    const invalidMedication = medications.find(med => 
      !med.name.trim() || !med.dosage.trim() || !med.frequency.trim() || !med.duration.trim()
    );

    if (invalidMedication) {
      Alert.alert('Validation Error', 'Please fill in all required medication fields (name, dosage, frequency, duration).');
      return;
    }

    // Here you would save to your backend/database
    Alert.alert(
      'Prescription Updated',
      'The prescription has been updated successfully.',
      [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]
    );
  };

  const handleDiscard = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => router.back()
          }
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleDiscard}>
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Prescription</Text>
        <TouchableOpacity 
          style={hasChanges ? styles.saveButton : [styles.saveButton, styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!hasChanges}
        >
          <Save size={20} color={hasChanges ? COLORS.primary : COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Prescription Info */}
        <View style={styles.prescriptionInfo}>
          <Text style={styles.prescriptionId}>Prescription ID: #{originalPrescription.id}</Text>
          <Text style={styles.prescriptionDate}>Original Date: {originalPrescription.date}</Text>
          <Text style={styles.doctorName}>Doctor: {originalPrescription.doctorName}</Text>
        </View>

        {/* Patient Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Patient Name *</Text>
            <TextInput
              style={styles.textInput}
              value={patientName}
              onChangeText={(text) => {
                setPatientName(text);
                setHasChanges(true);
              }}
              placeholder="Enter patient name"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Patient ID *</Text>
            <TextInput
              style={styles.textInput}
              value={patientId}
              onChangeText={(text) => {
                setPatientId(text);
                setHasChanges(true);
              }}
              placeholder="Enter patient ID"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
        </View>

        {/* Condition Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Condition/Diagnosis</Text>
          <TextInput
            style={styles.textInput}
            value={condition}
            onChangeText={(text) => {
              setCondition(text);
              setHasChanges(true);
            }}
            placeholder="Enter condition being treated"
            placeholderTextColor={COLORS.textSecondary}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Medications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Medications</Text>
            <TouchableOpacity style={styles.addButton} onPress={addMedication}>
              <Plus size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {medications.map((medication, index) => (
            <View key={index} style={styles.medicationCard}>
              <View style={styles.medicationHeader}>
                <Text style={styles.medicationNumber}>Medication {index + 1}</Text>
                {medications.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeMedication(index)}
                  >
                    <Trash2 size={16} color={COLORS.error} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.medicationFields}>
                <View style={styles.fieldRow}>
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Medicine Name *</Text>
                    <TextInput
                      style={styles.fieldInput}
                      value={medication.name}
                      onChangeText={(text) => handleMedicationChange(index, 'name', text)}
                      placeholder="e.g. Metformin"
                      placeholderTextColor={COLORS.textSecondary}
                    />
                  </View>
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Dosage *</Text>
                    <TextInput
                      style={styles.fieldInput}
                      value={medication.dosage}
                      onChangeText={(text) => handleMedicationChange(index, 'dosage', text)}
                      placeholder="e.g. 500mg"
                      placeholderTextColor={COLORS.textSecondary}
                    />
                  </View>
                </View>

                <View style={styles.fieldRow}>
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Frequency *</Text>
                    <TextInput
                      style={styles.fieldInput}
                      value={medication.frequency}
                      onChangeText={(text) => handleMedicationChange(index, 'frequency', text)}
                      placeholder="e.g. Twice daily"
                      placeholderTextColor={COLORS.textSecondary}
                    />
                  </View>
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Duration *</Text>
                    <TextInput
                      style={styles.fieldInput}
                      value={medication.duration}
                      onChangeText={(text) => handleMedicationChange(index, 'duration', text)}
                      placeholder="e.g. 30 days"
                      placeholderTextColor={COLORS.textSecondary}
                    />
                  </View>
                </View>

                <View style={styles.fullWidthField}>
                  <Text style={styles.fieldLabel}>Instructions</Text>
                  <TextInput
                    style={[styles.fieldInput, styles.instructionsInput]}
                    value={medication.instructions}
                    onChangeText={(text) => handleMedicationChange(index, 'instructions', text)}
                    placeholder="e.g. Take with meals"
                    placeholderTextColor={COLORS.textSecondary}
                    multiline
                    numberOfLines={2}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Pharmacy Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pharmacy Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Pharmacy</Text>
            <TextInput
              style={styles.textInput}
              value={pharmacy}
              onChangeText={(text) => {
                setPharmacy(text);
                setHasChanges(true);
              }}
              placeholder="Enter pharmacy name"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Refills Remaining</Text>
            <TextInput
              style={styles.textInput}
              value={refillsRemaining}
              onChangeText={(text) => {
                setRefillsRemaining(text);
                setHasChanges(true);
              }}
              placeholder="e.g. 3"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes</Text>
          <TextInput
            style={[styles.textInput, styles.notesInput]}
            value={notes}
            onChangeText={(text) => {
              setNotes(text);
              setHasChanges(true);
            }}
            placeholder="Enter additional notes or instructions..."
            placeholderTextColor={COLORS.textSecondary}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Save Changes"
            onPress={handleSave}
            style={!hasChanges ? styles.saveButtonDisabled : styles.saveButtonLarge}
            disabled={!hasChanges}
          />
          
          <Button
            title="Discard Changes"
            variant="outline"
            onPress={handleDiscard}
            style={styles.discardButton}
          />
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
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // saveButtonDisabled: {
  //   opacity: 0.5,
  // },
  content: {
    flex: 1,
    padding: 16,
  },
  prescriptionInfo: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    ...SHADOWS.small,
  },
  prescriptionId: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  prescriptionDate: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  doctorName: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
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
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
    textAlignVertical: 'top',
  },
  notesInput: {
    minHeight: 80,
  },
  medicationCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicationNumber: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  removeButton: {
    padding: 4,
  },
  medicationFields: {
    gap: 12,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldContainer: {
    flex: 1,
  },
  fullWidthField: {
    width: '100%',
  },
  fieldLabel: {
    fontSize: SIZES.xs,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 10,
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
  },
  instructionsInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  actionButtons: {
    gap: 12,
    marginBottom: 24,
    marginTop: 8,
  },
  saveButtonLarge: {
    backgroundColor: COLORS.primary,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
    opacity: 0.6,
  },
  discardButton: {
    borderColor: COLORS.textSecondary,
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