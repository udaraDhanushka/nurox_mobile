import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, Plus, FileText, Calendar, User } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../../constants/theme';

// Mock prescription data for doctors
const mockPrescriptions = [
  {
    id: '1',
    patientName: 'John Doe',
    patientImage: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=987&auto=format&fit=crop',
    medication: 'Lisinopril 10mg',
    dosage: 'Once daily',
    quantity: '30 tablets',
    refills: 2,
    dateIssued: '2023-11-10',
    status: 'active',
    condition: 'Hypertension'
  },
  {
    id: '2',
    patientName: 'Emily Johnson',
    patientImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop',
    medication: 'Metformin 500mg',
    dosage: 'Twice daily',
    quantity: '60 tablets',
    refills: 3,
    dateIssued: '2023-11-08',
    status: 'active',
    condition: 'Diabetes Type 2'
  },
  {
    id: '3',
    patientName: 'Michael Smith',
    patientImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop',
    medication: 'Ibuprofen 400mg',
    dosage: 'As needed',
    quantity: '20 tablets',
    refills: 1,
    dateIssued: '2023-11-05',
    status: 'completed',
    condition: 'Arthritis'
  },
  {
    id: '4',
    patientName: 'Sarah Wilson',
    patientImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=1974&auto=format&fit=crop',
    medication: 'Albuterol Inhaler',
    dosage: '2 puffs as needed',
    quantity: '1 inhaler',
    refills: 2,
    dateIssued: '2023-11-12',
    status: 'active',
    condition: 'Asthma'
  }
];

export default function DoctorPrescriptionsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPrescriptions, setFilteredPrescriptions] = useState(mockPrescriptions);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredPrescriptions(mockPrescriptions);
    } else {
      const filtered = mockPrescriptions.filter(prescription =>
        prescription.patientName.toLowerCase().includes(query.toLowerCase()) ||
        prescription.medication.toLowerCase().includes(query.toLowerCase()) ||
        prescription.condition.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredPrescriptions(filtered);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return COLORS.success;
      case 'completed':
        return COLORS.textSecondary;
      case 'expired':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Prescriptions</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/(doctor)/doctor-prescriptions/new')}
        >
          <Plus size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search prescriptions..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Prescriptions List */}
      <ScrollView style={styles.prescriptionsList} showsVerticalScrollIndicator={false}>
        {filteredPrescriptions.map((prescription) => (
          <TouchableOpacity
            key={prescription.id}
            style={styles.prescriptionCard}
            onPress={() => router.push({
              pathname: '/(doctor)/doctor-prescriptions/[id]',
              params: {id: prescription.id}
            })}
          >
            <View style={styles.prescriptionHeader}>
              <Image source={{ uri: prescription.patientImage }} style={styles.patientImage} />
              <View style={styles.prescriptionInfo}>
                <Text style={styles.patientName}>{prescription.patientName}</Text>
                <Text style={styles.condition}>{prescription.condition}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(prescription.status) + '20' }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: getStatusColor(prescription.status) }
                ]}>
                  {prescription.status}
                </Text>
              </View>
            </View>

            <View style={styles.medicationInfo}>
              <View style={styles.medicationHeader}>
                <FileText size={20} color={COLORS.primary} />
                <Text style={styles.medicationName}>{prescription.medication}</Text>
              </View>
              
              <View style={styles.prescriptionDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Dosage:</Text>
                  <Text style={styles.detailValue}>{prescription.dosage}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Quantity:</Text>
                  <Text style={styles.detailValue}>{prescription.quantity}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Refills:</Text>
                  <Text style={styles.detailValue}>{prescription.refills} remaining</Text>
                </View>
              </View>

              <View style={styles.prescriptionFooter}>
                <View style={styles.dateContainer}>
                  <Calendar size={14} color={COLORS.textSecondary} />
                  <Text style={styles.dateText}>Issued: {prescription.dateIssued}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
    paddingVertical: 16,
  },
  title: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    ...SHADOWS.small,
  },
  searchInput: {
    flex: 1,
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  prescriptionsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  prescriptionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.medium,
  },
  prescriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  patientImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  prescriptionInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  condition: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: SIZES.xs,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  medicationInfo: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 16,
  },
  medicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  medicationName: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  prescriptionDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  prescriptionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
  },
});