import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, Plus, FileText, Calendar, User, Clock } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../../constants/theme';
import { useMedicalStore } from '../../../store/medicalStore';
import { LabTestRequest } from '../../../types/medical';

export default function DoctorLabRequestsScreen() {
  const router = useRouter();
  const { labTestRequests } = useMedicalStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const statusOptions = [
    { key: 'all', label: 'All', count: labTestRequests.length },
    { key: 'pending', label: 'Pending', count: labTestRequests.filter(r => r.status === 'pending').length },
    { key: 'approved', label: 'Approved', count: labTestRequests.filter(r => r.status === 'approved').length },
    { key: 'scheduled', label: 'Scheduled', count: labTestRequests.filter(r => r.status === 'scheduled').length },
    { key: 'completed', label: 'Completed', count: labTestRequests.filter(r => r.status === 'completed').length }
  ];

  const filteredRequests = labTestRequests.filter(request => {
    const matchesSearch = searchQuery === '' || 
      request.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.requestedTests.some(test => test.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return COLORS.warning;
      case 'approved':
        return COLORS.info;
      case 'scheduled':
        return COLORS.primary;
      case 'in_progress':
        return COLORS.secondary;
      case 'completed':
        return COLORS.success;
      case 'cancelled':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'stat':
        return COLORS.error;
      case 'urgent':
        return COLORS.warning;
      case 'routine':
        return COLORS.info;
      default:
        return COLORS.textSecondary;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lab Requests</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/(doctor)/doctor-lab-requests/new')}
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
            placeholder="Search lab requests..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Status Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.statusTabs}
        contentContainerStyle={styles.statusTabsContent}
      >
        {statusOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.statusTab,
              selectedStatus === option.key && styles.activeStatusTab
            ]}
            onPress={() => setSelectedStatus(option.key)}
          >
            <Text style={[
              styles.statusTabText,
              selectedStatus === option.key && styles.activeStatusTabText
            ]}>
              {option.label} ({option.count})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lab Requests List */}
      <ScrollView style={styles.requestsList} showsVerticalScrollIndicator={false}>
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <TouchableOpacity
              key={request.id}
              style={styles.requestCard}
              onPress={() => router.push({
                pathname: '/(doctor)/doctor-lab-requests/[id]',
                params: { id: request.id }
              })}
            >
              <View style={styles.requestHeader}>
                <View style={styles.patientInfo}>
                  <User size={20} color={COLORS.primary} />
                  <Text style={styles.patientName}>{request.patientName}</Text>
                </View>
                <View style={styles.statusContainer}>
                  <View style={[
                    styles.priorityBadge,
                    { backgroundColor: getPriorityColor(request.priority) + '20' }
                  ]}>
                    <Text style={[
                      styles.priorityText,
                      { color: getPriorityColor(request.priority) }
                    ]}>
                      {request.priority.toUpperCase()}
                    </Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(request.status) + '20' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(request.status) }
                    ]}>
                      {request.status}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.testsContainer}>
                <FileText size={16} color={COLORS.textSecondary} />
                <View style={styles.testsInfo}>
                  <Text style={styles.testsLabel}>Requested Tests:</Text>
                  <Text style={styles.testsText}>
                    {request.requestedTests.slice(0, 2).join(', ')}
                    {request.requestedTests.length > 2 && ` +${request.requestedTests.length - 2} more`}
                  </Text>
                </View>
              </View>

              {request.clinicalNotes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesLabel}>Clinical Notes:</Text>
                  <Text style={styles.notesText} numberOfLines={2}>
                    {request.clinicalNotes}
                  </Text>
                </View>
              )}

              <View style={styles.requestFooter}>
                <View style={styles.dateContainer}>
                  <Calendar size={14} color={COLORS.textSecondary} />
                  <Text style={styles.dateText}>
                    Requested: {formatDate(request.requestDate)}
                  </Text>
                </View>
                {request.expectedDate && (
                  <View style={styles.dateContainer}>
                    <Clock size={14} color={COLORS.textSecondary} />
                    <Text style={styles.dateText}>
                      Expected: {formatDate(request.expectedDate)}
                    </Text>
                  </View>
                )}
              </View>

              {request.assignedTestCenter && (
                <View style={styles.testCenterInfo}>
                  <Text style={styles.testCenterLabel}>Assigned to:</Text>
                  <Text style={styles.testCenterName}>{request.assignedTestCenter.name}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <FileText size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>No Lab Requests Found</Text>
            <Text style={styles.emptyDescription}>
              {searchQuery || selectedStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first lab request to get started'
              }
            </Text>
            {!searchQuery && selectedStatus === 'all' && (
              <TouchableOpacity
                style={styles.createFirstButton}
                onPress={() => router.push('/(doctor)/doctor-lab-requests/new')}
              >
                <Plus size={20} color={COLORS.white} />
                <Text style={styles.createFirstButtonText}>Create Lab Request</Text>
              </TouchableOpacity>
            )}
          </View>
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
  statusTabs: {
    maxHeight: 50,
    marginBottom: 16,
  },
  statusTabsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  statusTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeStatusTab: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  statusTabText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activeStatusTabText: {
    color: COLORS.white,
  },
  requestsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  requestCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.medium,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  patientName: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: SIZES.xs,
    fontWeight: '600',
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
  testsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  testsInfo: {
    flex: 1,
  },
  testsLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  testsText: {
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  notesContainer: {
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  notesText: {
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
  },
  testCenterInfo: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  testCenterLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  testCenterName: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
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
    lineHeight: 22,
    marginBottom: 24,
  },
  createFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  createFirstButtonText: {
    color: COLORS.white,
    fontSize: SIZES.md,
    fontWeight: '600',
  },
});