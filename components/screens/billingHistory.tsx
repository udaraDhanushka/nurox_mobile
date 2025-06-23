import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Download, 
  Calendar,
  CreditCard,
  FileText,
  Eye,
  MoreVertical,
  TrendingUp,
  DollarSign,
  Receipt,
  Shield
} from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { Button } from '@/components/Button';
import { useAppointmentStore } from '@/store/appointmentStore';
import paymentService, { PaymentHistoryItem, PaymentHistoryResponse } from '@/services/paymentService';

interface BillingItem {
  id: string;
  appointmentId: string;
  date: string;
  doctorName: string;
  specialty: string;
  hospitalName: string;
  appointmentType: string;
  amount: number;
  paymentMethod: 'card' | 'apple_pay' | 'google_pay' | 'insurance';
  status: 'paid' | 'pending' | 'refunded' | 'failed';
  receiptId: string;
  insuranceCovered?: number;
  paymentId?: string;
  consultationFee: number;
  hospitalFee: number;
  tax: number;
}

export default function BillingHistoryScreen() {
  const router = useRouter();
  const { appointments } = useAppointmentStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'paid' | 'pending' | 'refunded'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [realPaymentHistory, setRealPaymentHistory] = useState<PaymentHistoryItem[]>([]);

  // Load real payment history from backend
  const loadPaymentHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await paymentService.getPaymentHistory();
      
      if (response.success && response.data?.payments) {
        setRealPaymentHistory(response.data.payments);
      } else {
        setError('No payment history found.');
        setRealPaymentHistory([]);
      }
      
    } catch (err) {
      console.error('Failed to load payment history:', err);
      setError('Could not load payment history from server.');
      setRealPaymentHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load payment history on component mount
  useEffect(() => {
    loadPaymentHistory();
  }, []);

  // Convert real payment history to billing items
  const billingData: BillingItem[] = useMemo(() => {
    return realPaymentHistory
      .filter(payment => payment.appointmentId) // Only show appointment-related payments
      .map(payment => {
        const doctorName = payment.appointment 
          ? `${payment.appointment.doctor.firstName} ${payment.appointment.doctor.lastName}`
          : 'Unknown Doctor';
        
        // Map backend payment status to frontend status
        const statusMap: { [key: string]: 'paid' | 'pending' | 'refunded' | 'failed' } = {
          'COMPLETED': 'paid',
          'PENDING': 'pending',
          'REFUNDED': 'refunded',
          'FAILED': 'failed'
        };
        
        const mappedStatus = statusMap[payment.status] || 'pending';
        
        // Parse metadata for fee breakdown or calculate from amount
        const metadata = payment.metadata || {};
        const totalAmount = payment.amount / 100; // Convert from cents
        
        // Try to get fee breakdown from metadata, otherwise estimate
        const consultationFee = metadata.consultationFee || (totalAmount * 0.8);
        const hospitalFee = metadata.hospitalFee || (totalAmount * 0.15);
        const tax = metadata.tax || (totalAmount * 0.05);

        return {
          id: payment.id,
          appointmentId: payment.appointmentId!,
          date: payment.appointment?.appointmentDate || payment.createdAt,
          doctorName,
          specialty: metadata.specialty || 'General Practice',
          hospitalName: metadata.hospitalName || 'Unknown Hospital',
          appointmentType: payment.appointment?.type || 'Consultation',
          amount: totalAmount,
          paymentMethod: payment.method.toLowerCase() as 'card' | 'apple_pay' | 'google_pay' | 'insurance',
          status: mappedStatus,
          receiptId: payment.transactionId || payment.id,
          consultationFee,
          hospitalFee,
          tax,
          paymentId: payment.id,
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date, newest first
  }, [realPaymentHistory]);

  // No longer needed - using real payment data with actual amounts

  const filteredData = billingData.filter(item => {
    const matchesSearch = 
      item.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.hospitalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.appointmentType.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || item.status === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const getTotalSpent = () => {
    return billingData
      .filter(item => item.status === 'paid')
      .reduce((total, item) => total + item.amount, 0);
  };

  const getThisMonthSpent = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return billingData
      .filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getMonth() === currentMonth && 
               itemDate.getFullYear() === currentYear &&
               item.status === 'paid';
      })
      .reduce((total, item) => total + item.amount, 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return COLORS.success;
      case 'pending':
        return COLORS.warning;
      case 'refunded':
        return COLORS.primary;
      case 'failed':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return '💳';
      // case 'apple_pay':
      //   return '🍎';
      // case 'google_pay':
      //   return '🎯';
      // case 'samsung_pay':
      //   return '📱';
      case 'insurance':
        return '🏥';
      default:
        return '💳';
    }
  };

  const handleDownloadReceipt = (item: BillingItem) => {
    if (item.status !== 'paid') {
      Alert.alert('Receipt Not Available', 'Receipt can only be downloaded for paid appointments');
      return;
    }

    Alert.alert(
      'Download Receipt',
      `Download receipt ${item.receiptId} for ${item.doctorName} appointment?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'PDF', 
          onPress: () => Alert.alert('Success', 'Receipt PDF downloaded to Downloads folder')
        },
        { 
          text: 'Email', 
          onPress: () => Alert.alert('Success', 'Receipt emailed to your registered email address')
        }
      ]
    );
  };

  const handleViewDetails = (item: BillingItem) => {
    Alert.alert(
      'Payment Details',
      `Receipt ID: ${item.receiptId}\nDoctor: ${item.doctorName}\nHospital: ${item.hospitalName}\nConsultation Fee: $${item.consultationFee.toFixed(2)}\nHospital Fee: $${item.hospitalFee.toFixed(2)}\nTax: $${item.tax.toFixed(2)}\nTotal Amount: $${item.amount.toFixed(2)}\nStatus: ${item.status.toUpperCase()}\nDate: ${new Date(item.date).toLocaleDateString()}${item.paymentId ? `\nPayment ID: ${item.paymentId}` : ''}`,
      [
        { text: 'OK' },
        { 
          text: 'View Appointment', 
          onPress: () => router.push(`/(patient)/patient-appointments/${item.appointmentId}`)
        }
      ]
    );
  };

  const handleMoreOptions = (item: BillingItem) => {
    const buttons: Array<{
      text: string;
      style?: 'cancel' | 'default' | 'destructive';
      onPress?: () => void;
    }> = [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Share Receipt', 
        onPress: () => Alert.alert('Success', 'Receipt sharing link copied to clipboard')
      },
      { 
        text: 'Report Issue', 
        onPress: () => Alert.alert('Report Issue', 'Please contact support for billing issues')
      }
    ];

    // Add refund option only for paid items
    if (item.status === 'paid') {
      buttons.push({
        text: 'Request Refund',
        style: 'destructive',
        onPress: () => Alert.alert('Refund Request', 'Refund request has been submitted')
      });
    }

    Alert.alert(
      'More Options',
      `Additional actions for ${item.doctorName} appointment`,
      buttons
    );
  };

  const renderSummaryCards = () => (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryCard}>
        <DollarSign size={24} color={COLORS.primary} />
        <Text style={styles.summaryValue}>${getTotalSpent().toFixed(2)}</Text>
        <Text style={styles.summaryLabel}>Total Spent</Text>
      </View>
      
      <View style={styles.summaryCard}>
        <TrendingUp size={24} color={COLORS.success} />
        <Text style={styles.summaryValue}>${getThisMonthSpent().toFixed(2)}</Text>
        <Text style={styles.summaryLabel}>This Month</Text>
      </View>
      
      <View style={styles.summaryCard}>
        <Receipt size={24} color={COLORS.warning} />
        <Text style={styles.summaryValue}>{billingData.length}</Text>
        <Text style={styles.summaryLabel}>Total Bills</Text>
      </View>
    </View>
  );

  const renderSearchAndFilters = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Search size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by doctor, hospital, or type..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.textSecondary}
        />
      </View>
      
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowFilters(!showFilters)}
      >
        <Filter size={20} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderFilters = () => {
    if (!showFilters) return null;

    const filters = [
      { key: 'all', label: 'All' },
      { key: 'paid', label: 'Paid' },
      { key: 'pending', label: 'Pending' },
      { key: 'refunded', label: 'Refunded' }
    ];

    return (
      <View style={styles.filtersContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              selectedFilter === filter.key && styles.activeFilterChip
            ]}
            onPress={() => setSelectedFilter(filter.key as 'all' | 'paid' | 'pending' | 'refunded')}
          >
            <Text style={[
              styles.filterChipText,
              selectedFilter === filter.key && styles.activeFilterChipText
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderBillingItem = ({ item }: { item: BillingItem }) => (
    <View style={styles.billingItem}>
      <View style={styles.billingHeader}>
        <View style={styles.billingMainInfo}>
          <Text style={styles.doctorName}>{item.doctorName}</Text>
          <Text style={styles.specialty}>{item.specialty}</Text>
          <Text style={styles.hospitalName}>{item.hospitalName}</Text>
        </View>
        
        <View style={styles.billingAmountSection}>
          <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: `${getStatusColor(item.status)}20` }
          ]}>
            <Text style={[
              styles.statusText,
              { color: getStatusColor(item.status) }
            ]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.billingDetails}>
        <View style={styles.detailRow}>
          <Calendar size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>
            {new Date(item.date).toLocaleDateString('en-US', { 
              weekday: 'short',
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.paymentMethodIcon}>
            {getPaymentMethodIcon(item.paymentMethod)}
          </Text>
          <Text style={styles.detailText}>{item.appointmentType}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Receipt size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>Receipt: {item.receiptId}</Text>
        </View>
        
        {item.insuranceCovered && (
          <View style={styles.detailRow}>
            <Shield size={16} color={COLORS.success} />
            <Text style={styles.insuranceText}>
              Insurance covered: ${item.insuranceCovered.toFixed(2)}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.billingActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleViewDetails(item)}
        >
          <Eye size={16} color={COLORS.primary} />
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDownloadReceipt(item)}
        >
          <Download size={16} color={COLORS.primary} />
          <Text style={styles.actionButtonText}>Receipt</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/(patient)/patient-appointments/${item.appointmentId}`)}
        >
          <Calendar size={16} color={COLORS.primary} />
          <Text style={styles.actionButtonText}>Appointment</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.moreButton}
          onPress={() => handleMoreOptions(item)}
        >
          <MoreVertical size={16} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleExportAll = () => {
    Alert.alert(
      'Export Billing Data',
      'Export all billing records to PDF or CSV?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'PDF', 
          onPress: () => Alert.alert('Success', 'Billing data exported to PDF')
        },
        { 
          text: 'CSV', 
          onPress: () => Alert.alert('Success', 'Billing data exported to CSV')
        }
      ]
    );
  };

  const handleMonthlyReport = () => {
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    Alert.alert(
      'Monthly Report',
      `Generate detailed report for ${currentMonth}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Generate', 
          onPress: () => Alert.alert('Success', `${currentMonth} report generated successfully`)
        }
      ]
    );
  };

  const handleInsuranceClaims = () => {
    Alert.alert(
      'Insurance Claims',
      'View and manage your insurance claim submissions',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'View Claims', 
          onPress: () => Alert.alert('Coming Soon', 'Insurance claims feature will be available soon')
        }
      ]
    );
  };

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={handleExportAll}
        >
          <FileText size={20} color={COLORS.primary} />
          <Text style={styles.quickActionText}>Export All</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={handleMonthlyReport}
        >
          <Calendar size={20} color={COLORS.primary} />
          <Text style={styles.quickActionText}>Monthly Report</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={handleInsuranceClaims}
        >
          <Shield size={20} color={COLORS.primary} />
          <Text style={styles.quickActionText}>Insurance Claims</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Billing History</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerActionButton}
            onPress={loadPaymentHistory}
            disabled={isLoading}
          >
            <Receipt size={20} color={isLoading ? COLORS.textSecondary : COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerActionButton}
            onPress={handleExportAll}
          >
            <Download size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading billing history...</Text>
          </View>
        ) : (
          <>
            {renderSummaryCards()}
            {renderSearchAndFilters()}
            {renderFilters()}
            {renderQuickActions()}
          </>
        )}
        
        <View style={styles.billingList}>
          <Text style={styles.sectionTitle}>Payment History</Text>
          
          {filteredData.length > 0 ? (
            <FlatList
              data={filteredData}
              renderItem={renderBillingItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Receipt size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyStateTitle}>No billing records found</Text>
              <Text style={styles.emptyStateSubtitle}>
                {searchQuery ? 'Try adjusting your search terms' : 
                 realPaymentHistory.length === 0 ? 'Complete your first appointment payment to see billing history' :
                 'Your payment history will appear here'}
              </Text>
              {realPaymentHistory.length === 0 && !searchQuery && (
                <TouchableOpacity
                  style={styles.scheduleButton}
                  onPress={() => router.push('/(patient)/patient-appointments/new')}
                >
                  <Text style={styles.scheduleButtonText}>Book Appointment</Text>
                </TouchableOpacity>
              )}
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
  headerActionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  summaryValue: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeFilterChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activeFilterChipText: {
    color: COLORS.white,
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickActionText: {
    fontSize: SIZES.xs,
    color: COLORS.textPrimary,
    marginTop: 4,
    textAlign: 'center',
  },
  billingList: {
    marginBottom: 20,
  },
  billingItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.small,
  },
  billingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  billingMainInfo: {
    flex: 1,
    marginRight: 12,
  },
  doctorName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  specialty: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  hospitalName: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  billingAmountSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: SIZES.xs,
    fontWeight: '600',
  },
  billingDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  paymentMethodIcon: {
    fontSize: 16,
  },
  insuranceText: {
    fontSize: SIZES.sm,
    color: COLORS.success,
    marginLeft: 8,
    fontWeight: '500',
  },
  billingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 12,
    borderRadius: 6,
    backgroundColor: COLORS.transparentPrimary,
  },
  actionButtonText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  moreButton: {
    marginLeft: 'auto',
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  scheduleButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  scheduleButtonText: {
    color: COLORS.white,
    fontSize: SIZES.md,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: COLORS.transparentError,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.sm,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});