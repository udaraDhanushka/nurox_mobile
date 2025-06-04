import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Pill, Calendar } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../../../constants/theme';
import { useMedicalStore, PrescriptionStatus, Prescription } from '../../../../store/medicalStore';
import { useTranslation } from '../../../../hooks/useTranslation';

export default function PrescriptionsScreen() {
  const router = useRouter();
  const { prescriptions } = useMedicalStore();
  const [filter, setFilter] = useState<PrescriptionStatus | 'all'>('all');
  const { t } = useTranslation();
  
  const filteredPrescriptions = filter === 'all' 
    ? prescriptions 
    : prescriptions.filter(prescription => prescription.status === filter);
  
  const sortedPrescriptions = [...filteredPrescriptions].sort((a, b) => {
    // Sort by date (newest first)
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const renderPrescriptionItem = ({ item }: { item: Prescription }) => (
    <TouchableOpacity 
      style={styles.prescriptionCard}
      onPress={() => router.push(`/records/prescriptions/${item.id}`)}
    >
      <View style={styles.prescriptionHeader}>
        <View style={styles.medicationInfo}>
          <Pill size={20} color={COLORS.primary} />
          <Text style={styles.medicationName}>
            {item.medications.length > 1 
              ? `${item.medications[0].name} +${item.medications.length - 1} more` 
              : item.medications[0].name}
          </Text>
        </View>
        <View style={[
          styles.statusBadge, 
          item.status === 'active' ? styles.activeBadge : 
          item.status === 'completed' ? styles.completedBadge : 
          item.status === 'expired' ? styles.expiredBadge : styles.cancelledBadge
        ]}>
          <Text style={styles.statusText}>{t(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.prescriptionDetails}>
        <Text style={styles.prescriptionDoctor}>Dr. {item.doctorName}</Text>
        <View style={styles.dateContainer}>
          <Calendar size={14} color={COLORS.textSecondary} />
          <Text style={styles.prescriptionDate}>{item.date}</Text>
        </View>
      </View>
      
      <View style={styles.prescriptionFooter}>
        <Text style={styles.prescriptionPharmacy}>{item.pharmacy}</Text>
        <Text style={styles.refillsText}>
          {t('refills')}: {item.refillsRemaining}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('prescriptions')}</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={styles.filterContainer}>
        {(['all', 'active', 'completed', 'expired', 'cancelled'] as const).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              filter === status && styles.filterButtonActive
            ]}
            onPress={() => setFilter(status)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === status && styles.filterButtonTextActive
              ]}
            >
              {status === 'all' ? t('all') : t(status)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {sortedPrescriptions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Pill size={60} color={COLORS.lightGray} />
          <Text style={styles.emptyText}>
            {filter === 'active' ? t('noActivePrescriptions') : t('noActivePrescriptions')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedPrescriptions}
          renderItem={renderPrescriptionItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: COLORS.veryLightGray,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
  },
  filterButtonTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  prescriptionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.small,
  },
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  medicationName: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  completedBadge: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
  },
  cancelledBadge: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  expiredBadge: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
  },
  statusText: {
    fontSize: SIZES.xs,
    fontWeight: '500',
    color: COLORS.textPrimary,
    textTransform: 'capitalize',
  },
  prescriptionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  prescriptionDoctor: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prescriptionDate: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  prescriptionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  prescriptionPharmacy: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  refillsText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: SIZES.md,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
});