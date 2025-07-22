import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { COLORS, SIZES } from '../../constants/theme';
import { Button } from '../Button';

interface WelcomeScreenProps {
    onGetStarted: () => void;
}

const { width, height } = Dimensions.get('window');

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
    const router = useRouter();
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            title: "Welcome",
            subtitle: "to Nurox",
            description: "Here you can learn new and most interesting things for you",
            image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=600&fit=crop&crop=face"
        },
        {
            title: "Expert Care",
            subtitle: "Professional Doctors",
            description: "Connect with certified healthcare professionals anytime, anywhere",
            image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=600&fit=crop&crop=face"
        },
        {
            title: "Easy to",
            subtitle: "manage your health",
            description: "Manage your prescriptions, appointments, and medical history in one place",
            image: "https://images.unsplash.com/photo-1594824804732-ca8db7d1e3d8?w=400&h=600&fit=crop&crop=face"
        }
    ];

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            router.push('/login');
        }
    };

    const handlePrevious = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    const handleSkip = () => {
        router.push('/login');
    };

    const currentSlideData = slides[currentSlide];

    return (
        <View style={styles.container}>
            {/* Purple gradient background */}
            <LinearGradient
                colors={['#3b82f6', '#2563eb']}
                style={styles.topSection}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handlePrevious}
                        disabled={currentSlide === 0}
                    >
                        {currentSlide > 0 && (
                            <ArrowLeft size={24} color={COLORS.white} />
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleSkip}>
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>
                </View>

                {/* Image Container */}
                <View style={styles.imageContainer}>
                    <View style={styles.imageWrapper}>
                        <Image
                            source={{ uri: currentSlideData.image }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    </View>
                </View>
            </LinearGradient>

            {/* White bottom section */}
            <View style={styles.bottomSection}>
                {/* Page Indicators */}
                <View style={styles.indicatorContainer}>
                    {slides.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.indicator,
                                index === currentSlide ? styles.activeIndicator : styles.inactiveIndicator
                            ]}
                        />
                    ))}
                </View>

                {/* Text Content */}
                <View style={styles.textContent}>
                    <Text style={styles.title}>{currentSlideData.title}</Text>
                    <Text style={styles.subtitle}>{currentSlideData.subtitle}</Text>
                    <Text style={styles.description}>{currentSlideData.description}</Text>
                </View>

                {/* Get Started Button */}
                <View style={styles.buttonContainer}>
                    <Button
                        title={currentSlide === slides.length - 1 ? "Get Started" : "Next"}
                        onPress={handleNext}
                        style={styles.getStartedButton}
                        textStyle={styles.getStartedButtonText}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    topSection: {
        flex: 2,
    },
    bottomSection: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        padding: 30,
        paddingBottom: 40,
        justifyContent: 'space-between',
        marginTop: -40,
        zIndex: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    skipText: {
        fontSize: SIZES.md,
        color: COLORS.white,
        fontWeight: '500',
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingBottom: 40,
    },
    imageWrapper: {
        width: width * 0.5,
        height: width * 0.7,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    indicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        gap: 8,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    activeIndicator: {
        backgroundColor: '#2563eb',
        width: 24,
    },
    inactiveIndicator: {
        backgroundColor: '#e5e7eb',
    },
    textContent: {
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: 12,
    },
    description: {
        fontSize: SIZES.sm,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 10,
    },
    buttonContainer: {
        paddingHorizontal: 0,
    },
    getStartedButton: {
        backgroundColor: '#2563eb',
        paddingVertical: 16,
        borderRadius: 12,
        shadowColor: '#7c3aed',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    getStartedButtonText: {
        fontSize: SIZES.md,
        fontWeight: '600',
        color: COLORS.white,
    },
});