/**
 * lib/purchases.ts
 * Initialisation RevenueCat + hook usePro().
 * TOUTE la logique free/pro passe par ce fichier.
 * Ne jamais hardcoder la frontière free/pro dans un écran.
 */

import { useState, useEffect } from 'react';
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PurchasesPackage,
} from 'react-native-purchases';
import { Platform } from 'react-native';

// ⚠️  Remplacer par vos vraies clés RevenueCat (App Store Connect + Google Play)
const REVENUECAT_API_KEY = {
  ios: 'appl_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  android: 'goog_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
} as const;

const PRO_ENTITLEMENT_ID = 'pro';

// ─── Initialisation (à appeler au démarrage de l'app) ────────────────────────

export async function initPurchases(): Promise<void> {
  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }

  const apiKey =
    Platform.OS === 'ios'
      ? REVENUECAT_API_KEY.ios
      : REVENUECAT_API_KEY.android;

  await Purchases.configure({ apiKey });
}

// ─── Hook principal : usePro() ────────────────────────────────────────────────

/**
 * Retourne si l'utilisateur est Pro.
 * Utiliser ce hook PARTOUT où on doit gate une feature.
 *
 * @example
 * const { isPro, isLoading } = usePro();
 * if (!isPro) return <Paywall />;
 */
export function usePro(): { isPro: boolean; isLoading: boolean; customerInfo: CustomerInfo | null } {
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkStatus() {
      try {
        const info = await Purchases.getCustomerInfo();
        if (!mounted) return;
        setCustomerInfo(info);
        setIsPro(info.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined);
      } catch (e) {
        console.warn('[usePro] Erreur RevenueCat:', e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    checkStatus();

    // Listener pour mises à jour en temps réel (achat, restauration)
    const unsubscribe = Purchases.addCustomerInfoUpdateListener((info) => {
      if (!mounted) return;
      setCustomerInfo(info);
      setIsPro(info.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return { isPro, isLoading, customerInfo };
}

// ─── Helpers achat / restauration ────────────────────────────────────────────

export async function restorePurchases(): Promise<CustomerInfo> {
  return Purchases.restorePurchases();
}

export async function getOfferings() {
  return Purchases.getOfferings();
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}
