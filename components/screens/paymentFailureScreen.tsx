import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { XCircle, ArrowLeft, CreditCard, RefreshCw, Phone, Mail } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { Button } from '@/components/Button';

export default function PaymentFailureScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Handle both URL parameters and navigation parameters
  const errorData = {
    errorCode: (params.errorCode as string) || 'PAYMENT_FAILED',
    errorMessage: (params.errorMessage as string) || 'Your payment could not be processed at this time.',
    amount: parseFloat((params.amount as string) || '275.00'),
    doctorName: (params.doctorName as string) || 'Dr. Sarah Johnson',
    specialty: (params.specialty as string) || 'Cardiologist',
    date: (params.date as string) || '2025-06-06',
    time: (params.time as string) || '10:30 AM',
    appointmentId: (params.appointmentId as string) || 'APT123',
    transactionId: (params.transactionId as string) || null,
  };

  const getErrorDetails = () => {
    switch (errorData.errorCode) {
      case 'CARD_DECLINED':
        return {
          title: 'Card Declined',
          message: 'Your card was declined by your bank. Please try a different payment method or contact your bank.',
          suggestion: 'Try using a different card or contact your bank'
        };
      case 'INSUFFICIENT_FUNDS':
        return {
          title: 'Insufficient Funds',
          message: 'Your account does not have sufficient funds to complete this transaction.',
          suggestion: 'Please check your account balance or use a different payment method'
        };
      case 'EXPIRED_CARD':
        return {
          title: 'Card Expired',
          message: 'The card you entered has expired. Please use a valid card.',
          suggestion: 'Please update your card information and try again'
        };
      case 'INVALID_CVV':
        return {
          title: 'Invalid Security Code',
          message: 'The security code (CVV) you entered is incorrect.',
          suggestion: 'Please check your CVV and try again'
        };
      case 'NETWORK_ERROR':
        return {
          title: 'Connection Error',
          message: 'There was a problem connecting to our payment processor.',
          suggestion: 'Please check your internet connection and try again'
        };
      default:
        return {
          title: 'Payment Failed',
          message: errorData.errorMessage,
          suggestion: 'Please try again or contact support if the problem persists'
        };
    }
  };

  const errorDetails = getErrorDetails();

  const handleRetryPayment = () => {
    router.back(); // Go back to payment screen
  };

  const handleTryDifferentMethod = () => {
    router.replace('/(patient)/payments'); // Navigate to payment screen with different method
  };

  const handleContactSupport = () => {
    // In a real app, this would open a support chat or email
    console.log('Contact support requested');
  };

  const handleGoBack = () => {
    router.push('/(patient)/patient-appointments/new');
  };

  const renderTroubleshootingTips = () => (
    <View style={styles.tipsCard}>
      <Text style={styles.cardTitle}>Troubleshooting Tips</Text>
      
      <View style={styles.tipItem}>
        <Text style={styles.tipNumber}>1.</Text>
        <Text style={styles.tipText}>Check that your card details are entered correctly</Text>
      </View>
      
      <View style={styles.tipItem}>
        <Text style={styles.tipNumber}>2.</Text>
        <Text style={styles.tipText}>Ensure your card has sufficient funds</Text>
      </View>
      
      <View style={styles.tipItem}>
        <Text style={styles.tipNumber}>3.</Text>
        <Text style={styles.tipText}>Verify that your card is not expired</Text>
      </View>
      
      <View style={styles.tipItem}>
        <Text style={styles.tipNumber}>4.</Text>
        <Text style={styles.tipText}>Check with your bank for any restrictions</Text>
      </View>
      
      <View style={styles.tipItem}>
        <Text style={styles.tipNumber}>5.</Text>
        <Text style={styles.tipText}>Try using a different payment method</Text>
      </View>
    </View>
  );

  const renderAppointmentDetails = () => (
    <View style={styles.appointmentCard}>
      <Text style={styles.cardTitle}>Appointment Details</Text>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Doctor</Text>
        <Text style={styles.detailValue}>{errorData.doctorName}</Text>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Specialty</Text>
        <Text style={styles.detailValue}>{errorData.specialty}</Text>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Date & Time</Text>
        <Text style={styles.detailValue}>
          {new Date(errorData.date).toLocaleDateString()} at {errorData.time}
        </Text>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Amount</Text>
        <Text style={styles.detailValue}>${errorData.amount.toFixed(2)}</Text>
      </View>
      
      {errorData.transactionId && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Transaction ID</Text>
          <Text style={styles.detailValue}>{errorData.transactionId}</Text>
        </View>
      )}
    </View>
  );

  const renderSupportOptions = () => (
    <View style={styles.supportCard}>
      <Text style={styles.cardTitle}>Need Help?</Text>
      
      <TouchableOpacity style={styles.supportOption} onPress={handleContactSupport}>
        <Phone size={20} color={COLORS.primary} />
        <View style={styles.supportContent}>
          <Text style={styles.supportTitle}>Call Support</Text>
          <Text style={styles.supportSubtitle}>1-800-NUROX-HELP</Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.supportOption} onPress={handleContactSupport}>
        <Mail size={20} color={COLORS.primary} />
        <View style={styles.supportContent}>
          <Text style={styles.supportTitle}>Email Support</Text>
          <Text style={styles.supportSubtitle}>support@nurox.com</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleGoBack}
        >
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Failed</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Error Icon */}
        <View style={styles.errorIconContainer}>
          <View style={styles.errorIcon}>
            <XCircle size={80} color={COLORS.error} />
          </View>
        </View>

        {/* Error Message */}
        <Text style={styles.errorTitle}>{errorDetails.title}</Text>
        <Text style={styles.errorMessage}>{errorDetails.message}</Text>
        <Text style={styles.errorSuggestion}>{errorDetails.suggestion}</Text>

        {renderAppointmentDetails()}
        {renderTroubleshootingTips()}
        {renderSupportOptions()}
      </View>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <Button
          title="Try Again"
          onPress={handleRetryPayment}
          style={styles.primaryButton}
          icon={<RefreshCw size={20} color={COLORS.white} />}
        />
        <Button
          title="Try Different Payment Method"
          onPress={handleTryDifferentMethod}
          style={styles.secondaryButton}
          variant="outline"
          icon={<CreditCard size={20} color={COLORS.primary} />}
        />
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
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  errorIconContainer: {
    marginTop: 20,
    marginBottom: 24,
  },
  errorIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.transparentError,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  errorSuggestion: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
    paddingHorizontal: 20,
    fontStyle: 'italic',
  },
  appointmentCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  tipsCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  supportCard: {
    width: '100%',
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
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: SIZES.sm,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipNumber: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: 8,
    minWidth: 20,
  },
  tipText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  supportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  supportContent: {
    marginLeft: 12,
  },
  supportTitle: {
    fontSize: SIZES.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  supportSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    marginBottom: 12,
  },
  secondaryButton: {
    borderColor: COLORS.primary,
  },
});