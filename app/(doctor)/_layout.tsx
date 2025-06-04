import { Stack } from 'expo-router';
import { useRoleProtection } from '@/hooks/useRoleProtection';

export default function DoctorLayout() {
  // Only allow doctor role in this route group
  const { isAuthorized } = useRoleProtection(['doctor']);

  if (!isAuthorized) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen 
        name="(tabs)" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="profile" 
        options={{ 
          headerShown: false,
          // presentation: 'modal' 
        }} 
      />
    </Stack>
  );
}