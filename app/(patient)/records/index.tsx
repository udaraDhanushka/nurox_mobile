import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, TestTube, Pill, FileCheck, Heart, Activity, ArrowRight } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';

export default function MedicalRecordsScreen() {
    const router = useRouter();

    const recordCategories = [
        {
            id: 'prescriptions',
            title: 'Prescriptions',
            description: 'View your current and past medications',
            icon: <Pill size={24} color={COLORS.primary} />,
            route: '/records/prescriptions'
        },
        {
            id: 'lab-reports',
            title: 'Lab Reports',
            description: 'Access your laboratory test results',
            icon: <TestTube size={24} color={COLORS.warning} />,
            route: '/records/lab-reports'
        },
        {
            id: 'medical-history',
            title: 'Medical History',
            description: 'View your past medical conditions and treatments',
            icon: <FileText size={24} color={COLORS.info} />,
            route: '/records/medical-history'
        },
        {
            id: 'vitals',
            title: 'Vital Signs',
            description: 'Track your blood pressure, heart rate, and more',
            icon: <Heart size={24} color={COLORS.error} />,
            route: '/records/vitals'
        },
        {
            id: 'allergies',
            title: 'Allergies & Conditions',
            description: 'Manage your allergies and chronic conditions',
            icon: <Activity size={24} color={COLORS.success} />,
            route: '/records/allergies'
        },
        {
            id: 'documents',
            title: 'Medical Documents',
            description: 'Access and upload important medical documents',
            icon: <FileCheck size={24} color={COLORS.secondary} />,
            route: '/records/documents'
        }
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Medical Records</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.subtitle}>
                    Access and manage all your health records in one place
                </Text>

                <View style={styles.categoriesContainer}>
                    {recordCategories.map(category => (
                        <TouchableOpacity
                            key={category.id}
                            style={styles.categoryCard}
                            onPress={() => router.push(category.route)}
                        >
                            <View style={styles.categoryIconContainer}>
                                {category.icon}
                            </View>
                            <View style={styles.categoryContent}>
                                <Text style={styles.categoryTitle}>{category.title}</Text>
                                <Text style={styles.categoryDescription}>{category.description}</Text>
                            </View>
                            <ArrowRight size={20} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    ))}
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
    content: {
        flex: 1,
        padding: 16,
    },
    subtitle: {
        fontSize: SIZES.md,
        color: COLORS.textSecondary,
        marginBottom: 24,
    },
    categoriesContainer: {
        gap: 12,
    },
    categoryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        ...SHADOWS.small,
    },
    categoryIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    categoryContent: {
        flex: 1,
    },
    categoryTitle: {
        fontSize: SIZES.md,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    categoryDescription: {
        fontSize: SIZES.xs,
        color: COLORS.textSecondary,
    },
});