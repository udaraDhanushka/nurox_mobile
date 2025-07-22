import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { ChevronDown, Search, X, Check, Activity, Plus } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { testService, Test } from '../services/testService';

interface HybridTestInputProps {
  value: string;
  onSelect: (test: Test | string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
}

export const HybridTestInput: React.FC<HybridTestInputProps> = ({
  value,
  onSelect,
  placeholder = "Select or enter test",
  label,
  error
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Test[]>([]);
  const [inputValue, setInputValue] = useState(value);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [showAddButton, setShowAddButton] = useState(false);
  const [allTests, setAllTests] = useState<Test[]>([]);

  useEffect(() => {
    loadTests();
  }, []);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (showDropdown && allTests.length > 0) {
      setSearchResults(allTests.slice(0, 10)); // Show first 10 tests initially
    }
  }, [showDropdown, allTests]);

  const loadTests = async () => {
    try {
      const tests = await testService.getTests({ limit: 100 });
      setAllTests(tests);
    } catch (error) {
      console.error('Failed to load tests:', error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const results = await testService.searchTests(query, 20);
        setSearchResults(results);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults(allTests.slice(0, 10));
    }
  };

  const handleTestSelect = (test: Test) => {
    setInputValue(''); // Clear input after selection
    setIsManualEntry(false);
    setShowAddButton(false);
    setShowDropdown(false);
    setSearchQuery('');
    onSelect(test);
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

  const formatTestName = (test: Test): string => {
    return testService.formatTestName(test);
  };

  const openDropdown = () => {
    setShowDropdown(true);
    setSearchQuery('');
    setSearchResults(allTests.slice(0, 10));
  };

  const getTestTypeIcon = (type: string) => {
    switch (type) {
      case 'blood':
        return '🩸';
      case 'urine':
        return '🧪';
      case 'imaging':
        return '📸';
      case 'biopsy':
        return '🔬';
      case 'culture':
        return '🧫';
      default:
        return '⚕️';
    }
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
              <View style={styles.headerContent}>
                <Activity size={20} color={COLORS.primary} />
                <Text style={styles.dropdownTitle}>Select Test</Text>
              </View>
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
                placeholder="Search tests..."
                placeholderTextColor={COLORS.textSecondary}
                autoFocus
              />
            </View>

            {/* Test Options */}
            <ScrollView style={styles.optionsList}>
              {searchResults.map((test) => (
                <TouchableOpacity
                  key={test.id}
                  style={styles.optionItem}
                  onPress={() => handleTestSelect(test)}
                >
                  <View style={styles.testIcon}>
                    <Text style={styles.testEmoji}>{getTestTypeIcon(test.type)}</Text>
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionName}>{test.name}</Text>
                    {test.description && (
                      <Text style={styles.optionDescription}>{test.description}</Text>
                    )}
                    <View style={styles.testMetadata}>
                      <Text style={styles.testCategory}>{test.category}</Text>
                      <Text style={styles.testType}>{test.type}</Text>
                    </View>
                  </View>
                  <Check size={16} color={COLORS.primary} />
                </TouchableOpacity>
              ))}

              {searchResults.length === 0 && searchQuery.trim() && (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsTitle}>No tests found</Text>
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
                    Add "{searchQuery}" as custom test
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
    backgroundColor: COLORS.info,
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  testIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  testEmoji: {
    fontSize: 16,
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
  optionDescription: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  testMetadata: {
    flexDirection: 'row',
    gap: 12,
  },
  testCategory: {
    fontSize: SIZES.xs,
    color: COLORS.primary,
    fontWeight: '500',
  },
  testType: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
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
    backgroundColor: COLORS.info + '10',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.info + '30',
  },
  manualEntryText: {
    fontSize: SIZES.sm,
    color: COLORS.info,
    fontWeight: '500',
    textAlign: 'center',
  },
});