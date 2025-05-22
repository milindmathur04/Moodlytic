import { Stack } from 'expo-router';
import { useUserStore } from '@/lib/store/userStore';
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function AuthLayout() {
  const { user } = useUserStore();

  useEffect(() => {
    if (user) {
      // Check if user has complete profile
      const isProfileComplete = Boolean(
        user.age &&
        user.gender &&
        user.nationality &&
        user.language
      );

      if (isProfileComplete) {
        router.replace('/(tabs)');
      } else {
        router.replace('/profile-setup');
      }
    }
  }, [user]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}