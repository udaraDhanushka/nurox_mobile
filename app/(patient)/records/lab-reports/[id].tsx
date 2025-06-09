import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    ArrowLeft, Calendar, User, Building, Download, Share2, 
    Upload, MapPin, Clock, Bell, Send 
} from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { Button } from '@/components/Button';
import { useMedicalStore } from '@/store/medicalStore';
import TestCentersList from '@/components/TestCentersList';
import TestCenterMap from '@/components/ui/TestCenterMap';
import BookingModal from '@/components/BookingModal';
import ShareModal from '@/components/ShareModal';

export default function LabReportDetailsScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { labReports, updateLabReport } = useMedicalStore();
    
    const [showTestCenters, setShowTestCenters] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedTestCenter, setSelectedTestCenter] = useState(null);
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

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

    const handleUploadNote = () => {
        Alert.alert(
            'Upload Lab Note',
            'Choose an option to upload your lab note:',
            [
                { text: 'Take Photo', onPress: () => console.log('Take Photo') },
                { text: 'Choose from Gallery', onPress: () => console.log('Choose from Gallery') },
                { text: 'Upload PDF', onPress: () => console.log('Upload PDF') },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    };

    const handleFindTestCenters = () => {
        setShowTestCenters(true);
    };

    const handleBookTest = (testCenter: any) => {
        setSelectedTestCenter(testCenter);
        setShowBookingModal(true);
    };

    const handleBookingConfirm = (bookingDetails: any) => {
        // Update the lab report with booking information
        updateLabReport(report.id, {
            ...report,
            bookingDetails,
            status: 'pending'
        });
        
        Alert.alert(
            'Booking Confirmed',
            `Your test has been booked at ${bookingDetails.testCenter.name} for ${bookingDetails.date} at ${bookingDetails.time}. You will receive a confirmation notification.`,
            [{ text: 'OK', onPress: () => setShowBookingModal(false) }]
        );
    };

    const handleNotifyWhenReady = () => {
        Alert.alert(
            'Notification Set',
            'You will be notified when your results are ready.',
            [{ text: 'OK' }]
        );
    };

    const handleRedirectToDoctor = () => {
        Alert.alert(
            'Send to Doctor',
            'Choose how to send the results to your doctor:',
            [
                { text: 'Send via App', onPress: () => console.log('Send via App') },
                { text: 'Email', onPress: () => console.log('Email') },
                { text: 'SMS', onPress: () => console.log('SMS') },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => showTestCenters ? setShowTestCenters(false) : router.back()}
                >
                    <ArrowLeft size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {showTestCenters ? 'Test Centers' : 'Lab Report Details'}
                </Text>
                {showTestCenters && (
                    <View style={styles.viewToggle}>
                        <TouchableOpacity
                            style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
                            onPress={() => setViewMode('list')}
                        >
                            <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>
                                List
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleButton, viewMode === 'map' && styles.toggleButtonActive]}
                            onPress={() => setViewMode('map')}
                        >
                            <Text style={[styles.toggleText, viewMode === 'map' && styles.toggleTextActive]}>
                                Map
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {!showTestCenters ? (
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

                    {/* Results or Pending Actions */}
                    {report.status === 'completed' ? (
                        <View style={styles.resultsCard}>
                            <Text style={styles.resultsTitle}>Test Results</Text>

                            <View style={styles.resultsHeader}>
                                <Text style={[styles.resultHeaderText, { flex: 2 }]}>Parameter</Text>
                                <Text style={[styles.resultHeaderText, { flex: 1 }]}>Result</Text>
                                <Text style={[styles.resultHeaderText, { flex: 2 }]}>Normal Range</Text>
                                <Text style={[styles.resultHeaderText, { flex: 1 }]}>Status</Text>
                            </View>

                            {report.results?.map((result, index) => (
                                <View key={index} style={styles.resultRow}>
                                    <Text style={[styles.resultText, { flex: 2 }]}>{result.name}</Text>
                                    <Text style={[styles.resultText, { flex: 1 }]}>{result.value}</Text>
                                    <Text style={[styles.resultText, { flex: 2 }]}>{result.normalRange}</Text>
                                    <Text
                                        style={[
                                            styles.resultText,
                                            {
                                                flex: 1,
                                                color: result.isNormal ? COLORS.success : COLORS.error
                                            }
                                        ]}
                                    >
                                        {result.isNormal ? 'Normal' : 'Abnormal'}
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
                        <View style={styles.pendingActionsCard}>
                            <Text style={styles.pendingTitle}>Test Actions</Text>
                            <Text style={styles.pendingDescription}>
                                Your test is currently {report.status}. You can upload your lab note or find nearby test centers to complete your test.
                            </Text>
                            
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={handleUploadNote}
                            >
                                <Upload size={20} color={COLORS.primary} />
                                <Text style={styles.actionButtonText}>Upload Lab Note</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={handleFindTestCenters}
                            >
                                <MapPin size={20} color={COLORS.primary} />
                                <Text style={styles.actionButtonText}>Find Test Centers</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Action Buttons */}
                    <View style={styles.actionsContainer}>
                        {report.status === 'completed' && (
                            <>
                                <TouchableOpacity
                                    style={styles.downloadButtonContainer}
                                    onPress={() => Alert.alert('Download', 'Report PDF downloaded successfully.')}
                                >
                                    <Download size={18} color={COLORS.white} style={styles.buttonIcon} />
                                    <Text style={styles.buttonText}>Download PDF</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.shareButtonContainer}
                                    onPress={() => setShowShareModal(true)}
                                >
                                    <Share2 size={18} color={COLORS.primary} style={styles.buttonIcon} />
                                    <Text style={styles.shareButtonText}>Share Report</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.redirectButtonContainer}
                                    onPress={handleRedirectToDoctor}
                                >
                                    <Send size={18} color={COLORS.secondary} style={styles.buttonIcon} />
                                    <Text style={styles.redirectButtonText}>Send to Doctor</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {report.status === 'pending' && (
                            <TouchableOpacity
                                style={styles.notifyButtonContainer}
                                onPress={handleNotifyWhenReady}
                            >
                                <Bell size={18} color={COLORS.white} style={styles.buttonIcon} />
                                <Text style={styles.buttonText}>Notify When Ready</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
            ) : (
                viewMode === 'list' ? (
                    <TestCentersList
                        testName={report.testName}
                        onBookTest={handleBookTest}
                    />
                ) : (
                    <TestCenterMap
                        testName={report.testName}
                        onBookTest={handleBookTest}
                    />
                )
            )}

            {/* Booking Modal */}
            <BookingModal
                visible={showBookingModal}
                testCenter={selectedTestCenter}
                testName={report.testName}
                onConfirm={handleBookingConfirm}
                onCancel={() => setShowBookingModal(false)}
            />

            {/* Share Modal */}
            <ShareModal
                visible={showShareModal}
                type="lab-report"
                data={report}
                onClose={() => setShowShareModal(false)}
            />
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
        justifyContent: 'center',
        alignItems: 'center',

    },
    viewToggle: {
        flexDirection: 'row',
        backgroundColor: COLORS.veryLightGray,
        borderRadius: 20,
        padding: 2,
    },
    toggleButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 18,
    },
    toggleButtonActive: {
        backgroundColor: COLORS.primary,
    },
    toggleText: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
    },
    toggleTextActive: {
        color: COLORS.white,
        fontWeight: '600',
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
    pendingActionsCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        ...SHADOWS.small,
    },
    pendingTitle: {
        fontSize: SIZES.md,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    pendingDescription: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        lineHeight: 20,
        marginBottom: 20,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: COLORS.veryLightGray,
        borderRadius: 8,
        marginBottom: 12,
    },
    actionButtonText: {
        fontSize: SIZES.md,
        color: COLORS.primary,
        fontWeight: '500',
        marginLeft: 12,
    },
    actionsContainer: {
        marginBottom: 24,
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
        marginBottom: 12,
    },
    redirectButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.secondary,
        marginBottom: 12,
    },
    notifyButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.warning,
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
    shareButtonText: {
        color: COLORS.primary,
        fontSize: SIZES.sm,
        fontWeight: '600',
    },
    redirectButtonText: {
        color: COLORS.secondary,
        fontSize: SIZES.sm,
        fontWeight: '600',
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