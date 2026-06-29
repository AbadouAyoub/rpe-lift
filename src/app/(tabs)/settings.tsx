/**
 * app/(tabs)/settings.tsx
 * Réglages — compte, restauration achat, unités, gestion abonnement.
 */

import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing } from '@/lib/theme';
import { restorePurchases, usePro } from '@/lib/purchases';
import { getString, setString, STORAGE_KEYS } from '@/lib/storage';
import type { WeightUnit } from '@/types';

export default function SettingsScreen() {
  const { isPro, isLoading } = usePro();
  const [unit, setUnitState] = useState<WeightUnit>(
    (getString(STORAGE_KEYS.UNIT) as WeightUnit) ?? 'kg',
  );
  const [restoring, setRestoring] = useState(false);

  const setUnit = (u: WeightUnit) => {
    setUnitState(u);
    setString(STORAGE_KEYS.UNIT, u);
  };

  const handleRestorePurchase = async () => {
    setRestoring(true);
    try {
      await restorePurchases();
    } catch (e) {
      console.warn('[Settings] Erreur restauration:', e);
    } finally {
      setRestoring(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Réglages</Text>

      {/* Abonnement */}
      <Text style={styles.sectionLabel}>Abonnement</Text>
      <View style={styles.card}>
        <SettingRow
          label="Plan actuel"
          value={isLoading ? '…' : isPro ? 'Pro ✓' : 'Gratuit'}
        />
        {!isPro && !isLoading && (
          <TouchableOpacity
            style={styles.upgradeBtn}
            onPress={() => router.push('/paywall')}
          >
            <Text style={styles.upgradeBtnText}>Passer à Pro →</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Préférences */}
      <Text style={styles.sectionLabel}>Préférences</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Unité de charge</Text>
          <View style={styles.unitToggle}>
            {(['kg', 'lb'] as WeightUnit[]).map((u) => (
              <TouchableOpacity
                key={u}
                style={[styles.unitBtn, unit === u && styles.unitBtnActive]}
                onPress={() => setUnit(u)}
              >
                <Text style={[styles.unitBtnText, unit === u && styles.unitBtnTextActive]}>
                  {u}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Achats */}
      <Text style={styles.sectionLabel}>Achats</Text>
      <View style={styles.card}>
        {/* OBLIGATOIRE Apple Review — bouton Restaurer un achat */}
        <TouchableOpacity
          style={[styles.row, styles.rowPressable]}
          onPress={handleRestorePurchase}
          disabled={restoring}
        >
          <Text style={styles.rowLabel}>
            {restoring ? 'Restauration…' : 'Restaurer un achat'}
          </Text>
          <Text style={styles.rowChevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Légal */}
      <Text style={styles.sectionLabel}>Légal</Text>
      <View style={styles.card}>
        <TouchableOpacity style={[styles.row, styles.rowPressable]}>
          <Text style={styles.rowLabel}>Politique de confidentialité</Text>
          <Text style={styles.rowChevron}>›</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity style={[styles.row, styles.rowPressable]}>
          <Text style={styles.rowLabel}>Conditions d'utilisation</Text>
          <Text style={styles.rowChevron}>›</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>RPE Lift · v1.0.0</Text>
    </ScrollView>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.base },
  content: { paddingHorizontal: 20, paddingTop: 64, paddingBottom: 40 },
  title: {
    fontFamily: 'Inter',
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 28,
  },
  sectionLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 16,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.cardRadius,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: Spacing.touchTarget,
  },
  rowPressable: {},
  rowLabel: {
    fontFamily: 'Inter',
    fontSize: 15,
    color: Colors.textPrimary,
  },
  rowValue: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  rowChevron: {
    fontFamily: 'Inter',
    fontSize: 18,
    color: Colors.textMuted,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  upgradeBtn: {
    backgroundColor: Colors.accent,
    margin: 12,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  upgradeBtnText: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '700',
    color: Colors.accentText,
  },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.base,
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  unitBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  unitBtnActive: {
    backgroundColor: Colors.accent,
  },
  unitBtnText: {
    fontFamily: 'JetBrains Mono',
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  unitBtnTextActive: {
    color: Colors.accentText,
  },
  version: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 32,
  },
});
