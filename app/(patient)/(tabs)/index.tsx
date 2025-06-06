import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, FileText, Activity, User, Shield, Clock, HandHeart } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { useAppointmentStore } from '@/store/appointmentStore';
import { useMedicalStore } from '@/store/medicalStore';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/hooks/useTranslation';

const upcomingAppointments = [
    {
        id: '1',
        doctorName: 'Dr. Sarah Wilson',
        specialty: 'Cardiologist',
        date: 'Today',
        time: '14:30',
        doctorImage: 'https://example.com/doctor1.jpg',
    },
    {
        id: '2',
        doctorName: 'Dr. Michael Chen',
        specialty: 'Dermatologist',
        date: 'Tomorrow',
        time: '10:00',
        doctorImage: 'https://example.com/doctor2.jpg',
    },
];

export default function PatientHomeScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { appointments } = useAppointmentStore();
    const { prescriptions, labReports } = useMedicalStore();
    const { t } = useTranslation();

    const currentDate = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    // Get upcoming appointments (not cancelled)
    const upcomingAppointments = appointments
        .filter(app => app.status !== 'cancelled')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 2);

    // Get active prescriptions
    const activePrescriptions = prescriptions
        .filter(prescription => prescription.status === 'active')
        .slice(0, 2);

    // Get recent lab reports
    const recentLabReports = labReports
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 2);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>{t('hello')}</Text>
                        <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
                        <Text style={styles.date}>{currentDate}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.profileButton}
                        onPress={() => router.push('/profile')}
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

                {/* Quick Actions - Now Horizontally Scrollable */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.quickActionsScrollView}
                    contentContainerStyle={styles.quickActionsContainer}
                >
                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() => router.push('/patient-appointments/new')}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: COLORS.transparentPrimary }]}>
                            <Calendar size={24} color={COLORS.primary} />
                        </View>
                        <Text style={styles.quickActionText}>{t('bookAppointment')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() => router.push('/records/lab-reports')}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 152, 0, 0.1)' }]}>
                            <FileText size={24} color={COLORS.warning} />
                        </View>
                        <Text style={styles.quickActionText}>{t('labReports')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() => router.push('/records/prescriptions')}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
                            <Activity size={24} color={COLORS.success} />
                        </View>
                        <Text style={styles.quickActionText}>{t('prescriptions')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() => router.push('/profile/insurance')}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: 'rgba(33, 150, 243, 0.1)' }]}>
                            <Shield size={24} color="#2196F3" />
                        </View>
                        <Text style={styles.quickActionText}>{t('insurance')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() => router.push('/health-tips')}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: 'rgba(156, 39, 176, 0.1)' }]}>
                            <HandHeart size={24} color="#9C27B0" />
                        </View>
                        <Text style={styles.quickActionText}>{t('healthTips')}</Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* Upcoming Appointments */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('upcomingAppointments')}</Text>
                        <TouchableOpacity onPress={() => router.push('/patient-appointments')}>
                            <Text style={styles.seeAllText}>{t('seeAll')}</Text>
                        </TouchableOpacity>
                    </View>

                    {upcomingAppointments.length > 0 ? (
                        upcomingAppointments.map((appointment) => (
                            <TouchableOpacity
                                key={appointment.id}
                                style={styles.appointmentCard}
                                onPress={() => router.push(`/patient-appointments/${appointment.id}`)}
                            >
                                <Image
                                    source={{ uri: appointment.doctorImage }}
                                    style={styles.doctorImage}
                                />
                                <View style={styles.appointmentInfo}>
                                    <Text style={styles.doctorName}>{appointment.doctorName}</Text>
                                    <Text style={styles.specialty}>{appointment.specialty}</Text>
                                    <View style={styles.appointmentTimeContainer}>
                                        <Calendar size={14} color={COLORS.textSecondary} />
                                        <Text style={styles.appointmentTime}>{appointment.date}</Text>
                                        <Clock size={14} color={COLORS.textSecondary} />
                                        <Text style={styles.appointmentTime}>{appointment.estimatedTime}</Text>
                                    </View>
                                </View>
                                <View style={[
                                    styles.statusBadge,
                                    appointment.status === 'confirmed' ? styles.confirmedBadge : styles.pendingBadge
                                ]}>
                                    <Text style={styles.statusText}>{appointment.status}</Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyStateContainer}>
                            <Text style={styles.emptyStateText}>{t('noUpcomingAppointments')}</Text>
                            <TouchableOpacity
                                style={styles.bookButton}
                                onPress={() => router.push('/patient-appointments/new')}
                            >
                                <Text style={styles.bookButtonText}>{t('bookNow')}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Active Prescriptions */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('activePrescriptions')}</Text>
                        <TouchableOpacity onPress={() => router.push('/records/prescriptions')}>
                            <Text style={styles.seeAllText}>{t('seeAll')}</Text>
                        </TouchableOpacity>
                    </View>

                    {activePrescriptions.length > 0 ? (
                        activePrescriptions.map((prescription) => (
                            <TouchableOpacity
                                key={prescription.id}
                                style={styles.prescriptionCard}
                                onPress={() => router.push(`/records/prescriptions/${prescription.id}`)}
                            >
                                <View style={styles.prescriptionHeader}>
                                    <Text style={styles.prescriptionTitle}>
                                        {prescription.medications.length > 1
                                            ? `${prescription.medications[0].name} +${prescription.medications.length - 1} ${t('moreItems')}`
                                            : prescription.medications[0].name}
                                    </Text>
                                    <Text style={styles.prescriptionDate}>{prescription.date}</Text>
                                </View>
                                <Text style={styles.prescriptionDoctor}>{prescription.doctorName}</Text>
                                <View style={styles.prescriptionFooter}>
                                    <Text style={styles.prescriptionPharmacy}>{prescription.pharmacy}</Text>
                                    <Text style={styles.refillsText}>
                                        Refills: {prescription.refillsRemaining}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyStateContainer}>
                            <Text style={styles.emptyStateText}>{t('noActivePrescriptions')}</Text>
                        </View>
                    )}
                </View>

                {/* Recent Lab Reports */}
                <View style={[styles.sectionContainer, { marginBottom: 20 }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('recentLabReports')}</Text>
                        <TouchableOpacity onPress={() => router.push('/records/lab-reports')}>
                            <Text style={styles.seeAllText}>{t('seeAll')}</Text>
                        </TouchableOpacity>
                    </View>

                    {recentLabReports.length > 0 ? (
                        recentLabReports.map((report) => (
                            <TouchableOpacity
                                key={report.id}
                                style={styles.labReportCard}
                                onPress={() => router.push(`/records/lab-reports/${report.id}`)}
                            >
                                <View style={styles.labReportHeader}>
                                    <Text style={styles.labReportTitle}>{report.testName}</Text>
                                    <View style={[
                                        styles.statusBadge,
                                        report.status === 'completed' ? styles.confirmedBadge : styles.pendingBadge
                                    ]}>
                                        <Text style={styles.statusText}>{report.status}</Text>
                                    </View>
                                </View>
                                <Text style={styles.labReportDate}>{report.date}</Text>
                                <Text style={styles.labReportLab}>{report.labName}</Text>
                                <Text style={styles.labReportDoctor}>Ordered by: {report.orderedBy}</Text>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyStateContainer}>
                            <Text style={styles.emptyStateText}>{t('noRecentLabReports')}</Text>
                        </View>
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
        alignItems: 'center',
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
    quickActionsScrollView: {
        marginBottom: 24,
    },
    quickActionsContainer: {
        paddingRight: 16, // Add some padding at the end for better UX
    },
    quickActionButton: {
        width: 110,
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginRight: 12,
        ...SHADOWS.small,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickActionText: {
        fontSize: SIZES.sm,
        color: COLORS.textPrimary,
        textAlign: 'center',
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
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        ...SHADOWS.small,
    },
    doctorImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 12,
    },
    appointmentInfo: {
        flex: 1,
    },
    doctorName: {
        fontSize: SIZES.md,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    specialty: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    appointmentTimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    appointmentTime: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
        marginLeft: 4,
        marginRight: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
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
    emptyStateContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        ...SHADOWS.small,
    },
    emptyStateText: {
        fontSize: SIZES.md,
        color: COLORS.textSecondary,
        marginBottom: 12,
    },
    bookButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    bookButtonText: {
        color: COLORS.white,
        fontSize: SIZES.sm,
        fontWeight: '500',
    },
    prescriptionCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        ...SHADOWS.small,
    },
    prescriptionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    prescriptionTitle: {
        fontSize: SIZES.md,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    prescriptionDate: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
    },
    prescriptionDoctor: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    prescriptionFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    prescriptionPharmacy: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
    },
    refillsText: {
        fontSize: SIZES.xs,
        color: COLORS.primary,
        fontWeight: '500',
    },
    labReportCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        ...SHADOWS.small,
    },
    labReportHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    labReportTitle: {
        fontSize: SIZES.md,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        flex: 1,
    },
    labReportDate: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    labReportLab: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    labReportDoctor: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
    },
});
