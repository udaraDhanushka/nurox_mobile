import React, { useState } from 'react';
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
  Smartphone,
  Shield
} from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { Button } from '@/components/Button';

interface BillingItem {
  id: string;
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
}

const mockBillingData: BillingItem[] = [
  {
    id: '1',
    date: '2025-06-06',
    doctorName: 'Dr. Sarah Johnson',
    specialty: 'Cardiologist',
    hospitalName: 'Heart Care Institute',
    appointmentType: 'Consultation',
    amount: 192.50,
    paymentMethod: 'card',
    status: 'paid',
    receiptId: 'RCP-2025-001',
  },
  {
    id: '2',
    date: '2025-05-28',
    doctorName: 'Dr. Michael Chen',
    specialty: 'Dermatologist',
    hospitalName: 'Skin Health Center',
    appointmentType: 'Follow-up',
    amount: 125.00,
    paymentMethod: 'apple_pay',
    status: 'paid',
    receiptId: 'RCP-2025-002',
  },
  {
    id: '3',
    date: '2025-05-15',
    doctorName: 'Dr. Emily Rodriguez',
    specialty: 'Pediatrician',
    hospitalName: 'Children\'s Medical Center',
    appointmentType: 'Routine Checkup',
    amount: 280.00,
    paymentMethod: 'insurance',
    status: 'paid',
    receiptId: 'RCP-2025-003',
    insuranceCovered: 210.00,
  },
  {
    id: '4',
    date: '2025-04-22',
    doctorName: 'Dr. James Wilson',
    specialty: 'Orthopedic',
    hospitalName: 'Bone & Joint Hospital',
    appointmentType: 'Specialist Consultation',
    amount: 350.00,
    paymentMethod: 'card',
    status: 'paid',
    receiptId: 'RCP-2025-004',
  },
  {
    id: '5',
    date: '2025-04-10',
    doctorName: 'Dr. Lisa Park',
    specialty: 'Neurology',
    hospitalName: 'Brain Health Institute',
    appointmentType: 'Emergency',
    amount: 425.00,
    paymentMethod: 'google_pay',
    status: 'pending',
    receiptId: 'RCP-2025-005',
  },
  {
    id: '6',
    date: '2025-03-28',
    doctorName: 'Dr. Robert Kim',
    specialty: 'ENT Specialist',
    hospitalName: 'Ear Nose Throat Clinic',
    appointmentType: 'Consultation',
    amount: 175.00,
    paymentMethod: 'card',
    status: 'refunded',
    receiptId: 'RCP-2025-006',
  }
];

export default function BillingHistoryScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'paid' | 'pending' | 'refunded'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredData = mockBillingData.filter(item => {
    const matchesSearch = 
      item.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.hospitalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.appointmentType.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || item.status === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const getTotalSpent = () => {
    return mockBillingData
      .filter(item => item.status === 'paid')
      .reduce((total, item) => total + item.amount, 0);
  };

  const getThisMonthSpent = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return mockBillingData
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
      case 'apple_pay':
        return '🍎';
      case 'google_pay':
        return '🎯';
      case 'samsung_pay':
        return '📱';
      case 'insurance':
        return '🏥';
      default:
        return '💳';
    }
  };

  const handleDownloadReceipt = (item: BillingItem) => {
    Alert.alert(
      'Download Receipt',
      `Download receipt ${item.receiptId} for ${item.doctorName} appointment?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Download', 
          onPress: () => Alert.alert('Success', 'Receipt downloaded to your device')
        }
      ]
    );
  };

  const handleViewDetails = (item: BillingItem) => {
    Alert.alert(
      'Payment Details',
      `Receipt ID: ${item.receiptId}\nDoctor: ${item.doctorName}\nHospital: ${item.hospitalName}\nAmount: $${item.amount.toFixed(2)}\nStatus: ${item.status.toUpperCase()}\nDate: ${new Date(item.date).toLocaleDateString()}`,
      [{ text: 'OK' }]
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
        <Text style={styles.summaryValue}>{mockBillingData.length}</Text>
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
            onPress={() => setSelectedFilter(filter.key as any)}
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
        
        <TouchableOpacity style={styles.moreButton}>
          <MoreVertical size={16} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickActionButton}>
          <FileText size={20} color={COLORS.primary} />
          <Text style={styles.quickActionText}>Export All</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionButton}>
          <Calendar size={20} color={COLORS.primary} />
          <Text style={styles.quickActionText}>Monthly Report</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionButton}>
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
        <TouchableOpacity style={styles.headerAction}>
          <Download size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderSummaryCards()}
        {renderSearchAndFilters()}
        {renderFilters()}
        {renderQuickActions()}
        
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
                {searchQuery ? 'Try adjusting your search terms' : 'Your payment history will appear here'}
              </Text>
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
  headerAction: {
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
  },
});