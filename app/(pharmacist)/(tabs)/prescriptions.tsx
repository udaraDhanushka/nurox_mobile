import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, FileText, Calendar, User, CheckCircle, Clock } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

// Mock prescription data for pharmacists
const mockPrescriptions = [
  {
    id: '1',
    patientName: 'John Doe',
    patientImage: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=987&auto=format&fit=crop',
    medication: 'Lisinopril 10mg',
    dosage: 'Once daily',
    quantity: '30 tablets',
    doctor: 'Dr. Sarah Johnson',
    dateReceived: '2023-11-15',
    status: 'pending',
    priority: 'normal',
    instructions: 'Take with food'
  },
  {
    id: '2',
    patientName: 'Emily Johnson',
    patientImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop',
    medication: 'Amoxicillin 500mg',
    dosage: 'Three times daily',
    quantity: '21 capsules',
    doctor: 'Dr. Michael Chen',
    dateReceived: '2023-11-15',
    status: 'pending',
    priority: 'urgent',
    instructions: 'Complete full course'
  },
  {
    id: '3',
    patientName: 'Michael Smith',
    patientImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop',
    medication: 'Ibuprofen 400mg',
    dosage: 'As needed',
    quantity: '20 tablets',
    doctor: 'Dr. Sarah Johnson',
    dateReceived: '2023-11-14',
    status: 'completed',
    priority: 'normal',
    instructions: 'Take with food, max 3 per day'
  },
  {
    id: '4',
    patientName: 'Sarah Wilson',
    patientImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=1974&auto=format&fit=crop',
    medication: 'Albuterol Inhaler',
    dosage: '2 puffs as needed',
    quantity: '1 inhaler',
    doctor: 'Dr. Lisa Brown',
    dateReceived: '2023-11-13',
    status: 'ready',
    priority: 'normal',
    instructions: 'Shake well before use'
  }
];

export default function PharmacistPrescriptionsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPrescriptions, setFilteredPrescriptions] = useState(mockPrescriptions);
  const [selectedStatus, setSelectedStatus] = useState('all');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterPrescriptions(query, selectedStatus);
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    filterPrescriptions(searchQuery, status);
  };

  const filterPrescriptions = (query: string, status: string) => {
    let filtered = mockPrescriptions;

    if (query.trim() !== '') {
      filtered = filtered.filter(prescription =>
        prescription.patientName.toLowerCase().includes(query.toLowerCase()) ||
        prescription.medication.toLowerCase().includes(query.toLowerCase()) ||
        prescription.doctor.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (status !== 'all') {
      filtered = filtered.filter(prescription => prescription.status === status);
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return COLORS.error;
      case 'high':
        return COLORS.warning;
      case 'normal':
        return COLORS.success;
      default:
        return COLORS.textSecondary;
    }
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
        {filteredPrescriptions.map((prescription) => (
          <TouchableOpacity
            key={prescription.id}
            style={styles.prescriptionCard}
            onPress={() => router.push(`/(pharmacist)/prescriptions/${prescription.id}`)}
          >
            <View style={styles.prescriptionHeader}>
              <Image source={{ uri: prescription.patientImage }} style={styles.patientImage} />
              <View style={styles.prescriptionInfo}>
                <Text style={styles.patientName}>{prescription.patientName}</Text>
                <Text style={styles.doctor}>{prescription.doctor}</Text>
              </View>
              <View style={styles.statusContainer}>
                <View style={[
                  styles.priorityBadge,
                  { backgroundColor: getPriorityColor(prescription.priority) + '20' }
                ]}>
                  <Text style={[
                    styles.priorityText,
                    { color: getPriorityColor(prescription.priority) }
                  ]}>
                    {prescription.priority}
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(prescription.status) + '20' }
                ]}>
                  {getStatusIcon(prescription.status)}
                  <Text style={[
                    styles.statusText,
                    { color: getStatusColor(prescription.status) }
                  ]}>
                    {prescription.status}
                  </Text>
                </View>
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
                  <Text style={styles.detailLabel}>Instructions:</Text>
                  <Text style={styles.detailValue}>{prescription.instructions}</Text>
                </View>
              </View>

              <View style={styles.prescriptionFooter}>
                <View style={styles.dateContainer}>
                  <Calendar size={14} color={COLORS.textSecondary} />
                  <Text style={styles.dateText}>Received: {prescription.dateReceived}</Text>
                </View>
                
                {prescription.status === 'pending' && (
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
});