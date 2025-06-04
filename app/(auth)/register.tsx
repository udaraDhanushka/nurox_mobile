import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SIZES } from '../../constants/theme';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/auth';

export default function RegisterScreen() {
    const router = useRouter();
    const { register, isLoading, error, clearError } = useAuthStore();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<UserRole>('patient');

    const [firstNameError, setFirstNameError] = useState('');
    const [lastNameError, setLastNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    // Clear auth store errors when component mounts or unmounts
    useEffect(() => {
        clearError();
        return () => clearError();
    }, []);

    // Auto-dismiss error messages after 5 seconds
    useEffect(() => {
        if (error || firstNameError || lastNameError || emailError || passwordError || confirmPasswordError) {
            const timer = setTimeout(() => {
                clearError();
                setFirstNameError('');
                setLastNameError('');
                setEmailError('');
                setPasswordError('');
                setConfirmPasswordError('');
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [error, firstNameError, lastNameError, emailError, passwordError, confirmPasswordError]);

    const resetForm = () => {
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setRole('patient');
        setFirstNameError('');
        setLastNameError('');
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');
    };

    const validateForm = () => {
        let isValid = true;

        // First name validation
        if (!firstName.trim()) {
            setFirstNameError('First name is required');
            isValid = false;
        } else {
            setFirstNameError('');
        }

        // Last name validation
        if (!lastName.trim()) {
            setLastNameError('Last name is required');
            isValid = false;
        } else {
            setLastNameError('');
        }

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
        } else if (password.length < 8) {
            setPasswordError('Password must be at least 8 characters');
            isValid = false;
        } else {
            setPasswordError('');
        }

        // Confirm password validation
        if (!confirmPassword) {
            setConfirmPasswordError('Please confirm your password');
            isValid = false;
        } else if (password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
            isValid = false;
        } else {
            setConfirmPasswordError('');
        }

        return isValid;
    };

    const handleRegister = async () => {
        clearError();
        if (validateForm()) {
            try {
                await register({
                    firstName,
                    lastName,
                    email,
                    password,
                    role
                });

                // If we get here, registration was successful
                Alert.alert(
                    "Registration Successful",
                    "Your account has been created successfully!",
                    [{
                        text: "OK",
                        onPress: () => {
                            resetForm();
                            router.push('/login');
                        }
                    }]
                );
            } catch (err) {
                // Error is handled by the store
                console.error("Registration error:", err);
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
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Sign up to get started with HealthConnect</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.nameRow}>
                            <Input
                                label="First Name"
                                value={firstName}
                                onChangeText={setFirstName}
                                placeholder="Enter first name"
                                error={firstNameError}
                                style={styles.nameInput}
                            />

                            <Input
                                label="Last Name"
                                value={lastName}
                                onChangeText={setLastName}
                                placeholder="Enter last name"
                                error={lastNameError}
                                style={styles.nameInput}
                            />
                        </View>

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
                            placeholder="Create a password"
                            secureTextEntry
                            error={passwordError}
                        />

                        <Input
                            label="Confirm Password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Confirm your password"
                            secureTextEntry
                            error={confirmPasswordError}
                        />

                        <Text style={styles.roleLabel}>I am a:</Text>
                        <View style={styles.roleContainer}>
                            {(['patient', 'doctor', 'pharmacist'] as UserRole[]).map((roleOption) => (
                                <TouchableOpacity
                                    key={roleOption}
                                    style={[
                                        styles.roleButton,
                                        role === roleOption && styles.roleButtonActive
                                    ]}
                                    onPress={() => setRole(roleOption)}
                                >
                                    <Text
                                        style={[
                                            styles.roleButtonText,
                                            role === roleOption && styles.roleButtonTextActive
                                        ]}
                                    >
                                        {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {error ? (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        <Button
                            title="Sign Up"
                            onPress={handleRegister}
                            isLoading={isLoading}
                            style={styles.button}
                        />

                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>Already have an account?</Text>
                            <TouchableOpacity onPress={() => router.push('/login')}>
                                <Text style={styles.loginLink}>Log In</Text>
                            </TouchableOpacity>
                        </View>
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
    },
    formContainer: {
        marginBottom: 24,
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    nameInput: {
        flex: 1,
        marginRight: 8,
    },
    roleLabel: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    roleContainer: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    roleButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        marginRight: 8,
        alignItems: 'center',
    },
    roleButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    roleButtonText: {
        fontSize: SIZES.sm,
        color: COLORS.textPrimary,
    },
    roleButtonTextActive: {
        color: COLORS.white,
        fontWeight: '600',
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
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    loginText: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
    },
    loginLink: {
        fontSize: SIZES.sm,
        color: COLORS.primary,
        fontWeight: '600',
        marginLeft: 4,
    },
});