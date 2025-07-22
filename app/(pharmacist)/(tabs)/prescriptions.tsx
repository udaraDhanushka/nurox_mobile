import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, FileText, Calendar, User, CheckCircle, Clock } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { formatAge } from '../../../utils/dateUtils';
import { patientDataService } from '../../../services/patientDataService';
import { prescriptionService } from '../../../services/prescriptionService';
import { usePatientSyncListener } from '../../../hooks/usePatientSyncListener';
import { useAuthStore } from '../../../store/authStore';

export default function PharmacistPrescriptionsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen for patient updates across apps
  const { recentUpdates, refreshPatientData, hasUpdates } = usePatientSyncListener();

  useEffect(() => {
    loadPrescriptions();
  }, [user?.id]);

  // Refresh prescription data when patient updates are detected
  useEffect(() => {
    if (hasUpdates) {
      console.log('Patient updates detected in pharmacist app, refreshing data...');
      // Refresh prescription data to get updated patient information
      loadPrescriptions();
    }
  }, [recentUpdates, hasUpdates]);

  const loadPrescriptions = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      // Get prescriptions for pharmacists (status: PENDING, PROCESSING, READY)
      const response = await prescriptionService.getPrescriptions({
        status: 'PENDING,PROCESSING,READY',
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
    filterPrescriptions(query, selectedStatus);
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    filterPrescriptions(searchQuery, status);
  };

  const filterPrescriptions = (query: string, status: string) => {
    let filtered = prescriptions;

    if (query.trim() !== '') {
      filtered = filtered.filter(prescription => {
        const patientName = prescription.patient ? 
          `${prescription.patient.firstName} ${prescription.patient.lastName}` : '';
        const doctorName = prescription.doctor ? 
          `${prescription.doctor.firstName} ${prescription.doctor.lastName}` : '';
        const medicationName = prescription.items?.[0]?.medicine?.name || '';
        
        return patientName.toLowerCase().includes(query.toLowerCase()) ||
               medicationName.toLowerCase().includes(query.toLowerCase()) ||
               doctorName.toLowerCase().includes(query.toLowerCase());
      });
    }

    if (status !== 'all') {
      filtered = filtered.filter(prescription => 
        prescription.status?.toLowerCase() === status.toLowerCase()
      );
    }

    setFilteredPrescriptions(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return COLORS.warning;
      case 'ready':
        return COLORS.success;
      case 'completed':
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} color={getStatusColor(status)} />;
      case 'ready':
        return <CheckCircle size={16} color={getStatusColor(status)} />;
      case 'completed':
        return <CheckCircle size={16} color={getStatusColor(status)} />;
      default:
        return <FileText size={16} color={getStatusColor(status)} />;
    }
  };

  const statusFilters = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'ready', label: 'Ready' },
    { key: 'completed', label: 'Completed' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Prescriptions</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Search */}
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
      </View>

      {/* Status Filters */}
      <View style={styles.statusFilters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {statusFilters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.statusFilter,
                selectedStatus === filter.key && styles.selectedStatusFilter
              ]}
              onPress={() => handleStatusFilter(filter.key)}
            >
              <Text style={[
                styles.statusFilterText,
                selectedStatus === filter.key && styles.selectedStatusFilterText
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Prescriptions List */}
      <ScrollView style={styles.prescriptionsList} showsVerticalScrollIndicator={false}>
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
              {searchQuery ? 'Try adjusting your search criteria' : 'Prescriptions will appear here when patients submit them'}
            </Text>
          </View>
        ) : (
          filteredPrescriptions.map((prescription) => (
            <TouchableOpacity
              key={prescription.id}
              style={styles.prescriptionCard}
              onPress={() => router.push(`/(pharmacist)/prescriptions/${prescription.id}`)}
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
                      'Unknown Patient'
                    }
                  </Text>
                  <Text style={styles.patientAge}>
                    {(() => {
                      if (prescription.patient?.dateOfBirth) {
                        return formatAge(prescription.patient.dateOfBirth);
                      }
                      const cachedPatient = patientDataService.getCachedPatientData(prescription.patientId);
                      return cachedPatient?.dateOfBirth ? formatAge(cachedPatient.dateOfBirth) : 'Age unknown';
                    })()}
                  </Text>
                  <Text style={styles.doctor}>
                    {prescription.doctor ? 
                      `Dr. ${prescription.doctor.firstName} ${prescription.doctor.lastName}` : 
                      'Unknown Doctor'
                    }
                  </Text>
                </View>
                <View style={styles.statusContainer}>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(prescription.status || 'pending') + '20' }
                  ]}>
                    {getStatusIcon(prescription.status || 'pending')}
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(prescription.status || 'pending') }
                    ]}>
                      {prescription.status || 'pending'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.medicationInfo}>
                <View style={styles.medicationHeader}>
                  <FileText size={20} color={COLORS.primary} />
                  <Text style={styles.medicationName}>
                    {prescription.items?.[0]?.medicine?.name || 'Unknown medication'}
                    {prescription.items && prescription.items.length > 1 && 
                      ` +${prescription.items.length - 1} more`
                    }
                  </Text>
                </View>
                
                <View style={styles.prescriptionDetails}>
                  {prescription.items?.[0] && (
                    <>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Dosage:</Text>
                        <Text style={styles.detailValue}>
                          {prescription.items[0].dosage || 'Not specified'}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Quantity:</Text>
                        <Text style={styles.detailValue}>
                          {prescription.items[0].quantity || 'Not specified'}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Instructions:</Text>
                        <Text style={styles.detailValue}>
                          {prescription.items[0].instructions || prescription.notes || 'No special instructions'}
                        </Text>
                      </View>
                    </>
                  )}
                </View>

                <View style={styles.prescriptionFooter}>
                  <View style={styles.dateContainer}>
                    <Calendar size={14} color={COLORS.textSecondary} />
                    <Text style={styles.dateText}>
                      Created: {prescription.createdAt ? new Date(prescription.createdAt).toLocaleDateString() : 'Unknown'}
                    </Text>
                  </View>
                  
                  {(prescription.status === 'pending' || prescription.status === 'PENDING') && (
                    <TouchableOpacity 
                      style={styles.processButton}
                      onPress={() => router.push(`/(pharmacist)/prescriptions/${prescription.id}/process`)}
                    >
                      <Text style={styles.processButtonText}>Process</Text>
                    </TouchableOpacity>
                  )}
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
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInputContainer: {
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
  statusFilters: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statusFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  selectedStatusFilter: {
    backgroundColor: COLORS.primary,
  },
  statusFilterText: {
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  selectedStatusFilterText: {
    color: COLORS.white,
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
    marginBottom: 2,
  },
  patientAge: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  doctor: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  statusContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: SIZES.xs,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
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
    flex: 1,
  },
  detailValue: {
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
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
  processButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  processButtonText: {
    fontSize: SIZES.xs,
    color: COLORS.white,
    fontWeight: '600',
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