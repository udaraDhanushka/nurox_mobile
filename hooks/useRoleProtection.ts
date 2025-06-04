import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '@/types/auth';

export function useRoleProtection(allowedRoles: UserRole[]) {
  const router = useRouter();
  const segments = useSegments();
  const { user, token } = useAuthStore();

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";
    const currentRole = user?.role;

    if (!token && !inAuthGroup) {
      // Not authenticated, redirect to login
      router.replace('/(auth)');
      return;
    }

    if (token && inAuthGroup) {
      // Authenticated but in auth group, redirect to appropriate role-based route
      if (currentRole) {
        router.replace(`/(${currentRole})`);
      }
      return;
    }

    if (token && currentRole && !allowedRoles.includes(currentRole)) {
      // User's role doesn't match allowed roles for this route
      router.replace(`/(${currentRole})`);
      return;
    }
  }, [token, segments, user?.role]);

  return { isAuthorized: token && user?.role && allowedRoles.includes(user.role) };
} 