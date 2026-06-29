/**
 * app/_layout.tsx
 * Root layout — initialise les services au démarrage.
 */

import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { initPurchases } from '@/lib/purchases';
import { initAds } from '@/lib/ads';
import { getBoolean, STORAGE_KEYS } from '@/lib/storage';
import '../global.css';

export default function RootLayout() {
  useEffect(() => {
    initPurchases().catch(console.warn);
    if (Platform.OS === 'android') {
      initAds().catch(console.warn);
    }

    // Rediriger vers l'onboarding si jamais fait
    const onboardingDone = getBoolean(STORAGE_KEYS.ONBOARDING_DONE);
    if (!onboardingDone) {
      router.replace('/onboarding');
    }
  }, []);

  return (
    <>
      <StatusBar style="light" backgroundColor="#14140F" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
        <Stack.Screen name="log/[sessionId]" />
      </Stack>
    </>
  );
}
