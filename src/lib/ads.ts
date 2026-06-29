/**
 * lib/ads.ts
 * Initialisation AdMob + consentement UMP (Android uniquement).
 * Les ads s'affichent ENTRE les sessions, JAMAIS pendant un set.
 */

import { Platform } from 'react-native';
import {
  MobileAds,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';

// ⚠️  Remplacer par vos vrais IDs AdMob
const AD_UNIT_IDS = {
  // Interstitiel affiché entre les sessions
  interstitial: __DEV__
    ? TestIds.INTERSTITIAL
    : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  // Banner optionnel (réglages / historique)
  banner: __DEV__
    ? TestIds.ADAPTIVE_BANNER
    : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
} as const;

export { AD_UNIT_IDS, BannerAdSize };

let initialized = false;

/**
 * Initialise AdMob. À appeler au démarrage de l'app UNIQUEMENT sur Android.
 * iOS utilise RevenueCat (pas d'ads).
 */
export async function initAds(): Promise<void> {
  if (Platform.OS !== 'android') return;
  if (initialized) return;

  try {
    await MobileAds().initialize();
    initialized = true;
    console.log('[Ads] AdMob initialisé');
  } catch (e) {
    console.warn('[Ads] Erreur initialisation AdMob:', e);
  }
}

/**
 * Règle critique : on n'affiche JAMAIS une pub pendant un set actif.
 * Utiliser ce flag pour bloquer l'affichage lors d'une session en cours.
 */
let isSessionActive = false;

export function setSessionActive(active: boolean): void {
  isSessionActive = active;
}

export function getIsSessionActive(): boolean {
  return isSessionActive;
}

export function canShowAd(): boolean {
  return Platform.OS === 'android' && !isSessionActive && initialized;
}
