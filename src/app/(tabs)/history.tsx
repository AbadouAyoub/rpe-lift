/**
 * app/(tabs)/history.tsx
 * Historique des sessions.
 */

import { useState, useCallback } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Colors, Spacing } from '@/lib/theme';
import { getHistorySessions } from '@/lib/sessions';
import { usePro } from '@/lib/purchases';
import type { Session } from '@/types';

export default function HistoryScreen() {
  const { isPro } = usePro();
  const [sessions, setSessions] = useState<Session[]>([]);

  useFocusEffect(
    useCallback(() => {
      setSessions(getHistorySessions(isPro));
    }, [isPro]),
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Historique</Text>
      <Text style={styles.subtitle}>{isPro ? 'Tout l\'historique' : '4 dernières semaines'}</Text>

      {sessions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Aucune séance encore.{'\n'}Démarre une séance depuis l'accueil !</Text>
        </View>
      ) : (
        sessions.map((session) => {
          const d = new Date(session.completedAt ?? session.startedAt);
          const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
          const weekday = days[d.getDay()];
          const date = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

          const bestSet = session.sets.reduce(
            (best, s) => (!best || s.weight * s.reps > best.weight * best.reps ? s : best),
            session.sets[0],
          );
          const exerciseName = bestSet
            ? bestSet.exerciseId.charAt(0).toUpperCase() + bestSet.exerciseId.slice(1)
            : 'Séance';
          const topSetStr = bestSet
            ? `${bestSet.weight} × ${bestSet.reps} @ ${bestSet.rpe}`
            : '—';
          const volume = session.sets.reduce((sum, s) => sum + s.weight * s.reps, 0);

          return (
            <View key={session.id} style={styles.sessionCard}>
              <View style={styles.dateCol}>
                <Text style={styles.weekday}>{weekday}</Text>
                <Text style={styles.date}>{date}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.sessionInfo}>
                <Text style={styles.exerciseName}>{exerciseName}</Text>
                <Text style={styles.topSet}>{topSetStr}</Text>
              </View>
              <View style={styles.sessionRight}>
                <Text style={styles.setsNum}>{session.sets.length}</Text>
                <Text style={styles.setsLabel}>sets</Text>
                <Text style={styles.volume}>{volume} kg</Text>
              </View>
            </View>
          );
        })
      )}

      {!isPro && (
        <TouchableOpacity style={styles.proGate} onPress={() => router.push('/paywall')}>
          <Text style={styles.proGateTitle}>🔒 Historique illimité</Text>
          <Text style={styles.proGateText}>
            Passez à Pro pour accéder à tout votre historique, export CSV et tendances avancées.
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.base },
  content: { paddingHorizontal: 20, paddingTop: 64, paddingBottom: 32 },
  title: {
    fontFamily: 'Inter',
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 24,
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
    gap: 12,
  },
  dateCol: {
    alignItems: 'center',
    minWidth: 36,
  },
  weekday: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  date: {
    fontFamily: 'JetBrains Mono',
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  sessionInfo: {
    flex: 1,
    gap: 4,
  },
  exerciseName: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  topSet: {
    fontFamily: 'JetBrains Mono',
    fontSize: 12,
    color: Colors.accent,
  },
  sessionRight: {
    alignItems: 'center',
  },
  setsNum: {
    fontFamily: 'JetBrains Mono',
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  setsLabel: {
    fontFamily: 'Inter',
    fontSize: 9,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  volume: {
    fontFamily: 'JetBrains Mono',
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  proGate: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.cardRadius,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    marginTop: 12,
    gap: 8,
    alignItems: 'center',
  },
  proGateTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  proGateText: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
