import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, MapPin, Plus } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { useAppointmentStore, AppointmentStatus, Appointment } from '@/store/appointmentStore';

export default function AppointmentsScreen() {
    const router = useRouter();
    const { appointments } = useAppointmentStore();
    const [filter, setFilter] = useState<AppointmentStatus | 'all'>('all');

    const filteredAppointments = filter === 'all'
        ? appointments
        : appointments.filter(app => app.status === filter);

    const sortedAppointments = [...filteredAppointments].sort((a, b) => {
        // Sort by date (newest first)
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    const renderAppointmentItem = ({ item }: { item: Appointment }) => (
        <TouchableOpacity
            style={styles.appointmentCard}
            onPress={() => router.push(`/appointments/${item.id}`)}
        >
            <Image
                source={{ uri: item.doctorImage }}
                style={styles.doctorImage}
            />
            <View style={styles.appointmentInfo}>
                <Text style={styles.doctorName}>{item.doctorName}</Text>
                <Text style={styles.specialty}>{item.specialty}</Text>

                <View style={styles.appointmentDetails}>
                    <View style={styles.detailItem}>
                        <Calendar size={14} color={COLORS.textSecondary} />
                        <Text style={styles.detailText}>{item.date}</Text>
                    </View>

                    <View style={styles.detailItem}>
                        <Clock size={14} color={COLORS.textSecondary} />
                        <Text style={styles.detailText}>{item.time}</Text>
                    </View>

                    <View style={styles.detailItem}>
                        <MapPin size={14} color={COLORS.textSecondary} />
                        <Text style={styles.detailText} numberOfLines={1}>{item.location}</Text>
                    </View>
                </View>
            </View>

            <View style={[
                styles.statusBadge,
                item.status === 'confirmed' ? styles.confirmedBadge :
                    item.status === 'pending' ? styles.pendingBadge : styles.cancelledBadge
            ]}>
                <Text style={styles.statusText}>{item.status}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Appointments</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => router.push('/appointments/new')}
                >
                    <Plus size={20} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            <View style={styles.filterContainer}>
                {(['all', 'confirmed', 'pending', 'cancelled'] as const).map((status) => (
                    <TouchableOpacity
                        key={status}
                        style={[
                            styles.filterButton,
                            filter === status && styles.filterButtonActive
                        ]}
                        onPress={() => setFilter(status)}
                    >
                        <Text
                            style={[
                                styles.filterButtonText,
                                filter === status && styles.filterButtonTextActive
                            ]}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {sortedAppointments.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Calendar size={60} color={COLORS.lightGray} />
                    <Text style={styles.emptyText}>No {filter !== 'all' ? filter : ''} appointments found</Text>
                    <TouchableOpacity
                        style={styles.bookButton}
                        onPress={() => router.push('/appointments/new')}
                    >
                        <Text style={styles.bookButtonText}>Book New Appointment</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={sortedAppointments}
                    renderItem={renderAppointmentItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}
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
    headerTitle: {
        fontSize: SIZES.xl,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    addButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.white,
        marginBottom: 8,
    },
    filterButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        backgroundColor: COLORS.veryLightGray,
    },
    filterButtonActive: {
        backgroundColor: COLORS.primary,
    },
    filterButtonText: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
    },
    filterButtonTextActive: {
        color: COLORS.white,
        fontWeight: '600',
    },
    listContainer: {
        padding: 16,
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
    appointmentDetails: {
        gap: 4,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailText: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
        marginLeft: 4,
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
    cancelledBadge: {
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
    },
    statusText: {
        fontSize: SIZES.xs,
        fontWeight: '500',
        color: COLORS.textPrimary,
        textTransform: 'capitalize',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        marginTop: 16,
        marginBottom: 16,
        fontSize: SIZES.md,
        color: COLORS.textTertiary,
        textAlign: 'center',
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
});