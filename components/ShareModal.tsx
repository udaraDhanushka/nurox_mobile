import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Modal,
    TouchableOpacity,
    ScrollView,
    Alert,
    Share,
    TextInput,
    Switch
} from 'react-native';
import {
    X,
    Share2,
    Mail,
    MessageSquare,
    FileText,
    Download,
    Send,
    Eye,
    EyeOff,
    Lock,
    Globe,
    CheckCircle
} from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { Button } from '@/components/Button';

interface ShareOption {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    action: () => void;
}

interface ShareModalProps {
    visible: boolean;
    type: 'lab-report' | 'prescription';
    data: any;
    onClose: () => void;
}

export default function ShareModal({ visible, type, data, onClose }: ShareModalProps) {
    const [selectedOption, setSelectedOption] = useState<string>('');
    const [recipientEmail, setRecipientEmail] = useState('');
    const [recipientPhone, setRecipientPhone] = useState('');
    const [message, setMessage] = useState('');
    const [includePersonalInfo, setIncludePersonalInfo] = useState(true);
    const [sharePrivately, setSharePrivately] = useState(true);
    const [expireAfter, setExpireAfter] = useState('7'); // days
    const [step, setStep] = useState<'options' | 'details' | 'confirm'>('options');

    const isLabReport = type === 'lab-report';
    const title = isLabReport ? 'Share Lab Report' : 'Share Prescription';

    const handleNativeShare = async () => {
        try {
            const shareContent = generateShareContent();
            await Share.share({
                message: shareContent,
                title: `${isLabReport ? 'Lab Report' : 'Prescription'} - ${data.testName || data.medications?.[0]?.name}`,
            });
            onClose();
        } catch (error) {
            Alert.alert('Error', 'Failed to share. Please try again.');
        }
    };

    const handleEmailShare = () => {
        setSelectedOption('email');
        setStep('details');
    };

    const handleSMSShare = () => {
        setSelectedOption('sms');
        setStep('details');
    };

    const handleSecureShare = () => {
        setSelectedOption('secure');
        setStep('details');
    };

    const handleDownloadPDF = () => {
        Alert.alert(
            'Download PDF',
            `${isLabReport ? 'Lab report' : 'Prescription'} PDF will be downloaded to your device.`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Download', 
                    onPress: () => {
                        // Handle PDF download
                        Alert.alert('Success', 'PDF downloaded successfully!');
                        onClose();
                    }
                }
            ]
        );
    };

    const generateShareContent = () => {
        if (isLabReport) {
            return `Lab Report Summary:
Test: ${data.testName}
Date: ${data.date}
Lab: ${data.labName}
Ordered by: ${data.orderedBy}
Status: ${data.status}

${data.status === 'completed' && data.results ? 
    'Results:\n' + data.results.map((r: any) => 
        `• ${r.name}: ${r.value} (${r.isNormal ? 'Normal' : 'Abnormal'})`
    ).join('\n') : 
    'Results pending'
}

${data.notes ? `Notes: ${data.notes}` : ''}

Shared via HealthApp`;
        } else {
            return `Prescription Summary:
Date: ${data.date}
Doctor: ${data.doctorName}
Pharmacy: ${data.pharmacy}
Status: ${data.status}

Medications:
${data.medications.map((med: any) => 
    `• ${med.name} ${med.dosage} - ${med.frequency}`
).join('\n')}

${data.notes ? `Notes: ${data.notes}` : ''}

Shared via HealthApp`;
        }
    };

    const shareOptions: ShareOption[] = [
        {
            id: 'native',
            title: 'Quick Share',
            description: 'Share via your device\'s built-in sharing options',
            icon: <Share2 size={24} color={COLORS.primary} />,
            action: handleNativeShare
        },
        {
            id: 'email',
            title: 'Email',
            description: 'Send detailed report via email',
            icon: <Mail size={24} color={COLORS.primary} />,
            action: handleEmailShare
        },
        {
            id: 'sms',
            title: 'SMS',
            description: 'Send summary via text message',
            icon: <MessageSquare size={24} color={COLORS.primary} />,
            action: handleSMSShare
        },
        {
            id: 'secure',
            title: 'Secure Link',
            description: 'Generate a private, expiring link',
            icon: <Lock size={24} color={COLORS.primary} />,
            action: handleSecureShare
        },
        {
            id: 'pdf',
            title: 'Download PDF',
            description: 'Save as PDF to share manually',
            icon: <Download size={24} color={COLORS.primary} />,
            action: handleDownloadPDF
        }
    ];

    const handleSend = () => {
        if (selectedOption === 'email' && !recipientEmail) {
            Alert.alert('Error', 'Please enter recipient email address');
            return;
        }
        if (selectedOption === 'sms' && !recipientPhone) {
            Alert.alert('Error', 'Please enter recipient phone number');
            return;
        }

        setStep('confirm');
    };

    const handleConfirmSend = () => {
        const method = selectedOption === 'email' ? 'Email' : 
                     selectedOption === 'sms' ? 'SMS' : 'Secure Link';
        
        Alert.alert(
            'Sent Successfully',
            `${isLabReport ? 'Lab report' : 'Prescription'} has been shared via ${method}.`,
            [{ text: 'OK', onPress: onClose }]
        );
    };

    const renderOptionsStep = () => (
        <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.stepTitle}>Choose Sharing Method</Text>
            <Text style={styles.stepDescription}>
                Select how you'd like to share your {isLabReport ? 'lab report' : 'prescription'}
            </Text>

            <View style={styles.optionsContainer}>
                {shareOptions.map((option) => (
                    <TouchableOpacity
                        key={option.id}
                        style={styles.optionCard}
                        onPress={option.action}
                    >
                        <View style={styles.optionIcon}>
                            {option.icon}
                        </View>
                        <View style={styles.optionContent}>
                            <Text style={styles.optionTitle}>{option.title}</Text>
                            <Text style={styles.optionDescription}>{option.description}</Text>
                        </View>
                        <View style={styles.optionArrow}>
                            <Send size={16} color={COLORS.textSecondary} />
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Report Preview */}
            <View style={styles.previewCard}>
                <Text style={styles.previewTitle}>Preview</Text>
                <View style={styles.previewContent}>
                    <View style={styles.previewHeader}>
                        {isLabReport ? (
                            <FileText size={20} color={COLORS.primary} />
                        ) : (
                            <FileText size={20} color={COLORS.secondary} />
                        )}
                        <Text style={styles.previewName}>
                            {data.testName || data.medications?.[0]?.name}
                        </Text>
                    </View>
                    <Text style={styles.previewDate}>{data.date}</Text>
                    <Text style={styles.previewDoctor}>
                        {data.orderedBy || data.doctorName}
                    </Text>
                </View>
            </View>
        </ScrollView>
    );

    const renderDetailsStep = () => (
        <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.stepTitle}>
                {selectedOption === 'email' ? 'Email Details' : 
                 selectedOption === 'sms' ? 'SMS Details' : 'Secure Share Settings'}
            </Text>
            
            {selectedOption === 'email' && (
                <>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Recipient Email *</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="doctor@example.com"
                            value={recipientEmail}
                            onChangeText={setRecipientEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Message (Optional)</Text>
                        <TextInput
                            style={[styles.textInput, styles.textArea]}
                            placeholder="Add a personal message..."
                            value={message}
                            onChangeText={setMessage}
                            multiline
                            numberOfLines={4}
                        />
                    </View>
                </>
            )}

            {selectedOption === 'sms' && (
                <>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Recipient Phone *</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="+94 77 123 4567"
                            value={recipientPhone}
                            onChangeText={setRecipientPhone}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Message (Optional)</Text>
                        <TextInput
                            style={[styles.textInput, styles.textArea]}
                            placeholder="Add a personal message..."
                            value={message}
                            onChangeText={setMessage}
                            multiline
                            numberOfLines={3}
                        />
                    </View>
                </>
            )}

            {selectedOption === 'secure' && (
                <View style={styles.secureOptions}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Link expires after</Text>
                        <View style={styles.expiryOptions}>
                            {['1', '7', '30'].map((days) => (
                                <TouchableOpacity
                                    key={days}
                                    style={[
                                        styles.expiryOption,
                                        expireAfter === days && styles.expiryOptionSelected
                                    ]}
                                    onPress={() => setExpireAfter(days)}
                                >
                                    <Text style={[
                                        styles.expiryOptionText,
                                        expireAfter === days && styles.expiryOptionTextSelected
                                    ]}>
                                        {days} {days === '1' ? 'day' : 'days'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            )}

            {/* Privacy Settings */}
            <View style={styles.privacyCard}>
                <Text style={styles.privacyTitle}>Privacy Settings</Text>
                
                <View style={styles.privacyOption}>
                    <View style={styles.privacyInfo}>
                        <View style={styles.privacyIcon}>
                            {includePersonalInfo ? 
                                <Eye size={20} color={COLORS.primary} /> : 
                                <EyeOff size={20} color={COLORS.textSecondary} />
                            }
                        </View>
                        <View style={styles.privacyContent}>
                            <Text style={styles.privacyOptionTitle}>Include Personal Information</Text>
                            <Text style={styles.privacyOptionDescription}>
                                Include patient name, phone, and other personal details
                            </Text>
                        </View>
                    </View>
                    <Switch
                        value={includePersonalInfo}
                        onValueChange={setIncludePersonalInfo}
                        trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                        thumbColor={COLORS.white}
                    />
                </View>

                <View style={styles.privacyOption}>
                    <View style={styles.privacyInfo}>
                        <View style={styles.privacyIcon}>
                            {sharePrivately ? 
                                <Lock size={20} color={COLORS.primary} /> : 
                                <Globe size={20} color={COLORS.textSecondary} />
                            }
                        </View>
                        <View style={styles.privacyContent}>
                            <Text style={styles.privacyOptionTitle}>Private Sharing</Text>
                            <Text style={styles.privacyOptionDescription}>
                                Require authentication to view shared content
                            </Text>
                        </View>
                    </View>
                    <Switch
                        value={sharePrivately}
                        onValueChange={setSharePrivately}
                        trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                        thumbColor={COLORS.white}
                    />
                </View>
            </View>
        </ScrollView>
    );

    const renderConfirmStep = () => (
        <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.stepTitle}>Confirm Sharing</Text>
            <Text style={styles.stepDescription}>
                Review the details before sharing your {isLabReport ? 'lab report' : 'prescription'}
            </Text>

            <View style={styles.confirmCard}>
                <View style={styles.confirmHeader}>
                    <CheckCircle size={24} color={COLORS.success} />
                    <Text style={styles.confirmTitle}>Sharing Summary</Text>
                </View>

                <View style={styles.confirmItem}>
                    <Text style={styles.confirmLabel}>Method</Text>
                    <Text style={styles.confirmValue}>
                        {selectedOption === 'email' ? 'Email' : 
                         selectedOption === 'sms' ? 'SMS' : 'Secure Link'}
                    </Text>
                </View>

                {selectedOption === 'email' && (
                    <View style={styles.confirmItem}>
                        <Text style={styles.confirmLabel}>Recipient</Text>
                        <Text style={styles.confirmValue}>{recipientEmail}</Text>
                    </View>
                )}

                {selectedOption === 'sms' && (
                    <View style={styles.confirmItem}>
                        <Text style={styles.confirmLabel}>Recipient</Text>
                        <Text style={styles.confirmValue}>{recipientPhone}</Text>
                    </View>
                )}

                {selectedOption === 'secure' && (
                    <View style={styles.confirmItem}>
                        <Text style={styles.confirmLabel}>Link Expires</Text>
                        <Text style={styles.confirmValue}>
                            {expireAfter} {expireAfter === '1' ? 'day' : 'days'}
                        </Text>
                    </View>
                )}

                <View style={styles.confirmItem}>
                    <Text style={styles.confirmLabel}>Personal Info</Text>
                    <Text style={styles.confirmValue}>
                        {includePersonalInfo ? 'Included' : 'Excluded'}
                    </Text>
                </View>

                <View style={styles.confirmItem}>
                    <Text style={styles.confirmLabel}>Privacy</Text>
                    <Text style={styles.confirmValue}>
                        {sharePrivately ? 'Private' : 'Public'}
                    </Text>
                </View>

                {message && (
                    <View style={styles.messagePreview}>
                        <Text style={styles.messageLabel}>Message</Text>
                        <Text style={styles.messageText}>{message}</Text>
                    </View>
                )}
            </View>

            {/* Content Preview */}
            <View style={styles.contentPreviewCard}>
                <Text style={styles.previewTitle}>Content Preview</Text>
                <View style={styles.contentPreview}>
                    <Text style={styles.contentText} numberOfLines={10}>
                        {generateShareContent()}
                    </Text>
                </View>
            </View>
        </ScrollView>
    );

    const getStepContent = () => {
        switch (step) {
            case 'options':
                return renderOptionsStep();
            case 'details':
                return renderDetailsStep();
            case 'confirm':
                return renderConfirmStep();
            default:
                return renderOptionsStep();
        }
    };

    const getActionButtons = () => {
        if (step === 'options') {
            return (
                <Button
                    title="Cancel"
                    variant="outline"
                    onPress={onClose}
                    style={styles.cancelButton}
                />
            );
        } else if (step === 'details') {
            return (
                <View style={styles.actionButtons}>
                    <Button
                        title="Back"
                        variant="outline"
                        onPress={() => setStep('options')}
                        style={styles.backButton}
                    />
                    <Button
                        title="Next"
                        onPress={handleSend}
                        style={styles.nextButton}
                    />
                </View>
            );
        } else {
            return (
                <View style={styles.actionButtons}>
                    <Button
                        title="Back"
                        variant="outline"
                        onPress={() => setStep('details')}
                        style={styles.backButton}
                    />
                    <Button
                        title="Send"
                        onPress={handleConfirmSend}
                        style={styles.sendButton}
                    />
                </View>
            );
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <X size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{title}</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={styles.content}>
                    {getStepContent()}
                </View>

                <View style={styles.footer}>
                    {getActionButtons()}
                </View>
            </View>
        </Modal>
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
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.white,
    },
    closeButton: {
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
    },
    stepContainer: {
        flex: 1,
        padding: 16,
    },
    stepTitle: {
        fontSize: SIZES.xl,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    stepDescription: {
        fontSize: SIZES.md,
        color: COLORS.textSecondary,
        marginBottom: 24,
    },
    optionsContainer: {
        marginBottom: 24,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        ...SHADOWS.small,
    },
    optionIcon: {
        marginRight: 16,
    },
    optionContent: {
        flex: 1,
    },
    optionTitle: {
        fontSize: SIZES.md,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    optionDescription: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
    },
    optionArrow: {
        marginLeft: 8,
    },
    previewCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        ...SHADOWS.small,
    },
    previewTitle: {
        fontSize: SIZES.md,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 12,
    },
    previewContent: {
        borderLeftWidth: 3,
        borderLeftColor: COLORS.primary,
        paddingLeft: 12,
    },
    previewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    previewName: {
        fontSize: SIZES.md,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginLeft: 8,
    },
    previewDate: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    previewDoctor: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: SIZES.sm,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        padding: 12,
        fontSize: SIZES.md,
        color: COLORS.textPrimary,
        backgroundColor: COLORS.white,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    secureOptions: {
        marginBottom: 20,
    },
    expiryOptions: {
        flexDirection: 'row',
        gap: 8,
    },
    expiryOption: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    expiryOptionSelected: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary,
    },
    expiryOptionText: {
        fontSize: SIZES.sm,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    expiryOptionTextSelected: {
        color: COLORS.white,
    },
    privacyCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        ...SHADOWS.small,
    },
    privacyTitle: {
        fontSize: SIZES.md,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 16,
    },
    privacyOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    privacyInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    privacyIcon: {
        marginRight: 12,
    },
    privacyContent: {
        flex: 1,
    },
    privacyOptionTitle: {
        fontSize: SIZES.sm,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    privacyOptionDescription: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
    },
    confirmCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        ...SHADOWS.small,
    },
    confirmHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    confirmTitle: {
        fontSize: SIZES.md,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginLeft: 8,
    },
    confirmItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    confirmLabel: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
    },
    confirmValue: {
        fontSize: SIZES.sm,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    messagePreview: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    messageLabel: {
        fontSize: SIZES.sm,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    messageText: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
    },
    contentPreviewCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        ...SHADOWS.small,
    },
    contentPreview: {
        backgroundColor: COLORS.veryLightGray,
        borderRadius: 8,
        padding: 12,
        maxHeight: 150,
    },
    contentText: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
        fontFamily: 'monospace',
        lineHeight: 16,
    },
    footer: {
        padding: 16,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        width: '100%',
    },
    backButton: {
        flex: 1,
    },
    nextButton: {
        flex: 1,
    },
    sendButton: {
        flex: 1,
    },
});