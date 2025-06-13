import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  SafeAreaView,
  Switch
} from 'react-native';
import {
  X,
  MapPin,
  Phone,
  Clock,
  Pill,
  Bell,
  AlertTriangle
} from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { Button } from '@/components/Button';

interface SendPrescriptionModalProps {
  visible: boolean;
  pharmacy: any; // Replace with proper Pharmacy type
  prescriptionMedicines: string[];
  onConfirm: (details: any) => void; // Replace with proper SendPrescriptionDetails type
  onCancel: () => void;
}

export default function SendPrescriptionModal({
  visible,
  pharmacy,
  prescriptionMedicines,
  onConfirm,
  onCancel
}: SendPrescriptionModalProps) {
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [urgency, setUrgency] = useState<'routine' | 'urgent'>('routine');
  const [notifyWhenReady, setNotifyWhenReady] = useState(true);

  const handleConfirm = () => {
    if (!pharmacy) return;

    const sendDetails = {
      pharmacy,
      prescriptionMedicines,
      specialInstructions: specialInstructions.trim(),
      urgency,
      notifyWhenReady
    };

    onConfirm(sendDetails);
  };

  const getAvailableMedicines = () => {
    if (!pharmacy?.medicines) return [];

    return pharmacy.medicines.filter((medicine: any) =>
      prescriptionMedicines.some(prescMed =>
        medicine.medicineName.toLowerCase().includes(prescMed.toLowerCase()) &&
        medicine.inStock
      )
    );
  };

  const availableMedicines = getAvailableMedicines();
  const totalPrice = availableMedicines.reduce((sum: number, med: any) => sum + med.price, 0);

  if (!pharmacy) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onCancel}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Send Prescription</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
            <X size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Pharmacy Info */}
          <View style={styles.pharmacyCard}>
            <Text style={styles.pharmacyName}>{pharmacy.name}</Text>
            <View style={styles.pharmacyDetails}>
              <View style={styles.pharmacyDetailItem}>
                <MapPin size={16} color={COLORS.textSecondary} />
                <Text style={styles.pharmacyDetailText}>{pharmacy.address}</Text>
              </View>
              <View style={styles.pharmacyDetailItem}>
                <Phone size={16} color={COLORS.textSecondary} />
                <Text style={styles.pharmacyDetailText}>{pharmacy.phone}</Text>
              </View>
              <View style={styles.pharmacyDetailItem}>
                <Clock size={16} color={pharmacy.isOpen ? COLORS.success : COLORS.textSecondary} />
                <Text style={[
                  styles.pharmacyDetailText,
                  { color: pharmacy.isOpen ? COLORS.success : COLORS.textSecondary }
                ]}>
                  {pharmacy.workingHours.open === '24 Hours'
                    ? 'Open 24 Hours'
                    : `${pharmacy.workingHours.open} - ${pharmacy.workingHours.close}`
                  }
                  {pharmacy.isOpen ? ' • Open now' : ' • Closed'}
                </Text>
              </View>
            </View>
          </View>

          {/* Medicine Availability */}
          <View style={styles.medicineCard}>
            <Text style={styles.sectionTitle}>Available Medicines</Text>
            {availableMedicines.length > 0 ? (
              <>
                {availableMedicines.map((med: any, index: number) => (
                  <View key={index} style={styles.medicineItem}>
                    <View style={styles.medicineItemLeft}>
                      <View style={styles.medicineHeader}>
                        <Pill size={16} color={COLORS.primary} />
                        <Text style={styles.medicineName}>{med.medicineName}</Text>
                      </View>
                      <Text style={styles.medicineStock}>In stock: {med.quantity} units</Text>
                    </View>
                    <Text style={styles.medicinePrice}>LKR {med.price.toFixed(2)}</Text>
                  </View>
                ))}

                <View style={styles.totalPrice}>
                  <Text style={styles.totalPriceLabel}>Total Estimated Cost:</Text>
                  <Text style={styles.totalPriceValue}>LKR {totalPrice.toFixed(2)}</Text>
                </View>
              </>
            ) : (
              <View style={styles.noMedicinesContainer}>
                <AlertTriangle size={24} color={COLORS.warning} />
                <Text style={styles.noMedicinesText}>
                  No prescribed medicines are currently available at this pharmacy.
                </Text>
              </View>
            )}
          </View>

          {/* Urgency Setting */}
          <View style={styles.settingsCard}>
            <Text style={styles.sectionTitle}>Prescription Options</Text>

            <View style={styles.urgencyContainer}>
              <Text style={styles.settingLabel}>Urgency Level</Text>
              <View style={styles.urgencyButtons}>
                <TouchableOpacity
                  style={[
                    styles.urgencyButton,
                    urgency === 'routine' && styles.urgencyButtonActive
                  ]}
                  onPress={() => setUrgency('routine')}
                >
                  <Text style={[
                    styles.urgencyButtonText,
                    urgency === 'routine' && styles.urgencyButtonTextActive
                  ]}>
                    Routine
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.urgencyButton,
                    urgency === 'urgent' && styles.urgencyButtonActive
                  ]}
                  onPress={() => setUrgency('urgent')}
                >
                  <Text style={[
                    styles.urgencyButtonText,
                    urgency === 'urgent' && styles.urgencyButtonTextActive
                  ]}>
                    Urgent
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.notificationSetting}>
              <View style={styles.notificationLabel}>
                <Bell size={20} color={COLORS.textPrimary} />
                <Text style={styles.settingLabel}>Notify when ready</Text>
              </View>
              <Switch
                value={notifyWhenReady}
                onValueChange={setNotifyWhenReady}
                trackColor={{ false: COLORS.lightGray, true: COLORS.primary + '40' }}
                thumbColor={notifyWhenReady ? COLORS.primary : COLORS.white}
              />
            </View>
          </View>

          {/* Special Instructions */}
          <View style={styles.instructionsCard}>
            <Text style={styles.sectionTitle}>Special Instructions</Text>
            <TextInput
              style={styles.instructionsInput}
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
              placeholder="Add any special instructions for the pharmacy..."
              placeholderTextColor={COLORS.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>
        </ScrollView>

        {/* Footer Actions - Only one footer now */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <Button
            title={pharmacy.isOpen ? "Send Prescription" : "Pharmacy Closed"}
            onPress={handleConfirm}
            style={[
              styles.confirmButton,
              !pharmacy.isOpen ? styles.confirmButtonDisabled : null
            ]}
            disabled={!pharmacy.isOpen}
          />
        </View>
      </SafeAreaView>
    </Modal>
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
  headerTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  pharmacyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  pharmacyName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  pharmacyDetails: {
    gap: 8,
  },
  pharmacyDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pharmacyDetailText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  medicineCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  sectionTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  medicineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicineItemLeft: {
    flex: 1,
  },
  medicineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  medicineName: {
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  medicineStock: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
  },
  medicinePrice: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  totalPrice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
    marginTop: 8,
  },
  totalPriceLabel: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  totalPriceValue: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  noMedicinesContainer: {
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  noMedicinesText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  settingsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  settingLabel: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  urgencyContainer: {
    marginBottom: 16,
  },
  urgencyButtons: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  urgencyButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  urgencyButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  urgencyButtonText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  urgencyButtonTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  notificationSetting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  instructionsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  instructionsInput: {
    backgroundColor: COLORS.veryLightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 2,
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
    opacity: 0.6,
  },
});