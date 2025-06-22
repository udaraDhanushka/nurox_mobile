import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Upload, X, Plus, Camera } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import * as ImagePicker from 'expo-image-picker';

// Define image type
interface ImageInfo {
    uri: string;
}

export default function InsuranceClaimScreen() {
    const router = useRouter();
    const [date, setDate] = useState('');
    const [provider, setProvider] = useState('');
    const [service, setService] = useState('');
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [images, setImages] = useState<ImageInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImages([...images, { uri: result.assets[0].uri }]);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    };

    const validateForm = () => {
        if (!date) {
            Alert.alert('Missing Information', 'Please enter the service date.');
            return false;
        }
        if (!provider) {
            Alert.alert('Missing Information', 'Please enter the provider name.');
            return false;
        }
        if (!service) {
            Alert.alert('Missing Information', 'Please enter the service description.');
            return false;
        }
        if (!amount) {
            Alert.alert('Missing Information', 'Please enter the claim amount.');
            return false;
        }
        if (images.length === 0) {
            Alert.alert('Missing Documentation', 'Please upload at least one image of your receipt or documentation.');
            return false;
        }
        return true;
    };

    const handleSubmitClaim = () => {
        if (!validateForm()) return;

        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            Alert.alert(
                'Claim Submitted',
                'Your insurance claim has been submitted successfully. You will receive a notification when it is processed.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.back()
                    }
                ]
            );
        }, 2000);
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
                <Text style={styles.headerTitle}>Submit Insurance Claim</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.subtitle}>
                    Please provide the details of your medical expense to submit for reimbursement.
                </Text>

                <View style={styles.formSection}>
                    <Input
                        label="Service Date"
                        value={date}
                        onChangeText={setDate}
                        placeholder="YYYY-MM-DD"
                        keyboardType="numbers-and-punctuation"
                    />

                    <Input
                        label="Provider Name"
                        value={provider}
                        onChangeText={setProvider}
                        placeholder="Enter healthcare provider name"
                    />

                    <Input
                        label="Service Description"
                        value={service}
                        onChangeText={setService}
                        placeholder="Enter service or procedure description"
                    />

                    <Input
                        label="Claim Amount ($)"
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="0.00"
                        keyboardType="decimal-pad"
                    />

                    <Input
                        label="Additional Notes (Optional)"
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Enter any additional information"
                        multiline
                        numberOfLines={4}
                    />
                </View>

                <View style={styles.uploadSection}>
                    <Text style={styles.uploadTitle}>Upload Documentation</Text>
                    <Text style={styles.uploadSubtitle}>
                        Please upload images of your receipts, bills, or other supporting documents.
                    </Text>

                    <View style={styles.imagesContainer}>
                        {images.map((image, index) => (
                            <View key={index} style={styles.imageContainer}>
                                <Image source={{ uri: image.uri }} style={styles.image} />
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => removeImage(index)}
                                >
                                    <X size={16} color={COLORS.white} />
                                </TouchableOpacity>
                            </View>
                        ))}

                        <TouchableOpacity
                            style={styles.addImageButton}
                            onPress={pickImage}
                        >
                            <Plus size={24} color={COLORS.primary} />
                            <Text style={styles.addImageText}>Add Image</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.disclaimerContainer}>
                    <Text style={styles.disclaimerText}>
                        By submitting this claim, you certify that the information provided is true and accurate.
                        Fraudulent claims may result in denial of benefits and possible legal action.
                    </Text>
                </View>

                <Button
                    title="Submit Claim"
                    onPress={handleSubmitClaim}
                    isLoading={isLoading}
                    style={styles.submitButton}
                />
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
    subtitle: {
        fontSize: SIZES.md,
        color: COLORS.textSecondary,
        marginBottom: 24,
        lineHeight: 22,
    },
    formSection: {
        marginBottom: 24,
    },
    uploadSection: {
        marginBottom: 24,
    },
    uploadTitle: {
        fontSize: SIZES.md,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    uploadSubtitle: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        marginBottom: 16,
    },
    imagesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    imageContainer: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginRight: 12,
        marginBottom: 12,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    removeButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.error,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.small,
    },
    addImageButton: {
        width: 100,
        height: 100,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    addImageText: {
        fontSize: SIZES.xs,
        color: COLORS.primary,
        marginTop: 4,
    },
    disclaimerContainer: {
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        borderRadius: 8,
        padding: 12,
        marginBottom: 24,
    },
    disclaimerText: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
        lineHeight: 18,
    },
    submitButton: {
        marginBottom: 24,
    },
});