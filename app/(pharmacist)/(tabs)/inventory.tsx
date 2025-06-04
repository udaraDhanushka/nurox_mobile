import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, Plus, Package, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';

// Mock inventory data for pharmacists
const mockInventory = [
  {
    id: '1',
    name: 'Lisinopril 10mg',
    category: 'Cardiovascular',
    currentStock: 15,
    minStock: 20,
    maxStock: 100,
    unitPrice: 0.85,
    supplier: 'MediPharm Supplies',
    expiryDate: '2024-08-15',
    batchNumber: 'LP2024001',
    status: 'low'
  },
  {
    id: '2',
    name: 'Metformin 500mg',
    category: 'Diabetes',
    currentStock: 8,
    minStock: 25,
    maxStock: 150,
    unitPrice: 0.45,
    supplier: 'HealthCare Distributors',
    expiryDate: '2024-12-20',
    batchNumber: 'MF2024002',
    status: 'critical'
  },
  {
    id: '3',
    name: 'Atorvastatin 20mg',
    category: 'Cardiovascular',
    currentStock: 45,
    minStock: 20,
    maxStock: 80,
    unitPrice: 1.20,
    supplier: 'MediPharm Supplies',
    expiryDate: '2025-03-10',
    batchNumber: 'AT2024003',
    status: 'good'
  },
  {
    id: '4',
    name: 'Amoxicillin 500mg',
    category: 'Antibiotics',
    currentStock: 32,
    minStock: 30,
    maxStock: 120,
    unitPrice: 0.75,
    supplier: 'PharmaCorp',
    expiryDate: '2024-06-30',
    batchNumber: 'AM2024004',
    status: 'expiring'
  },
  {
    id: '5',
    name: 'Ibuprofen 400mg',
    category: 'Pain Relief',
    currentStock: 78,
    minStock: 25,
    maxStock: 100,
    unitPrice: 0.35,
    supplier: 'HealthCare Distributors',
    expiryDate: '2025-01-15',
    batchNumber: 'IB2024005',
    status: 'good'
  }
];

export default function PharmacistInventoryScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredInventory, setFilteredInventory] = useState(mockInventory);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterInventory(query, selectedCategory);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    filterInventory(searchQuery, category);
  };

  const filterInventory = (query: string, category: string) => {
    let filtered = mockInventory;

    if (query.trim() !== '') {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase()) ||
        item.supplier.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (category !== 'all') {
      filtered = filtered.filter(item => item.category.toLowerCase() === category.toLowerCase());
    }

    setFilteredInventory(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return COLORS.success;
      case 'low':
        return COLORS.warning;
      case 'critical':
        return COLORS.error;
      case 'expiring':
        return COLORS.warning;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <TrendingUp size={16} color={getStatusColor(status)} />;
      case 'low':
        return <TrendingDown size={16} color={getStatusColor(status)} />;
      case 'critical':
        return <AlertTriangle size={16} color={getStatusColor(status)} />;
      case 'expiring':
        return <AlertTriangle size={16} color={getStatusColor(status)} />;
      default:
        return <Package size={16} color={getStatusColor(status)} />;
    }
  };

  const categories = ['all', 'cardiovascular', 'diabetes', 'antibiotics', 'pain relief'];

  const getStockPercentage = (current: number, max: number) => {
    return (current / max) * 100;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventory</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/(pharmacist)/inventory/add')}
          >
            <Plus size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search inventory..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>
      </View>

      {/* Category Filters */}
      <View style={styles.categoryFilters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryFilter,
                selectedCategory === category && styles.selectedCategoryFilter
              ]}
              onPress={() => handleCategoryFilter(category)}
            >
              <Text style={[
                styles.categoryFilterText,
                selectedCategory === category && styles.selectedCategoryFilterText
              ]}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Inventory List */}
      <ScrollView style={styles.inventoryList} showsVerticalScrollIndicator={false}>
        {filteredInventory.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.inventoryCard}
            onPress={() => router.push(`/(pharmacist)/inventory/${item.id}`)}
          >
            <View style={styles.inventoryHeader}>
              <View style={styles.inventoryInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCategory}>{item.category}</Text>
              </View>
              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(item.status) + '20' }
                ]}>
                  {getStatusIcon(item.status)}
                  <Text style={[
                    styles.statusText,
                    { color: getStatusColor(item.status) }
                  ]}>
                    {item.status}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.stockInfo}>
              <View style={styles.stockHeader}>
                <Text style={styles.stockLabel}>Stock Level</Text>
                <Text style={styles.stockValue}>
                  {item.currentStock} / {item.maxStock}
                </Text>
              </View>
              <View style={styles.stockBar}>
                <View 
                  style={[
                    styles.stockLevel,
                    { 
                      width: `${getStockPercentage(item.currentStock, item.maxStock)}%`,
                      backgroundColor: getStatusColor(item.status)
                    }
                  ]} 
                />
              </View>
              <View style={styles.stockDetails}>
                <Text style={styles.stockDetail}>Min: {item.minStock}</Text>
                <Text style={styles.stockDetail}>Price: ${item.unitPrice}</Text>
              </View>
            </View>

            <View style={styles.inventoryFooter}>
              <View style={styles.supplierInfo}>
                <Text style={styles.supplier}>{item.supplier}</Text>
                <Text style={styles.batchNumber}>Batch: {item.batchNumber}</Text>
              </View>
              <View style={styles.expiryInfo}>
                <Text style={styles.expiryLabel}>Expires:</Text>
                <Text style={[
                  styles.expiryDate,
                  item.status === 'expiring' && { color: COLORS.warning }
                ]}>
                  {item.expiryDate}
                </Text>
              </View>
            </View>

            {(item.status === 'low' || item.status === 'critical') && (
              <TouchableOpacity 
                style={styles.reorderButton}
                onPress={() => router.push(`/(pharmacist)/inventory/reorder/${item.id}`)}
              >
                <Text style={styles.reorderButtonText}>Reorder</Text>
              </TouchableOpacity>
            )}
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
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
  categoryFilters: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  selectedCategoryFilter: {
    backgroundColor: COLORS.primary,
  },
  categoryFilterText: {
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  selectedCategoryFilterText: {
    color: COLORS.white,
  },
  inventoryList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  inventoryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.medium,
  },
  inventoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  inventoryInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  statusContainer: {
    alignItems: 'flex-end',
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
  stockInfo: {
    marginBottom: 16,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stockLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  stockValue: {
    fontSize: SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  stockBar: {
    height: 6,
    backgroundColor: COLORS.lightGray,
    borderRadius: 3,
    marginBottom: 8,
  },
  stockLevel: {
    height: 6,
    borderRadius: 3,
  },
  stockDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stockDetail: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
  },
  inventoryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  supplierInfo: {
    flex: 1,
  },
  supplier: {
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  batchNumber: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
  },
  expiryInfo: {
    alignItems: 'flex-end',
  },
  expiryLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  expiryDate: {
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  reorderButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  reorderButtonText: {
    fontSize: SIZES.sm,
    color: COLORS.white,
    fontWeight: '600',
  },
});