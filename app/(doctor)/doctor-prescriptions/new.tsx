import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, Plus, X, User, FileText } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../../constants/theme';
import { Button } from '../../../components/Button';
import { useMedicineStore, Medicine } from '@/store/medicineStore';
import { useMedicalStore } from '../../../store/medicalStore';
import { useNotificationStore } from '../../../store/notificationStore';

interface SelectedMedicine {
  medicine: Medicine;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export default function NewPrescriptionScreen() {
  const router = useRouter();
  const { patientId, patientName } = useLocalSearchParams();
  const { medicines, searchMedicines } = useMedicineStore();
  const { addPrescription } = useMedicalStore();
  const { addNotification } = useNotificationStore();
  
  const [patientNameInput, setPatientNameInput] = useState('');
  const [patientIdInput, setPatientIdInput] = useState('');
  const [condition, setCondition] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedMedicines, setSelectedMedicines] = useState<SelectedMedicine[]>([]);
  const [showMedicineSearch, setShowMedicineSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Medicine[]>([]);

  // Pre-fill patient information if coming from patient detail screen
  useEffect(() => {
    if (patientName && typeof patientName === 'string') {
      setPatientNameInput(patientName);
    }
    if (patientId && typeof patientId === 'string') {
      setPatientIdInput(patientId);
    }
  }, [patientName, patientId]);

  const handleMedicineSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = searchMedicines(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const addMedicineToSelection = (medicine: Medicine) => {
    const isAlreadySelected = selectedMedicines.some(selected => selected.medicine.id === medicine.id);
    if (isAlreadySelected) {
      Alert.alert('Medicine Already Added', 'This medicine is already in the prescription.');
      return;
    }

    const newSelection: SelectedMedicine = {
      medicine,
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    };
    
    setSelectedMedicines([...selectedMedicines, newSelection]);
    setShowMedicineSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeMedicineFromSelection = (medicineId: string) => {
    setSelectedMedicines(selectedMedicines.filter(selected => selected.medicine.id !== medicineId));
  };

  const updateMedicineDetails = (medicineId: string, field: keyof Omit<SelectedMedicine, 'medicine'>, value: string) => {
    setSelectedMedicines(selectedMedicines.map(selected => 
      selected.medicine.id === medicineId 
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
        name: selected.medicine.name,
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Medications</Text>
            <TouchableOpacity
              style={styles.addMedicineButton}
              onPress={() => setShowMedicineSearch(true)}
            >
              <Plus size={20} color={COLORS.white} />
              <Text style={styles.addMedicineText}>Add Medicine</Text>
            </TouchableOpacity>
          </View>

          {selectedMedicines.map((selected, index) => (
            <View key={selected.medicine.id} style={styles.medicineCard}>
              <View style={styles.medicineHeader}>
                <Text style={styles.medicineName}>{selected.medicine.name}</Text>
                <TouchableOpacity
                  onPress={() => removeMedicineFromSelection(selected.medicine.id)}
                  style={styles.removeButton}
                >
                  <X size={20} color={COLORS.error} />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.medicineDescription}>{selected.medicine.description}</Text>
              
              <View style={styles.medicineDetailsForm}>
                <View style={styles.inputRow}>
                  <View style={styles.halfInput}>
                    <Text style={styles.inputLabel}>Dosage *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={selected.dosage}
                      onChangeText={(value) => updateMedicineDetails(selected.medicine.id, 'dosage', value)}
                      placeholder="e.g., 10mg"
                      placeholderTextColor={COLORS.textSecondary}
                    />
                  </View>
                  
                  <View style={styles.halfInput}>
                    <Text style={styles.inputLabel}>Frequency *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={selected.frequency}
                      onChangeText={(value) => updateMedicineDetails(selected.medicine.id, 'frequency', value)}
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
                    onChangeText={(value) => updateMedicineDetails(selected.medicine.id, 'duration', value)}
                    placeholder="e.g., 30 days"
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Instructions</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={selected.instructions}
                    onChangeText={(value) => updateMedicineDetails(selected.medicine.id, 'instructions', value)}
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

      {/* Medicine Search Modal */}
      {showMedicineSearch && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Medicine</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowMedicineSearch(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
              >
                <X size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <Search size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={handleMedicineSearch}
                placeholder="Search medicines..."
                placeholderTextColor={COLORS.textSecondary}
                autoFocus
              />
            </View>
            
            <ScrollView style={styles.searchResults}>
              {searchResults.map((medicine) => (
                <TouchableOpacity
                  key={medicine.id}
                  style={styles.medicineSearchItem}
                  onPress={() => addMedicineToSelection(medicine)}
                >
                  <Text style={styles.medicineSearchName}>{medicine.name}</Text>
                  <Text style={styles.medicineSearchDescription}>{medicine.description}</Text>
                  <Text style={styles.medicineSearchCategory}>{medicine.category}</Text>
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity
                style={styles.addNewMedicineButton}
                onPress={() => {
                  setShowMedicineSearch(false);
                  router.push('/(doctor)/medicines/new');
                }}
              >
                <Plus size={20} color={COLORS.primary} />
                <Text style={styles.addNewMedicineText}>Add New Medicine</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      )}
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    width: '100%',
    maxHeight: '80%',
    ...SHADOWS.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
  },
  searchResults: {
    flex: 1,
    paddingHorizontal: 16,
  },
  medicineSearchItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  medicineSearchName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  medicineSearchDescription: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  medicineSearchCategory: {
    fontSize: SIZES.xs,
    color: COLORS.primary,
    fontWeight: '500',
  },
  addNewMedicineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 8,
  },
  addNewMedicineText: {
    color: COLORS.primary,
    fontSize: SIZES.md,
    fontWeight: '500',
  },
});