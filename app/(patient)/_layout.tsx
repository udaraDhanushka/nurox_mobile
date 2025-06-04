import { Stack } from 'expo-router';
import { useRoleProtection } from '@/hooks/useRoleProtection';

export default function PatientLayout() {
  // Only allow patient role in this route group
  const { isAuthorized } = useRoleProtection(['patient']);

  if (!isAuthorized) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}