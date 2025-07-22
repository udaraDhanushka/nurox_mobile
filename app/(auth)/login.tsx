import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SIZES } from '../../constants/theme';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../store/authStore';
import { checkApiHealthDetailed } from '../../services/api';

export default function LoginScreen() {
    const router = useRouter();
    const { login, isLoading, error, clearError } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // Clear auth store errors when component mounts or unmounts
    useEffect(() => {
        clearError();
        return () => clearError();
    }, []);

    // Auto-dismiss error messages after 5 seconds
    useEffect(() => {
        if (error || emailError || passwordError) {
            const timer = setTimeout(() => {
                clearError();
                setEmailError('');
                setPasswordError('');
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [error, emailError, passwordError]);

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

        // Password validation
        if (!password) {
            setPasswordError('Password is required');
            isValid = false;
        } else {
            setPasswordError('');
        }

        return isValid;
    };

    const handleLogin = async () => {
        if (validateForm()) {
            try {
                // Optional health check - don't block login if health check fails
                try {
                    const healthCheck = await checkApiHealthDetailed();
                    if (!healthCheck.isHealthy) {
                        console.warn('Server health check failed, but proceeding with login:', healthCheck);
                    }
                } catch (healthError) {
                    console.warn('Health check failed, but proceeding with login:', healthError);
                }
                
                // Proceed with login regardless of health check result
                await login({ email, password });
            } catch (err) {
                console.error("Login error:", err);
            }
        }
    };

    // Helper text for demo users
    // const demoUsers = [
    //     { role: 'Patient', email: 'patient@example.com' },
    //     { role: 'Doctor', email: 'doctor@example.com' },
    //     { role: 'Pharmacist', email: 'pharmacist@example.com' }
    // ];

    // const handleDemoLogin = (demoEmail: string) => {
    //     // Set the demo credentials
    //     setEmail(demoEmail);
    //     setPassword('password123');

    //     // Clear any validation errors
    //     setEmailError('');
    //     setPasswordError('');

    //     // Login with the demo credentials
    //     login({ email: demoEmail, password: 'password123' });
    // };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.header}>
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=2070&auto=format&fit=crop' }}
                            style={styles.logo}
                        />
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Log in to your Nurox account</Text>
                    </View>

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

                        <Input
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Enter your password"
                            secureTextEntry
                            error={passwordError}
                        />

                        <TouchableOpacity
                            style={styles.forgotPasswordContainer}
                            onPress={() => router.push('/forgot-password')}
                        >
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        {error ? (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}
                        </View>
                        <Button
                            title="Log In"
                            onPress={handleLogin}
                            isLoading={isLoading}
                            style={styles.button}
                        />

                        <View style={styles.registerContainer}>
                            <Text style={styles.registerText}>Don&apos;t have an account?</Text>
                            <TouchableOpacity onPress={() => router.push('/register')}>
                                <Text style={styles.registerLink}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>

                    {/* <View style={styles.demoContainer}>
                        <Text style={styles.demoTitle}>Demo Accounts</Text>
                        <Text style={styles.demoSubtitle}>Use these accounts to explore different roles:</Text>

                        <View style={styles.demoButtonsContainer}>
                            {demoUsers.map((user, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.demoButton}
                                    onPress={() => handleDemoLogin(user.email)}
                                >
                                    <Text style={styles.demoButtonText}>{user.role}</Text>
                                    <Text style={styles.demoButtonSubtext}>{user.email}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <Text style={styles.demoNote}>Password for all demo accounts: password123</Text>
                    </View> */}
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logo: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
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
        textAlign: 'center',
    },
    formContainer: {
        marginTop: 32,
        marginBottom: 24,
    },
    forgotPasswordContainer: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        fontSize: SIZES.sm,
        color: COLORS.primary,
        fontWeight: '500',
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
        marginTop: 40,
        marginBottom: 16,
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    registerText: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
    },
    registerLink: {
        fontSize: SIZES.sm,
        color: COLORS.primary,
        fontWeight: '600',
        marginLeft: 4,
    },
    demoContainer: {
        marginTop: 32,
        padding: 16,
        backgroundColor: COLORS.veryLightGray,
        borderRadius: 12,
    },
    demoTitle: {
        fontSize: SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 8,
        textAlign: 'center',
    },
    demoSubtitle: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        marginBottom: 16,
        textAlign: 'center',
    },
    demoButtonsContainer: {
        marginBottom: 16,
    },
    demoButton: {
        backgroundColor: COLORS.white,
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    demoButtonText: {
        fontSize: SIZES.md,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    demoButtonSubtext: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    demoNote: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
        textAlign: 'center',
    },
});