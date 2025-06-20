import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  Modal
} from 'react-native';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Plus,
  Trash2,
  Pill,
  Clock,
  Zap,
  Eye,
  EyeOff,
  Info,
  Target,
  X
} from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { Button } from '@/components/Button';

interface ReviewDetectedMedicinesScreenProps {
  detectedMedicines: DetectedMedicine[];
  onConfirm: (result: UploadResult) => void;
  onBack: () => void;
}

interface DetectedMedicine {
  id?: string;
  name: string;
  dosage: string;
  frequency: string;
  confidence: number;
  detected: boolean;
  isVerified?: boolean;
  notes?: string;
}

interface UploadResult {
  type: 'photo' | 'gallery' | 'pdf';
  uri: string;
  fileName: string;
  detectedMedicines: DetectedMedicine[];
  confidence: number;
  processingTime: number;
}

export default function ReviewDetectedMedicinesScreen({
  detectedMedicines: initialMedicines,
  onConfirm,
  onBack
}: ReviewDetectedMedicinesScreenProps) {
  const [medicines, setMedicines] = useState<DetectedMedicine[]>(
    initialMedicines.map((med, index) => ({
      ...med,
      id: med.id || `medicine_${index}`,
      isVerified: false
    }))
  );
  const [showLowConfidence, setShowLowConfidence] = useState(true);
  const [editingMedicine, setEditingMedicine] = useState<DetectedMedicine | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const averageConfidence = medicines.reduce((sum, med) => sum + med.confidence, 0) / medicines.length;
  const verifiedCount = medicines.filter(med => med.isVerified).length;
  const highConfidenceMedicines = medicines.filter(med => med.confidence >= 0.8);
  const lowConfidenceMedicines = medicines.filter(med => med.confidence < 0.8);

  const handleMedicineToggle = (medicineId: string) => {
    setMedicines(prev => prev.map(med => 
      med.id === medicineId 
        ? { ...med, isVerified: !med.isVerified }
        : med
    ));
  };

  const handleEditMedicine = (medicine: DetectedMedicine) => {
    setEditingMedicine(medicine);
  };

  const handleSaveEdit = (updatedMedicine: DetectedMedicine) => {
    setMedicines(prev => prev.map(med => 
      med.id === updatedMedicine.id ? updatedMedicine : med
    ));
    setEditingMedicine(null);
  };

  const handleDeleteMedicine = (medicineId: string) => {
    Alert.alert(
      'Delete Medicine',
      'Are you sure you want to remove this medicine from the list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setMedicines(prev => prev.filter(med => med.id !== medicineId));
          }
        }
      ]
    );
  };

  const handleAddMedicine = (newMedicine: Omit<DetectedMedicine, 'id'>) => {
    const medicine: DetectedMedicine = {
      ...newMedicine,
      id: `manual_${Date.now()}`,
      confidence: 1.0, // Manual entries have 100% confidence
      detected: false, // Manual entry, not detected
      isVerified: true
    };
    setMedicines(prev => [...prev, medicine]);
    setShowAddModal(false);
  };

  const handleConfirmUpload = () => {
    if (verifiedCount === 0) {
      Alert.alert(
        'No Medicines Verified',
        'Please verify at least one medicine before continuing.',
        [{ text: 'OK' }]
      );
      return;
    }

    const result: UploadResult = {
      type: 'photo', // This would be passed from the actual upload type
      uri: 'file://mock-prescription.jpg',
      fileName: 'prescription_upload.jpg',
      detectedMedicines: medicines.filter(med => med.isVerified),
      confidence: averageConfidence,
      processingTime: 8.5
    };

    onConfirm(result);
  };

  const renderMedicineCard = (medicine: DetectedMedicine) => {
    const isLowConfidence = medicine.confidence < 0.8;
    
    if (!showLowConfidence && isLowConfidence) return null;

    return (
      <View key={medicine.id} style={[
        styles.medicineCard,
        medicine.isVerified && styles.medicineCardVerified,
        isLowConfidence && styles.medicineCardLowConfidence
      ]}>
        <View style={styles.medicineHeader}>
          <View style={styles.medicineMainInfo}>
            <View style={styles.medicineNameRow}>
              <Pill size={18} color={medicine.isVerified ? COLORS.success : COLORS.primary} />
              <Text style={[
                styles.medicineName,
                medicine.isVerified && styles.medicineNameVerified
              ]}>
                {medicine.name}
              </Text>
              {medicine.detected && (
                <View style={[
                  styles.confidenceBadge,
                  isLowConfidence && styles.confidenceBadgeLow
                ]}>
                  <Target size={12} color={COLORS.white} />
                  <Text style={styles.confidenceText}>
                    {Math.round(medicine.confidence * 100)}%
                  </Text>
                </View>
              )}
            </View>
            
            <Text style={styles.medicineDosage}>{medicine.dosage}</Text>
            <View style={styles.medicineFrequency}>
              <Clock size={14} color={COLORS.textSecondary} />
              <Text style={styles.medicineFrequencyText}>{medicine.frequency}</Text>
            </View>
            
            {medicine.notes && (
              <Text style={styles.medicineNotes}>Note: {medicine.notes}</Text>
            )}
          </View>

          <View style={styles.medicineActions}>
            <Switch
              value={medicine.isVerified}
              onValueChange={() => handleMedicineToggle(medicine.id!)}
              trackColor={{ false: COLORS.lightGray, true: COLORS.success + '40' }}
              thumbColor={medicine.isVerified ? COLORS.success : COLORS.white}
            />
          </View>
        </View>

        {isLowConfidence && (
          <View style={styles.warningContainer}>
            <AlertTriangle size={16} color={COLORS.warning} />
            <Text style={styles.warningText}>
              Low confidence detection. Please verify this medicine carefully.
            </Text>
          </View>
        )}

        <View style={styles.medicineFooter}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditMedicine(medicine)}
          >
            <Edit3 size={16} color={COLORS.primary} />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteMedicine(medicine.id!)}
          >
            <Trash2 size={16} color={COLORS.error} />
            <Text style={[styles.actionButtonText, { color: COLORS.error }]}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Medicines</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary Stats */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{medicines.length}</Text>
            <Text style={styles.summaryLabel}>Detected</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: COLORS.success }]}>
              {verifiedCount}
            </Text>
            <Text style={styles.summaryLabel}>Verified</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: COLORS.primary }]}>
              {Math.round(averageConfidence * 100)}%
            </Text>
            <Text style={styles.summaryLabel}>Confidence</Text>
          </View>
        </View>

        <View style={styles.filterControls}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowLowConfidence(!showLowConfidence)}
          >
            {showLowConfidence ? (
              <Eye size={16} color={COLORS.textPrimary} />
            ) : (
              <EyeOff size={16} color={COLORS.textSecondary} />
            )}
            <Text style={[
              styles.filterButtonText,
              !showLowConfidence && { color: COLORS.textSecondary }
            ]}>
              Show Low Confidence ({lowConfidenceMedicines.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Medicines List */}
      <ScrollView style={styles.medicinesList} showsVerticalScrollIndicator={false}>
        {medicines.length > 0 ? (
          medicines.map(renderMedicineCard)
        ) : (
          <View style={styles.emptyState}>
            <Pill size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyStateTitle}>No Medicines Detected</Text>
            <Text style={styles.emptyStateText}>
              Tap the + button to manually add medicines
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <View style={styles.instructionItem}>
          <Info size={16} color={COLORS.primary} />
          <Text style={styles.instructionText}>
            Toggle the switch to verify medicines you want to save
          </Text>
        </View>
        <Text style={styles.instructionSubtext}>
          You can edit, add, or remove medicines before saving
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.backToEditButton} onPress={onBack}>
          <Text style={styles.backToEditButtonText}>Back to Edit</Text>
        </TouchableOpacity>
        
        <Button
          title={`Save ${verifiedCount} Medicine${verifiedCount !== 1 ? 's' : ''}`}
          onPress={handleConfirmUpload}
          disabled={verifiedCount === 0}
          style={[styles.confirmButton, verifiedCount === 0 && styles.confirmButtonDisabled]}
        />
      </View>

      {/* Edit Medicine Modal */}
      {editingMedicine && (
        <EditMedicineModal
          medicine={editingMedicine}
          onSave={handleSaveEdit}
          onCancel={() => setEditingMedicine(null)}
        />
      )}

      {/* Add Medicine Modal */}
      <AddMedicineModal
        visible={showAddModal}
        onAdd={handleAddMedicine}
        onCancel={() => setShowAddModal(false)}
      />
    </View>
  );
}

// Edit Medicine Modal Component
const EditMedicineModal = ({ 
  medicine, 
  onSave, 
  onCancel 
}: { 
  medicine: DetectedMedicine; 
  onSave: (medicine: DetectedMedicine) => void; 
  onCancel: () => void; 
}) => {
  const [name, setName] = useState(medicine.name);
  const [dosage, setDosage] = useState(medicine.dosage);
  const [frequency, setFrequency] = useState(medicine.frequency);
  const [notes, setNotes] = useState(medicine.notes || '');

  const handleSave = () => {
    if (!name.trim() || !dosage.trim() || !frequency.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    onSave({
      ...medicine,
      name: name.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      notes: notes.trim() || undefined
    });
  };

  return (
    <Modal visible={true} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Edit Medicine</Text>
          <TouchableOpacity onPress={onCancel}>
            <X size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <FormField label="Medicine Name *" value={name} onChangeText={setName} />
          <FormField label="Dosage *" value={dosage} onChangeText={setDosage} />
          <FormField label="Frequency *" value={frequency} onChangeText={setFrequency} />
          <FormField 
            label="Notes (Optional)" 
            value={notes} 
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </ScrollView>
        
        <View style={styles.modalActions}>
          <TouchableOpacity style={styles.modalCancelButton} onPress={onCancel}>
            <Text style={styles.modalCancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Button title="Save Changes" onPress={handleSave} style={styles.modalSaveButton} />
        </View>
      </View>
    </Modal>
  );
};

// Add Medicine Modal Component
const AddMedicineModal = ({ 
  visible, 
  onAdd, 
  onCancel 
}: { 
  visible: boolean; 
  onAdd: (medicine: Omit<DetectedMedicine, 'id'>) => void; 
  onCancel: () => void; 
}) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [notes, setNotes] = useState('');

  const handleAdd = () => {
    if (!name.trim() || !dosage.trim() || !frequency.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    onAdd({
      name: name.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      notes: notes.trim() || undefined,
      confidence: 1.0,
      detected: false
    });

    // Reset form
    setName('');
    setDosage('');
    setFrequency('');
    setNotes('');
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add Medicine</Text>
          <TouchableOpacity onPress={onCancel}>
            <X size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <FormField label="Medicine Name *" value={name} onChangeText={setName} />
          <FormField label="Dosage *" value={dosage} onChangeText={setDosage} />
          <FormField label="Frequency *" value={frequency} onChangeText={setFrequency} />
          <FormField 
            label="Notes (Optional)" 
            value={notes} 
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </ScrollView>
        
        <View style={styles.modalActions}>
          <TouchableOpacity style={styles.modalCancelButton} onPress={onCancel}>
            <Text style={styles.modalCancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Button title="Add Medicine" onPress={handleAdd} style={styles.modalSaveButton} />
        </View>
      </View>
    </Modal>
  );
};

// Form Field Component
const FormField = ({ 
  label, 
  value, 
  onChangeText, 
  multiline = false, 
  numberOfLines = 1 
}: any) => (
  <View style={styles.formField}>
    <Text style={styles.formLabel}>{label}</Text>
    <TextInput
      style={[styles.formInput, multiline && styles.formInputMultiline]}
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      numberOfLines={numberOfLines}
      placeholderTextColor={COLORS.textSecondary}
    />
  </View>
);

// Styles continue...
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
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  addButton: {
    width: 32,
    height: 32,
    backgroundColor: COLORS.primary + '20',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContainer: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: SIZES.xl,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  summaryLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  filterControls: {
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.veryLightGray,
    borderRadius: 20,
    gap: 8,
  },
  filterButtonText: {
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
  },
  medicinesList: {
    flex: 1,
    padding: 16,
  },
  medicineCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.small,
  },
  medicineCardVerified: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success + '05',
  },
  medicineCardLowConfidence: {
    borderColor: COLORS.warning,
    backgroundColor: COLORS.warning + '05',
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  medicineMainInfo: {
    flex: 1,
  },
  medicineNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  medicineName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  medicineNameVerified: {
    color: COLORS.success,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  confidenceBadgeLow: {
    backgroundColor: COLORS.warning,
  },
  confidenceText: {
    fontSize: SIZES.xs,
    color: COLORS.white,
    fontWeight: '600',
  },
  medicineDosage: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  medicineFrequency: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  medicineFrequencyText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  medicineNotes: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  medicineActions: {
    justifyContent: 'center',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '10',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    gap: 8,
  },
  warningText: {
    fontSize: SIZES.xs,
    color: COLORS.warning,
    flex: 1,
  },
  medicineFooter: {
    flexDirection: 'row',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionButtonText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 12,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  instructionsContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  instructionText: {
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
    flex: 1,
  },
  instructionSubtext: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: 24,
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  backToEditButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  backToEditButtonText: {
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  confirmButton: {
    flex: 2,
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
    opacity: 0.6,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formField: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
  },
  formInputMultiline: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  modalSaveButton: {
    flex: 1,
  },
});