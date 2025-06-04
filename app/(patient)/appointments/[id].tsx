import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, MapPin, ArrowLeft, Phone, MessageCircle, X } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { Button } from '@/components/Button';
import { useAppointmentStore } from '@/store/appointmentStore';

export default function AppointmentDetailsScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { getAppointmentById, cancelAppointment } = useAppointmentStore();
    const [isLoading, setIsLoading] = useState(false);

    const appointment = getAppointmentById(id as string);

    if (!appointment) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <ArrowLeft size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Appointment Details</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={styles.notFoundContainer}>
                    <Text style={styles.notFoundText}>Appointment not found</Text>
                    <Button
                        title="Go Back"
                        onPress={() => router.back()}
                        style={styles.goBackButton}
                    />
                </View>
            </SafeAreaView>
        );
    }

    const handleCancelAppointment = () => {
        Alert.alert(
            'Cancel Appointment',
            'Are you sure you want to cancel this appointment?',
            [
                {
                    text: 'No',
                    style: 'cancel'
                },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: () => {
                        setIsLoading(true);

                        // Simulate API delay
                        setTimeout(() => {
                            cancelAppointment(appointment.id);
                            setIsLoading(false);

                            Alert.alert(
                                'Appointment Cancelled',
                                'Your appointment has been cancelled successfully.',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => router.back()
                                    }
                                ]
                            );
                        }, 1000);
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <ArrowLeft size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Appointment Details</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Status Badge */}
                <View style={[
                    styles.statusBadgeContainer,
                    appointment.status === 'confirmed' ? styles.confirmedContainer :
                        appointment.status === 'pending' ? styles.pendingContainer : styles.cancelledContainer
                ]}>
                    <Text style={styles.statusBadgeText}>
                        {appointment.status === 'confirmed' ? 'Confirmed' :
                            appointment.status === 'pending' ? 'Pending Confirmation' : 'Cancelled'}
                    </Text>
                </View>

                {/* Doctor Info */}
                <View style={styles.doctorCard}>
                    <Image
                        source={{ uri: appointment.doctorImage }}
                        style={styles.doctorImage}
                    />
                    <View style={styles.doctorInfo}>
                        <Text style={styles.doctorName}>{appointment.doctorName}</Text>
                        <Text style={styles.doctorSpecialty}>{appointment.specialty}</Text>
                    </View>
                </View>

                {/* Appointment Details */}
                <View style={styles.detailsCard}>
                    <Text style={styles.detailsTitle}>Appointment Details</Text>

                    <View style={styles.detailItem}>
                        <Calendar size={20} color={COLORS.primary} />
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Date</Text>
                            <Text style={styles.detailValue}>{appointment.date}</Text>
                        </View>
                    </View>

                    <View style={styles.detailItem}>
                        <Clock size={20} color={COLORS.primary} />
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Time</Text>
                            <Text style={styles.detailValue}>{appointment.time}</Text>
                        </View>
                    </View>

                    <View style={styles.detailItem}>
                        <MapPin size={20} color={COLORS.primary} />
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Location</Text>
                            <Text style={styles.detailValue}>{appointment.location}</Text>
                        </View>
                    </View>

                    {appointment.notes && (
                        <View style={styles.notesContainer}>
                            <Text style={styles.notesLabel}>Additional Notes</Text>
                            <Text style={styles.notesText}>{appointment.notes}</Text>
                        </View>
                    )}
                </View>

                {/* Action Buttons */}
                {appointment.status !== 'cancelled' && (
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity style={styles.actionButton}>
                            <Phone size={20} color={COLORS.primary} />
                            <Text style={styles.actionText}>Call</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton}>
                            <MessageCircle size={20} color={COLORS.primary} />
                            <Text style={styles.actionText}>Message</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.cancelButton]}
                            onPress={handleCancelAppointment}
                        >
                            <X size={20} color={COLORS.error} />
                            <Text style={[styles.actionText, styles.cancelText]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Buttons */}
                <View style={styles.buttonsContainer}>
                    {appointment.status === 'confirmed' && (
                        <Button
                            title="Reschedule"
                            variant="outline"
                            onPress={() => router.push('/myAppointments/new')}
                            style={styles.rescheduleButton}
                        />
                    )}

                    {appointment.status === 'cancelled' && (
                        <Button
                            title="Book New Appointment"
                            onPress={() => router.push('/myAppointments/new')}
                            style={styles.bookButton}
                        />
                    )}
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
    statusBadgeContainer: {
        alignSelf: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 16,
    },
    confirmedContainer: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
    },
    pendingContainer: {
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
    },
    cancelledContainer: {
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
    },
    statusBadgeText: {
        fontSize: SIZES.sm,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    doctorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        ...SHADOWS.small,
    },
    doctorImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: 16,
    },
    doctorInfo: {
        flex: 1,
    },
    doctorName: {
        fontSize: SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    doctorSpecialty: {
        fontSize: SIZES.md,
        color: COLORS.textSecondary,
    },
    detailsCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        ...SHADOWS.small,
    },
    detailsTitle: {
        fontSize: SIZES.md,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 16,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    detailContent: {
        marginLeft: 12,
        flex: 1,
    },
    detailLabel: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    detailValue: {
        fontSize: SIZES.md,
        color: COLORS.textPrimary,
    },
    notesContainer: {
        marginTop: 8,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    notesLabel: {
        fontSize: SIZES.sm,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    notesText: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        ...SHADOWS.small,
    },
    actionButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },
    actionText: {
        fontSize: SIZES.sm,
        color: COLORS.primary,
        marginTop: 4,
    },
    cancelButton: {
        borderLeftWidth: 1,
        borderLeftColor: COLORS.border,
    },
    cancelText: {
        color: COLORS.error,
    },
    buttonsContainer: {
        marginBottom: 24,
    },
    rescheduleButton: {
        marginBottom: 12,
    },
    bookButton: {
        marginBottom: 12,
    },
    notFoundContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    notFoundText: {
        fontSize: SIZES.lg,
        color: COLORS.textSecondary,
        marginBottom: 16,
    },
    goBackButton: {
        width: 200,
    },
});