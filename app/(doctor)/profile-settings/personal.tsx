import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User, Mail, Save, Award, Building } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../../constants/theme';
import { useAuthStore } from '../../../store/authStore';
import { authService } from '../../../services/authService';

export default function DoctorPersonalInformationScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    licenseNumber: user?.licenseNumber || '',
    specialization: user?.specialization || '',
    hospitalAffiliation: user?.hospitalAffiliation || '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    // Ensure all values are strings
    const stringValue = String(value || '');
    setFormData(prev => ({
      ...prev,
      [field]: stringValue
    }));
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'User not found. Please log in again.');
      return;
    }

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      Alert.alert('Validation Error', 'First name and last name are required.');
      return;
    }

    try {
      setIsLoading(true);
      
      // Prepare update data, only including non-empty fields
      const updateData: any = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
      };

      // Note: Phone field removed for doctor privacy

      // Only include professional fields if they're not empty
      if (formData.licenseNumber.trim()) {
        updateData.licenseNumber = formData.licenseNumber.trim();
      }
      
      if (formData.specialization.trim()) {
        updateData.specialization = formData.specialization.trim();
      }
      
      if (formData.hospitalAffiliation.trim()) {
        updateData.hospitalAffiliation = formData.hospitalAffiliation.trim();
      }

      // Log the data being sent for debugging
      console.log('Update data being sent:', JSON.stringify(updateData, null, 2));

      // Try doctor profile endpoint first, fall back to general profile endpoint
      try {
        await authService.updateDoctorProfile(updateData);
      } catch (doctorProfileError) {
        console.log('Doctor profile endpoint failed, trying general profile endpoint:', doctorProfileError);
        // Fallback to general profile update
        await authService.updateProfile(updateData);
      }

      // Update local user state with only the changed fields (avoid phone field issues)
      const updatedUserData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        ...(formData.licenseNumber.trim() && { licenseNumber: formData.licenseNumber.trim() }),
        ...(formData.specialization.trim() && { specialization: formData.specialization.trim() }),
        ...(formData.hospitalAffiliation.trim() && { hospitalAffiliation: formData.hospitalAffiliation.trim() }),
      };

      // Update only specific fields without triggering another API call
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        useAuthStore.setState({ 
          user: { 
            ...currentUser, 
            ...updatedUserData 
          } 
        });
      }

      Alert.alert('Success', 'Personal information updated successfully');
      router.back();
      
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
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
        <Text style={styles.title}>Personal Information</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Personal Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>First Name *</Text>
            <View style={styles.inputContainer}>
              <User size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.textInput}
                value={formData.firstName}
                onChangeText={(value) => handleInputChange('firstName', value)}
                placeholder="Enter first name"
                placeholderTextColor={COLORS.textSecondary}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Last Name *</Text>
            <View style={styles.inputContainer}>
              <User size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.textInput}
                value={formData.lastName}
                onChangeText={(value) => handleInputChange('lastName', value)}
                placeholder="Enter last name"
                placeholderTextColor={COLORS.textSecondary}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={[styles.inputContainer, styles.disabledInput]}>
              <Mail size={20} color={COLORS.textSecondary} />
              <TextInput
                style={[styles.textInput, styles.disabledText]}
                value={formData.email}
                editable={false}
                placeholder="Email address"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
            <Text style={styles.helpText}>Email cannot be changed. Contact support if needed.</Text>
          </View>

          {/* Privacy Notice */}
          <View style={styles.privacyNotice}>
            <Text style={styles.privacyText}>
              📞 Phone numbers are not required for doctors to maintain professional privacy. 
              Patients will contact you through the hospital or appointment system.
            </Text>
          </View>

        </View>

        {/* Professional Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Medical License Number</Text>
            <View style={styles.inputContainer}>
              <Award size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.textInput}
                value={formData.licenseNumber}
                onChangeText={(value) => handleInputChange('licenseNumber', value)}
                placeholder="Enter license number"
                placeholderTextColor={COLORS.textSecondary}
                autoCapitalize="characters"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Primary Specialization</Text>
            <View style={styles.inputContainer}>
              <Award size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.textInput}
                value={formData.specialization}
                onChangeText={(value) => handleInputChange('specialization', value)}
                placeholder="Enter specialization"
                placeholderTextColor={COLORS.textSecondary}
                autoCapitalize="words"
              />
            </View>
            <Text style={styles.helpText}>For multiple specializations, use the Specializations section.</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Primary Hospital Affiliation</Text>
            <View style={styles.inputContainer}>
              <Building size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.textInput}
                value={formData.hospitalAffiliation}
                onChangeText={(value) => handleInputChange('hospitalAffiliation', value)}
                placeholder="Enter hospital name"
                placeholderTextColor={COLORS.textSecondary}
                autoCapitalize="words"
              />
            </View>
            <Text style={styles.helpText}>For multiple affiliations, use the Hospital Affiliations section.</Text>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Save size={20} color={COLORS.white} style={styles.saveIcon} />
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
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
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    ...SHADOWS.small,
  },
  disabledInput: {
    backgroundColor: COLORS.background,
    opacity: 0.6,
  },
  textInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
  },
  disabledText: {
    color: COLORS.textSecondary,
  },
  helpText: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  privacyNotice: {
    backgroundColor: '#E8F4FD',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  privacyText: {
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 32,
    ...SHADOWS.medium,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  saveIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});