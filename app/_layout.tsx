import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from 'react-native';
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useSocket } from "../hooks/useSocket";
import ErrorBoundary from "./error-boundary";
import { COLORS } from "./constants/theme";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(auth)/login",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    FontAwesome: require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome.ttf"),
  });
  
  // Get the authentication state
  const { token, user } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  
  // Initialize socket connection for authenticated users
  useSocket();

  // Handle authentication state changes
  useEffect(() => {
    if (!loaded) return;

    const inAuthGroup = segments[0] === "(auth)";
    
    console.log('Navigation Debug:', {
      token: !!token,
      user: user ? { id: user.id, role: user.role } : null,
      inAuthGroup,
      segments,
      loaded
    });
    
    // If user is authenticated and in auth group, redirect to appropriate dashboard
    if (token && user && inAuthGroup) {
      console.log('Redirecting authenticated user:', user.role);
      const userRole = user.role.toLowerCase();
      if (userRole === 'patient') {
        router.replace("/(patient)");
      } else if (userRole === 'doctor') {
        router.replace("/(doctor)");
      } else if (userRole === 'pharmacist') {
        router.replace("/(pharmacist)");
      }
    } 
    // If user is not authenticated and not in auth group, redirect to auth
    else if (!token && !inAuthGroup) {
      console.log('Redirecting unauthenticated user to auth');
      router.replace("/(auth)");
    }
    // If user is not authenticated but still in auth group, that's fine
    // If user is authenticated and not in auth group, that's also fine
  }, [token, user, segments, loaded, router]);

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
    <StatusBar barStyle="dark-content" backgroundColor="COLORS.white" />
      <RootLayoutNav />
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(patient)" />
      <Stack.Screen name="(doctor)" />
      <Stack.Screen name="(pharmacist)" />
      <Stack.Screen name="modal" options={{ presentation: "modal", headerShown: true }} />
    </Stack>
  );
}