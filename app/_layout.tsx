import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Linking from "expo-linking";
import { StatusBar } from 'react-native';
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useSocket } from "../hooks/useSocket";
import ErrorBoundary from "./error-boundary";
import { COLORS } from "./constants/theme";
import { parseUrlParams, isPaymentDeepLink } from "../utils/urlUtils";

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
  const { token, user, checkTokenExpiration } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // Initialize socket connection for authenticated users
  useSocket();

  // Handle authentication state changes
  useEffect(() => {
    if (!loaded) return;

    const inAuthGroup = segments[0] === "(auth)";

    // Temporarily disable token expiration check to debug Buffer issue
    // TODO: Re-enable this after fixing the Buffer issue
    // const tokensExpired = checkTokenExpiration();
    const tokensExpired = false;

    // Add a small delay to avoid race conditions during logout
    const timeoutId = setTimeout(() => {
      // If tokens are expired, redirect to auth
      if (tokensExpired) {
        console.log('App: Tokens expired, redirecting to auth');
        router.replace("/(auth)");
        return;
      }

      // If user is authenticated and in auth group, redirect to appropriate dashboard
      if (token && user && inAuthGroup) {
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
        router.replace("/(auth)");
      }
      // If user is not authenticated but still in auth group, that's fine
      // If user is authenticated and not in auth group, that's also fine
    }, 50); // Small delay to allow state to settle

    return () => clearTimeout(timeoutId);
  }, [token, user, segments, loaded, router, checkTokenExpiration]);

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

  // Handle deep links
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      console.log('Deep link received:', url);

      if (isPaymentDeepLink(url)) {
        const params = parseUrlParams(url);

        if (url.includes('/payments/success')) {
          router.push({
            pathname: '/(patient)/payment-success',
            params: params as any
          });
        } else if (url.includes('/payments/failure')) {
          router.push({
            pathname: '/(patient)/payment-failure',
            params: params as any
          });
        }
      }
    };

    // Handle app launch via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Handle deep links while app is running
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => subscription?.remove();
  }, [router]);

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
