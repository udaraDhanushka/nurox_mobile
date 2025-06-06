import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Clock, MapPin, User, FileText, ChevronDown, Building } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../../../constants/theme';
import { Button } from '../../../components/Button';
import { DatePickerModal } from '../../../components/ui/DatePickerModal';
import { useAppointmentStore } from '../../../store/appointmentStore';
import { Hospital, TokenSlot, AppointmentType } from '../../../types/appointment';

const mockDoctors = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiologist',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop',
    rating: 4.9,
    experience: '15 years',
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialty: 'Dermatologist',
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=1974&auto=format&fit=crop',
    rating: 4.8,
    experience: '12 years',
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Pediatrician',
    image: 'https://images.unsplash.com/photo-1594824475317-d3e2b7b3e5e5?q=80&w=1974&auto=format&fit=crop',
    rating: 4.9,
    experience: '10 years',
  }
];

const appointmentTypes: AppointmentType[] = [
  'Consultation',
  'Follow-up',
  'Routine Checkup',
  'Specialist Consultation',
  'Emergency',
  'Vaccination'
];

export default function NewAppointmentScreen() {
  const router = useRouter();
  const { addAppointment, getHospitalsByDoctorId, getTokenAvailability } = useAppointmentStore();
  
  const [selectedDoctor, setSelectedDoctor] = useState<typeof mockDoctors[0] | null>(null);
  const [availableHospitals, setAvailableHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedToken, setSelectedToken] = useState<TokenSlot | null>(null);
  const [availableTokens, setAvailableTokens] = useState<TokenSlot[]>([]);
  const [selectedType, setSelectedType] = useState<AppointmentType>('Consultation');
  const [notes, setNotes] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [showHospitalDropdown, setShowHospitalDropdown] = useState(false);
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);

  // Get current date in local timezone (Sri Lankan if device is set correctly)
  const getCurrentDate = () => {
    const now = new Date();
    // Normalize to start of day to avoid time-related issues
    now.setHours(0, 0, 0, 0);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Reset form function
  const resetForm = React.useCallback(() => {
    setSelectedDoctor(null);
    setAvailableHospitals([]);
    setSelectedHospital(null);
    setSelectedDate(getCurrentDate());
    setSelectedToken(null);
    setAvailableTokens([]);
    setSelectedType('Consultation');
    setNotes('');
    setCurrentStep(1);
    setShowHospitalDropdown(false);
    setShowDatePickerModal(false);
  }, []);

  // Initialize current date
  useEffect(() => {
    setSelectedDate(getCurrentDate());
  }, []);

  // Reset form when navigating back using useFocusEffect
  useFocusEffect(
    React.useCallback(() => {
      // Reset form when screen comes into focus
      resetForm();
    }, [resetForm])
  );

  // Update available hospitals when doctor is selected
  useEffect(() => {
    if (selectedDoctor) {
      const hospitals = getHospitalsByDoctorId(selectedDoctor.id);
      setAvailableHospitals(hospitals);
      setSelectedHospital(null);
      setAvailableTokens([]);
      setSelectedToken(null);
    }
  }, [selectedDoctor]);

  // Better token availability logic with fallback
  useEffect(() => {
    if (selectedDoctor && selectedHospital && selectedDate) {
      console.log('Fetching tokens for:', { 
        doctorId: selectedDoctor.id, 
        hospitalId: selectedHospital.id, 
        date: selectedDate 
      });
      
      let tokens = getTokenAvailability(selectedDoctor.id, selectedHospital.id, selectedDate);
      
      // If no tokens from store, generate mock tokens
      if (!tokens || tokens.length === 0) {
        console.log('No tokens from store, generating fallback tokens');
        tokens = generateFallbackTokens();
      }
      
      console.log('Available tokens:', tokens);
      setAvailableTokens(tokens);
      setSelectedToken(null);
    }
  }, [selectedDoctor, selectedHospital, selectedDate]);

  // Generate mock tokens if store doesn't return any
  const generateFallbackTokens = (): TokenSlot[] => {
    const tokens: TokenSlot[] = [];
    for (let i = 1; i <= 20; i++) {
      const hour = Math.floor(9 + (i - 1) * 0.5); // Start from 9 AM
      const minute = ((i - 1) % 2) * 30; // Alternate between :00 and :30
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      tokens.push({
        tokenNumber: i,
        time,
        isBooked: Math.random() > 0.7 // 30% chance of being booked
      });
    }
    return tokens;
  };

  const handleNext = () => {
    if (currentStep === 1 && !selectedDoctor) {
      Alert.alert('Please select a doctor');
      return;
    }
    if (currentStep === 2 && !selectedHospital) {
      Alert.alert('Please select a hospital');
      return;
    }
    if (currentStep === 3 && !selectedDate) {
      Alert.alert('Please select a date');
      return;
    }
    if (currentStep === 4 && !selectedToken) {
      Alert.alert('Please select a token number');
      return;
    }
    if (currentStep === 5 && !selectedType) {
      Alert.alert('Please select appointment type');
      return;
    }
    
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      resetForm();
      router.back();
    }
  };

  const handleBookAppointment = () => {
    if (!selectedDoctor || !selectedHospital || !selectedToken || !selectedType) {
      Alert.alert('Please fill in all required fields');
      return;
    }

    const newAppointment = {
      id: Math.random().toString(36).substring(2, 9),
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      doctorImage: selectedDoctor.image,
      specialty: selectedDoctor.specialty,
      rating: selectedDoctor.rating,
      experience: selectedDoctor.experience,
      hospitalId: selectedHospital.id,
      hospitalName: selectedHospital.name,
      hospitalAddress: selectedHospital.address,
      date: selectedDate,
      tokenNumber: selectedToken.tokenNumber,
      estimatedTime: selectedToken.time,
      duration: '30 min',
      type: selectedType as AppointmentType,
      status: 'pending' as const,
      paymentId: undefined,
      notes
      
    };

    // Store appointment temporarily (in real app, you might use a different approach)
    addAppointment(newAppointment);
    
    Alert.alert(
      'Appointment Confirmed! 🎉',
      `Your appointment has been scheduled:\n\nDoctor: ${selectedDoctor.name}\nDate: ${selectedDate}\nToken: #${selectedToken.tokenNumber}\nTime: ${selectedToken.time}\n\nProceed to payment to complete your booking.`,
      [
        {
          text: 'Proceed to Payment',
          onPress: () => {
            resetForm();
            // Navigate to payment screen with appointment details
            router.push({
              pathname: '/(patient)/payments',
              params: {
                appointmentId: newAppointment.id,
                doctorName: selectedDoctor.name,
                specialty: selectedDoctor.specialty,
                hospitalName: selectedHospital.name,
                date: selectedDate,
                time: selectedToken.time,
                tokenNumber: selectedToken.tokenNumber
              }
            });
          }
        }
      ]
    );
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4, 5, 6].map((step) => (
        <View key={step} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            currentStep >= step && styles.activeStepCircle
          ]}>
            <Text style={[
              styles.stepText,
              currentStep >= step && styles.activeStepText
            ]}>
              {step}
            </Text>
          </View>
          {step < 6 && (
            <View style={[
              styles.stepLine,
              currentStep > step && styles.activeStepLine
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderDoctorSelection = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Doctor</Text>
      <Text style={styles.stepSubtitle}>Choose a doctor for your appointment</Text>
      
      {mockDoctors.map((doctor) => (
        <TouchableOpacity
          key={doctor.id}
          style={[
            styles.doctorCard,
            selectedDoctor?.id === doctor.id && styles.selectedDoctorCard
          ]}
          onPress={() => setSelectedDoctor(doctor)}
        >
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{doctor.name}</Text>
            <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
            <Text style={styles.doctorDetails}>
              ⭐ {doctor.rating} • {doctor.experience}
            </Text>
          </View>
          {selectedDoctor?.id === doctor.id && (
            <View style={styles.selectedIndicator}>
              <Text style={styles.selectedText}>✓</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderHospitalSelection = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Hospital</Text>
      <Text style={styles.stepSubtitle}>Choose a hospital where {selectedDoctor?.name} practices</Text>
      
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setShowHospitalDropdown(!showHospitalDropdown)}
      >
        <Building size={20} color={COLORS.textSecondary} />
        <Text style={[
          styles.dropdownText,
          selectedHospital ? styles.selectedDropdownText : styles.placeholderText
        ]}>
          {selectedHospital ? selectedHospital.name : 'Select Hospital'}
        </Text>
        <ChevronDown size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>

      {showHospitalDropdown && (
        <View style={styles.dropdownList}>
          {availableHospitals.length > 0 ? (
            availableHospitals.map((hospital) => (
              <TouchableOpacity
                key={hospital.id}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedHospital(hospital);
                  setShowHospitalDropdown(false);
                }}
              >
                <Text style={styles.hospitalName}>{hospital.name}</Text>
                <Text style={styles.hospitalAddress}>{hospital.address}</Text>
                <Text style={styles.hospitalTokens}>Total Tokens: {hospital.totalTokens}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.dropdownItem}>
              <Text style={styles.noHospitalsText}>No hospitals available for this doctor</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  // FIXED: Clean date selection with calendar picker modal
  const renderDateSelection = () => {
    const formatSelectedDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      });
    };

    const handleDateSelect = (date: string) => {
      setSelectedDate(date);
    };
    
    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>Select Date</Text>
        <Text style={styles.stepSubtitle}>Choose your preferred appointment date</Text>
        
        <TouchableOpacity
          style={styles.selectedDateCard}
          onPress={() => setShowDatePickerModal(true)}
        >
          <Calendar size={24} color={COLORS.primary} />
          <View style={styles.dateInfo}>
            <Text style={styles.dateLabel}>Selected Date</Text>
            <Text style={styles.dateValue}>
              {selectedDate ? formatSelectedDate(selectedDate) : 'Tap to select date'}
            </Text>
            <Text style={styles.dateCode}>{selectedDate}</Text>
          </View>
        </TouchableOpacity>
        
        <Text style={styles.dateHint}>
          Tap the date card above to open calendar and select your preferred appointment date
        </Text>
      </View>
    );
  };

  const renderTokenSelection = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Token Number</Text>
      <Text style={styles.stepSubtitle}>
        Available tokens for {selectedDoctor?.name} at {selectedHospital?.name}
      </Text>
      
      <View style={styles.tokenStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{availableTokens.filter(t => !t.isBooked).length}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{availableTokens.filter(t => t.isBooked).length}</Text>
          <Text style={styles.statLabel}>Booked</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{availableTokens.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {availableTokens.length > 0 ? (
        <ScrollView style={styles.tokenScrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.tokenGrid}>
            {availableTokens.map((token) => (
              <TouchableOpacity
                key={token.tokenNumber}
                style={[
                  styles.tokenCard,
                  token.isBooked ? styles.bookedTokenCard : styles.availableTokenCard,
                  selectedToken?.tokenNumber === token.tokenNumber && styles.selectedTokenCard
                ]}
                onPress={() => !token.isBooked && setSelectedToken(token)}
                disabled={token.isBooked}
              >
                <Text style={[
                  styles.tokenNumber,
                  token.isBooked ? styles.bookedTokenText : styles.availableTokenText,
                  selectedToken?.tokenNumber === token.tokenNumber && styles.selectedTokenText
                ]}>
                  {token.tokenNumber}
                </Text>
                <Text style={[
                  styles.tokenTime,
                  token.isBooked ? styles.bookedTokenTime : styles.availableTokenTime,
                  selectedToken?.tokenNumber === token.tokenNumber && styles.selectedTokenTime
                ]}>
                  {token.time}
                </Text>
                {token.isBooked && (
                  <Text style={styles.bookedLabel}>Booked</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.noTokensContainer}>
          <Text style={styles.noTokensText}>No tokens available for this date</Text>
          <Text style={styles.noTokensSubtext}>Please select a different date</Text>
        </View>
      )}
    </View>
  );

  const renderTypeSelection = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Appointment Type</Text>
      <Text style={styles.stepSubtitle}>What type of appointment do you need?</Text>
      
      {appointmentTypes.map((type) => (
        <TouchableOpacity
          key={type}
          style={[
            styles.typeCard,
            selectedType === type && styles.selectedTypeCard
          ]}
          onPress={() => setSelectedType(type)}
        >
          <Text style={[
            styles.typeText,
            selectedType === type && styles.selectedTypeText
          ]}>
            {type}
          </Text>
          {selectedType === type && (
            <Text style={styles.selectedText}>✓</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderConfirmation = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Confirm Appointment</Text>
      <Text style={styles.stepSubtitle}>Review your appointment details</Text>
      
      <View style={styles.confirmationCard}>
        <View style={styles.confirmationItem}>
          <User size={20} color={COLORS.primary} />
          <View style={styles.confirmationContent}>
            <Text style={styles.confirmationLabel}>Doctor</Text>
            <Text style={styles.confirmationValue}>{selectedDoctor?.name}</Text>
            <Text style={styles.confirmationSubValue}>{selectedDoctor?.specialty}</Text>
          </View>
        </View>
        
        <View style={styles.confirmationItem}>
          <Building size={20} color={COLORS.primary} />
          <View style={styles.confirmationContent}>
            <Text style={styles.confirmationLabel}>Hospital</Text>
            <Text style={styles.confirmationValue}>{selectedHospital?.name}</Text>
            <Text style={styles.confirmationSubValue}>{selectedHospital?.address}</Text>
          </View>
        </View>
        
        <View style={styles.confirmationItem}>
          <Calendar size={20} color={COLORS.primary} />
          <View style={styles.confirmationContent}>
            <Text style={styles.confirmationLabel}>Date & Token</Text>
            <Text style={styles.confirmationValue}>{selectedDate}</Text>
            <Text style={styles.confirmationSubValue}>
              Token #{selectedToken?.tokenNumber} • Est. {selectedToken?.time}
            </Text>
          </View>
        </View>
        
        <View style={styles.confirmationItem}>
          <FileText size={20} color={COLORS.primary} />
          <View style={styles.confirmationContent}>
            <Text style={styles.confirmationLabel}>Type</Text>
            <Text style={styles.confirmationValue}>{selectedType}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Additional Notes (Optional)</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Any specific concerns or notes for the doctor"
          placeholderTextColor={COLORS.textSecondary}
          multiline
          numberOfLines={4}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <View style={{ width: 24 }} />
      </View>

      {renderStepIndicator()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentStep === 1 && renderDoctorSelection()}
        {currentStep === 2 && renderHospitalSelection()}
        {currentStep === 3 && renderDateSelection()}
        {currentStep === 4 && renderTokenSelection()}
        {currentStep === 5 && renderTypeSelection()}
        {currentStep === 6 && renderConfirmation()}
      </ScrollView>

      <View style={styles.footer}>
        {currentStep < 6 ? (
          <Button
            title="Next"
            onPress={handleNext}
            style={styles.nextButton}
          />
        ) : (
          <Button
            title="Book Appointment"
            onPress={handleBookAppointment}
            style={styles.bookButton}
          />
        )}
      </View>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePickerModal}
        selectedDate={selectedDate}
        onDateSelect={(date) => {
          setSelectedDate(date);
        }}
        onClose={() => setShowDatePickerModal(false)}
        maxDaysAhead={14}
      />
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
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  activeStepCircle: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  stepText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeStepText: {
    color: COLORS.white,
  },
  stepLine: {
    width: 18,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },
  activeStepLine: {
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  doctorCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  selectedDoctorCard: {
    borderColor: COLORS.primary,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  doctorDetails: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    color: COLORS.white,
    fontSize: SIZES.sm,
    fontWeight: 'bold',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  dropdownText: {
    flex: 1,
    marginLeft: 12,
    fontSize: SIZES.md,
  },
  selectedDropdownText: {
    color: COLORS.textPrimary,
  },
  placeholderText: {
    color: COLORS.textSecondary,
  },
  dropdownList: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: 200,
    ...SHADOWS.small,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  hospitalName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  hospitalAddress: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  hospitalTokens: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  noHospitalsText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  selectedDateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  dateHint: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  dateInfo: {
    marginLeft: 12,
  },
  dateLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  dateCode: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  tokenStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  tokenScrollView: {
    maxHeight: 300,
  },
  tokenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tokenCard: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 8,
  },
  availableTokenCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
  },
  bookedTokenCard: {
    backgroundColor: COLORS.lightGray,
    borderColor: COLORS.border,
  },
  selectedTokenCard: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tokenNumber: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  availableTokenText: {
    color: COLORS.textPrimary,
  },
  bookedTokenText: {
    color: COLORS.textSecondary,
  },
  selectedTokenText: {
    color: COLORS.white,
  },
  tokenTime: {
    fontSize: SIZES.xs,
  },
  availableTokenTime: {
    color: COLORS.textSecondary,
  },
  bookedTokenTime: {
    color: COLORS.textSecondary,
  },
  selectedTokenTime: {
    color: COLORS.white,
  },
  bookedLabel: {
    fontSize: SIZES.xs,
    color: COLORS.error,
    fontWeight: '500',
    marginTop: 2,
  },
  noTokensContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  noTokensText: {
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  noTokensSubtext: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  typeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  selectedTypeCard: {
    borderColor: COLORS.primary,
  },
  typeText: {
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  selectedTypeText: {
    color: COLORS.primary,
  },
  confirmationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  confirmationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  confirmationContent: {
    marginLeft: 12,
    flex: 1,
  },
  confirmationLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  confirmationValue: {
    fontSize: SIZES.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  confirmationSubValue: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: SIZES.sm,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
  },
});