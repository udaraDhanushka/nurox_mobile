import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, TestTube, Calendar, User } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { useMedicalStore, LabReportStatus, LabReport } from '@/store/medicalStore';

export default function LabReportsScreen({params}: {params: {is: string}}) {
    const router = useRouter();
    const { labReports } = useMedicalStore();
    const [filter, setFilter] = useState<LabReportStatus | 'all'>('all');

    const filteredReports = filter === 'all'
        ? labReports
        : labReports.filter((report: { status: string }) => report.status === filter);

    const sortedReports = [...filteredReports].sort((a, b) => {
        // Sort by date (newest first)
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    const renderReportItem = ({ item }: { item: LabReport }) => (
        <TouchableOpacity
            style={styles.reportCard}
            onPress={() => router.push({
                pathname: "/records/lab-reports/[id]",
                params: { id: item.id }
            })}
        >
            <View style={styles.reportHeader}>
                <View style={styles.reportInfo}>
                    <TestTube size={20} color={COLORS.warning} />
                    <Text style={styles.reportName}>{item.testName}</Text>
                </View>
                <View style={[
                    styles.statusBadge,
                    item.status === 'completed' ? styles.completedBadge :
                        item.status === 'pending' ? styles.pendingBadge : styles.cancelledBadge
                ]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>

            <View style={styles.reportDetails}>
                <View style={styles.detailItem}>
                    <Calendar size={14} color={COLORS.textSecondary} />
                    <Text style={styles.detailText}>{item.date}</Text>
                </View>

                <View style={styles.detailItem}>
                    <User size={14} color={COLORS.textSecondary} />
                    <Text style={styles.detailText}>{item.orderedBy}</Text>
                </View>
            </View>

            <Text style={styles.labName}>{item.labName}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <ArrowLeft size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Lab Reports</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.filterContainer}>
                {(['all', 'completed', 'pending', 'cancelled'] as const).map((status) => (
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

            {sortedReports.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <TestTube size={60} color={COLORS.lightGray} />
                    <Text style={styles.emptyText}>No {filter !== 'all' ? filter : ''} lab reports found</Text>
                </View>
            ) : (
                <FlatList
                    data={sortedReports}
                    renderItem={renderReportItem}
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
    reportCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        ...SHADOWS.small,
    },
    reportHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    reportInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    reportName: {
        fontSize: SIZES.md,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginLeft: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    completedBadge: {
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
    reportDetails: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    detailText: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
        marginLeft: 4,
    },
    labName: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        marginTop: 16,
        fontSize: SIZES.md,
        color: COLORS.textTertiary,
        textAlign: 'center',
    },
});