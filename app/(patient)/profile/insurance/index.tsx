import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CreditCard, FileText, Plus, CheckCircle, XCircle, Clock } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';

// Define claim status type
type ClaimStatus = 'approved' | 'rejected' | 'pending';

// Define claim interface
interface Claim {
    id: string;
    date: string;
    provider: string;
    service: string;
    amount: number;
    coveredAmount: number;
    status: ClaimStatus;
}

// Mock insurance data
const insuranceInfo = {
    provider: 'HealthPlus Insurance',
    policyNumber: 'HP-12345678',
    memberID: 'MEM-987654',
    groupNumber: 'GRP-123456',
    planType: 'Premium Health Plan',
    coverageStart: '2023-01-01',
    coverageEnd: '2023-12-31',
    primaryCare: '$20 copay',
    specialist: '$40 copay',
    emergency: '$250 copay',
    prescription: '$10/$30/$50 (Tier 1/2/3)',
    logo: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2071&auto=format&fit=crop'
};

// Mock claims data
const recentClaims: Claim[] = [
    {
        id: 'c1',
        date: '2023-11-05',
        provider: 'Heart Care Center',
        service: 'Cardiology Consultation',
        amount: 250.00,
        coveredAmount: 200.00,
        status: 'approved'
    },
    {
        id: 'c2',
        date: '2023-10-15',
        provider: 'Central Diagnostics',
        service: 'Blood Tests',
        amount: 180.00,
        coveredAmount: 180.00,
        status: 'approved'
    },
    {
        id: 'c3',
        date: '2023-11-12',
        provider: 'MediCare Pharmacy',
        service: 'Prescription Medications',
        amount: 120.00,
        coveredAmount: 0.00,
        status: 'pending'
    },
    {
        id: 'c4',
        date: '2023-09-28',
        provider: 'City Medical Center',
        service: 'X-Ray Imaging',
        amount: 350.00,
        coveredAmount: 280.00,
        status: 'rejected'
    }
];

export default function InsuranceScreen() {
    const router = useRouter();

    const getStatusIcon = (status: ClaimStatus) => {
        switch (status) {
            case 'approved':
                return <CheckCircle size={16} color={COLORS.success} />;
            case 'rejected':
                return <XCircle size={16} color={COLORS.error} />;
            case 'pending':
                return <Clock size={16} color={COLORS.warning} />;
            default:
                return null;
        }
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
                <Text style={styles.headerTitle}>Insurance</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Insurance Card */}
                <View style={styles.insuranceCard}>
                    <View style={styles.insuranceCardHeader}>
                        <Image
                            source={{ uri: insuranceInfo.logo }}
                            style={styles.insuranceLogo}
                        />
                        <Text style={styles.insuranceProvider}>{insuranceInfo.provider}</Text>
                    </View>

                    <View style={styles.insuranceCardContent}>
                        <View style={styles.insuranceInfoRow}>
                            <View style={styles.insuranceInfoItem}>
                                <Text style={styles.infoLabel}>Policy Number</Text>
                                <Text style={styles.infoValue}>{insuranceInfo.policyNumber}</Text>
                            </View>
                            <View style={styles.insuranceInfoItem}>
                                <Text style={styles.infoLabel}>Member ID</Text>
                                <Text style={styles.infoValue}>{insuranceInfo.memberID}</Text>
                            </View>
                        </View>

                        <View style={styles.insuranceInfoRow}>
                            <View style={styles.insuranceInfoItem}>
                                <Text style={styles.infoLabel}>Group Number</Text>
                                <Text style={styles.infoValue}>{insuranceInfo.groupNumber}</Text>
                            </View>
                            <View style={styles.insuranceInfoItem}>
                                <Text style={styles.infoLabel}>Plan Type</Text>
                                <Text style={styles.infoValue}>{insuranceInfo.planType}</Text>
                            </View>
                        </View>

                        <View style={styles.insuranceInfoRow}>
                            <View style={styles.insuranceInfoItem}>
                                <Text style={styles.infoLabel}>Coverage Start</Text>
                                <Text style={styles.infoValue}>{insuranceInfo.coverageStart}</Text>
                            </View>
                            <View style={styles.insuranceInfoItem}>
                                <Text style={styles.infoLabel}>Coverage End</Text>
                                <Text style={styles.infoValue}>{insuranceInfo.coverageEnd}</Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.viewDetailsButton}>
                        <Text style={styles.viewDetailsText}>View Full Details</Text>
                    </TouchableOpacity>
                </View>

                {/* Coverage Summary */}
                <View style={styles.coverageCard}>
                    <Text style={styles.sectionTitle}>Coverage Summary</Text>

                    <View style={styles.coverageItem}>
                        <Text style={styles.coverageLabel}>Primary Care Visit</Text>
                        <Text style={styles.coverageValue}>{insuranceInfo.primaryCare}</Text>
                    </View>

                    <View style={styles.coverageItem}>
                        <Text style={styles.coverageLabel}>Specialist Visit</Text>
                        <Text style={styles.coverageValue}>{insuranceInfo.specialist}</Text>
                    </View>

                    <View style={styles.coverageItem}>
                        <Text style={styles.coverageLabel}>Emergency Room</Text>
                        <Text style={styles.coverageValue}>{insuranceInfo.emergency}</Text>
                    </View>

                    <View style={styles.coverageItem}>
                        <Text style={styles.coverageLabel}>Prescription Drugs</Text>
                        <Text style={styles.coverageValue}>{insuranceInfo.prescription}</Text>
                    </View>
                </View>

                {/* Recent Claims */}
                <View style={styles.claimsSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Claims</Text>
                        <TouchableOpacity
                            style={styles.newClaimButton}
                            onPress={() => router.push('/profile/insurance/claim')}
                        >
                            <Plus size={16} color={COLORS.white} />
                            <Text style={styles.newClaimText}>New Claim</Text>
                        </TouchableOpacity>
                    </View>

                    {recentClaims.map(claim => (
                        <TouchableOpacity
                            key={claim.id}
                            style={styles.claimCard}
                            onPress={() => router.push(`/profile/insurance/claims/${claim.id}`)}
                        >
                            <View style={styles.claimHeader}>
                                <Text style={styles.claimService}>{claim.service}</Text>
                                <View style={styles.statusContainer}>
                                    {getStatusIcon(claim.status)}
                                    <Text
                                        style={[
                                            styles.statusText,
                                            claim.status === 'approved' ? styles.approvedText :
                                                claim.status === 'rejected' ? styles.rejectedText :
                                                    styles.pendingText
                                        ]}
                                    >
                                        {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                                    </Text>
                                </View>
                            </View>

                            <Text style={styles.claimProvider}>{claim.provider}</Text>
                            <Text style={styles.claimDate}>{claim.date}</Text>

                            <View style={styles.claimAmounts}>
                                <Text style={styles.claimAmount}>
                                    <Text style={styles.amountLabel}>Total: </Text>
                                    ${claim.amount.toFixed(2)}
                                </Text>
                                <Text style={styles.claimCovered}>
                                    <Text style={styles.amountLabel}>Covered: </Text>
                                    ${claim.coveredAmount.toFixed(2)}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity style={styles.viewAllButton}>
                        <Text style={styles.viewAllText}>View All Claims</Text>
                    </TouchableOpacity>
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
    insuranceCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        ...SHADOWS.medium,
    },
    insuranceCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    insuranceLogo: {
        width: 40,
        height: 40,
        borderRadius: 8,
        marginRight: 12,
    },
    insuranceProvider: {
        fontSize: SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    insuranceCardContent: {
        padding: 16,
    },
    insuranceInfoRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    insuranceInfoItem: {
        flex: 1,
    },
    infoLabel: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: SIZES.md,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    viewDetailsButton: {
        backgroundColor: COLORS.transparentPrimary,
        padding: 12,
        alignItems: 'center',
    },
    viewDetailsText: {
        fontSize: SIZES.sm,
        color: COLORS.primary,
        fontWeight: '600',
    },
    coverageCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        ...SHADOWS.small,
    },
    sectionTitle: {
        fontSize: SIZES.md,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 16,
    },
    coverageItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    coverageLabel: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
    },
    coverageValue: {
        fontSize: SIZES.sm,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    claimsSection: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    newClaimButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    newClaimText: {
        fontSize: SIZES.xs,
        color: COLORS.white,
        fontWeight: '600',
        marginLeft: 4,
    },
    claimCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        ...SHADOWS.small,
    },
    claimHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    claimService: {
        fontSize: SIZES.md,
        fontWeight: '600',
        color: COLORS.textPrimary,
        flex: 1,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        fontSize: SIZES.xs,
        fontWeight: '600',
        marginLeft: 4,
    },
    approvedText: {
        color: COLORS.success,
    },
    rejectedText: {
        color: COLORS.error,
    },
    pendingText: {
        color: COLORS.warning,
    },
    claimProvider: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    claimDate: {
        fontSize: SIZES.xs,
        color: COLORS.textTertiary,
        marginBottom: 8,
    },
    claimAmounts: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    claimAmount: {
        fontSize: SIZES.sm,
        color: COLORS.textPrimary,
    },
    claimCovered: {
        fontSize: SIZES.sm,
        color: COLORS.textPrimary,
    },
    amountLabel: {
        color: COLORS.textSecondary,
    },
    viewAllButton: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    viewAllText: {
        fontSize: SIZES.sm,
        color: COLORS.primary,
        fontWeight: '600',
    },
});