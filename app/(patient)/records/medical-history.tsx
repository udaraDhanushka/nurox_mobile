import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Plus, Calendar, User, AlertCircle } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTranslation } from '@/hooks/useTranslation';

interface MedicalHistoryItem {
  id: string;
  condition: string;
  diagnosedDate: string;
  doctor: string;
  status: 'active' | 'resolved' | 'chronic';
  description: string;
  treatment: string;
}

export default function MedicalHistoryScreen() {
  const { t } = useTranslation();
  const [medicalHistory] = useState<MedicalHistoryItem[]>([
    {
      id: '1',
      condition: 'Hypertension',
      diagnosedDate: '2023-01-15',
      doctor: 'Dr. Sarah Johnson',
      status: 'chronic',
      description: 'High blood pressure requiring ongoing management',
      treatment: 'Lifestyle changes and medication'
    },
    {
      id: '2',
      condition: 'Seasonal Allergies',
      diagnosedDate: '2022-03-20',
      doctor: 'Dr. Michael Chen',
      status: 'active',
      description: 'Allergic reactions to pollen during spring season',
      treatment: 'Antihistamines as needed'
    },
    {
      id: '3',
      condition: 'Appendicitis',
      diagnosedDate: '2021-08-10',
      doctor: 'Dr. Robert Smith',
      status: 'resolved',
      description: 'Acute appendicitis requiring surgical removal',
      treatment: 'Appendectomy performed successfully'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return COLORS.warning;
      case 'chronic':
        return COLORS.error;
      case 'resolved':
        return COLORS.success;
      default:
        return COLORS.textSecondary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: t('medicalHistory'),
          headerStyle: {
            backgroundColor: COLORS.white,
          },
          headerTintColor: COLORS.primary,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }} 
      />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.subtitle}>
            {t('viewPastMedicalConditions')}
          </Text>
          <Button
            title={t('addCondition')}
            onPress={() => {}}
            style={styles.addButton}
            icon={<Plus size={20} color={COLORS.white} />}
          />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {medicalHistory.length === 0 ? (
            <EmptyState
              icon={<FileText size={48} color={COLORS.textSecondary} />}
              message={t('noMedicalHistory')}
              description={t('medicalHistoryWillAppear')}
            />
          ) : (
            <View style={styles.historyList}>
              {medicalHistory.map((item) => (
                <TouchableOpacity key={item.id} style={styles.historyCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.conditionInfo}>
                      <Text style={styles.conditionName}>{item.condition}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                        <Text style={styles.statusText}>{t(item.status)}</Text>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.description}>{item.description}</Text>

                  <View style={styles.cardDetails}>
                    <View style={styles.detailRow}>
                      <Calendar size={16} color={COLORS.textSecondary} />
                      <Text style={styles.detailText}>{t('diagnosed')}: {formatDate(item.diagnosedDate)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <User size={16} color={COLORS.textSecondary} />
                      <Text style={styles.detailText}>{item.doctor}</Text>
                    </View>
                  </View>

                  <View style={styles.treatmentSection}>
                    <Text style={styles.treatmentLabel}>{t('treatment')}:</Text>
                    <Text style={styles.treatmentText}>{item.treatment}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  subtitle: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  historyList: {
    gap: 16,
  },
  historyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    ...SHADOWS.medium,
  },
  cardHeader: {
    marginBottom: 12,
  },
  conditionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conditionName: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: SIZES.xs,
    fontWeight: '500',
    color: COLORS.white,
  },
  description: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  cardDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  treatmentSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  treatmentLabel: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  treatmentText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});