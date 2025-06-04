import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, User, Building, Download, Share2 } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { Button } from '@/components/Button';
import { useMedicalStore } from '@/store/medicalStore';

export default function LabReportDetailsScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { labReports } = useMedicalStore();

    const report = labReports.find(r => r.id === String(id));

    if (!report) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <ArrowLeft size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Lab Report Details</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={styles.notFoundContainer}>
                    <Text style={styles.notFoundText}>Lab report not found</Text>
                    <Button
                        title="Go Back"
                        onPress={() => router.back()}
                        style={styles.goBackButton}
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <ArrowLeft size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Lab Report Details</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Status Badge */}
                <View style={[
                    styles.statusBadgeContainer,
                    report.status === 'completed' ? styles.completedBadge :
                        report.status === 'pending' ? styles.pendingBadge : styles.cancelledBadge
                ]}>
                    <Text style={styles.statusBadgeText}>{report.status}</Text>
                </View>

                {/* Report Title */}
                <Text style={styles.reportTitle}>{report.testName}</Text>

                {/* Report Info */}
                <View style={styles.infoCard}>
                    <View style={styles.infoItem}>
                        <Calendar size={20} color={COLORS.primary} />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Date</Text>
                            <Text style={styles.infoValue}>{report.date}</Text>
                        </View>
                    </View>

                    <View style={styles.infoItem}>
                        <User size={20} color={COLORS.primary} />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Ordered By</Text>
                            <Text style={styles.infoValue}>{report.orderedBy}</Text>
                        </View>
                    </View>

                    <View style={styles.infoItem}>
                        <Building size={20} color={COLORS.primary} />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Laboratory</Text>
                            <Text style={styles.infoValue}>{report.labName}</Text>
                        </View>
                    </View>
                </View>

                {/* Results */}
                {report.status === 'completed' ? (
                    <View style={styles.resultsCard}>
                        <Text style={styles.resultsTitle}>Test Results</Text>

                        <View style={styles.resultsHeader}>
                            <Text style={[styles.resultHeaderText, { flex: 2 }]}>Parameter</Text>
                            <Text style={[styles.resultHeaderText, { flex: 1 }]}>Result</Text>
                            <Text style={[styles.resultHeaderText, { flex: 2 }]}>Normal Range</Text>
                            <Text style={[styles.resultHeaderText, { flex: 1 }]}>Status</Text>
                        </View>

                        {report.results.map((result, index) => (
                            <View key={index} style={styles.resultRow}>
                                <Text style={[styles.resultText, { flex: 2 }]}>{result.parameter}</Text>
                                <Text style={[styles.resultText, { flex: 1 }]}>{result.value}</Text>
                                <Text style={[styles.resultText, { flex: 2 }]}>{result.normalRange}</Text>
                                <Text
                                    style={[
                                        styles.resultText,
                                        {
                                            flex: 1,
                                            color: result.flag === 'Normal' ? COLORS.success :
                                                result.flag === 'High' ? COLORS.error :
                                                    result.flag === 'Low' ? COLORS.warning : COLORS.textPrimary
                                        }
                                    ]}
                                >
                                    {result.flag}
                                </Text>
                            </View>
                        ))}

                        {report.notes && (
                            <View style={styles.notesContainer}>
                                <Text style={styles.notesLabel}>Notes</Text>
                                <Text style={styles.notesText}>{report.notes}</Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <View style={styles.pendingResultsCard}>
                        <Text style={styles.pendingResultsText}>
                            {report.status === 'pending'
                                ? 'Your test results are being processed and will be available soon.'
                                : 'This test has been cancelled.'}
                        </Text>
                    </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                    {report.status === 'completed' && (
                        <>
                            <Button
                                title="Download PDF"
                                onPress={() => Alert.alert('Download', 'Report PDF downloaded successfully.')}
                                style={styles.downloadButton}
                            />

                            <TouchableOpacity
                                style={styles.downloadButtonContainer}
                                onPress={() => Alert.alert('Download', 'Report PDF downloaded successfully.')}
                            >
                                <Download size={18} color={COLORS.white} style={styles.buttonIcon} />
                                <Text style={styles.buttonText}>Download PDF</Text>
                            </TouchableOpacity>

                            <Button
                                title="Share Report"
                                variant="outline"
                                onPress={() => Alert.alert('Share', 'Sharing options opened.')}
                                style={styles.shareButton}
                            />

                            <TouchableOpacity
                                style={styles.shareButtonContainer}
                                onPress={() => Alert.alert('Share', 'Sharing options opened.')}
                            >
                                <Share2 size={18} color={COLORS.primary} style={styles.buttonIcon} />
                                <Text style={styles.shareButtonText}>Share Report</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {report.status === 'pending' && (
                        <Button
                            title="Notify Me When Ready"
                            onPress={() => Alert.alert('Notification Set', 'You will be notified when your results are ready.')}
                            style={styles.notifyButton}
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
    completedBadge: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
    },
    pendingBadge: {
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
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
    reportTitle: {
        fontSize: SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: 16,
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
    resultsCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        ...SHADOWS.small,
    },
    resultsTitle: {
        fontSize: SIZES.md,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 16,
    },
    resultsHeader: {
        flexDirection: 'row',
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        marginBottom: 8,
    },
    resultHeaderText: {
        fontSize: SIZES.xs,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    resultRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    resultText: {
        fontSize: SIZES.sm,
        color: COLORS.textPrimary,
    },
    notesContainer: {
        marginTop: 16,
        paddingTop: 8,
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
    pendingResultsCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 24,
        marginBottom: 16,
        alignItems: 'center',
        ...SHADOWS.small,
    },
    pendingResultsText: {
        fontSize: SIZES.md,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    actionsContainer: {
        marginBottom: 24,
    },
    downloadButton: {
        marginBottom: 12,
        display: 'none', // Hide the original button
    },
    downloadButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginBottom: 12,
    },
    buttonIcon: {
        marginRight: 8,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: SIZES.sm,
        fontWeight: '600',
    },
    shareButton: {
        borderWidth: 1,
        borderColor: COLORS.primary,
        backgroundColor: 'transparent',
        display: 'none', // Hide the original button
    },
    shareButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    shareButtonText: {
        color: COLORS.primary,
        fontSize: SIZES.sm,
        fontWeight: '600',
    },
    notifyButton: {
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