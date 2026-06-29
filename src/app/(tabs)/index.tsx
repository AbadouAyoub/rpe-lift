/**
 * app/(tabs)/index.tsx
 * Dashboard / Accueil — séance du jour, tendances RPE, stats.
 */

import { useState, useCallback } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Colors, Spacing } from '@/lib/theme';
import { getWeekStats, getRecentSessions, type WeekStats, type RecentSession } from '@/lib/sessions';

export default function DashboardScreen() {
  const [stats, setStats] = useState<WeekStats>({
    streakDays: 0,
    weekVolume: 0,
    avgRPE: 0,
    totalSets: 0,
  });
  const [recent, setRecent] = useState<RecentSession[]>([]);

  // Recharge les données à chaque fois qu'on revient sur l'onglet
  useFocusEffect(
    useCallback(() => {
      setStats(getWeekStats());
      setRecent(getRecentSessions(5));
    }, []),
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Bon entraînement</Text>
        <Text style={styles.subtitle}>
          {stats.streakDays > 0 ? `${stats.streakDays} jours de streak` : 'Démarre ta première séance'}
        </Text>
      </View>

      {/* CTA Démarrer séance */}
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => router.push('/log/new')}
        activeOpacity={0.85}
      >
        <Text style={styles.startButtonText}>▶  Démarrer la séance</Text>
      </TouchableOpacity>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatCard label="Streak" value={`${stats.streakDays}`} unit="jours" accent />
        <StatCard
          label="Volume"
          value={stats.weekVolume >= 1000 ? `${(stats.weekVolume / 1000).toFixed(1)}t` : `${stats.weekVolume}`}
          unit="cette sem."
        />
        <StatCard label="RPE moy." value={stats.totalSets > 0 ? `${stats.avgRPE}` : '—'} unit="sur 10" />
        <StatCard label="Sets" value={`${stats.totalSets}`} unit="cette sem." />
      </View>

      {/* Historique récent */}
      <Text style={styles.sectionTitle}>Récent</Text>
      {recent.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Aucune séance encore.{'\n'}Démarre et logue tes premiers sets !</Text>
        </View>
      ) : (
        recent.map((item) => (
          <View key={item.sessionId} style={styles.sessionCard}>
            <View style={styles.sessionLeft}>
              <Text style={styles.sessionDate}>{item.date}</Text>
              <Text style={styles.sessionExercise}>{item.exercise}</Text>
              <Text style={styles.sessionTopSet}>{item.topSet}</Text>
            </View>
            <View style={styles.sessionSets}>
              <Text style={styles.sessionSetsNum}>{item.sets}</Text>
              <Text style={styles.sessionSetsLabel}>sets</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function StatCard({
  label, value, unit, accent = false,
}: {
  label: string; value: string; unit: string; accent?: boolean;
}) {
  return (
    <View style={[styles.statCard, accent && styles.statCardAccent]}>
      <Text style={[styles.statValue, accent && styles.statValueAccent]}>{value}</Text>
      <Text style={[styles.statUnit, accent && styles.statUnitAccent]}>{unit}</Text>
      <Text style={[styles.statLabel, accent && styles.statLabelAccent]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.base,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 28,
  },
  greeting: {
    fontFamily: 'Inter',
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  startButton: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 28,
    minHeight: Spacing.touchTarget,
  },
  startButtonText: {
    fontFamily: 'Inter',
    fontSize: 17,
    fontWeight: '700',
    color: Colors.accentText,
    letterSpacing: 0.3,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Spacing.cardRadius,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    alignItems: 'center',
    gap: 2,
  },
  statCardAccent: {
    backgroundColor: Colors.accent + '18',
    borderColor: Colors.accent + '40',
  },
  statValue: {
    fontFamily: 'JetBrains Mono',
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statValueAccent: {
    color: Colors.accent,
  },
  statUnit: {
    fontFamily: 'Inter',
    fontSize: 9,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statUnitAccent: {
    color: Colors.accent + 'AA',
  },
  statLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  statLabelAccent: {
    color: Colors.accent,
  },
  sectionTitle: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  sessionCard: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.cardRadius,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sessionLeft: {
    flex: 1,
    gap: 3,
  },
  sessionDate: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sessionExercise: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  sessionTopSet: {
    fontFamily: 'JetBrains Mono',
    fontSize: 12,
    color: Colors.accent,
  },
  sessionSets: {
    alignItems: 'center',
  },
  sessionSetsNum: {
    fontFamily: 'JetBrains Mono',
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  sessionSetsLabel: {
    fontFamily: 'Inter',
    fontSize: 10,
    color: Colors.textMuted,
  },
});
