import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Edit, Trash2, AlertTriangle, Shield, Pill } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../../constants/theme';
import { medicineService, Medicine } from '../../../services/medicineService';

export default function MedicineDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadMedicine(id);
    }
  }, [id]);

  const loadMedicine = async (medicineId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const medicineData = await medicineService.getMedicine(medicineId);
      setMedicine(medicineData);
    } catch (error) {
      console.error('Error loading medicine:', error);
      setError(error instanceof Error ? error.message : 'Failed to load medicine');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (!medicine) return;

    Alert.alert(
      'Delete Medicine',
      `Are you sure you want to delete "${medicine.name}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await medicineService.deleteMedicine(medicine.id);
              Alert.alert(
                'Success',
                'Medicine deleted successfully.',
                [
                  {
                    text: 'OK',
                    onPress: () => router.back(),
                  },
                ]
              );
            } catch (error) {
              Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Failed to delete medicine'
              );
            }
          },
        },
      ]
    );
  };

  const formatMedicineName = () => {
    if (!medicine) return '';
    let name = medicine.name;
    if (medicine.strength && medicine.unit) {
      name += ` ${medicine.strength}${medicine.unit}`;
    }
    return name;
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
          <Text style={styles.headerTitle}>Medicine Details</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading medicine details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !medicine) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Medicine Details</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Medicine not found'}</Text>
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
        <Text style={styles.headerTitle}>Medicine Details</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/(doctor)/medicines/${id}/edit`)}
          >
            <Edit size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleDelete}
          >
            <Trash2 size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Medicine Header */}
        <View style={styles.medicineHeader}>
          <View style={styles.medicineIcon}>
            <Pill size={32} color={COLORS.primary} />
          </View>
          <View style={styles.medicineInfo}>
            <Text style={styles.medicineName}>{formatMedicineName()}</Text>
            {medicine.genericName && (
              <Text style={styles.medicineGeneric}>Generic: {medicine.genericName}</Text>
            )}
            {medicine.brand && medicine.brand !== medicine.name && (
              <Text style={styles.medicineBrand}>Brand: {medicine.brand}</Text>
            )}
          </View>
        </View>

        {/* Status Badges */}
        <View style={styles.badgeContainer}>
          <View style={[styles.badge, styles.typeBadge]}>
            <Text style={styles.badgeText}>{medicine.type}</Text>
          </View>
          {medicine.isControlled && (
            <View style={[styles.badge, styles.controlledBadge]}>
              <Shield size={12} color={COLORS.white} />
              <Text style={styles.badgeText}>Controlled</Text>
            </View>
          )}
          {medicine.requiresPrescription && (
            <View style={[styles.badge, styles.prescriptionBadge]}>
              <Text style={styles.badgeText}>Prescription Required</Text>
            </View>
          )}
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          {medicine.description && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Description</Text>
              <Text style={styles.infoValue}>{medicine.description}</Text>
            </View>
          )}
          
          {medicine.manufacturer && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Manufacturer</Text>
              <Text style={styles.infoValue}>{medicine.manufacturer}</Text>
            </View>
          )}
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type</Text>
            <Text style={styles.infoValue}>{medicine.type}</Text>
          </View>
          
          {medicine.strength && medicine.unit && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Strength</Text>
              <Text style={styles.infoValue}>{medicine.strength} {medicine.unit}</Text>
            </View>
          )}
        </View>

        {/* Safety Information */}
        {(medicine.sideEffects && medicine.sideEffects.length > 0) || 
         (medicine.contraindications && medicine.contraindications.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Safety Information</Text>
            
            {medicine.sideEffects && medicine.sideEffects.length > 0 && (
              <View style={styles.safetyCard}>
                <View style={styles.safetyHeader}>
                  <AlertTriangle size={16} color={COLORS.warning} />
                  <Text style={styles.safetyTitle}>Side Effects</Text>
                </View>
                <View style={styles.listContainer}>
                  {medicine.sideEffects.map((effect, index) => (
                    <Text key={index} style={styles.listItem}>• {effect}</Text>
                  ))}
                </View>
              </View>
            )}
            
            {medicine.contraindications && medicine.contraindications.length > 0 && (
              <View style={styles.safetyCard}>
                <View style={styles.safetyHeader}>
                  <Shield size={16} color={COLORS.error} />
                  <Text style={styles.safetyTitle}>Contraindications</Text>
                </View>
                <View style={styles.listContainer}>
                  {medicine.contraindications.map((contraindication, index) => (
                    <Text key={index} style={styles.listItem}>• {contraindication}</Text>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Metadata */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Active Status</Text>
            <Text style={[
              styles.infoValue,
              { color: medicine.isActive ? COLORS.success : COLORS.error }
            ]}>
              {medicine.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created</Text>
            <Text style={styles.infoValue}>
              {new Date(medicine.createdAt).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Updated</Text>
            <Text style={styles.infoValue}>
              {new Date(medicine.updatedAt).toLocaleDateString()}
            </Text>
          </View>
          
          {medicine._count?.prescriptionItems !== undefined && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Times Prescribed</Text>
              <Text style={styles.infoValue}>{medicine._count.prescriptionItems}</Text>
            </View>
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: SIZES.md,
    color: COLORS.error,
    textAlign: 'center',
  },
  medicineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  medicineIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: SIZES.xl,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  medicineGeneric: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  medicineBrand: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  typeBadge: {
    backgroundColor: COLORS.primary,
  },
  controlledBadge: {
    backgroundColor: COLORS.warning,
  },
  prescriptionBadge: {
    backgroundColor: COLORS.info,
  },
  badgeText: {
    fontSize: SIZES.xs,
    color: COLORS.white,
    fontWeight: '500',
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
    flex: 2,
    textAlign: 'right',
  },
  safetyCard: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  safetyTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  listContainer: {
    gap: 4,
  },
  listItem: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});