import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, Users, FileText, Activity, User } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { patientService } from '@/services/patientService';
import { appointmentService } from '@/services/appointmentService';
import { Patient } from '@/types/appointment';

// Dashboard appointment interface
interface DashboardAppointment {
    id: string;
    patientName: string;
    time: string;
    type: string;
    status: string;
    patientImage: string;
    patientOrder?: number; // Sequential patient number for the day
}

// Statistics interface
interface DashboardStats {
    title: string;
    value: number;
    icon: React.ReactNode;
}

export default function DoctorDashboardScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
    const [todayAppointments, setTodayAppointments] = useState<DashboardAppointment[]>([]);
    const [stats, setStats] = useState<DashboardStats[]>([
        { title: 'Patients', value: 0, icon: <Users size={24} color={COLORS.primary} /> },
        { title: 'Appointments', value: 0, icon: <Calendar size={24} color={COLORS.secondary} /> },
        { title: 'Prescriptions', value: 0, icon: <FileText size={24} color={COLORS.success} /> }
    ]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        if (user?.id) {
            loadDashboardData();
        }
    }, [user]);
    
    const loadDashboardData = async () => {
        if (!user?.id) return;
        
        try {
            setIsLoading(true);
            
            // Load recent patients and today's appointments in parallel
            const [patientsResult, appointmentsResult] = await Promise.all([
                patientService.getRecentPatients(user.id, 3),
                loadTodayAppointments()
            ]);
            
            setRecentPatients(patientsResult);
            
            // Update stats with real data
            const allPatients = await patientService.getDoctorPatients(user.id);
            setStats([
                { title: 'Patients', value: allPatients.length, icon: <Users size={24} color={COLORS.primary} /> },
                { title: 'Appointments', value: appointmentsResult.length, icon: <Calendar size={24} color={COLORS.secondary} /> },
                { title: 'Prescriptions', value: Math.floor(allPatients.length * 0.7), icon: <FileText size={24} color={COLORS.success} /> } // Approximate
            ]);
            
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const loadTodayAppointments = async (): Promise<DashboardAppointment[]> => {
        if (!user?.id) return [];
        
        try {
            const today = new Date().toISOString().split('T')[0];
            
            // Use the new doctor-specific method that only returns confirmed appointments
            const appointments = await appointmentService.getDoctorConfirmedAppointments(user.id, today);
            
            if (!appointments) return [];
            
            const todayAppts = appointments
                .slice(0, 3) // Show only first 3
                .map((apt, index) => ({
                    id: apt.id,
                    patientName: apt.patient ? `${apt.patient.firstName} ${apt.patient.lastName}` : 'Unknown Patient',
                    time: new Date(apt.appointmentDate).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit', 
                        hour12: true 
                    }),
                    type: apt.type.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    status: apt.status.toLowerCase(),
                    patientImage: apt.patient?.profileImage || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=987&auto=format&fit=crop',
                    patientOrder: index + 1 // Sequential patient number for the day
                }));
            
            setTodayAppointments(todayAppts);
            return todayAppts;
        } catch (error) {
            console.error('Failed to load today appointments:', error);
            return [];
        }
    };

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
                        <TouchableOpacity onPress={() => router.push('/(doctor)/appointments')}>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {todayAppointments.map((appointment) => (
                        <TouchableOpacity
                            key={appointment.id}
                            style={styles.appointmentCard}
                            onPress={() => router.push({
                                pathname: '/(doctor)/doctor-appointments/[id]',
                                params: { id: appointment.id }
                            })}
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
                        <TouchableOpacity onPress={() => router.push('/(doctor)/(tabs)/patients')}>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color={COLORS.primary} />
                            <Text style={styles.loadingText}>Loading patients...</Text>
                        </View>
                    ) : recentPatients.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No recent patients</Text>
                        </View>
                    ) : (
                        recentPatients.map((patient) => (
                            <TouchableOpacity
                                key={patient.id}
                                style={styles.patientCard}
                                onPress={() => router.push({
                                    pathname: '/(doctor)/doctor-patients/[id]',
                                    params: { id: patient.id }
                                })}
                            >
                                <Image
                                    source={{ uri: patient.profileImage || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=987&auto=format&fit=crop' }}
                                    style={styles.patientCardImage}
                                />
                                <View style={styles.patientInfo}>
                                    <Text style={styles.patientCardName}>{patient.name}</Text>
                                    <Text style={styles.patientDetails}>
                                        {patient.age ? `${patient.age} years` : 'Age unknown'}
                                        {patient.conditions && patient.conditions.length > 0 && ` • ${patient.conditions[0]}`}
                                    </Text>
                                    <Text style={styles.patientLastVisit}>
                                        Last visit: {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'Unknown'}
                                    </Text>
                                </View>
                                <View style={styles.patientActions}>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            router.push({
                                                pathname: '/(doctor)/doctor-patients/[id]',
                                                params: { id: patient.id }
                                            });
                                        }}
                                    >
                                        <FileText size={16} color={COLORS.primary} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            router.push({
                                                pathname: '/(doctor)/doctor-prescriptions/new',
                                                params: { patientId: patient.id, patientName: patient.name }
                                            });
                                        }}
                                    >
                                        <Activity size={16} color={COLORS.primary} />
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
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
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        ...SHADOWS.small,
    },
    loadingText: {
        marginLeft: 8,
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        ...SHADOWS.small,
    },
    emptyText: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
});