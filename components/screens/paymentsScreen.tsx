import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CreditCard, Smartphone, Shield, Lock, Calendar, User, Building, Clock, CheckCircle, FileText } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { Button } from '@/components/Button';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { STRIPE_CONFIG } from '@/config/stripe';
import paymentService, { CreatePaymentIntentRequest, PaymentIntent } from '@/services/paymentService';
import { useAuthStore } from '@/store/authStore';

interface PaymentMethod {
  id: string;
  type: 'card' | 'digital' | 'insurance';
  name: string;
  icon: string;
  subtitle?: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'card',
    type: 'card',
    name: 'Credit/Debit Card',
    icon: '💳',
    subtitle: 'Visa, Mastercard, Amex accepted'
  },
  // {
  //   id: 'apple_pay',
  //   type: 'digital',
  //   name: 'Apple Pay',
  //   icon: '🍎',
  //   subtitle: 'Pay with Touch ID or Face ID'
  // },
  // {
  //   id: 'google_pay',
  //   type: 'digital',
  //   name: 'Google Pay',
  //   icon: '🎯',
  //   subtitle: 'Quick and secure payment'
  // },
  // {
  //   id: 'samsung_pay',
  //   type: 'digital',
  //   name: 'Samsung Pay',
  //   icon: '📱',
  //   subtitle: 'Samsung Wallet payment'
  // },
  {
    id: 'insurance',
    type: 'insurance',
    name: 'Insurance Coverage',
    icon: '🏥',
    subtitle: 'Use your health insurance'
  }
];

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
    hospitalFee: 25.00,
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
      'Cardiologist': 200.00,
      'Dermatologist': 150.00,
      'Pediatrician': 120.00,
      'Orthopedic': 180.00,
      'Neurology': 250.00,
      'ENT Specialist': 140.00,
      'General Physician': 100.00,
    };
    
    const typeMultipliers: { [key: string]: number } = {
      'Consultation': 1.0,
      'Follow-up': 0.7,
      'Routine Checkup': 0.8,
      'Specialist Visit': 1.2,
      'Emergency': 1.5
    };
    
    const baseFee = baseFeesBySpecialty[specialty] || 150.00;
    const multiplier = typeMultipliers[appointmentType] || 1.0;
    
    return Math.round(baseFee * multiplier * 100) / 100; // Round to 2 decimal places
  }

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const formatCardNumber = (text: string) => {
    // Remove all non-digits
    const digitsOnly = text.replace(/\D/g, '');
    // Add spaces every 4 digits
    const formatted = digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.slice(0, 19); // Limit to 16 digits + 3 spaces
  };

  const formatExpiryDate = (text: string) => {
    const digitsOnly = text.replace(/\D/g, '');
    if (digitsOnly.length >= 2) {
      return digitsOnly.slice(0, 2) + '/' + digitsOnly.slice(2, 4);
    }
    return digitsOnly;
  };

  const createPaymentIntent = async (): Promise<PaymentIntent | undefined> => {
    try {
      const paymentData: CreatePaymentIntentRequest = {
        amount: Math.round(appointmentData.total * 100), // Convert to cents
        currency: 'usd',
        appointmentId: appointmentData.appointmentId,
        description: `Appointment with ${appointmentData.doctorName} - ${appointmentData.specialty}`,
        metadata: {
          doctorName: appointmentData.doctorName,
          specialty: appointmentData.specialty,
          hospitalName: appointmentData.hospitalName,
          date: appointmentData.date,
          time: appointmentData.time,
          tokenNumber: appointmentData.tokenNumber.toString(),
          appointmentType: appointmentData.appointmentType,
          // Add fee breakdown for billing history
          consultationFee: appointmentData.consultationFee || (appointmentData.total * 0.8),
          hospitalFee: appointmentData.hospitalFee || (appointmentData.total * 0.15),
          tax: appointmentData.tax || (appointmentData.total * 0.05)
        }
      };

      const paymentIntent = await paymentService.createPaymentIntent(paymentData);
      setPaymentIntentId(paymentIntent.paymentIntentId);
      return paymentIntent;
    } catch (error: any) {
      console.error('Payment intent creation error:', error);
      
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

  const initializePaymentSheet = async () => {
    try {
      const paymentIntent = await createPaymentIntent();
      
      // Check if payment intent was created successfully
      if (!paymentIntent) {
        throw new Error('Failed to create payment intent');
      }
      
      console.log('Initializing payment sheet with return URL:', STRIPE_CONFIG.returnURL);
      
      const { error } = await initPaymentSheet({
        merchantDisplayName: 'Nurox Healthcare',
        paymentIntentClientSecret: paymentIntent.clientSecret,
        defaultBillingDetails: {
          name: cardHolderName || undefined,
        },
        appearance: {
          colors: {
            primary: COLORS.primary,
          },
        },
        returnURL: STRIPE_CONFIG.returnURL,
      });

      if (error) {
        console.error('Payment sheet initialization error:', error);
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Payment sheet setup error:', error);
      throw error;
    }
  };

  const handleStripePayment = async () => {
    try {
      setIsProcessing(true);
      
      // Initialize payment sheet if not already done
      await initializePaymentSheet();
      
      // Present payment sheet
      const { error } = await presentPaymentSheet();
      
      if (error) {
        if (error.code === 'Canceled') {
          Alert.alert('Payment Canceled', 'Payment was canceled by user.');
        } else {
          router.replace({
            pathname: '/(patient)/payment-failure',
            params: {
              errorCode: error.code || 'PAYMENT_FAILED',
              errorMessage: error.message || 'Payment could not be processed.',
              amount: appointmentData.total.toString(),
              doctorName: appointmentData.doctorName,
              specialty: appointmentData.specialty,
              date: appointmentData.date,
              time: appointmentData.time,
              appointmentId: appointmentData.appointmentId
            }
          });
        }
        return;
      }

      // Confirm payment with backend
      if (paymentIntentId) {
        const confirmation = await paymentService.confirmPayment({
          paymentIntentId: paymentIntentId
        });

        if (confirmation.success) {
          router.replace({
            pathname: '/(patient)/payment-success',
            params: {
              transactionId: confirmation.payment.transactionId,
              amount: appointmentData.total.toString(),
              doctorName: appointmentData.doctorName,
              specialty: appointmentData.specialty,
              hospitalName: appointmentData.hospitalName,
              date: appointmentData.date,
              time: appointmentData.time,
              tokenNumber: appointmentData.tokenNumber.toString(),
              appointmentId: appointmentData.appointmentId,
              paymentMethod: 'Credit Card'
            }
          });
        } else {
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
              transactionId: confirmation.payment?.transactionId || ''
            }
          });
        }
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      router.replace({
        pathname: '/(patient)/payment-failure',
        params: {
          errorCode: 'NETWORK_ERROR',
          errorMessage: 'An error occurred while processing your payment. Please try again.',
          amount: appointmentData.total.toString(),
          doctorName: appointmentData.doctorName,
          specialty: appointmentData.specialty,
          date: appointmentData.date,
          time: appointmentData.time,
          appointmentId: appointmentData.appointmentId
        }
      });
    } finally {
      setIsProcessing(false);
    }
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

    if (!selectedPaymentMethod) {
      Alert.alert('Payment Method Required', 'Please select a payment method');
      return;
    }

    if (selectedPaymentMethod === 'card') {
      await handleStripePayment();
    } else if (selectedPaymentMethod === 'insurance') {
      await handleInsurancePayment();
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
        <Text style={styles.pricingValue}>${appointmentData.consultationFee.toFixed(2)}</Text>
      </View>
      
      <View style={styles.pricingRow}>
        <Text style={styles.pricingLabel}>Hospital Fee</Text>
        <Text style={styles.pricingValue}>${appointmentData.hospitalFee.toFixed(2)}</Text>
      </View>
      
      <View style={styles.pricingRow}>
        <Text style={styles.pricingLabel}>Tax (10%)</Text>
        <Text style={styles.pricingValue}>${appointmentData.tax.toFixed(2)}</Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total Amount</Text>
        <Text style={styles.totalValue}>${appointmentData.total.toFixed(2)}</Text>
      </View>
    </View>
  );

  const renderPaymentMethods = () => (
    <View style={styles.paymentMethodsCard}>
      <Text style={styles.cardTitle}>Payment Method</Text>
      
      {paymentMethods.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={[
            styles.paymentMethodItem,
            selectedPaymentMethod === method.id && styles.selectedPaymentMethod
          ]}
          onPress={() => setSelectedPaymentMethod(method.id)}
        >
          <Text style={styles.paymentMethodIcon}>{method.icon}</Text>
          <View style={styles.paymentMethodInfo}>
            <Text style={styles.paymentMethodName}>{method.name}</Text>
            {method.subtitle && (
              <Text style={styles.paymentMethodSubtitle}>{method.subtitle}</Text>
            )}
          </View>
          {selectedPaymentMethod === method.id && (
            <CheckCircle size={20} color={COLORS.primary} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCardForm = () => {
    if (selectedPaymentMethod !== 'card') return null;

    return (
      <View style={styles.cardFormContainer}>
        <Text style={styles.cardTitle}>Card Details</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Card Number</Text>
          <TextInput
            style={styles.textInput}
            value={cardNumber}
            onChangeText={(text) => setCardNumber(formatCardNumber(text))}
            placeholder="1234 5678 9012 3456"
            keyboardType="numeric"
            maxLength={19}
          />
        </View>

        <View style={styles.rowInputs}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.inputLabel}>Expiry Date</Text>
            <TextInput
              style={styles.textInput}
              value={expiryDate}
              onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
              placeholder="MM/YY"
              keyboardType="numeric"
              maxLength={5}
            />
          </View>
          
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.inputLabel}>CVV</Text>
            <TextInput
              style={styles.textInput}
              value={cvv}
              onChangeText={setCvv}
              placeholder="123"
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Cardholder Name</Text>
          <TextInput
            style={styles.textInput}
            value={cardHolderName}
            onChangeText={setCardHolderName}
            placeholder="John Doe"
            autoCapitalize="words"
          />
        </View>
      </View>
    );
  };

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
        {renderPaymentMethods()}
        {renderCardForm()}
        {renderSecurityFeatures()}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={isProcessing ? "Processing..." : `Pay $${appointmentData.total.toFixed(2)}`}
          onPress={handlePayment}
          style={styles.payButton}
          isLoading={isProcessing}
          disabled={isProcessing}
        />
      </View>
    </SafeAreaView>
  );
}

export default function PaymentScreen() {
  return (
    <StripeProvider
      publishableKey={STRIPE_CONFIG.publishableKey}
      merchantIdentifier={STRIPE_CONFIG.merchantIdentifier}
      urlScheme={STRIPE_CONFIG.urlScheme}
    >
      <PaymentScreenContent />
    </StripeProvider>
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
  paymentMethodsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  selectedPaymentMethod: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.transparentPrimary,
  },
  paymentMethodIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: SIZES.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  paymentMethodSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  cardFormContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.small,
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
  rowInputs: {
    flexDirection: 'row',
    alignItems: 'flex-end',
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