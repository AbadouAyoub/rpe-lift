/**
 * app/(tabs)/programs.tsx
 * Program Builder — jours d'entraînement, exercices avec cibles (sets×reps @ RPE).
 */

import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing } from '@/lib/theme';
import { usePro } from '@/lib/purchases';

const MOCK_PROGRAMS = [
  {
    id: '1',
    name: 'Sheiko Base',
    days: 3,
    weeks: 8,
    active: true,
    nextDay: 'Jour A — Squat / Bench',
  },
];

export default function ProgramsScreen() {
  const [programs] = useState(MOCK_PROGRAMS);
  const { isPro } = usePro();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Programmes</Text>

      {/* Programme actif */}
      {programs.filter((p) => p.active).map((p) => (
        <View key={p.id} style={styles.activeProgramCard}>
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>ACTIF</Text>
          </View>
          <Text style={styles.programName}>{p.name}</Text>
          <Text style={styles.programMeta}>{p.days}j/sem · {p.weeks} semaines</Text>
          <View style={styles.nextDayRow}>
            <Text style={styles.nextDayLabel}>Prochaine séance</Text>
            <Text style={styles.nextDayValue}>{p.nextDay}</Text>
          </View>
        </View>
      ))}

      {/* Créer un programme */}
      <TouchableOpacity style={styles.newProgramBtn}>
        <Text style={styles.newProgramBtnText}>+ Nouveau programme</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Tous les programmes</Text>
      {programs.map((p) => (
        <View key={p.id} style={styles.programCard}>
          <Text style={styles.programCardName}>{p.name}</Text>
          <Text style={styles.programCardMeta}>{p.days}j · {p.weeks} sem.</Text>
        </View>
      ))}

      {!isPro && (
        <TouchableOpacity style={styles.proHint} onPress={() => router.push('/paywall')}>
          <Text style={styles.proHintText}>🔒 Pro — Programmes illimités</Text>
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
    marginBottom: 24,
  },
  activeProgramCard: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.cardRadius,
    borderWidth: 1,
    borderColor: Colors.accent + '50',
    padding: 20,
    marginBottom: 20,
    gap: 6,
  },
  activeBadge: {
    backgroundColor: Colors.accent,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  activeBadgeText: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '700',
    color: Colors.accentText,
    letterSpacing: 1,
  },
  programName: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  programMeta: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: Colors.textSecondary,
  },
  nextDayRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 2,
  },
  nextDayLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  nextDayValue: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '600',
    color: Colors.accent,
  },
  newProgramBtn: {
    borderRadius: Spacing.cardRadius,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 32,
    minHeight: Spacing.touchTarget,
  },
  newProgramBtnText: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  programCard: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.cardRadius,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  programCardName: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  programCardMeta: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: Colors.textSecondary,
  },
  proHint: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.cardRadius,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  proHintText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
