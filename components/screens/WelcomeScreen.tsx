import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SIZES } from '@/constants/theme';
import { Button } from '@/components/Button';

export default function WelcomeScreen() {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(0);

    const onboardingData = [
        {
            title: "Welcome to Nurox",
            description: "Your comprehensive healthcare platform for patients, doctors, and pharmacists.",
            image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop"
        },
        {
            title: "Manage Your Health",
            description: "Schedule appointments, access medical records, and manage prescriptions all in one place.",
            image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=2070&auto=format&fit=crop"
        },
        {
            title: "Connect with Healthcare Providers",
            description: "Seamless communication between patients, doctors, and pharmacists for better healthcare outcomes.",
            image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop"
        }
    ];

    const handleNext = () => {
        if (currentPage < onboardingData.length - 1) {
            setCurrentPage(currentPage + 1);
        } else {
            router.push('/login');
        }
    };

    const handleSkip = () => {
        router.push('/login');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            <View style={styles.skipContainer}>
                {currentPage < onboardingData.length - 1 && (
                    <TouchableOpacity onPress={handleSkip}>
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: onboardingData[currentPage].image }}
                    style={styles.image}
                    resizeMode="cover"
                />
            </View>

            <View style={styles.contentContainer}>
                <Text style={styles.title}>{onboardingData[currentPage].title}</Text>
                <Text style={styles.description}>{onboardingData[currentPage].description}</Text>

                <View style={styles.paginationContainer}>
                    {onboardingData.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.paginationDot,
                                index === currentPage && styles.paginationDotActive
                            ]}
                        />
                    ))}
                </View>

                <Button
                    title={currentPage === onboardingData.length - 1 ? "Get Started" : "Next"}
                    onPress={handleNext}
                    style={styles.button}
                />

                {currentPage === onboardingData.length - 1 && (
                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>Already have an account?</Text>
                        <TouchableOpacity onPress={() => router.push('/login')}>
                            <Text style={styles.loginLink}>Log In</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    skipContainer: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
    },
    skipText: {
        fontSize: SIZES.md,
        color: COLORS.primary,
        fontWeight: '500',
    },
    imageContainer: {
        height: '50%',
        width: '100%',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    contentContainer: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    title: {
        fontSize: SIZES.xxxl,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 12,
        textAlign: 'center',
    },
    description: {
        fontSize: SIZES.md,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 32,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.lightGray,
        marginHorizontal: 4,
    },
    paginationDotActive: {
        backgroundColor: COLORS.primary,
        width: 20,
    },
    button: {
        width: '100%',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
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