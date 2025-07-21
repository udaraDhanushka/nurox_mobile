import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../../constants/theme';
import { Button } from '../../../components/Button';
import { useMedicineStore } from '../../../store/medicineStore';
import { medicineService } from '../../../services/medicineService';

export default function NewMedicineScreen() {
  const router = useRouter();
  const { addMedicine, refreshMedicines } = useMedicineStore();
  
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    brand: '',
    type: 'Tablet',
    strength: '',
    unit: 'mg',
    description: '',
    manufacturer: '',
    isControlled: false,
    requiresPrescription: true
  });
  
  const [sideEffects, setSideEffects] = useState('');
  const [contraindications, setContraindications] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const medicineTypes = medicineService.getMedicineTypes();
  const units = ['mg', 'mcg', 'g', 'ml', 'L', 'IU', '%', 'units'];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Please enter the medicine name.');
      return false;
    }
    if (!formData.type.trim()) {
      Alert.alert('Validation Error', 'Please select a medicine type.');
      return false;
    }
    return true;
  };

  const handleCreateMedicine = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Parse side effects and contraindications from comma-separated strings
      const parsedSideEffects = sideEffects.split(',').map(s => s.trim()).filter(s => s);
      const parsedContraindications = contraindications.split(',').map(s => s.trim()).filter(s => s);

      const medicineData = {
        ...formData,
        sideEffects: parsedSideEffects,
        contraindications: parsedContraindications
      };

      await addMedicine(medicineData);
      await refreshMedicines();

      Alert.alert(
        'Success',
        'Medicine has been added successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error creating medicine:', error);
      Alert.alert(
        'Error', 
        error instanceof Error ? error.message : 'Failed to create medicine. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
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
        <Text style={styles.headerTitle}>Add New Medicine</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Medicine Name *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Enter medicine name"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Generic Name</Text>
            <TextInput
              style={styles.textInput}
              value={formData.genericName}
              onChangeText={(value) => handleInputChange('genericName', value)}
              placeholder="Enter generic name"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Brand Name</Text>
            <TextInput
              style={styles.textInput}
              value={formData.brand}
              onChangeText={(value) => handleInputChange('brand', value)}
              placeholder="Enter brand name"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
        </View>

        {/* Medicine Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medicine Details</Text>
          
          <View style={styles.inputRow}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Type *</Text>
              <View style={styles.pickerContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {medicineTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        formData.type === type && styles.typeButtonActive
                      ]}
                      onPress={() => handleInputChange('type', type)}
                    >
                      <Text style={[
                        styles.typeButtonText,
                        formData.type === type && styles.typeButtonTextActive
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>
          
          <View style={styles.inputRow}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Strength</Text>
              <TextInput
                style={styles.textInput}
                value={formData.strength}
                onChangeText={(value) => handleInputChange('strength', value)}
                placeholder="e.g., 500"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Unit</Text>
              <View style={styles.pickerContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {units.map((unit) => (
                    <TouchableOpacity
                      key={unit}
                      style={[
                        styles.unitButton,
                        formData.unit === unit && styles.unitButtonActive
                      ]}
                      onPress={() => handleInputChange('unit', unit)}
                    >
                      <Text style={[
                        styles.unitButtonText,
                        formData.unit === unit && styles.unitButtonTextActive
                      ]}>
                        {unit}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Manufacturer</Text>
            <TextInput
              style={styles.textInput}
              value={formData.manufacturer}
              onChangeText={(value) => handleInputChange('manufacturer', value)}
              placeholder="Enter manufacturer name"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              placeholder="Enter description of the medicine"
              placeholderTextColor={COLORS.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Safety Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Side Effects</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={sideEffects}
              onChangeText={setSideEffects}
              placeholder="Enter side effects separated by commas"
              placeholderTextColor={COLORS.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Contraindications</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={contraindications}
              onChangeText={setContraindications}
              placeholder="Enter contraindications separated by commas"
              placeholderTextColor={COLORS.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Regulatory Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Regulatory Information</Text>
          
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => handleInputChange('isControlled', !formData.isControlled)}
            >
              <View style={[
                styles.checkboxInner,
                formData.isControlled && styles.checkboxActive
              ]} />
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>Controlled Substance</Text>
          </View>
          
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => handleInputChange('requiresPrescription', !formData.requiresPrescription)}
            >
              <View style={[
                styles.checkboxInner,
                formData.requiresPrescription && styles.checkboxActive
              ]} />
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>Requires Prescription</Text>
          </View>
        </View>

        <Button
          title="Add Medicine"
          onPress={handleCreateMedicine}
          loading={isLoading}
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
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
  },
  pickerContainer: {
    marginTop: 8,
  },
  typeButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: COLORS.white,
  },
  unitButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  unitButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  unitButtonText: {
    fontSize: SIZES.xs,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  unitButtonTextActive: {
    color: COLORS.white,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
  },
  checkboxLabel: {
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  createButton: {
    marginBottom: 24,
  },
});