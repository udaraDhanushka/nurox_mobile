import { Stack } from 'expo-router';
import { useRoleProtection } from '@/hooks/useRoleProtection';

export default function PharmacistLayout() {
  // Only allow pharmacist role in this route group
  const { isAuthorized } = useRoleProtection(['pharmacist']);

  if (!isAuthorized) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
