import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '@/constants/theme';

export default function NewClaimScreen() {
  // This is a placeholder screen that should never be shown
  // The actual new claim functionality is handled by the custom tab button
  // which redirects to the insurance claim page
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.text}>New Claim</Text>
        <Text style={styles.subtitle}>Use the + button to create a new claim</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: SIZES.lg,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});