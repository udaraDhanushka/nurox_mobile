import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Phone, Mail, MapPin, Calendar, Save } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { calculateAge, formatAge, validateDateOfBirth, formatDateForInput } from '@/utils/dateUtils';

interface FormField {
  label: string;
  key: string;
  placeholder: string;
  required?: boolean;
  keyboardType?: string;
  disabled?: boolean;
}

export default function PersonalInformationScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.patientProfile?.address || '',
    city: user?.patientProfile?.city || '',
    state: user?.patientProfile?.state || '',
    zipCode: user?.patientProfile?.zipCode || '',
    dateOfBirth: user?.dateOfBirth ? formatDateForInput(user.dateOfBirth) : '',
    emergencyContact: user?.patientProfile?.emergencyContact || '',
    emergencyPhone: user?.patientProfile?.emergencyPhone || '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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

    if (!formData.email.trim()) {
      Alert.alert('Validation Error', 'Email is required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }

    // Validate date of birth
    const dobValidation = validateDateOfBirth(formData.dateOfBirth);
    if (!dobValidation.isValid) {
      Alert.alert('Validation Error', dobValidation.error || 'Please enter a valid date of birth.');
      return;
    }

    setIsLoading(true);

    try {
      // Update user profile (basic info)
      const userUpdateData: any = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
      };

      // Add optional user fields if they have values
      if (formData.phone.trim()) userUpdateData.phone = formData.phone.trim();
      
      // Date of birth is now mandatory
      userUpdateData.dateOfBirth = formData.dateOfBirth.trim();

      // Update patient profile (address and emergency contact info)
      const patientUpdateData: any = {};
      if (formData.address.trim()) patientUpdateData.address = formData.address.trim();
      if (formData.city.trim()) patientUpdateData.city = formData.city.trim();
      if (formData.state.trim()) patientUpdateData.state = formData.state.trim();
      if (formData.zipCode.trim()) patientUpdateData.zipCode = formData.zipCode.trim();
      if (formData.emergencyContact.trim()) patientUpdateData.emergencyContact = formData.emergencyContact.trim();
      if (formData.emergencyPhone.trim()) patientUpdateData.emergencyPhone = formData.emergencyPhone.trim();

      // Update both profiles
      console.log('Updating user profile with:', userUpdateData);
      await updateUser(userUpdateData);
      
      // Only update patient profile if there's data to update
      if (Object.keys(patientUpdateData).length > 0) {
        console.log('Updating patient profile with:', patientUpdateData);
        await authService.updatePatientProfile(patientUpdateData);
      }

      Alert.alert(
        'Success',
        'Your personal information has been updated successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update personal information. Please try again.');
      console.error('Update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formSections: Array<{
    title: string;
    icon: React.ReactElement;
    fields: FormField[];
  }> = [
    {
      title: 'Basic Information',
      icon: <User size={20} color={COLORS.primary} />,
      fields: [
        {
          label: 'First Name',
          key: 'firstName',
          placeholder: 'Enter your first name',
          required: true,
        },
        {
          label: 'Last Name',
          key: 'lastName',
          placeholder: 'Enter your last name',
          required: true,
        },
        {
          label: 'Email (Cannot be changed)',
          key: 'email',
          placeholder: 'Enter your email address',
          keyboardType: 'email-address',
          required: true,
          disabled: true,
        },
        {
          label: 'Phone Number',
          key: 'phone',
          placeholder: 'Enter your phone number',
          keyboardType: 'phone-pad',
        },
        {
          label: 'Date of Birth',
          key: 'dateOfBirth',
          placeholder: 'YYYY-MM-DD',
          required: true,
        },
      ],
    },
    {
      title: 'Address Information',
      icon: <MapPin size={20} color={COLORS.primary} />,
      fields: [
        {
          label: 'Street Address',
          key: 'address',
          placeholder: 'Enter your street address',
        },
        {
          label: 'City',
          key: 'city',
          placeholder: 'Enter your city',
        },
        {
          label: 'State',
          key: 'state',
          placeholder: 'Enter your state',
        },
        {
          label: 'ZIP Code',
          key: 'zipCode',
          placeholder: 'Enter your ZIP code',
          keyboardType: 'numeric',
        },
      ],
    },
    {
      title: 'Emergency Contact',
      icon: <Phone size={20} color={COLORS.primary} />,
      fields: [
        {
          label: 'Emergency Contact Name',
          key: 'emergencyContact',
          placeholder: 'Enter emergency contact name',
        },
        {
          label: 'Emergency Contact Phone',
          key: 'emergencyPhone',
          placeholder: 'Enter emergency contact phone',
          keyboardType: 'phone-pad',
        },
      ],
    },
  ];

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Personal Information',
          headerStyle: {
            backgroundColor: COLORS.white,
          },
          headerTintColor: COLORS.primary,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }} 
      />
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {formSections.map((section, sectionIndex) => (
            <View key={section.title} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  {section.icon}
                </View>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              
              <View style={styles.sectionContent}>
                {section.fields.map((field, fieldIndex) => (
                  <View key={field.key}>
                    <View style={styles.fieldContainer}>
                      <Text style={styles.fieldLabel}>
                        {field.label}
                        {field.required === true && <Text style={styles.required}> *</Text>}
                      </Text>
                      <Input
                        value={formData[field.key as keyof typeof formData]}
                        onChangeText={(value) => handleInputChange(field.key, value)}
                        placeholder={field.placeholder}
                        keyboardType={field.keyboardType as any}
                        style={styles.input}
                        disabled={field.disabled}
                      />
                    </View>
                    
                    {/* Show calculated age after date of birth field */}
                    {field.key === 'dateOfBirth' && formData.dateOfBirth && (
                      <View style={styles.ageDisplayContainer}>
                        <Text style={styles.ageLabel}>Age:</Text>
                        <Text style={styles.ageValue}>{formatAge(formData.dateOfBirth)}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}

          <View style={styles.buttonContainer}>
            <Button
              title="Save Changes"
              onPress={handleSave}
              isLoading={isLoading}
              style={styles.saveButton}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.transparentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  sectionContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    ...SHADOWS.medium,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: SIZES.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  required: {
    color: COLORS.error,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  disabledInput: {
    backgroundColor: COLORS.veryLightGray,
    color: COLORS.textSecondary,
  },
  ageDisplayContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  ageLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  ageValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
});