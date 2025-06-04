import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, Users, FileText, Activity, User } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';

// Mock data for doctor dashboard
const todayAppointments = [
    {
        id: '1',
        patientName: 'John Doe',
        time: '09:00 AM',
        type: 'Check-up',
        status: 'confirmed',
        patientImage: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=987&auto=format&fit=crop'
    },
    {
        id: '2',
        patientName: 'Emily Johnson',
        time: '10:30 AM',
        type: 'Follow-up',
        status: 'confirmed',
        patientImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop'
    },
    {
        id: '3',
        patientName: 'Michael Smith',
        time: '01:15 PM',
        type: 'Consultation',
        status: 'confirmed',
        patientImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop'
    }
];

const recentPatients = [
    {
        id: '1',
        name: 'John Doe',
        age: 42,
        lastVisit: '2023-11-10',
        condition: 'Hypertension',
        image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=987&auto=format&fit=crop'
    },
    {
        id: '2',
        name: 'Emily Johnson',
        age: 35,
        lastVisit: '2023-11-08',
        condition: 'Diabetes Type 2',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop'
    }
];

const stats = [
    { title: 'Patients', value: 128, icon: <Users size={24} color={COLORS.primary} /> },
    { title: 'Appointments', value: 42, icon: <Calendar size={24} color={COLORS.secondary} /> },
    { title: 'Prescriptions', value: 86, icon: <FileText size={24} color={COLORS.success} /> }
];

export default function DoctorDashboardScreen() {
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
                        <Text style={styles.userName}>Dr. {user?.lastName}</Text>
                        <Text style={styles.date}>{currentDate}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.profileButton}
                        onPress={() => router.push('/(doctor)/profile')}
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

                {/* Today's Appointments */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Today's Appointments</Text>
                        <TouchableOpacity onPress={() => router.push('/appointments')}>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {todayAppointments.map((appointment) => (
                        <TouchableOpacity
                            key={appointment.id}
                            style={styles.appointmentCard}
                            onPress={() => router.push(`/appointments/${appointment.id}`)}
                        >
                            <View style={styles.appointmentTimeContainer}>
                                <Text style={styles.appointmentTime}>{appointment.time}</Text>
                            </View>
                            <Image
                                source={{ uri: appointment.patientImage }}
                                style={styles.patientImage}
                            />
                            <View style={styles.appointmentInfo}>
                                <Text style={styles.patientName}>{appointment.patientName}</Text>
                                <Text style={styles.appointmentType}>{appointment.type}</Text>
                            </View>
                            <View style={[
                                styles.statusBadge,
                                appointment.status === 'confirmed' ? styles.confirmedBadge : styles.pendingBadge
                            ]}>
                                <Text style={styles.statusText}>{appointment.status}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Recent Patients */}
                <View style={[styles.sectionContainer, { marginBottom: 20 }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Patients</Text>
                        <TouchableOpacity onPress={() => router.push('/patients')}>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {recentPatients.map((patient) => (
                        <TouchableOpacity
                            key={patient.id}
                            style={styles.patientCard}
                            onPress={() => router.push(`/patients/${patient.id}`)}
                        >
                            <Image
                                source={{ uri: patient.image }}
                                style={styles.patientCardImage}
                            />
                            <View style={styles.patientInfo}>
                                <Text style={styles.patientCardName}>{patient.name}</Text>
                                <Text style={styles.patientDetails}>{patient.age} years • {patient.condition}</Text>
                                <Text style={styles.patientLastVisit}>Last visit: {patient.lastVisit}</Text>
                            </View>
                            <View style={styles.patientActions}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => router.push(`/patients/${patient.id}/records`)}
                                >
                                    <FileText size={16} color={COLORS.primary} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => router.push(`/prescriptions/new?patientId=${patient.id}`)}
                                >
                                    <Activity size={16} color={COLORS.primary} />
                                </TouchableOpacity>
                            </View>
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
        backgroundColor: COLORS.transparentPrimary,
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
    appointmentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        ...SHADOWS.small,
    },
    appointmentTimeContainer: {
        backgroundColor: COLORS.transparentPrimary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginRight: 12,
    },
    appointmentTime: {
        fontSize: SIZES.xs,
        fontWeight: '600',
        color: COLORS.primary,
    },
    patientImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    appointmentInfo: {
        flex: 1,
    },
    patientName: {
        fontSize: SIZES.md,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    appointmentType: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    confirmedBadge: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
    },
    pendingBadge: {
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
    },
    statusText: {
        fontSize: SIZES.xs,
        fontWeight: '500',
        color: COLORS.textPrimary,
        textTransform: 'capitalize',
    },
    patientCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        ...SHADOWS.small,
    },
    patientCardImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    patientInfo: {
        flex: 1,
    },
    patientCardName: {
        fontSize: SIZES.md,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    patientDetails: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    patientLastVisit: {
        fontSize: SIZES.xs,
        color: COLORS.textTertiary,
    },
    patientActions: {
        flexDirection: 'row',
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.transparentPrimary,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
});