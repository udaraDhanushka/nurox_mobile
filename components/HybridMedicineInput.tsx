import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { ChevronDown, Search, X, Check, Plus } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useMedicineStore, Medicine } from '../store/medicineStore';

interface HybridMedicineInputProps {
  value: string;
  onSelect: (medicine: Medicine | string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
}

export const HybridMedicineInput: React.FC<HybridMedicineInputProps> = ({
  value,
  onSelect,
  placeholder = "Select or enter medicine",
  label,
  error
}) => {
  const { medicines, searchMedicines, loadMedicines } = useMedicineStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Medicine[]>([]);
  const [inputValue, setInputValue] = useState(value);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [showAddButton, setShowAddButton] = useState(false);

  useEffect(() => {
    loadMedicines();
  }, [loadMedicines]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (showDropdown) {
      setSearchResults(medicines.slice(0, 10)); // Show first 10 medicines initially
    }
  }, [showDropdown, medicines]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const results = await searchMedicines(query);
        setSearchResults(results.slice(0, 20)); // Limit to 20 results
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults(medicines.slice(0, 10));
    }
  };

  const handleMedicineSelect = (medicine: Medicine) => {
    setInputValue(''); // Clear input after selection
    setIsManualEntry(false);
    setShowAddButton(false);
    setShowDropdown(false);
    setSearchQuery('');
    onSelect(medicine);
  };

  const handleTextChange = (text: string) => {
    setInputValue(text);
    setIsManualEntry(true);
    setShowAddButton(text.trim().length > 0);
    // Don't call onSelect here - only when user actually selects
  };

  const handleManualEntry = (text: string) => {
    setInputValue(''); // Clear input after adding
    setIsManualEntry(false);
    setShowAddButton(false);
    onSelect(text); // Only call onSelect when user actually wants to add
  };

  const formatMedicineName = (medicine: Medicine): string => {
    let name = medicine.name;
    if (medicine.strength && medicine.unit) {
      name += ` ${medicine.strength}${medicine.unit}`;
    }
    if (medicine.brand && medicine.brand !== medicine.name) {
      name += ` (${medicine.brand})`;
    }
    return name;
  };

  const openDropdown = () => {
    setShowDropdown(true);
    setSearchQuery('');
    setSearchResults(medicines.slice(0, 10));
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      {/* Input Field */}
      <TouchableOpacity style={styles.inputContainer} onPress={openDropdown}>
        <TextInput
          style={[styles.textInput, error && styles.inputError]}
          value={inputValue}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textSecondary}
          editable={!showDropdown}
          onSubmitEditing={() => {
            if (inputValue.trim()) {
              handleManualEntry(inputValue.trim());
            }
          }}
        />
        <TouchableOpacity onPress={openDropdown} style={styles.dropdownButton}>
          <ChevronDown size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Add Button for manual entry */}
      {showAddButton && inputValue.trim() && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleManualEntry(inputValue.trim())}
        >
          <Plus size={16} color={COLORS.white} />
          <Text style={styles.addButtonText}>Add "{inputValue.trim()}"</Text>
        </TouchableOpacity>
      )}

      {/* Dropdown Modal */}
      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.dropdownContainer}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Select Medicine</Text>
              <TouchableOpacity
                onPress={() => setShowDropdown(false)}
                style={styles.closeButton}
              >
                <X size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Search size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={handleSearch}
                placeholder="Search medicines..."
                placeholderTextColor={COLORS.textSecondary}
                autoFocus
              />
            </View>

            {/* Medicine Options */}
            <ScrollView style={styles.optionsList}>
              {searchResults.map((medicine) => (
                <TouchableOpacity
                  key={medicine.id}
                  style={styles.optionItem}
                  onPress={() => handleMedicineSelect(medicine)}
                >
                  <View style={styles.optionContent}>
                    <Text style={styles.optionName}>{formatMedicineName(medicine)}</Text>
                    {medicine.genericName && (
                      <Text style={styles.optionGeneric}>{medicine.genericName}</Text>
                    )}
                    <Text style={styles.optionType}>{medicine.type || medicine.category}</Text>
                  </View>
                  <Check size={16} color={COLORS.primary} />
                </TouchableOpacity>
              ))}

              {searchResults.length === 0 && searchQuery.trim() && (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsTitle}>No medicines found</Text>
                  <Text style={styles.noResultsText}>
                    You can type manually in the input field above
                  </Text>
                </View>
              )}

              {/* Manual Entry Option */}
              {searchQuery.trim() && (
                <TouchableOpacity
                  style={styles.manualEntryOption}
                  onPress={() => {
                    handleManualEntry(searchQuery);
                    setShowDropdown(false);
                  }}
                >
                  <Text style={styles.manualEntryText}>
                    Add "{searchQuery}" as custom medicine
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: SIZES.sm,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textInput: {
    flex: 1,
    padding: 12,
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  dropdownButton: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: SIZES.sm,
    color: COLORS.error,
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
    gap: 6,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: SIZES.sm,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dropdownContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    width: '100%',
    maxHeight: '80%',
    ...SHADOWS.large,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
  },
  optionsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionContent: {
    flex: 1,
  },
  optionName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  optionGeneric: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  optionType: {
    fontSize: SIZES.xs,
    color: COLORS.primary,
    fontWeight: '500',
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  noResultsText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  manualEntryOption: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  manualEntryText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
});