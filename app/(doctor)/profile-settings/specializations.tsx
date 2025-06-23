import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Trash2, Save, Award } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../../constants/theme';
import { useAuthStore } from '../../../store/authStore';
import { authService } from '../../../services/authService';

// Common medical specializations list
const COMMON_SPECIALIZATIONS = [
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Family Medicine',
  'Gastroenterology',
  'General Surgery',
  'Internal Medicine',
  'Neurology',
  'Obstetrics & Gynecology',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Otolaryngology',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Urology'
];

export default function SpecializationsScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [newSpecialization, setNewSpecialization] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Initialize specializations from user data
    if (user?.specialization) {
      // Handle both single specialization (legacy) and multiple specializations
      const userSpecs = Array.isArray(user.specialization) 
        ? user.specialization 
        : [user.specialization];
      setSpecializations(userSpecs.filter(spec => spec.trim() !== ''));
    }
  }, [user]);

  const addSpecialization = (specialization: string) => {
    const trimmedSpec = specialization.trim();
    if (trimmedSpec && !specializations.includes(trimmedSpec)) {
      setSpecializations([...specializations, trimmedSpec]);
      setNewSpecialization('');
      setShowSuggestions(false);
    }
  };

  const removeSpecialization = (index: number) => {
    const updated = specializations.filter((_, i) => i !== index);
    setSpecializations(updated);
  };

  const getSuggestions = () => {
    if (!newSpecialization.trim()) return [];
    
    return COMMON_SPECIALIZATIONS.filter(spec =>
      spec.toLowerCase().includes(newSpecialization.toLowerCase()) &&
      !specializations.includes(spec)
    ).slice(0, 5);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Prepare update data
      const updateData: any = {};
      
      if (specializations.length > 0) {
        updateData.specializations = specializations;
        updateData.specialization = specializations[0]; // Primary specialization for backward compatibility
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
            specialization: specializations[0] || '',
            specializations: specializations
          } 
        });
      }

      Alert.alert('Success', 'Specializations updated successfully');
      router.back();
      
    } catch (error) {
      console.error('Error updating specializations:', error);
      Alert.alert('Error', 'Failed to update specializations. Please try again.');
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
        <Text style={styles.title}>Specializations</Text>
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
          <Award size={24} color={COLORS.primary} />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Medical Specializations</Text>
            <Text style={styles.infoDescription}>
              Add your medical specializations. These will be visible to patients when they search for doctors.
            </Text>
          </View>
        </View>

        {/* Current Specializations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Specializations</Text>
          {specializations.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No specializations added yet</Text>
            </View>
          ) : (
            <View style={styles.specializationsList}>
              {specializations.map((spec, index) => (
                <View key={index} style={styles.specializationItem}>
                  <Text style={styles.specializationText}>{spec}</Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeSpecialization(index)}
                  >
                    <Trash2 size={16} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Add New Specialization */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Specialization</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={newSpecialization}
              onChangeText={(text) => {
                setNewSpecialization(text);
                setShowSuggestions(text.length > 0);
              }}
              placeholder="Enter specialization name"
              placeholderTextColor={COLORS.textSecondary}
              autoCapitalize="words"
            />
            <TouchableOpacity
              style={[styles.addButton, !newSpecialization.trim() && styles.addButtonDisabled]}
              onPress={() => addSpecialization(newSpecialization)}
              disabled={!newSpecialization.trim()}
            >
              <Plus size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {/* Suggestions */}
          {showSuggestions && getSuggestions().length > 0 && (
            <View style={styles.suggestions}>
              <Text style={styles.suggestionsTitle}>Suggestions:</Text>
              {getSuggestions().map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => addSpecialization(suggestion)}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Popular Specializations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Specializations</Text>
          <View style={styles.popularGrid}>
            {COMMON_SPECIALIZATIONS
              .filter(spec => !specializations.includes(spec))
              .slice(0, 8)
              .map((spec, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.popularItem}
                  onPress={() => addSpecialization(spec)}
                >
                  <Text style={styles.popularText}>{spec}</Text>
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
  specializationsList: {
    gap: 8,
  },
  specializationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    ...SHADOWS.small,
  },
  specializationText: {
    flex: 1,
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.errorLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    ...SHADOWS.small,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  addButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  suggestions: {
    marginTop: 12,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
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