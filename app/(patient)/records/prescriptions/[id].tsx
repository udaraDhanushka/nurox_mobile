import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, User, MapPin, Pill, RefreshCw } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { Button } from '@/components/Button';
import { useMedicalStore } from '@/store/medicalStore';

export default function PrescriptionDetailsScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { prescriptions } = useMedicalStore();

    const prescription = prescriptions.find(p => p.id === id);

    if (!prescription) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <ArrowLeft size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Prescription Details</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={styles.notFoundContainer}>
                    <Text style={styles.notFoundText}>Prescription not found</Text>
                    <Button
                        title="Go Back"
                        onPress={() => router.back()}
                        style={styles.goBackButton}
                    />
                </View>
            </SafeAreaView>
        );
    }

    const handleRefillRequest = () => {
        Alert.alert(
            'Request Refill',
            'Would you like to request a refill for this prescription?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Request Refill',
                    onPress: () => {
                        Alert.alert(
                            'Refill Requested',
                            'Your refill request has been sent to the pharmacy. You will receive a notification when it is ready for pickup.',
                            [{ text: 'OK' }]
                        );
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
                <Text style={styles.headerTitle}>Prescription Details</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Status Badge */}
                <View style={[
                    styles.statusBadgeContainer,
                    prescription.status === 'active' ? styles.activeBadge :
                        prescription.status === 'completed' ? styles.completedBadge : styles.cancelledBadge
                ]}>
                    <Text style={styles.statusBadgeText}>{prescription.status}</Text>
                </View>

                {/* Prescription Info */}
                <View style={styles.infoCard}>
                    <View style={styles.infoItem}>
                        <Calendar size={20} color={COLORS.primary} />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Date Prescribed</Text>
                            <Text style={styles.infoValue}>{prescription.date}</Text>
                        </View>
                    </View>

                    <View style={styles.infoItem}>
                        <User size={20} color={COLORS.primary} />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Prescribed By</Text>
                            <Text style={styles.infoValue}>Dr. {prescription.doctorName}</Text>
                        </View>
                    </View>

                    <View style={styles.infoItem}>
                        <MapPin size={20} color={COLORS.primary} />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Pharmacy</Text>
                            <Text style={styles.infoValue}>{prescription.pharmacy}</Text>
                        </View>
                    </View>

                    <View style={styles.infoItem}>
                        <RefreshCw size={20} color={COLORS.primary} />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Refills Remaining</Text>
                            <Text style={styles.infoValue}>{prescription.refillsRemaining}</Text>
                        </View>
                    </View>
                </View>

                {/* Medications */}
                <View style={styles.medicationsCard}>
                    <Text style={styles.medicationsTitle}>Medications</Text>

                    {prescription.medications.map((medication, index) => (
                        <View key={index} style={styles.medicationItem}>
                            <View style={styles.medicationHeader}>
                                <View style={styles.medicationTitleContainer}>
                                    <Pill size={20} color={COLORS.primary} />
                                    <Text style={styles.medicationName}>{medication.name}</Text>
                                </View>
                                <Text style={styles.medicationDosage}>{medication.dosage}</Text>
                            </View>

                            <View style={styles.medicationDetails}>
                                <Text style={styles.medicationDetail}>
                                    <Text style={styles.detailLabel}>Frequency: </Text>
                                    {medication.frequency}
                                </Text>
                                <Text style={styles.medicationDetail}>
                                    <Text style={styles.detailLabel}>Duration: </Text>
                                    {medication.duration}
                                </Text>
                                {medication.notes && (
                                    <Text style={styles.medicationDetail}>
                                        <Text style={styles.detailLabel}>Instructions: </Text>
                                        {medication.notes}
                                    </Text>
                                )}
                            </View>
                        </View>
                    ))}
                </View>

                {/* Action Buttons */}
                {prescription.status === 'active' && prescription.refillsRemaining > 0 && (
                    <Button
                        title="Request Refill"
                        onPress={handleRefillRequest}
                        style={styles.refillButton}
                    />
                )}

                <Button
                    title="Download Prescription"
                    variant="outline"
                    onPress={() => Alert.alert('Download', 'Prescription PDF downloaded successfully.')}
                    style={styles.downloadButton}
                />
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
    activeBadge: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
    },
    completedBadge: {
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
    },
    cancelledBadge: {
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
    },
    statusBadgeText: {
        fontSize: SIZES.sm,
        fontWeight: '600',
        color: COLORS.textPrimary,
        textTransform: 'capitalize',
    },
    infoCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        ...SHADOWS.small,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    infoContent: {
        marginLeft: 12,
        flex: 1,
    },
    infoLabel: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: SIZES.md,
        color: COLORS.textPrimary,
    },
    medicationsCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        ...SHADOWS.small,
    },
    medicationsTitle: {
        fontSize: SIZES.md,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 16,
    },
    medicationItem: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        paddingBottom: 16,
        marginBottom: 16,
    },
    medicationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    medicationTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    medicationName: {
        fontSize: SIZES.md,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginLeft: 8,
    },
    medicationDosage: {
        fontSize: SIZES.sm,
        fontWeight: '600',
        color: COLORS.primary,
    },
    medicationDetails: {
        marginLeft: 28,
    },
    medicationDetail: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    detailLabel: {
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    refillButton: {
        marginBottom: 12,
    },
    downloadButton: {
        marginBottom: 24,
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