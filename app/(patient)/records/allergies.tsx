import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertTriangle, Plus, Pill, Utensils, Flower, Shield } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTranslation } from '@/hooks/useTranslation';

interface Allergy {
  id: string;
  name: string;
  type: 'medication' | 'food' | 'environmental' | 'other';
  severity: 'mild' | 'moderate' | 'severe';
  symptoms: string[];
  notes?: string;
  dateAdded: string;
}

interface Condition {
  id: string;
  name: string;
  type: 'chronic' | 'acute' | 'genetic';
  status: 'active' | 'managed' | 'resolved';
  diagnosedDate: string;
  description: string;
}

export default function AllergiesConditionsScreen() {
  const { t } = useTranslation();
  const [allergies] = useState<Allergy[]>([
    {
      id: '1',
      name: 'Penicillin',
      type: 'medication',
      severity: 'severe',
      symptoms: ['Rash', 'Difficulty breathing', 'Swelling'],
      notes: 'Discovered during childhood infection treatment',
      dateAdded: '2020-03-15'
    },
    {
      id: '2',
      name: 'Peanuts',
      type: 'food',
      severity: 'moderate',
      symptoms: ['Hives', 'Nausea', 'Stomach pain'],
      dateAdded: '2019-08-22'
    },
    {
      id: '3',
      name: 'Pollen',
      type: 'environmental',
      severity: 'mild',
      symptoms: ['Sneezing', 'Runny nose', 'Itchy eyes'],
      dateAdded: '2021-04-10'
    }
  ]);

  const [conditions] = useState<Condition[]>([
    {
      id: '1',
      name: 'Type 2 Diabetes',
      type: 'chronic',
      status: 'managed',
      diagnosedDate: '2022-01-15',
      description: 'Well-controlled with diet and medication'
    },
    {
      id: '2',
      name: 'Hypertension',
      type: 'chronic',
      status: 'active',
      diagnosedDate: '2021-11-08',
      description: 'Currently managing with lifestyle changes and medication'
    }
  ]);

  const [activeTab, setActiveTab] = useState<'allergies' | 'conditions'>('allergies');

  const getAllergyIcon = (type: string) => {
    switch (type) {
      case 'medication':
        return <Pill size={20} color={COLORS.error} />;
      case 'food':
        return <Utensils size={20} color={COLORS.warning} />;
      case 'environmental':
        return <Flower size={20} color={COLORS.success} />;
      default:
        return <AlertTriangle size={20} color={COLORS.textSecondary} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild':
        return COLORS.success;
      case 'moderate':
        return COLORS.warning;
      case 'severe':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return COLORS.error;
      case 'managed':
        return COLORS.warning;
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
          title: `${t('allergies')} & ${t('conditions')}`,
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
            {t('manageAllergiesConditions')}
          </Text>
          
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'allergies' && styles.activeTab]}
              onPress={() => setActiveTab('allergies')}
            >
              <Text style={[styles.tabText, activeTab === 'allergies' && styles.activeTabText]}>
                {t('allergies')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'conditions' && styles.activeTab]}
              onPress={() => setActiveTab('conditions')}
            >
              <Text style={[styles.tabText, activeTab === 'conditions' && styles.activeTabText]}>
                {t('conditions')}
              </Text>
            </TouchableOpacity>
          </View>

          <Button
            title={activeTab === 'allergies' ? t('addAllergy') : t('addCondition')}
            onPress={() => {}}
            style={styles.addButton}
            icon={<Plus size={20} color={COLORS.white} />}
          />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'allergies' ? (
            allergies.length === 0 ? (
              <EmptyState
                icon={<AlertTriangle size={48} color={COLORS.textSecondary} />}
                message={t('noAllergiesRecorded')}
                description={t('addKnownAllergies')}
              />
            ) : (
              <View style={styles.itemsList}>
                {allergies.map((allergy) => (
                  <TouchableOpacity key={allergy.id} style={styles.allergyCard}>
                    <View style={styles.cardHeader}>
                      <View style={styles.allergyInfo}>
                        <View style={styles.allergyIcon}>
                          {getAllergyIcon(allergy.type)}
                        </View>
                        <View style={styles.allergyDetails}>
                          <Text style={styles.allergyName}>{allergy.name}</Text>
                          <Text style={styles.allergyType}>{t(allergy.type)} {t('allergies')}</Text>
                        </View>
                      </View>
                      <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(allergy.severity) }]}>
                        <Text style={styles.severityText}>{t(allergy.severity).toUpperCase()}</Text>
                      </View>
                    </View>

                    <View style={styles.symptomsSection}>
                      <Text style={styles.symptomsLabel}>{t('symptoms')}:</Text>
                      <View style={styles.symptomsList}>
                        {allergy.symptoms.map((symptom, index) => (
                          <View key={index} style={styles.symptomTag}>
                            <Text style={styles.symptomText}>{symptom}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {allergy.notes && (
                      <View style={styles.notesSection}>
                        <Text style={styles.notesLabel}>{t('notes')}:</Text>
                        <Text style={styles.notesText}>{allergy.notes}</Text>
                      </View>
                    )}

                    <Text style={styles.dateAdded}>{t('added')}: {formatDate(allergy.dateAdded)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )
          ) : (
            conditions.length === 0 ? (
              <EmptyState
                icon={<Shield size={48} color={COLORS.textSecondary} />}
                message={t('noConditionsRecorded')}
                description={t('addChronicConditions')}
              />
            ) : (
              <View style={styles.itemsList}>
                {conditions.map((condition) => (
                  <TouchableOpacity key={condition.id} style={styles.conditionCard}>
                    <View style={styles.cardHeader}>
                      <View style={styles.conditionInfo}>
                        <Text style={styles.conditionName}>{condition.name}</Text>
                        <Text style={styles.conditionType}>{condition.type.charAt(0).toUpperCase() + condition.type.slice(1)} {t('conditions')}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(condition.status) }]}>
                        <Text style={styles.statusText}>{t(condition.status).toUpperCase()}</Text>
                      </View>
                    </View>

                    <Text style={styles.conditionDescription}>{condition.description}</Text>
                    
                    <Text style={styles.diagnosedDate}>{t('diagnosed')}: {formatDate(condition.diagnosedDate)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  tabText: {
    fontSize: SIZES.md,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.primary,
  },
  addButton: {
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  itemsList: {
    gap: 16,
  },
  allergyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    ...SHADOWS.medium,
  },
  conditionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    ...SHADOWS.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  allergyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  conditionInfo: {
    flex: 1,
  },
  allergyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  allergyDetails: {
    flex: 1,
  },
  allergyName: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  conditionName: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  allergyType: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  conditionType: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: SIZES.xs,
    fontWeight: '600',
    color: COLORS.white,
  },
  statusText: {
    fontSize: SIZES.xs,
    fontWeight: '600',
    color: COLORS.white,
  },
  symptomsSection: {
    marginBottom: 12,
  },
  symptomsLabel: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  symptomsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  symptomTag: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  symptomText: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
  },
  notesSection: {
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  notesText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  conditionDescription: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  dateAdded: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
  },
  diagnosedDate: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
  },
});