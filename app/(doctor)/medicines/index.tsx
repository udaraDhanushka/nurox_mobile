import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, Plus, Filter, Edit } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../../constants/theme';
import { useMedicineStore, Medicine } from '../../../store/medicineStore';

export default function MedicinesScreen() {
  const router = useRouter();
  const { medicines, loadMedicines, searchMedicines, isLoading, error } = useMedicineStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Medicine[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    loadMedicines();
  }, [loadMedicines]);

  useEffect(() => {
    setSearchResults(medicines);
  }, [medicines]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const results = await searchMedicines(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults(medicines);
    }
  };

  const filteredMedicines = searchResults.filter(medicine => {
    if (selectedType === 'all') return true;
    return medicine.type === selectedType || medicine.category === selectedType;
  });

  const medicineTypes = Array.from(new Set(medicines.map(m => m.type || m.category).filter(Boolean)));

  const formatMedicineStrength = (medicine: Medicine) => {
    if (medicine.strength && medicine.unit) {
      return `${medicine.strength}${medicine.unit}`;
    }
    return '';
  };

  if (isLoading && medicines.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Medicines</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(doctor)/medicines/new')}
          >
            <Plus size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading medicines...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medicines</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(doctor)/medicines/new')}
        >
          <Plus size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Search medicines..."
            placeholderTextColor={COLORS.textSecondary}
          />
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} color={showFilters ? COLORS.primary : COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedType === 'all' && styles.filterChipActive
                ]}
                onPress={() => setSelectedType('all')}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedType === 'all' && styles.filterChipTextActive
                ]}>
                  All
                </Text>
              </TouchableOpacity>
              
              {medicineTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterChip,
                    selectedType === type && styles.filterChipActive
                  ]}
                  onPress={() => setSelectedType(type)}
                >
                  <Text style={[
                    styles.filterChipText,
                    selectedType === type && styles.filterChipTextActive
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {filteredMedicines.length} of {medicines.length} medicines
          </Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Medicine List */}
        <ScrollView style={styles.medicineList} showsVerticalScrollIndicator={false}>
          {filteredMedicines.map((medicine) => (
            <TouchableOpacity
              key={medicine.id}
              style={styles.medicineCard}
              onPress={() => router.push(`/(doctor)/medicines/${medicine.id}`)}
            >
              <View style={styles.medicineHeader}>
                <View style={styles.medicineInfo}>
                  <Text style={styles.medicineName}>
                    {medicine.name}
                    {formatMedicineStrength(medicine) && (
                      <Text style={styles.medicineStrength}> {formatMedicineStrength(medicine)}</Text>
                    )}
                  </Text>
                  
                  {medicine.genericName && (
                    <Text style={styles.medicineGeneric}>{medicine.genericName}</Text>
                  )}
                  
                  {medicine.brand && medicine.brand !== medicine.name && (
                    <Text style={styles.medicineBrand}>Brand: {medicine.brand}</Text>
                  )}
                </View>
                
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => router.push(`/(doctor)/medicines/${medicine.id}/edit`)}
                >
                  <Edit size={16} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              {medicine.description && (
                <Text style={styles.medicineDescription} numberOfLines={2}>
                  {medicine.description}
                </Text>
              )}

              <View style={styles.medicineFooter}>
                <View style={styles.medicineTypeContainer}>
                  <Text style={styles.medicineType}>{medicine.type || medicine.category}</Text>
                </View>
                
                <View style={styles.medicineBadges}>
                  {medicine.isControlled && (
                    <View style={[styles.badge, styles.controlledBadge]}>
                      <Text style={styles.badgeText}>Controlled</Text>
                    </View>
                  )}
                  
                  {medicine.requiresPrescription && (
                    <View style={[styles.badge, styles.prescriptionBadge]}>
                      <Text style={styles.badgeText}>Rx</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {filteredMedicines.length === 0 && !isLoading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No medicines found</Text>
              <Text style={styles.emptyText}>
                {searchQuery ? 'Try adjusting your search or filters' : 'Start by adding your first medicine'}
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/(doctor)/medicines/new')}
              >
                <Plus size={20} color={COLORS.white} />
                <Text style={styles.emptyButtonText}>Add Medicine</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
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
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
  },
  filterButton: {
    padding: 4,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterChip: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  statsContainer: {
    marginBottom: 16,
  },
  statsText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: COLORS.error + '20',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.sm,
  },
  medicineList: {
    flex: 1,
  },
  medicineCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.small,
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  medicineStrength: {
    fontWeight: '500',
    color: COLORS.primary,
  },
  medicineGeneric: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  medicineBrand: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  editButton: {
    padding: 4,
  },
  medicineDescription: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  medicineFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  medicineTypeContainer: {
    flex: 1,
  },
  medicineType: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  medicineBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  controlledBadge: {
    backgroundColor: COLORS.warning,
  },
  prescriptionBadge: {
    backgroundColor: COLORS.info,
  },
  badgeText: {
    fontSize: SIZES.xs,
    color: COLORS.white,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  emptyButtonText: {
    color: COLORS.white,
    fontSize: SIZES.md,
    fontWeight: '500',
  },
});