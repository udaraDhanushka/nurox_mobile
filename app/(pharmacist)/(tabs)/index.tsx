import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Package, AlertCircle, CheckCircle, User } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { prescriptionService } from '../../../services/prescriptionService';

export default function PharmacistDashboardScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [pendingPrescriptions, setPendingPrescriptions] = useState([]);
    const [stats, setStats] = useState([
        { title: 'Pending', value: 0, icon: <AlertCircle size={24} color={COLORS.warning} /> },
        { title: 'Completed', value: 0, icon: <CheckCircle size={24} color={COLORS.success} /> },
        { title: 'Low Stock', value: 0, icon: <Package size={24} color={COLORS.error} /> }
    ]);
    const [isLoading, setIsLoading] = useState(true);

    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    useEffect(() => {
        loadDashboardData();
    }, [user?.id]);

    const loadDashboardData = async () => {
        if (!user?.id) return;
        
        try {
            setIsLoading(true);
            
            // Load pending prescriptions
            const pendingResponse = await prescriptionService.getPrescriptions({
                status: 'PENDING',
                limit: 5
            });
            setPendingPrescriptions(pendingResponse.prescriptions);

            // Get prescription analytics
            const analyticsResponse = await prescriptionService.getPrescriptionAnalytics();
            
            setStats([
                { 
                    title: 'Pending', 
                    value: analyticsResponse.statusBreakdown?.pending || 0, 
                    icon: <AlertCircle size={24} color={COLORS.warning} /> 
                },
                { 
                    title: 'Completed', 
                    value: (analyticsResponse.statusBreakdown?.dispensed || 0) + (analyticsResponse.statusBreakdown?.ready || 0), 
                    icon: <CheckCircle size={24} color={COLORS.success} /> 
                },
                { 
                    title: 'Low Stock', 
                    value: 0, // This would come from inventory API 
                    icon: <Package size={24} color={COLORS.error} /> 
                }
            ]);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Hello,</Text>
                        <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
                        <Text style={styles.date}>{currentDate}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.profileButton}
                        onPress={() => router.push('/(pharmacist)/profile')}
                    >
                        {user?.profileImage ? (
                            <Image
                                source={{ uri: user.profileImage }}
                                style={styles.profileImage}
                            />
                        ) : (
                            <User size={24} color={COLORS.primary} />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Stats */}
                <View style={styles.statsContainer}>
                    {stats.map((stat, index) => (
                        <View key={index} style={styles.statCard}>
                            <View style={styles.statIconContainer}>
                                {stat.icon}
                            </View>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statTitle}>{stat.title}</Text>
                        </View>
                    ))}
                </View>

                {/* Pending Prescriptions */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Pending Prescriptions</Text>
                        <TouchableOpacity onPress={() => router.push('/prescriptions')}>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color={COLORS.primary} />
                            <Text style={styles.loadingText}>Loading...</Text>
                        </View>
                    ) : pendingPrescriptions.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No pending prescriptions</Text>
                        </View>
                    ) : (
                        pendingPrescriptions.map((prescription) => (
                            <TouchableOpacity
                                key={prescription.id}
                                style={styles.prescriptionCard}
                                onPress={() => router.push(`/prescriptions/${prescription.id}`)}
                            >
                                <Image
                                    source={{ 
                                        uri: prescription.patient?.profileImage || 
                                        'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=987&auto=format&fit=crop'
                                    }}
                                    style={styles.patientImage}
                                />
                                <View style={styles.prescriptionInfo}>
                                    <Text style={styles.patientName}>
                                        {prescription.patient ? 
                                            `${prescription.patient.firstName} ${prescription.patient.lastName}` : 
                                            'Unknown Patient'
                                        }
                                    </Text>
                                    <Text style={styles.medicationName}>
                                        {prescription.items?.[0]?.medicine?.name || 'Unknown medication'}
                                    </Text>
                                    <Text style={styles.prescriptionDetails}>
                                        {prescription.doctor ? 
                                            `Dr. ${prescription.doctor.firstName} ${prescription.doctor.lastName}` : 
                                            'Unknown Doctor'
                                        } • {new Date(prescription.createdAt).toLocaleDateString()}
                                    </Text>
                                </View>
                                <View style={[
                                    styles.statusBadge,
                                    prescription.status === 'PENDING' ? styles.pendingBadge : styles.completedBadge
                                ]}>
                                    <Text style={styles.statusText}>{prescription.status || 'pending'}</Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                {/* Inventory Quick Access */}
                <View style={[styles.sectionContainer, { marginBottom: 20 }]}>
                    <TouchableOpacity 
                        style={styles.inventoryQuickAccess}
                        onPress={() => router.push('/inventory')}
                    >
                        <Package size={24} color={COLORS.primary} />
                        <Text style={styles.inventoryQuickAccessText}>Manage Inventory</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    greeting: {
        fontSize: SIZES.lg,
        color: COLORS.textSecondary,
    },
    userName: {
        fontSize: SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    date: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    profileButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.small,
    },
    profileImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginHorizontal: 4,
        ...SHADOWS.small,
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    statTitle: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
    },
    sectionContainer: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    seeAllText: {
        fontSize: SIZES.sm,
        color: COLORS.primary,
    },
    prescriptionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        ...SHADOWS.small,
    },
    patientImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    prescriptionInfo: {
        flex: 1,
    },
    patientName: {
        fontSize: SIZES.md,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    medicationName: {
        fontSize: SIZES.sm,
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    prescriptionDetails: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    pendingBadge: {
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
    },
    completedBadge: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
    },
    statusText: {
        fontSize: SIZES.xs,
        fontWeight: '500',
        color: COLORS.textPrimary,
        textTransform: 'capitalize',
    },
    inventoryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        ...SHADOWS.small,
    },
    inventoryIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    inventoryInfo: {
        flex: 1,
    },
    inventoryName: {
        fontSize: SIZES.md,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    inventorySupplier: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    stockContainer: {
        width: '100%',
    },
    stockText: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    stockValue: {
        color: COLORS.error,
        fontWeight: '600',
    },
    stockBar: {
        height: 4,
        width: '100%',
        backgroundColor: COLORS.lightGray,
        borderRadius: 2,
    },
    stockLevel: {
        height: 4,
        backgroundColor: COLORS.error,
        borderRadius: 2,
    },
    reorderButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginLeft: 8,
    },
    reorderText: {
        fontSize: SIZES.xs,
        color: COLORS.white,
        fontWeight: '600',
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    loadingText: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        marginTop: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    emptyText: {
        fontSize: SIZES.md,
        color: COLORS.textSecondary,
    },
    inventoryQuickAccess: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        gap: 12,
        ...SHADOWS.small,
    },
    inventoryQuickAccessText: {
        fontSize: SIZES.md,
        fontWeight: '600',
        color: COLORS.primary,
    },
});