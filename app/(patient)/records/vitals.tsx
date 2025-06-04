import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Activity, Thermometer, Weight, Plus, TrendingUp, TrendingDown } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { Button } from '@/components/Button';
import { useTranslation } from '@/hooks/useTranslation';

interface VitalReading {
  id: string;
  type: 'blood_pressure' | 'heart_rate' | 'temperature' | 'weight' | 'oxygen_saturation';
  value: string;
  unit: string;
  date: string;
  time: string;
  status: 'normal' | 'high' | 'low';
}

const { width } = Dimensions.get('window');

export default function VitalSignsScreen() {
  const { t } = useTranslation();
  const [vitals] = useState<VitalReading[]>([
    {
      id: '1',
      type: 'blood_pressure',
      value: '120/80',
      unit: 'mmHg',
      date: '2024-01-15',
      time: '09:30 AM',
      status: 'normal'
    },
    {
      id: '2',
      type: 'heart_rate',
      value: '72',
      unit: 'bpm',
      date: '2024-01-15',
      time: '09:30 AM',
      status: 'normal'
    },
    {
      id: '3',
      type: 'temperature',
      value: '98.6',
      unit: '°F',
      date: '2024-01-15',
      time: '09:30 AM',
      status: 'normal'
    },
    {
      id: '4',
      type: 'weight',
      value: '165',
      unit: 'lbs',
      date: '2024-01-15',
      time: '09:30 AM',
      status: 'normal'
    },
    {
      id: '5',
      type: 'oxygen_saturation',
      value: '98',
      unit: '%',
      date: '2024-01-15',
      time: '09:30 AM',
      status: 'normal'
    }
  ]);

  const getVitalIcon = (type: string) => {
    switch (type) {
      case 'blood_pressure':
        return <Heart size={24} color={COLORS.error} />;
      case 'heart_rate':
        return <Activity size={24} color={COLORS.primary} />;
      case 'temperature':
        return <Thermometer size={24} color={COLORS.warning} />;
      case 'weight':
        return <Weight size={24} color={COLORS.info} />;
      case 'oxygen_saturation':
        return <Activity size={24} color={COLORS.success} />;
      default:
        return <Activity size={24} color={COLORS.textSecondary} />;
    }
  };

  const getVitalName = (type: string) => {
    switch (type) {
      case 'blood_pressure':
        return t('bloodPressure');
      case 'heart_rate':
        return t('heartRate');
      case 'temperature':
        return t('temperature');
      case 'weight':
        return t('weight');
      case 'oxygen_saturation':
        return t('oxygenSaturation');
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return COLORS.success;
      case 'high':
        return COLORS.error;
      case 'low':
        return COLORS.warning;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'high':
        return <TrendingUp size={16} color={COLORS.error} />;
      case 'low':
        return <TrendingDown size={16} color={COLORS.warning} />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Group vitals by type for latest readings
  const latestVitals = vitals.reduce((acc, vital) => {
    if (!acc[vital.type] || new Date(vital.date) > new Date(acc[vital.type].date)) {
      acc[vital.type] = vital;
    }
    return acc;
  }, {} as Record<string, VitalReading>);

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: t('vitalSigns'),
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
            {t('trackVitalSigns')}
          </Text>
          <Button
            title={t('recordVitals')}
            onPress={() => {}}
            style={styles.addButton}
            icon={<Plus size={20} color={COLORS.white} />}
          />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>{t('latestReadings')}</Text>
          
          <View style={styles.vitalsGrid}>
            {Object.values(latestVitals).map((vital) => (
              <TouchableOpacity key={vital.id} style={styles.vitalCard}>
                <View style={styles.vitalHeader}>
                  <View style={styles.vitalIcon}>
                    {getVitalIcon(vital.type)}
                  </View>
                  <View style={styles.statusContainer}>
                    {getStatusIcon(vital.status)}
                  </View>
                </View>
                
                <Text style={styles.vitalName}>{getVitalName(vital.type)}</Text>
                
                <View style={styles.vitalValue}>
                  <Text style={styles.valueText}>{vital.value}</Text>
                  <Text style={styles.unitText}>{vital.unit}</Text>
                </View>
                
                <View style={styles.vitalMeta}>
                  <Text style={styles.dateText}>{formatDate(vital.date)}</Text>
                  <Text style={styles.timeText}>{vital.time}</Text>
                </View>
                
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(vital.status) }]}>
                  <Text style={styles.statusText}>{t(vital.status).toUpperCase()}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>{t('recentHistory')}</Text>
            
            <View style={styles.historyList}>
              {vitals.slice(0, 10).map((vital) => (
                <View key={vital.id} style={styles.historyItem}>
                  <View style={styles.historyIcon}>
                    {getVitalIcon(vital.type)}
                  </View>
                  
                  <View style={styles.historyContent}>
                    <Text style={styles.historyName}>{getVitalName(vital.type)}</Text>
                    <Text style={styles.historyDate}>{formatDate(vital.date)} at {vital.time}</Text>
                  </View>
                  
                  <View style={styles.historyValue}>
                    <Text style={styles.historyValueText}>{vital.value} {vital.unit}</Text>
                    <View style={[styles.historyStatus, { backgroundColor: getStatusColor(vital.status) }]} />
                  </View>
                </View>
              ))}
            </View>
          </View>
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
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  vitalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    width: (width - 44) / 2,
    ...SHADOWS.medium,
  },
  vitalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  vitalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vitalName: {
    fontSize: SIZES.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  vitalValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  valueText: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  unitText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  vitalMeta: {
    marginBottom: 8,
  },
  dateText: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
  },
  timeText: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.white,
  },
  historySection: {
    marginTop: 16,
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    ...SHADOWS.small,
  },
  historyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyName: {
    fontSize: SIZES.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  historyDate: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
  },
  historyValue: {
    alignItems: 'flex-end',
  },
  historyValueText: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  historyStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});