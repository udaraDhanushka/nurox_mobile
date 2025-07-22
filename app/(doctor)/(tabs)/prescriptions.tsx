import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, Plus, FileText, Calendar, User } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../../constants/theme';
import { prescriptionService } from '../../../services/prescriptionService';
import { useAuthStore } from '../../../store/authStore';

// Type for prescription items from the API
interface PrescriptionItem {
  medicine?: {
    name?: string;
  };
  name?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
}

// Type for prescription from the API
interface Prescription {
  id: string;
  patientName?: string;
  diagnosis?: string;
  items?: PrescriptionItem[];
  medications?: Array<{ name: string }>;
  condition?: string;
  date: string;
  status: string;
  patient?: {
    firstName?: string;
    lastName?: string;
    profileImage?: string;
  };
}

export default function DoctorPrescriptionsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPrescriptions();
  }, [user?.id]);

  const loadPrescriptions = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await prescriptionService.getPrescriptions({
        doctorId: user.id,
        limit: 50
      });
      setPrescriptions(response.prescriptions);
      setFilteredPrescriptions(response.prescriptions);
    } catch (error) {
      console.error('Failed to load prescriptions:', error);
      setError('Failed to load prescriptions');
      setPrescriptions([]);
      setFilteredPrescriptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredPrescriptions(prescriptions);
    } else {
      const filtered = prescriptions.filter(prescription =>
        (prescription.patientName && prescription.patientName.toLowerCase().includes(query.toLowerCase())) ||
        (prescription.items && prescription.items.some(item => 
          item.medicine?.name?.toLowerCase().includes(query.toLowerCase())
        )) ||
        (prescription.diagnosis && prescription.diagnosis.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredPrescriptions(filtered);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return COLORS.warning;
      case 'processing':
        return COLORS.primary;
      case 'ready':
        return COLORS.success;
      case 'dispensed':
        return COLORS.textSecondary;
      case 'cancelled':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPrimaryMedicine = (items: PrescriptionItem[] | undefined) => {
    if (!items || items.length === 0) return 'No medication';
    const firstItem = items[0];
    return firstItem.medicine?.name || firstItem.name || 'Unknown medication';
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
<<<<<<< Updated upstream
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
=======
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading prescriptions...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadPrescriptions}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredPrescriptions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FileText size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>No prescriptions found</Text>
            <Text style={styles.emptyDescription}>
              {searchQuery ? 'Try adjusting your search criteria' : 'Prescriptions you create will appear here'}
            </Text>
          </View>
        ) : (
          filteredPrescriptions.map((prescription) => (
            <TouchableOpacity
              key={prescription.id}
              style={styles.prescriptionCard}
              onPress={() => router.push({
                pathname: '/(doctor)/doctor-prescriptions/[id]',
                params: {id: prescription.id}
              })}
            >
              <View style={styles.prescriptionHeader}>
                <Image 
                  source={{ 
                    uri: prescription.patient?.profileImage || 
                    'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=987&auto=format&fit=crop' 
                  }} 
                  style={styles.patientImage} 
                />
                <View style={styles.prescriptionInfo}>
                  <Text style={styles.patientName}>
                    {prescription.patient ? 
                      `${prescription.patient.firstName} ${prescription.patient.lastName}` : 
                      prescription.patientName || 'Unknown Patient'
                    }
                  </Text>
                  <Text style={styles.condition}>
                    {prescription.diagnosis || 'No diagnosis specified'}
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(prescription.status) + '20' }
>>>>>>> Stashed changes
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: getStatusColor(prescription.status) }
                  ]}>
                    {prescription.status || 'pending'}
                  </Text>
                </View>
              </View>

              <View style={styles.medicationInfo}>
                <View style={styles.medicationHeader}>
                  <FileText size={20} color={COLORS.primary} />
                  <Text style={styles.medicationName}>
                    {getPrimaryMedicine(prescription.items)}
                    {prescription.items && prescription.items.length > 1 && 
                      ` +${prescription.items.length - 1} more`
                    }
                  </Text>
                </View>
                
                <View style={styles.prescriptionDetails}>
                  {prescription.items && prescription.items[0] && (
                    <>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Dosage:</Text>
                        <Text style={styles.detailValue}>
                          {prescription.items[0].dosage || 'Not specified'}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Frequency:</Text>
                        <Text style={styles.detailValue}>
                          {prescription.items[0].frequency || 'Not specified'}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Duration:</Text>
                        <Text style={styles.detailValue}>
                          {prescription.items[0].duration || 'Not specified'}
                        </Text>
                      </View>
                    </>
                  )}
                </View>

                <View style={styles.prescriptionFooter}>
                  <View style={styles.dateContainer}>
                    <Calendar size={14} color={COLORS.textSecondary} />
                    <Text style={styles.dateText}>
                      Created: {prescription.createdAt ? formatDate(prescription.createdAt) : 'Unknown'}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: SIZES.md,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    fontSize: SIZES.sm,
    color: COLORS.white,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});