import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Package, AlertCircle, CheckCircle, User } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';

// Mock data for pharmacist dashboard
const pendingPrescriptions = [
    {
        id: '1',
        patientName: 'John Doe',
        medication: 'Lisinopril 10mg',
        doctor: 'Dr. Sarah Johnson',
        date: '2023-11-15',
        status: 'pending',
        patientImage: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=987&auto=format&fit=crop'
    },
    {
        id: '2',
        patientName: 'Emily Johnson',
        medication: 'Amoxicillin 500mg',
        doctor: 'Dr. Michael Chen',
        date: '2023-11-15',
        status: 'pending',
        patientImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop'
    }
];

const lowStockItems = [
    {
        id: '1',
        name: 'Lisinopril 10mg',
        currentStock: 15,
        minStock: 20,
        supplier: 'MediPharm Supplies'
    },
    {
        id: '2',
        name: 'Metformin 500mg',
        currentStock: 8,
        minStock: 25,
        supplier: 'HealthCare Distributors'
    },
    {
        id: '3',
        name: 'Atorvastatin 20mg',
        currentStock: 12,
        minStock: 20,
        supplier: 'MediPharm Supplies'
    }
];

const stats = [
    { title: 'Pending', value: 12, icon: <AlertCircle size={24} color={COLORS.warning} /> },
    { title: 'Completed', value: 28, icon: <CheckCircle size={24} color={COLORS.success} /> },
    { title: 'Low Stock', value: 8, icon: <Package size={24} color={COLORS.error} /> }
];

export default function PharmacistDashboardScreen() {
    const router = useRouter();
    const { user } = useAuthStore();

    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

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

                    {pendingPrescriptions.map((prescription) => (
                        <TouchableOpacity
                            key={prescription.id}
                            style={styles.prescriptionCard}
                            onPress={() => router.push(`/prescriptions/${prescription.id}`)}
                        >
                            <Image
                                source={{ uri: prescription.patientImage }}
                                style={styles.patientImage}
                            />
                            <View style={styles.prescriptionInfo}>
                                <Text style={styles.patientName}>{prescription.patientName}</Text>
                                <Text style={styles.medicationName}>{prescription.medication}</Text>
                                <Text style={styles.prescriptionDetails}>
                                    {prescription.doctor} • {prescription.date}
                                </Text>
                            </View>
                            <View style={[
                                styles.statusBadge,
                                prescription.status === 'pending' ? styles.pendingBadge : styles.completedBadge
                            ]}>
                                <Text style={styles.statusText}>{prescription.status}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Low Stock Items */}
                <View style={[styles.sectionContainer, { marginBottom: 20 }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Low Stock Items</Text>
                        <TouchableOpacity onPress={() => router.push('/inventory')}>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {lowStockItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.inventoryCard}
                            onPress={() => router.push(`/inventory/${item.id}`)}
                        >
                            <View style={styles.inventoryIconContainer}>
                                <Package size={24} color={COLORS.error} />
                            </View>
                            <View style={styles.inventoryInfo}>
                                <Text style={styles.inventoryName}>{item.name}</Text>
                                <Text style={styles.inventorySupplier}>{item.supplier}</Text>
                                <View style={styles.stockContainer}>
                                    <Text style={styles.stockText}>
                                        Stock: <Text style={styles.stockValue}>{item.currentStock}</Text> / {item.minStock}
                                    </Text>
                                    <View style={styles.stockBar}>
                                        <View
                                            style={[
                                                styles.stockLevel,
                                                { width: `${(item.currentStock / item.minStock) * 100}%` }
                                            ]}
                                        />
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.reorderButton}
                                onPress={() => router.push(`/inventory/reorder/${item.id}`)}
                            >
                                <Text style={styles.reorderText}>Reorder</Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
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
});