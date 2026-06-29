/**
 * app/paywall.tsx
 * Paywall — annual-first, 7j d'essai, bouton "Restaurer un achat" OBLIGATOIRE.
 * Conforme guidelines Apple (guideline 3.1.1).
 */

import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import type { PurchasesPackage, PurchasesOffering } from 'react-native-purchases';
import { Colors, Spacing } from '@/lib/theme';
import { getOfferings, purchasePackage, restorePurchases } from '@/lib/purchases';

const PRO_FEATURES = [
  { icon: '📊', text: 'Ajustement par fatigue automatique' },
  { icon: '♾️', text: 'Historique illimité + export CSV' },
  { icon: '📋', text: 'Programmes multiples simultanés' },
  { icon: '📈', text: 'Tendances RPE & volume avancées' },
  { icon: '🚫', text: 'Sans publicité (iOS)' },
];

// Identifiants des packages dans RevenueCat (à aligner avec votre dashboard RC)
const RC_ANNUAL_ID = '$rc_annual';
const RC_MONTHLY_ID = '$rc_monthly';

export default function PaywallScreen() {
  const [selected, setSelected] = useState<'annual' | 'monthly'>('annual');
  const [restoring, setRestoring] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [loadingOffering, setLoadingOffering] = useState(true);

  useEffect(() => {
    getOfferings()
      .then((offerings) => {
        setOffering(offerings.current ?? null);
      })
      .catch((e) => console.warn('[Paywall] getOfferings error:', e))
      .finally(() => setLoadingOffering(false));
  }, []);

  const getPackage = (): PurchasesPackage | undefined => {
    if (!offering) return undefined;
    const rcId = selected === 'annual' ? RC_ANNUAL_ID : RC_MONTHLY_ID;
    return offering.availablePackages.find((p) => p.packageType === rcId)
      ?? offering.availablePackages.find((p) =>
        selected === 'annual'
          ? p.packageType === 'ANNUAL'
          : p.packageType === 'MONTHLY',
      );
  };

  const handlePurchase = async () => {
    const pkg = getPackage();
    if (!pkg) {
      Alert.alert('Erreur', 'Impossible de charger les offres. Réessaie.');
      return;
    }
    setPurchasing(true);
    try {
      await purchasePackage(pkg);
      router.back();
    } catch (e: any) {
      if (!e?.userCancelled) {
        Alert.alert('Erreur', 'L\'achat a échoué. Réessaie ou contacte le support.');
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      await restorePurchases();
      router.back();
    } catch (e) {
      Alert.alert('Erreur', 'Restauration impossible. Réessaie.');
    } finally {
      setRestoring(false);
    }
  };

  // Prix depuis RevenueCat ou fallback statique
  const annualPkg = offering?.availablePackages.find((p) =>
    p.packageType === RC_ANNUAL_ID || p.packageType === 'ANNUAL',
  );
  const monthlyPkg = offering?.availablePackages.find((p) =>
    p.packageType === RC_MONTHLY_ID || p.packageType === 'MONTHLY',
  );

  const annualPrice = annualPkg?.product.priceString ?? '$39.99';
  const monthlyPrice = monthlyPkg?.product.priceString ?? '$5.99';

  const PLANS = [
    {
      id: 'annual' as const,
      label: 'Annual',
      badge: 'BEST VALUE',
      price: annualPrice,
      period: '/year',
      perMonth: annualPkg
        ? `$${(annualPkg.product.price / 12).toFixed(2)}/month`
        : '$3.33/month',
      highlight: true,
      trial: null,
    },
    {
      id: 'monthly' as const,
      label: 'Monthly',
      badge: null,
      price: monthlyPrice,
      period: '/month',
      perMonth: null,
      highlight: false,
      trial: null,
    },
  ];

  const selectedPlan = PLANS.find((p) => p.id === selected)!;;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Close */}
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
        <Text style={styles.closeBtnText}>✕</Text>
      </TouchableOpacity>

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.badge}>RPE LIFT PRO</Text>
        <Text style={styles.heroTitle}>Entraîne-toi{'\n'}comme un pro.</Text>
        <Text style={styles.heroSubtitle}>
          L'autorégulation avancée pour lifters sérieux.
        </Text>
      </View>

      {/* Features */}
      <View style={styles.features}>
        {PRO_FEATURES.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <Text style={styles.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>

      {/* Plans */}
      <View style={styles.plans}>
        {PLANS.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[styles.planCard, plan.highlight && styles.planCardHighlight, selected === plan.id && styles.planCardSelected]}
            onPress={() => setSelected(plan.id)}
            activeOpacity={0.85}
          >
            {plan.badge && (
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>{plan.badge}</Text>
              </View>
            )}
            <View style={styles.planLeft}>
              <Text style={styles.planLabel}>{plan.label}</Text>
              {plan.trial && <Text style={styles.planTrial}>{plan.trial}</Text>}
              {plan.perMonth && <Text style={styles.planPerMonth}>{plan.perMonth}</Text>}
            </View>
            <View style={styles.planRight}>
              <Text style={styles.planPrice}>{plan.price}</Text>
              <Text style={styles.planPeriod}>{plan.period}</Text>
            </View>
            {selected === plan.id && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* CTA */}
      <TouchableOpacity
        style={[styles.cta, (purchasing || loadingOffering) && styles.ctaDisabled]}
        onPress={handlePurchase}
        disabled={purchasing || loadingOffering}
        activeOpacity={0.85}
      >
        {purchasing || loadingOffering ? (
          <ActivityIndicator color={Colors.accentText} />
        ) : (
          <Text style={styles.ctaText}>
            Subscribe — {selectedPlan.price}{selectedPlan.period}
          </Text>
        )}
      </TouchableOpacity>

      {/* Infos légales — OBLIGATOIRES Apple */}
      <Text style={styles.legalText}>
        {selectedPlan.price}{selectedPlan.period}, automatically renewed.
        {' '}Cancel anytime in App Store Settings at least 24h before renewal.
      </Text>

      {/* Restaurer — OBLIGATOIRE Apple (guideline 3.1.1) */}
      <TouchableOpacity onPress={handleRestore} disabled={restoring || purchasing} style={styles.restoreBtn}>
        <Text style={styles.restoreBtnText}>
          {restoring ? 'Restauration…' : 'Restaurer un achat'}
        </Text>
      </TouchableOpacity>

      <View style={styles.legalLinks}>
        <TouchableOpacity>
          <Text style={styles.legalLink}>Confidentialité</Text>
        </TouchableOpacity>
        <Text style={styles.legalSep}>·</Text>
        <TouchableOpacity>
          <Text style={styles.legalLink}>Conditions</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.base },
  content: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 48 },
  closeBtn: {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  closeBtnText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: 'Inter',
  },
  hero: {
    paddingTop: 24,
    paddingBottom: 32,
    gap: 8,
  },
  badge: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 2,
  },
  heroTitle: {
    fontFamily: 'Inter',
    fontSize: 36,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 42,
  },
  heroSubtitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  features: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.cardRadius,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 14,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    fontSize: 20,
    width: 28,
  },
  featureText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: Colors.textPrimary,
    flex: 1,
  },
  plans: {
    gap: 12,
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.cardRadius,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: Spacing.touchTarget,
    overflow: 'hidden',
  },
  planCardHighlight: {
    borderColor: Colors.accent + '60',
  },
  planCardSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '12',
  },
  planBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderBottomLeftRadius: 8,
  },
  planBadgeText: {
    fontFamily: 'Inter',
    fontSize: 9,
    fontWeight: '700',
    color: Colors.accentText,
    letterSpacing: 0.5,
  },
  planLeft: {
    flex: 1,
    gap: 3,
  },
  planLabel: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  planTrial: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '500',
  },
  planPerMonth: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  planRight: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  planPrice: {
    fontFamily: 'JetBrains Mono',
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  planPeriod: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
    color: Colors.accentText,
  },
  cta: {
    backgroundColor: Colors.accent,
    borderRadius: Spacing.cardRadius,
    paddingVertical: 18,
    alignItems: 'center',
    minHeight: Spacing.touchTarget,
    marginBottom: 16,
  },
  ctaDisabled: {
    opacity: 0.6,
  },
  ctaText: {
    fontFamily: 'Inter',
    fontSize: 17,
    fontWeight: '700',
    color: Colors.accentText,
  },
  legalText: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 16,
  },
  restoreBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    minHeight: Spacing.touchTarget,
    justifyContent: 'center',
  },
  restoreBtnText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  legalLink: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: Colors.textMuted,
    textDecorationLine: 'underline',
  },
  legalSep: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: Colors.textMuted,
  },
});
