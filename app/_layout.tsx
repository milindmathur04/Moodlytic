import 'react-native-url-polyfill/auto';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useUserStore } from '@/lib/store/userStore';
import { checkExistingSession } from '@/lib/services/auth/session';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SplashScreen } from 'expo-router';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { Platform, LogBox } from 'react-native';

// Ignore specific warnings that might be causing issues
LogBox.ignoreLogs([
  'Overwriting fontFamily style attribute preprocessor',
  'Constants.manifest has been deprecated',
  'ViewPropTypes will be removed from React Native',
  'The provided value \'ms\' is not a valid \'numeric-multiplier\'',
]);

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { setUser } = useUserStore();
  
  // Required hook for framework initialization - DO NOT REMOVE
  useFrameworkReady();

  useEffect(() => {
    const initSession = async () => {
      try {
        const profile = await checkExistingSession();
        if (profile) {
          setUser(profile);
        }
      } catch (error) {
        console.error('Session initialization error:', error);
      } finally {
        // Hide the splash screen once initialization is complete
        SplashScreen.hideAsync().catch(console.error);
      }
    };

    initSession();
  }, [setUser]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="profile-setup" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}