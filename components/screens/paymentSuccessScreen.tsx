import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle, Calendar, User, Building, Clock, Receipt, ArrowRight } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { Button } from '@/components/Button';
import { useAppointmentStore } from '@/store/appointmentStore';
import { formatCurrency } from '@/utils/currencyUtils';

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { updateAppointment } = useAppointmentStore();
  
  // Handle both URL parameters and navigation parameters
  const paymentData = {
    transactionId: (params.transactionId as string) || 'TXN123456789',
    amount: parseFloat((params.amount as string) || '15000.00'),
    doctorName: (params.doctorName as string) || 'Dr. Sarah Johnson',
    specialty: (params.specialty as string) || 'Cardiologist',
    hospitalName: (params.hospitalName as string) || 'Heart Care Institute',
    date: (params.date as string) || '2025-06-06',
    time: (params.time as string) || '10:30 AM',
    tokenNumber: parseInt((params.tokenNumber as string) || '15'),
    appointmentId: (params.appointmentId as string) || 'APT123',
    paymentMethod: (params.paymentMethod as string) || 'Credit Card'
  };

  // Update appointment status to confirmed after successful payment
  useEffect(() => {
    if (paymentData.appointmentId && paymentData.transactionId) {
      updateAppointment(paymentData.appointmentId, { 
        status: 'confirmed',
        paymentId: paymentData.transactionId
      });
    }
  }, [paymentData.appointmentId, paymentData.transactionId, updateAppointment]);

  const handleViewAppointment = () => {
    router.push(`/patient-appointments/${paymentData.appointmentId}`);
  };

  const handleViewReceipt = () => {
    router.push('/(patient)/patient-billing-history');
  };

  const handleBookAnother = () => {
    router.push('/(patient)/patient-appointments/new');
  };

  const handleGoHome = () => {
    router.push('/(patient)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.successIconContainer}>
          <View style={styles.successIcon}>
            <CheckCircle size={80} color={COLORS.success} />
          </View>
        </View>

        {/* Success Message */}
        <Text style={styles.successTitle}>Payment Successful!</Text>
        <Text style={styles.successSubtitle}>
          Your appointment has been booked and payment has been processed successfully.
        </Text>

        {/* Transaction Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Transaction Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction ID</Text>
            <Text style={styles.detailValue}>{paymentData.transactionId}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount Paid</Text>
            <Text style={styles.detailValue}>{formatCurrency(paymentData.amount)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>
            <Text style={styles.detailValue}>{paymentData.paymentMethod}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{new Date().toLocaleDateString()}</Text>
          </View>
        </View>

        {/* Appointment Summary */}
        <View style={styles.appointmentCard}>
          <Text style={styles.cardTitle}>Appointment Summary</Text>
          
          <View style={styles.appointmentItem}>
            <User size={20} color={COLORS.primary} />
            <View style={styles.appointmentContent}>
              <Text style={styles.appointmentLabel}>Doctor</Text>
              <Text style={styles.appointmentValue}>{paymentData.doctorName}</Text>
              <Text style={styles.appointmentSubValue}>{paymentData.specialty}</Text>
            </View>
          </View>

          <View style={styles.appointmentItem}>
            <Building size={20} color={COLORS.primary} />
            <View style={styles.appointmentContent}>
              <Text style={styles.appointmentLabel}>Hospital</Text>
              <Text style={styles.appointmentValue}>{paymentData.hospitalName}</Text>
            </View>
          </View>

          <View style={styles.appointmentItem}>
            <Calendar size={20} color={COLORS.primary} />
            <View style={styles.appointmentContent}>
              <Text style={styles.appointmentLabel}>Date & Time</Text>
              <Text style={styles.appointmentValue}>
                {new Date(paymentData.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Text>
              <Text style={styles.appointmentSubValue}>
                {paymentData.time} • Token #{paymentData.tokenNumber}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsCard}>
          <TouchableOpacity style={styles.actionItem} onPress={handleViewAppointment}>
            <Calendar size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>View Appointment</Text>
            <ArrowRight size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleViewReceipt}>
            <Receipt size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>View Receipt</Text>
            <ArrowRight size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <Button
          title="Book Another Appointment"
          onPress={handleBookAnother}
          style={styles.primaryButton}
        />
        <Button
          title="Go to Home"
          onPress={handleGoHome}
          style={styles.secondaryButton}
          variant="outline"
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
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  successIconContainer: {
    marginTop: 40,
    marginBottom: 24,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.transparentSuccess,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  appointmentCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  actionsCard: {
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
  appointmentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  appointmentContent: {
    marginLeft: 12,
    flex: 1,
  },
  appointmentLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  appointmentValue: {
    fontSize: SIZES.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  appointmentSubValue: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  actionText: {
    flex: 1,
    fontSize: SIZES.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginLeft: 12,
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