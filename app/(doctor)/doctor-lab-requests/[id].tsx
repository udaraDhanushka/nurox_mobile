import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  User, 
  FileText, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit
} from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../../constants/theme';
import { Button } from '../../../components/Button';
import { useMedicalStore } from '../../../store/medicalStore';
import { LabTestRequest } from '../../../types/medical';

export default function LabRequestDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { labTestRequests, updateLabTestRequest, deleteLabTestRequest, convertLabRequestToReport } = useMedicalStore();
  
  const request = labTestRequests.find(r => r.id === id);
  
  if (!request) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lab Request</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Lab request not found</Text>
        </View>
      </SafeAreaView>
    );
  }

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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleStatusUpdate = (newStatus: string) => {
    if (newStatus === 'completed') {
      Alert.alert(
        'Complete Lab Request',
        'This will generate mock lab results and create a lab report for the patient. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Complete',
            onPress: () => {
              // Generate mock results based on the requested tests
              const mockResults = request.requestedTests.map(testName => {
                if (testName.toLowerCase().includes('blood count') || testName.toLowerCase().includes('cbc')) {
                  return {
                    name: 'White Blood Cell Count',
                    value: '6.8 x10^9/L',
                    normalRange: '4.0-11.0 x10^9/L',
                    isNormal: true
                  };
                } else if (testName.toLowerCase().includes('cholesterol')) {
                  return {
                    name: 'Total Cholesterol',
                    value: '195 mg/dL',
                    normalRange: '<200 mg/dL',
                    isNormal: true
                  };
                } else {
                  return {
                    name: testName,
                    value: 'Normal',
                    normalRange: 'Within normal limits',
                    isNormal: true
                  };
                }
              });

              // Convert lab request to lab report with results
              convertLabRequestToReport(request.id, mockResults);
              
              Alert.alert(
                'Lab Request Completed', 
                'Lab results have been generated and the patient has been notified.',
                [{ text: 'OK', onPress: () => router.back() }]
              );
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'Update Status',
        `Are you sure you want to update the status to "${newStatus}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Update',
            onPress: () => {
              updateLabTestRequest(request.id, { status: newStatus as any });
              Alert.alert('Success', 'Lab request status updated successfully.');
            }
          }
        ]
      );
    }
  };

  const handleCancelRequest = () => {
    Alert.alert(
      'Cancel Lab Request',
      'Are you sure you want to cancel this lab request? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            updateLabTestRequest(request.id, { status: 'cancelled' });
            Alert.alert('Cancelled', 'Lab request has been cancelled.', [
              { text: 'OK', onPress: () => router.back() }
            ]);
          }
        }
      ]
    );
  };

  const handleDeleteRequest = () => {
    Alert.alert(
      'Delete Lab Request',
      'Are you sure you want to delete this lab request? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Delete',
          style: 'destructive',
          onPress: () => {
            deleteLabTestRequest(request.id);
            Alert.alert('Deleted', 'Lab request has been deleted.', [
              { text: 'OK', onPress: () => router.back() }
            ]);
          }
        }
      ]
    );
  };

  const getAvailableActions = () => {
    switch (request.status) {
      case 'pending':
        return [
          { label: 'Approve', status: 'approved', color: COLORS.success },
          { label: 'Cancel', action: 'cancel', color: COLORS.error }
        ];
      case 'approved':
        return [
          { label: 'Schedule', status: 'scheduled', color: COLORS.primary },
          { label: 'Cancel', action: 'cancel', color: COLORS.error }
        ];
      case 'scheduled':
        return [
          { label: 'Mark In Progress', status: 'in_progress', color: COLORS.secondary },
          { label: 'Cancel', action: 'cancel', color: COLORS.error }
        ];
      case 'in_progress':
        return [
          { label: 'Mark Completed', status: 'completed', color: COLORS.success }
        ];
      case 'completed':
      case 'cancelled':
        return [];
      default:
        return [];
    }
  };

  const availableActions = getAvailableActions();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lab Request Details</Text>
        <TouchableOpacity onPress={() => router.push(`/(doctor)/doctor-lab-requests/edit/${request.id}`)}>
          <Edit size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status and Priority Header */}
        <View style={styles.statusHeader}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(request.status) + '20' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: getStatusColor(request.status) }
            ]}>
              {request.status.toUpperCase()}
            </Text>
          </View>
          <View style={[
            styles.priorityBadge,
            { backgroundColor: getPriorityColor(request.priority) + '20' }
          ]}>
            <AlertCircle size={16} color={getPriorityColor(request.priority)} />
            <Text style={[
              styles.priorityText,
              { color: getPriorityColor(request.priority) }
            ]}>
              {request.priority.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Patient Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <User size={20} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Patient Name</Text>
                <Text style={styles.infoValue}>{request.patientName}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <FileText size={20} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Patient ID</Text>
                <Text style={styles.infoValue}>{request.patientId}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Request Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Request Details</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Calendar size={20} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Request Date</Text>
                <Text style={styles.infoValue}>{formatDate(request.requestDate)}</Text>
              </View>
            </View>
            {request.expectedDate && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Clock size={20} color={COLORS.primary} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Expected Completion</Text>
                    <Text style={styles.infoValue}>{formatDate(request.expectedDate)}</Text>
                  </View>
                </View>
              </>
            )}
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <User size={20} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Requesting Doctor</Text>
                <Text style={styles.infoValue}>{request.doctorName}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Requested Tests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requested Tests ({request.requestedTests.length})</Text>
          <View style={styles.testsContainer}>
            {request.requestedTests.map((test, index) => (
              <View key={index} style={styles.testItem}>
                <View style={styles.testBullet} />
                <Text style={styles.testName}>{test}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Clinical Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clinical Information</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Clinical Notes/Indication</Text>
            <Text style={styles.clinicalText}>{request.clinicalNotes}</Text>
            
            {request.symptoms && (
              <>
                <View style={styles.divider} />
                <Text style={styles.infoLabel}>Symptoms</Text>
                <Text style={styles.clinicalText}>{request.symptoms}</Text>
              </>
            )}
          </View>
        </View>

        {/* Test Center Assignment */}
        {request.assignedTestCenter && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Assigned Test Center</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <MapPin size={20} color={COLORS.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoValue}>{request.assignedTestCenter.name}</Text>
                  <Text style={styles.infoLabel}>{request.assignedTestCenter.address}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Request History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Request History</Text>
          <View style={styles.historyContainer}>
            <View style={styles.historyItem}>
              <View style={[styles.historyDot, { backgroundColor: COLORS.primary }]} />
              <View style={styles.historyContent}>
                <Text style={styles.historyTitle}>Request Created</Text>
                <Text style={styles.historyTime}>{formatDateTime(request.createdAt)}</Text>
              </View>
            </View>
            {request.updatedAt && (
              <View style={styles.historyItem}>
                <View style={[styles.historyDot, { backgroundColor: getStatusColor(request.status) }]} />
                <View style={styles.historyContent}>
                  <Text style={styles.historyTitle}>Status Updated</Text>
                  <Text style={styles.historyTime}>{formatDateTime(request.updatedAt)}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        {availableActions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions</Text>
            <View style={styles.actionsContainer}>
              {availableActions.map((action, index) => (
                <Button
                  key={index}
                  title={action.label}
                  onPress={() => {
                    if (action.action === 'cancel') {
                      handleCancelRequest();
                    } else if (action.status) {
                      handleStatusUpdate(action.status);
                    }
                  }}
                  style={[
                    styles.actionButton,
                    { backgroundColor: action.color }
                  ]}
                />
              ))}
            </View>
          </View>
        )}

        {/* Delete Button for completed/cancelled requests */}
        {(request.status === 'completed' || request.status === 'cancelled') && (
          <View style={styles.section}>
            <Button
              title="Delete Request"
              onPress={handleDeleteRequest}
              style={[styles.actionButton, { backgroundColor: COLORS.error }]}
            />
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
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
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  priorityText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    ...SHADOWS.small,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  clinicalText: {
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  testsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    ...SHADOWS.small,
  },
  testItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  testBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  testName: {
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    flex: 1,
  },
  historyContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    ...SHADOWS.small,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  historyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
    marginBottom: 2,
  },
  historyTime: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 0,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: SIZES.lg,
    color: COLORS.textSecondary,
  },
});