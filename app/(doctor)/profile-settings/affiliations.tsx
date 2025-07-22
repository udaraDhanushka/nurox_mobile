import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Trash2, Save, Building, MapPin } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../../constants/theme';
import { useAuthStore } from '../../../store/authStore';
import { authService } from '../../../services/authService';
import { HospitalAffiliation } from '../../../types/auth';

// Common hospitals in Sri Lanka
const COMMON_HOSPITALS = [
  'National Hospital of Sri Lanka',
  'Colombo General Hospital',
  'Teaching Hospital Kandy',
  'Teaching Hospital Karapitiya',
  'Apeksha Hospital',
  'Lady Ridgeway Hospital',
  'Castle Street Hospital',
  'Kalubowila Teaching Hospital',
  'General Hospital Ratnapura',
  'General Hospital Badulla',
  'General Hospital Matara',
  'General Hospital Anuradhapura',
  'Nawaloka Hospital',
  'Asiri Central Hospital',
  'Lanka Hospital',
  'Apollo Hospital',
  'Ninewells Hospital',
  'Hemas Hospital',
  'Durdans Hospital',
  'Golden Key Eye Hospital'
];


export default function AffiliationsScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [affiliations, setAffiliations] = useState<HospitalAffiliation[]>([]);
  const [newHospitalName, setNewHospitalName] = useState('');
  const [newHospitalAddress, setNewHospitalAddress] = useState('');
  const [newPosition, setNewPosition] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Initialize affiliations from user data
    if (user?.hospitalAffiliation) {
      // Handle both single affiliation (legacy) and multiple affiliations
      if (Array.isArray(user.hospitalAffiliation)) {
        setAffiliations(user.hospitalAffiliation);
      } else {
        // Convert single affiliation to array format
        setAffiliations([{
          id: '1',
          name: user.hospitalAffiliation,
          address: '',
          position: 'Doctor',
          department: user.specialization || ''
        }]);
      }
    }
  }, [user]);

  const addAffiliation = () => {
    const trimmedName = newHospitalName.trim();
    if (!trimmedName) {
      Alert.alert('Error', 'Please enter hospital name');
      return;
    }

    // Check if hospital already exists
    if (affiliations.some(aff => aff.name.toLowerCase() === trimmedName.toLowerCase())) {
      Alert.alert('Error', 'This hospital is already in your affiliations');
      return;
    }

    const newAffiliation: HospitalAffiliation = {
      id: Date.now().toString(),
      name: trimmedName,
      address: newHospitalAddress.trim(),
      position: newPosition.trim() || 'Doctor',
      department: newDepartment.trim()
    };

    setAffiliations([...affiliations, newAffiliation]);
    
    // Clear form
    setNewHospitalName('');
    setNewHospitalAddress('');
    setNewPosition('');
    setNewDepartment('');
    setShowSuggestions(false);
  };

  const removeAffiliation = (id: string) => {
    setAffiliations(affiliations.filter(aff => aff.id !== id));
  };

  const getSuggestions = () => {
    if (!newHospitalName.trim()) return [];
    
    return COMMON_HOSPITALS.filter(hospital =>
      hospital.toLowerCase().includes(newHospitalName.toLowerCase()) &&
      !affiliations.some(aff => aff.name.toLowerCase() === hospital.toLowerCase())
    ).slice(0, 5);
  };

  const selectSuggestion = (hospitalName: string) => {
    setNewHospitalName(hospitalName);
    setShowSuggestions(false);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Prepare update data
      const updateData: any = {};
      
      if (affiliations.length > 0) {
        updateData.hospitalAffiliations = affiliations;
        updateData.hospitalAffiliation = affiliations[0]?.name; // Primary affiliation for backward compatibility
      }

      // Try doctor profile endpoint first, fall back to general profile endpoint
      try {
        await authService.updateDoctorProfile(updateData);
      } catch (doctorProfileError) {
        console.log('Doctor profile endpoint failed, trying general profile endpoint:', doctorProfileError);
        // Fallback to general profile update
        await authService.updateProfile(updateData);
      }

      // Update local user state directly without triggering another API call
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        useAuthStore.setState({ 
          user: { 
            ...currentUser,
            hospitalAffiliation: affiliations[0]?.name || '',
            hospitalAffiliations: affiliations
          } 
        });
      }

      Alert.alert('Success', 'Hospital affiliations updated successfully');
      router.back();
      
    } catch (error) {
      console.error('Error updating affiliations:', error);
      Alert.alert('Error', 'Failed to update affiliations. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Hospital Affiliations</Text>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Save size={24} color={COLORS.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info */}
        <View style={styles.infoCard}>
          <Building size={24} color={COLORS.primary} />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Hospital Affiliations</Text>
            <Text style={styles.infoDescription}>
              Add hospitals where you practice. Patients will see these options when booking appointments with you.
            </Text>
          </View>
        </View>

        {/* Current Affiliations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Affiliations</Text>
          {affiliations.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No hospital affiliations added yet</Text>
            </View>
          ) : (
            <View style={styles.affiliationsList}>
              {affiliations.map((affiliation) => (
                <View key={affiliation.id} style={styles.affiliationItem}>
                  <View style={styles.affiliationInfo}>
                    <Text style={styles.hospitalName}>{affiliation.name}</Text>
                    {affiliation.address && (
                      <View style={styles.addressRow}>
                        <MapPin size={14} color={COLORS.textSecondary} />
                        <Text style={styles.hospitalAddress}>{affiliation.address}</Text>
                      </View>
                    )}
                    <View style={styles.detailsRow}>
                      {affiliation.position && (
                        <Text style={styles.positionText}>Position: {affiliation.position}</Text>
                      )}
                      {affiliation.department && (
                        <Text style={styles.departmentText}>Dept: {affiliation.department}</Text>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeAffiliation(affiliation.id)}
                  >
                    <Trash2 size={16} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Add New Affiliation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Hospital Affiliation</Text>
          
          {/* Hospital Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Hospital Name *</Text>
            <TextInput
              style={styles.input}
              value={newHospitalName}
              onChangeText={(text) => {
                setNewHospitalName(text);
                setShowSuggestions(text.length > 0);
              }}
              placeholder="Enter hospital name"
              placeholderTextColor={COLORS.textSecondary}
              autoCapitalize="words"
            />
          </View>

          {/* Suggestions */}
          {showSuggestions && getSuggestions().length > 0 && (
            <View style={styles.suggestions}>
              <Text style={styles.suggestionsTitle}>Suggestions:</Text>
              {getSuggestions().map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => selectSuggestion(suggestion)}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Hospital Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Address</Text>
            <TextInput
              style={styles.input}
              value={newHospitalAddress}
              onChangeText={setNewHospitalAddress}
              placeholder="Enter hospital address"
              placeholderTextColor={COLORS.textSecondary}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Position */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Your Position</Text>
            <TextInput
              style={styles.input}
              value={newPosition}
              onChangeText={setNewPosition}
              placeholder="e.g. Consultant, Registrar, Doctor"
              placeholderTextColor={COLORS.textSecondary}
              autoCapitalize="words"
            />
          </View>

          {/* Department */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Department</Text>
            <TextInput
              style={styles.input}
              value={newDepartment}
              onChangeText={setNewDepartment}
              placeholder="e.g. Cardiology, Emergency, Surgery"
              placeholderTextColor={COLORS.textSecondary}
              autoCapitalize="words"
            />
          </View>

          <TouchableOpacity
            style={[styles.addButton, !newHospitalName.trim() && styles.addButtonDisabled]}
            onPress={addAffiliation}
            disabled={!newHospitalName.trim()}
          >
            <Plus size={20} color={COLORS.white} style={styles.addIcon} />
            <Text style={styles.addButtonText}>Add Hospital</Text>
          </TouchableOpacity>
        </View>

        {/* Popular Hospitals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Hospitals</Text>
          <View style={styles.popularGrid}>
            {COMMON_HOSPITALS
              .filter(hospital => !affiliations.some(aff => aff.name.toLowerCase() === hospital.toLowerCase()))
              .slice(0, 6)
              .map((hospital, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.popularItem}
                  onPress={() => selectSuggestion(hospital)}
                >
                  <Text style={styles.popularText}>{hospital}</Text>
                </TouchableOpacity>
              ))
            }
          </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  title: {
    flex: 1,
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    ...SHADOWS.medium,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  emptyState: {
    backgroundColor: COLORS.white,
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  emptyText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
  },
  affiliationsList: {
    gap: 12,
  },
  affiliationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    ...SHADOWS.small,
  },
  affiliationInfo: {
    flex: 1,
  },
  hospitalName: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  hospitalAddress: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: 4,
    flex: 1,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  positionText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  departmentText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.errorLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    ...SHADOWS.small,
  },
  suggestions: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  suggestionsTitle: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  suggestionItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    marginBottom: 4,
  },
  suggestionText: {
    fontSize: SIZES.md,
    color: COLORS.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    ...SHADOWS.medium,
  },
  addButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  addIcon: {
    marginRight: 8,
  },
  addButtonText: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  popularItem: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    ...SHADOWS.small,
  },
  popularText: {
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
});