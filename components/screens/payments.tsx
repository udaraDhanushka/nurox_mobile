import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreditCard, Plus, ChevronRight, Calendar, DollarSign, Building, CheckCircle, XCircle, Clock } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { Button } from '@/components/Button';

// Define payment method type
interface PaymentMethod {
    id: string;
    type: 'credit' | 'debit' | 'bank';
    last4: string;
    expiryDate: string;
    cardType: string;
    isDefault: boolean;
    image: string;
}

// Define billing item type
interface BillingItem {
    id: string;
    date: string;
    description: string;
    amount: number;
    status: 'paid' | 'pending' | 'failed';
    provider: string;
}

// Mock payment methods
const paymentMethods: PaymentMethod[] = [
    {
        id: '1',
        type: 'credit',
        last4: '4242',
        expiryDate: '12/24',
        cardType: 'Visa',
        isDefault: true,
        image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2071&auto=format&fit=crop'
    },
    {
        id: '2',
        type: 'credit',
        last4: '1234',
        expiryDate: '10/25',
        cardType: 'Mastercard',
        isDefault: false,
        image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2071&auto=format&fit=crop'
    }
];

// Mock billing history
const billingHistory: BillingItem[] = [
    {
        id: 'b1',
        date: '2023-11-10',
        description: 'Cardiology Consultation',
        amount: 150.00,
        status: 'paid',
        provider: 'Heart Care Center'
    },
    {
        id: 'b2',
        date: '2023-10-25',
        description: 'Blood Test Panel',
        amount: 85.00,
        status: 'paid',
        provider: 'Central Diagnostics'
    },
    {
        id: 'b3',
        date: '2023-11-15',
        description: 'Prescription Refill',
        amount: 45.00,
        status: 'pending',
        provider: 'MediCare Pharmacy'
    },
    {
        id: 'b4',
        date: '2023-09-18',
        description: 'Annual Physical',
        amount: 200.00,
        status: 'failed',
        provider: 'City Medical Center'
    }
];

export default function PaymentsScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('billing');

    const getStatusIcon = (status: 'paid' | 'pending' | 'failed') => {
        switch (status) {
            case 'paid':
                return <CheckCircle size={16} color={COLORS.success} />;
            case 'failed':
                return <XCircle size={16} color={COLORS.error} />;
            case 'pending':
                return <Clock size={16} color={COLORS.warning} />;
            default:
                return null;
        }
    };

    const handleAddPaymentMethod = () => {
        Alert.alert(
            'Add Payment Method',
            'This feature would allow you to add a new credit card or other payment method.',
            [{ text: 'OK' }]
        );
    };

    const handleMakePayment = (item: BillingItem) => {
        Alert.alert(
            'Make Payment',
            `Would you like to pay $${item.amount.toFixed(2)} for ${item.description}?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Pay Now',
                    onPress: () => {
                        Alert.alert(
                            'Payment Successful',
                            `Your payment of $${item.amount.toFixed(2)} has been processed successfully.`,
                            [{ text: 'OK' }]
                        );
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Payments & Billing</Text>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'billing' && styles.activeTabButton]}
                    onPress={() => setActiveTab('billing')}
                >
                    <Text
                        style={[styles.tabButtonText, activeTab === 'billing' && styles.activeTabButtonText]}
                    >
                        Billing History
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'payment' && styles.activeTabButton]}
                    onPress={() => setActiveTab('payment')}
                >
                    <Text
                        style={[styles.tabButtonText, activeTab === 'payment' && styles.activeTabButtonText]}
                    >
                        Payment Methods
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {activeTab === 'payment' ? (
                    <View style={styles.paymentMethodsContainer}>
                        <Text style={styles.sectionTitle}>Your Payment Methods</Text>

                        {paymentMethods.map(method => (
                            <TouchableOpacity
                                key={method.id}
                                style={styles.paymentMethodCard}
                                onPress={() => Alert.alert('Edit Card', 'This would allow you to edit your card details.')}
                            >
                                <View style={styles.cardIconContainer}>
                                    <CreditCard size={24} color={COLORS.primary} />
                                </View>
                                <View style={styles.cardDetails}>
                                    <Text style={styles.cardType}>{method.cardType} •••• {method.last4}</Text>
                                    <Text style={styles.cardExpiry}>Expires {method.expiryDate}</Text>
                                    {method.isDefault && <Text style={styles.defaultLabel}>Default</Text>}
                                </View>
                                <ChevronRight size={20} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            style={styles.addPaymentButton}
                            onPress={handleAddPaymentMethod}
                        >
                            <Plus size={20} color={COLORS.primary} />
                            <Text style={styles.addPaymentText}>Add Payment Method</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.billingHistoryContainer}>
                        <Text style={styles.sectionTitle}>Recent Transactions</Text>

                        {billingHistory.map(item => (
                            <View key={item.id} style={styles.billingItem}>
                                <View style={styles.billingHeader}>
                                    <View style={styles.billingInfo}>
                                        <Text style={styles.billingDescription}>{item.description}</Text>
                                        <View style={styles.statusContainer}>
                                            {getStatusIcon(item.status)}
                                            <Text
                                                style={[
                                                    styles.statusText,
                                                    item.status === 'paid' ? styles.paidText :
                                                        item.status === 'failed' ? styles.failedText :
                                                            styles.pendingText
                                                ]}
                                            >
                                                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.billingDetails}>
                                    <View style={styles.billingDetail}>
                                        <Calendar size={14} color={COLORS.textSecondary} />
                                        <Text style={styles.detailText}>{item.date}</Text>
                                    </View>

                                    <View style={styles.billingDetail}>
                                        <Building size={14} color={COLORS.textSecondary} />
                                        <Text style={styles.detailText}>{item.provider}</Text>
                                    </View>

                                    <View style={styles.billingDetail}>
                                        <DollarSign size={14} color={COLORS.textSecondary} />
                                        <Text style={styles.detailText}>${item.amount.toFixed(2)}</Text>
                                    </View>
                                </View>

                                {item.status === 'pending' && (
                                    <Button
                                        title="Make Payment"
                                        onPress={() => handleMakePayment(item)}
                                        size="small"
                                        style={styles.payButton}
                                    />
                                )}

                                {item.status === 'failed' && (
                                    <Button
                                        title="Retry Payment"
                                        onPress={() => handleMakePayment(item)}
                                        size="small"
                                        style={styles.payButton}
                                    />
                                )}

                                {item.status === 'paid' && (
                                    <TouchableOpacity style={styles.viewReceiptButton}>
                                        <Text style={styles.viewReceiptText}>View Receipt</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}

                        <TouchableOpacity style={styles.viewAllButton}>
                            <Text style={styles.viewAllText}>View All Transactions</Text>
                        </TouchableOpacity>
                    </View>
                )}
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
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTabButton: {
        borderBottomColor: COLORS.primary,
    },
    tabButtonText: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    activeTabButtonText: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    sectionTitle: {
        fontSize: SIZES.md,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 16,
    },
    paymentMethodsContainer: {
        marginBottom: 24,
    },
    paymentMethodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        ...SHADOWS.small,
    },
    cardIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.transparentPrimary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardDetails: {
        flex: 1,
    },
    cardType: {
        fontSize: SIZES.md,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    cardExpiry: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    defaultLabel: {
        fontSize: SIZES.xs,
        color: COLORS.primary,
        fontWeight: '600',
    },
    addPaymentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderStyle: 'dashed',
    },
    addPaymentText: {
        fontSize: SIZES.sm,
        color: COLORS.primary,
        fontWeight: '600',
        marginLeft: 8,
    },
    billingHistoryContainer: {
        marginBottom: 24,
    },
    billingItem: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        ...SHADOWS.small,
    },
    billingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    billingInfo: {
        flex: 1,
    },
    billingDescription: {
        fontSize: SIZES.md,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 4,
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
    paidText: {
        color: COLORS.success,
    },
    failedText: {
        color: COLORS.error,
    },
    pendingText: {
        color: COLORS.warning,
    },
    billingDetails: {
        marginBottom: 12,
    },
    billingDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    detailText: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
        marginLeft: 4,
    },
    payButton: {
        marginBottom: 0,
    },
    viewReceiptButton: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    viewReceiptText: {
        fontSize: SIZES.sm,
        color: COLORS.primary,
        fontWeight: '500',
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