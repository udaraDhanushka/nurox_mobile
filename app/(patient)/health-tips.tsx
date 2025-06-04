import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Activity, Coffee, Moon, Utensils, Dumbbell, ArrowRight } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';

// Mock health tips data
const healthTips = [
  {
    id: '1',
    title: 'Importance of Hydration',
    description: 'Drinking enough water is crucial for your health. Aim for 8 glasses daily.',
    icon: <Coffee size={24} color={COLORS.primary} />,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: '2',
    title: 'Sleep and Recovery',
    description: 'Quality sleep is essential for your body to recover and maintain good health.',
    icon: <Moon size={24} color={COLORS.primary} />,
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop'
  },
  {
    id: '3',
    title: 'Balanced Nutrition',
    description: 'A balanced diet provides the nutrients your body needs to function properly.',
    icon: <Utensils size={24} color={COLORS.primary} />,
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: '4',
    title: 'Regular Exercise',
    description: 'Regular physical activity improves your health and reduces the risk of disease.',
    icon: <Dumbbell size={24} color={COLORS.primary} />,
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop'
  }
];

// Mock doctor recommendations
const doctorRecommendations = [
  {
    id: '1',
    doctorName: 'Dr. Sarah Johnson',
    specialty: 'Cardiologist',
    recommendation: 'Consider adding more heart-healthy foods like fatty fish, nuts, and olive oil to your diet.',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: '2',
    doctorName: 'Dr. Michael Chen',
    specialty: 'Neurologist',
    recommendation: 'Regular mental exercises like puzzles and reading can help maintain cognitive function.',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop'
  }
];

export default function HealthTipsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Health Tips & Recommendations</Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Featured Tip */}
        <View style={styles.featuredContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=2070&auto=format&fit=crop' }} 
            style={styles.featuredImage}
          />
          <View style={styles.featuredContent}>
            <View style={styles.featuredIconContainer}>
              <Heart size={24} color={COLORS.white} />
            </View>
            <Text style={styles.featuredTitle}>Maintaining Heart Health</Text>
            <Text style={styles.featuredDescription}>
              Regular check-ups, a balanced diet, and exercise are key to maintaining a healthy heart.
            </Text>
            <TouchableOpacity style={styles.readMoreButton}>
              <Text style={styles.readMoreText}>Read More</Text>
              <ArrowRight size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Health Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Health Tips</Text>
          
          {healthTips.map(tip => (
            <TouchableOpacity key={tip.id} style={styles.tipCard}>
              <View style={styles.tipIconContainer}>
                {tip.icon}
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDescription}>{tip.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Doctor Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Doctor Recommendations</Text>
          
          {doctorRecommendations.map(rec => (
            <View key={rec.id} style={styles.recommendationCard}>
              <View style={styles.recommendationHeader}>
                <Image 
                  source={{ uri: rec.image }} 
                  style={styles.doctorImage}
                />
                <View>
                  <Text style={styles.doctorName}>{rec.doctorName}</Text>
                  <Text style={styles.doctorSpecialty}>{rec.specialty}</Text>
                </View>
              </View>
              <Text style={styles.recommendationText}>"{rec.recommendation}"</Text>
            </View>
          ))}
        </View>
        
        {/* Health Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Health Metrics</Text>
          
          <View style={styles.metricsContainer}>
            <View style={styles.metricCard}>
              <Activity size={24} color={COLORS.primary} />
              <Text style={styles.metricValue}>72 bpm</Text>
              <Text style={styles.metricLabel}>Heart Rate</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Heart size={24} color={COLORS.primary} />
              <Text style={styles.metricValue}>120/80</Text>
              <Text style={styles.metricLabel}>Blood Pressure</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Dumbbell size={24} color={COLORS.primary} />
              <Text style={styles.metricValue}>8,500</Text>
              <Text style={styles.metricLabel}>Steps Today</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.viewAllMetricsButton}>
            <Text style={styles.viewAllMetricsText}>View All Health Metrics</Text>
          </TouchableOpacity>
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
  featuredContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    ...SHADOWS.medium,
  },
  featuredImage: {
    width: '100%',
    height: 180,
  },
  featuredContent: {
    padding: 16,
  },
  featuredIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featuredTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  featuredDescription: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readMoreText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.small,
  },
  tipIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.transparentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  recommendationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.small,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  doctorImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  doctorName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  doctorSpecialty: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
  },
  recommendationText: {
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    ...SHADOWS.small,
  },
  metricValue: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
  },
  viewAllMetricsButton: {
    backgroundColor: COLORS.transparentPrimary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  viewAllMetricsText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
}); 