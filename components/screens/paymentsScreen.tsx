import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Shield, Lock, Calendar, User, Building, CheckCircle, FileText } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { Button } from '@/components/Button';
import PayHereWebView, { PayHerePaymentData } from '@/components/PayHereWebView';
import paymentService, { CreatePaymentRequest } from '@/services/paymentService';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency } from '@/utils/currencyUtils';

// Insurance option interface - keeping only insurance as an optional feature
interface InsuranceOption {
  id: string;
  name: string;
  icon: string;
  subtitle?: string;
}

const insuranceOption: InsuranceOption = {
  id: 'insurance',
  name: 'Insurance Coverage',
  icon: '🏥',
  subtitle: 'Use your health insurance'
};

function PaymentScreenContent() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, token } = useAuthStore();
  
  // Debug: Log received parameters (remove in production)
  console.log('Payment Screen Parameters:', params);
  
  // Validate required parameters
  const hasRequiredParams = params.doctorName && params.specialty && params.hospitalName && 
                           params.date && params.time && params.tokenNumber;
  
  if (!hasRequiredParams) {
    console.warn('Missing required appointment parameters');
  }
  
  // Extract appointment data from parameters (passed from appointment screen)
  const appointmentData = {
    appointmentId: params.appointmentId as string || '',
    doctorName: params.doctorName as string || 'Dr. Sarah Johnson',
    specialty: params.specialty as string || 'Cardiologist', 
    hospitalName: params.hospitalName as string || 'Heart Care Institute',
    date: params.date as string || '2025-06-06',
    time: params.time as string || '10:30 AM',
    tokenNumber: parseInt(params.tokenNumber as string) || 15,
    appointmentType: params.appointmentType as string || 'Consultation',
    notes: params.notes as string || '',
    // Calculate fees based on appointment type and doctor specialty
    consultationFee: calculateConsultationFee(params.specialty as string, params.appointmentType as string),
    hospitalFee: 2500.00,
    tax: 0, // Will be calculated below
    total: 0 // Will be calculated below
  };

  // Calculate tax and total
  const subtotal = appointmentData.consultationFee + appointmentData.hospitalFee;
  appointmentData.tax = subtotal * 0.10; // 10% tax
  appointmentData.total = subtotal + appointmentData.tax;

  // Function to calculate consultation fee based on specialty and appointment type
  function calculateConsultationFee(specialty: string, appointmentType: string): number {
    const baseFeesBySpecialty: { [key: string]: number } = {
      'Cardiologist': 15000.00,
      'Dermatologist': 12000.00,
      'Pediatrician': 8000.00,
      'Orthopedic': 13000.00,
      'Neurology': 18000.00,
      'ENT Specialist': 10000.00,
      'General Physician': 7000.00,
    };
    
    const typeMultipliers: { [key: string]: number } = {
      'Consultation': 1.0,
      'Follow-up': 0.7,
      'Routine Checkup': 0.8,
      'Specialist Visit': 1.2,
      'Emergency': 1.5
    };
    
    const baseFee = baseFeesBySpecialty[specialty] || 10000.00;
    const multiplier = typeMultipliers[appointmentType] || 1.0;
    
    return Math.round(baseFee * multiplier * 100) / 100; // Round to 2 decimal places
  }

  const [useInsurance, setUseInsurance] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPayHereWebView, setShowPayHereWebView] = useState(false);
  const [payHereData, setPayHereData] = useState<PayHerePaymentData | null>(null);


  const createPayHerePayment = async (): Promise<PayHerePaymentData | undefined> => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const paymentData: CreatePaymentRequest = {
        amount: appointmentData.total,
        currency: 'LKR',
        appointmentId: appointmentData.appointmentId,
        description: `Appointment with ${appointmentData.doctorName} - ${appointmentData.specialty}`,
        customerInfo: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone || '0771234567',
          address: 'Colombo',
          city: 'Colombo',
          country: 'Sri Lanka'
        },
        metadata: {
          doctorName: appointmentData.doctorName,
          specialty: appointmentData.specialty,
          hospitalName: appointmentData.hospitalName,
          date: appointmentData.date,
          time: appointmentData.time,
          tokenNumber: appointmentData.tokenNumber.toString(),
          appointmentType: appointmentData.appointmentType,
          consultationFee: appointmentData.consultationFee,
          hospitalFee: appointmentData.hospitalFee,
          tax: appointmentData.tax
        }
      };

      const payHerePayment = await paymentService.createPayHerePayment(paymentData);
      console.log('PayHere payment data received:', JSON.stringify(payHerePayment, null, 2));
      setPayHereData(payHerePayment);
      return payHerePayment;
    } catch (error: any) {
      console.error('PayHere payment creation error:', error);
      
      // Handle authentication errors specifically
      if (error.message?.includes('Access token required') || error.message?.includes('Unauthorized')) {
        Alert.alert(
          'Authentication Required',
          'Please log in again to continue with payment.',
          [
            {
              text: 'Go to Login',
              onPress: () => router.push('/(auth)/login')
            }
          ]
        );
        return undefined;
      }
      
      throw error;
    }
  };

  const handlePayHerePayment = async () => {
    try {
      setIsProcessing(true);
      
      // Create PayHere payment data
      const payHerePayment = await createPayHerePayment();
      
      if (!payHerePayment) {
        throw new Error('Failed to create PayHere payment');
      }
      
      // Show PayHere WebView
      setShowPayHereWebView(true);
    } catch (error) {
      console.error('PayHere payment setup error:', error);
      Alert.alert(
        'Payment Error',
        'Failed to initialize payment. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayHereSuccess = async (paymentId: string, orderId: string) => {
    try {
      setShowPayHereWebView(false);
      
      // Confirm payment with backend
      const confirmation = await paymentService.confirmPayment({
        orderId,
        paymentId,
        payhereData: { paymentId, orderId }
      });

      if (confirmation.success) {
        router.replace({
          pathname: '/(patient)/payment-success',
          params: {
            transactionId: paymentId,
            amount: appointmentData.total.toString(),
            doctorName: appointmentData.doctorName,
            specialty: appointmentData.specialty,
            hospitalName: appointmentData.hospitalName,
            date: appointmentData.date,
            time: appointmentData.time,
            tokenNumber: appointmentData.tokenNumber.toString(),
            appointmentId: appointmentData.appointmentId,
            paymentMethod: 'PayHere'
          }
        });
      } else {
        throw new Error('Payment confirmation failed');
      }
    } catch (error) {
      console.error('PayHere payment confirmation error:', error);
      router.replace({
        pathname: '/(patient)/payment-failure',
        params: {
          errorCode: 'CONFIRMATION_FAILED',
          errorMessage: 'Payment was processed but confirmation failed. Please contact support.',
          amount: appointmentData.total.toString(),
          doctorName: appointmentData.doctorName,
          specialty: appointmentData.specialty,
          date: appointmentData.date,
          time: appointmentData.time,
          appointmentId: appointmentData.appointmentId,
          transactionId: paymentId
        }
      });
    }
  };

  const handlePayHereError = (error: string) => {
    setShowPayHereWebView(false);
    router.replace({
      pathname: '/(patient)/payment-failure',
      params: {
        errorCode: 'PAYMENT_FAILED',
        errorMessage: error,
        amount: appointmentData.total.toString(),
        doctorName: appointmentData.doctorName,
        specialty: appointmentData.specialty,
        date: appointmentData.date,
        time: appointmentData.time,
        appointmentId: appointmentData.appointmentId
      }
    });
  };

  const handlePayHereCancel = () => {
    setShowPayHereWebView(false);
    Alert.alert('Payment Canceled', 'Payment was canceled by user.');
  };

  const handlePayHereClose = () => {
    setShowPayHereWebView(false);
  };


  const handleInsurancePayment = async () => {
    setIsProcessing(true);
    
    // Simulate insurance payment processing
    setTimeout(() => {
      setIsProcessing(false);
      router.replace({
        pathname: '/(patient)/payment-success',
        params: {
          transactionId: `INS-${Date.now()}`,
          amount: appointmentData.total.toString(),
          doctorName: appointmentData.doctorName,
          specialty: appointmentData.specialty,
          hospitalName: appointmentData.hospitalName,
          date: appointmentData.date,
          time: appointmentData.time,
          tokenNumber: appointmentData.tokenNumber.toString(),
          appointmentId: appointmentData.appointmentId,
          paymentMethod: 'Insurance Coverage'
        }
      });
    }, 2000);
  };

  const handlePayment = async () => {
    // Check if user is authenticated
    if (!user || !token) {
      Alert.alert(
        'Authentication Required',
        'Please log in to continue with payment.',
        [
          {
            text: 'Go to Login',
            onPress: () => router.push('/(auth)/login')
          }
        ]
      );
      return;
    }

    // If insurance is selected, handle insurance payment
    if (useInsurance) {
      await handleInsurancePayment();
    } else {
      // Default to PayHere payment
      await handlePayHerePayment();
    }
  };

  const renderAppointmentSummary = () => (
    <View style={styles.summaryCard}>
      <Text style={styles.cardTitle}>Appointment Summary</Text>
      
      <View style={styles.summaryItem}>
        <User size={20} color={COLORS.primary} />
        <View style={styles.summaryContent}>
          <Text style={styles.summaryLabel}>Doctor</Text>
          <Text style={styles.summaryValue}>{appointmentData.doctorName}</Text>
          <Text style={styles.summarySubValue}>{appointmentData.specialty}</Text>
        </View>
      </View>

      <View style={styles.summaryItem}>
        <Building size={20} color={COLORS.primary} />
        <View style={styles.summaryContent}>
          <Text style={styles.summaryLabel}>Hospital</Text>
          <Text style={styles.summaryValue}>{appointmentData.hospitalName}</Text>
        </View>
      </View>

      <View style={styles.summaryItem}>
        <Calendar size={20} color={COLORS.primary} />
        <View style={styles.summaryContent}>
          <Text style={styles.summaryLabel}>Date & Time</Text>
          <Text style={styles.summaryValue}>
            {new Date(appointmentData.date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
          </Text>
          <Text style={styles.summarySubValue}>
            {appointmentData.time} • Token #{appointmentData.tokenNumber}
          </Text>
        </View>
      </View>

      <View style={styles.summaryItem}>
        <FileText size={20} color={COLORS.primary} />
        <View style={styles.summaryContent}>
          <Text style={styles.summaryLabel}>Appointment Type</Text>
          <Text style={styles.summaryValue}>{appointmentData.appointmentType}</Text>
          {appointmentData.notes && (
            <Text style={styles.summarySubValue} numberOfLines={2}>
              Notes: {appointmentData.notes}
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  const renderPricingBreakdown = () => (
    <View style={styles.pricingCard}>
      <Text style={styles.cardTitle}>Payment Breakdown</Text>
      
      <View style={styles.pricingRow}>
        <Text style={styles.pricingLabel}>
          {appointmentData.appointmentType} Fee ({appointmentData.specialty})
        </Text>
        <Text style={styles.pricingValue}>{formatCurrency(appointmentData.consultationFee)}</Text>
      </View>
      
      <View style={styles.pricingRow}>
        <Text style={styles.pricingLabel}>Hospital Fee</Text>
        <Text style={styles.pricingValue}>{formatCurrency(appointmentData.hospitalFee)}</Text>
      </View>
      
      <View style={styles.pricingRow}>
        <Text style={styles.pricingLabel}>Tax (10%)</Text>
        <Text style={styles.pricingValue}>{formatCurrency(appointmentData.tax)}</Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total Amount</Text>
        <Text style={styles.totalValue}>{formatCurrency(appointmentData.total)}</Text>
      </View>
    </View>
  );

  const renderInsuranceOption = () => (
    <View style={styles.insuranceCard}>
      <Text style={styles.cardTitle}>Payment Options</Text>
      
      <TouchableOpacity
        style={[
          styles.insuranceItem,
          useInsurance && styles.selectedInsuranceItem
        ]}
        onPress={() => setUseInsurance(!useInsurance)}
      >
        <Text style={styles.insuranceIcon}>{insuranceOption.icon}</Text>
        <View style={styles.insuranceInfo}>
          <Text style={styles.insuranceName}>{insuranceOption.name}</Text>
          {insuranceOption.subtitle && (
            <Text style={styles.insuranceSubtitle}>{insuranceOption.subtitle}</Text>
          )}
        </View>
        {useInsurance && (
          <CheckCircle size={20} color={COLORS.primary} />
        )}
      </TouchableOpacity>
      
      {/* {!useInsurance && (
        <View style={styles.paymentMethodInfo}>
          <Text style={styles.paymentMethodNote}>
            💳 Payment will be processed through PayHere secure gateway
          </Text>
        </View>
      )} */}
    </View>
  );


  const renderSecurityFeatures = () => (
    <View style={styles.securityCard}>
      <View style={styles.securityHeader}>
        <Shield size={20} color={COLORS.success} />
        <Text style={styles.securityTitle}>Secure Payment</Text>
      </View>
      
      <View style={styles.securityFeatures}>
        <View style={styles.securityFeature}>
          <Lock size={16} color={COLORS.textSecondary} />
          <Text style={styles.securityText}>256-bit SSL encryption</Text>
        </View>
        <View style={styles.securityFeature}>
          <Shield size={16} color={COLORS.textSecondary} />
          <Text style={styles.securityText}>PCI DSS compliant</Text>
        </View>
        <View style={styles.securityFeature}>
          <CheckCircle size={16} color={COLORS.textSecondary} />
          <Text style={styles.securityText}>HIPAA protected</Text>
        </View>
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
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Debug info for missing parameters (remove in production) */}
        {!hasRequiredParams && (
          <View style={styles.debugCard}>
            <Text style={styles.debugTitle}>⚠️ Debug Info</Text>
            <Text style={styles.debugText}>
              Some appointment parameters are missing. Using default values.
              {'\n'}Received parameters: {Object.keys(params).length}
            </Text>
          </View>
        )}
        
        {renderAppointmentSummary()}
        {renderPricingBreakdown()}
        {renderInsuranceOption()}
        {renderSecurityFeatures()}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={isProcessing ? "Processing..." : `Pay ${formatCurrency(appointmentData.total)}`}
          onPress={handlePayment}
          style={styles.payButton}
          isLoading={isProcessing}
          disabled={isProcessing}
        />
      </View>

      {/* PayHere WebView Modal */}
      {showPayHereWebView && payHereData && (
        <View style={StyleSheet.absoluteFill}>
          <PayHereWebView
            paymentData={payHereData}
            onSuccess={handlePayHereSuccess}
            onError={handlePayHereError}
            onCancel={handlePayHereCancel}
            onClose={handlePayHereClose}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

export default function PaymentScreen() {
  return <PaymentScreenContent />;
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
  content: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  cardTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  summaryContent: {
    marginLeft: 12,
    flex: 1,
  },
  summaryLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: SIZES.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  summarySubValue: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  pricingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  pricingLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  pricingValue: {
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  insuranceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  insuranceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  selectedInsuranceItem: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.transparentPrimary,
  },
  insuranceIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  insuranceInfo: {
    flex: 1,
  },
  insuranceName: {
    fontSize: SIZES.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  insuranceSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  paymentMethodInfo: {
    marginTop: 8,
    padding: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
  },
  paymentMethodNote: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  securityCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  securityTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  securityFeatures: {
    gap: 8,
  },
  securityFeature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  footer: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  payButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
  },
  debugCard: {
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  debugTitle: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 4,
  },
  debugText: {
    fontSize: SIZES.xs,
    color: '#856404',
    lineHeight: 16,
  },
});