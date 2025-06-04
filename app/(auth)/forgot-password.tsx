import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SIZES } from '@/constants/theme';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/store/authStore';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const { resetPassword, isLoading, error, clearError } = useAuthStore();

    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Clear auth store errors when component mounts or unmounts
    useEffect(() => {
        clearError();
        return () => clearError();
    }, []);

    // Auto-dismiss error messages after 5 seconds
    useEffect(() => {
        if (error || emailError) {
            const timer = setTimeout(() => {
                clearError();
                setEmailError('');
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [error, emailError]);

    const validateForm = () => {
        let isValid = true;

        // Email validation
        if (!email) {
            setEmailError('Email is required');
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setEmailError('Please enter a valid email address');
            isValid = false;
        } else {
            setEmailError('');
        }

        return isValid;
    };

    const handleResetPassword = async () => {
        clearError();
        if (validateForm()) {
            try {
                await resetPassword({ email });
                setIsSubmitted(true);
                setEmail(''); // Clear the email field after successful submission
            } catch (error) {
                // Error is handled by the store
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text style={styles.title}>Forgot Password</Text>
                        <Text style={styles.subtitle}>
                            {isSubmitted
                                ? "We've sent password reset instructions to your email."
                                : "Enter your email and we'll send you instructions to reset your password."}
                        </Text>
                    </View>

                    {!isSubmitted ? (
                        <View style={styles.formContainer}>
                            <Input
                                label="Email"
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Enter your email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                error={emailError}
                            />

                            {error ? (
                                <View style={styles.errorContainer}>
                                    <Text style={styles.errorText}>{error}</Text>
                                </View>
                            ) : null}

                            <Button
                                title="Send Reset Link"
                                onPress={handleResetPassword}
                                isLoading={isLoading}
                                style={styles.button}
                            />
                        </View>
                    ) : (
                        <View style={styles.successContainer}>
                            <Text style={styles.successText}>
                                Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
                            </Text>

                            <Button
                                title="Back to Login"
                                onPress={() => router.push('/login')}
                                style={styles.button}
                            />

                            <TouchableOpacity
                                style={styles.resendContainer}
                                onPress={handleResetPassword}
                            >
                                <Text style={styles.resendText}>Didn't receive the email? Resend</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={styles.helpContainer}>
                        <Text style={styles.helpText}>Need help?</Text>
                        <TouchableOpacity>
                            <Text style={styles.helpLink}>Contact Support</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
    },
    backButton: {
        marginBottom: 24,
    },
    backButtonText: {
        fontSize: SIZES.md,
        color: COLORS.primary,
        fontWeight: '500',
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: SIZES.xxxl,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: SIZES.md,
        color: COLORS.textSecondary,
        lineHeight: 22,
    },
    formContainer: {
        marginBottom: 24,
    },
    errorContainer: {
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    errorText: {
        fontSize: SIZES.sm,
        color: COLORS.error,
        textAlign: 'center',
    },
    button: {
        marginBottom: 16,
    },
    successContainer: {
        marginBottom: 24,
    },
    successText: {
        fontSize: SIZES.md,
        color: COLORS.textSecondary,
        lineHeight: 22,
        marginBottom: 24,
    },
    resendContainer: {
        alignItems: 'center',
        marginTop: 8,
    },
    resendText: {
        fontSize: SIZES.sm,
        color: COLORS.primary,
        fontWeight: '500',
    },
    helpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 'auto',
        paddingTop: 24,
    },
    helpText: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
    },
    helpLink: {
        fontSize: SIZES.sm,
        color: COLORS.primary,
        fontWeight: '600',
        marginLeft: 4,
    },
});