/**
 * app/log/[sessionId].tsx
 * CŒUR DE L'APP — Set Logging.
 * Charge + reps + RPE réel en un tap, gros chiffres mono, barre de progression.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, roundWeight } from '@/lib/theme';
import { setSessionActive } from '@/lib/ads';
import { createSession, saveSession, completeSession } from '@/lib/sessions';
import type { LoggedSet, RPEValue, Session } from '@/types';

const RPE_VALUES: RPEValue[] = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];
const TARGET_SETS = 4;

export default function SetLoggingScreen() {
  useLocalSearchParams<{ sessionId: string }>();

  const sessionRef = useRef<Session>(createSession());
  const [sets, setSets] = useState<LoggedSet[]>([]);
  const [weight, setWeight] = useState(100);
  const [reps, setReps] = useState(5);
  const [rpe, setRpe] = useState<RPEValue>(8);
  const [exercise] = useState('Squat');

  useEffect(() => {
    setSessionActive(true);
    return () => { setSessionActive(false); };
  }, []);

  const handleLogSet = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const newSet: LoggedSet = {
      id: Date.now().toString(),
      exerciseId: exercise.toLowerCase(),
      setNumber: sets.length + 1,
      weight: roundWeight(weight),
      reps,
      rpe,
      rir: 10 - rpe,
      completedAt: new Date().toISOString(),
    };

    const updatedSets = [...sets, newSet];
    setSets(updatedSets);

    // Sauvegarde en cours de session (auto-save)
    sessionRef.current = { ...sessionRef.current, sets: updatedSets };
    saveSession(sessionRef.current);
  }, [sets, weight, reps, rpe, exercise]);

  const handleFinish = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Marquer la session comme complète et sauvegarder
    const done = completeSession({ ...sessionRef.current, sets });
    saveSession(done);
    setSessionActive(false);
    router.back();
  };

  const adjustWeight = (delta: number) => setWeight((w) => Math.max(0, roundWeight(w + delta)));
  const adjustReps = (delta: number) => setReps((r) => Math.max(1, Math.min(30, r + delta)));

  const progress = Math.min(sets.length / TARGET_SETS, 1);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleFinish} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.exerciseName}>{exercise}</Text>
        <Text style={styles.setCount}>{sets.length}/{TARGET_SETS} sets</Text>
      </View>

      {/* Barre de progression */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
      </View>

      {/* Zone principale — gros chiffres */}
      <View style={styles.mainZone}>
        {/* Charge */}
        <View style={styles.controlBlock}>
          <Text style={styles.controlLabel}>CHARGE</Text>
          <View style={styles.controlRow}>
            <TouchableOpacity style={styles.adjBtn} onPress={() => adjustWeight(-2.5)}>
              <Text style={styles.adjBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.bigNumber}>{weight}</Text>
            <TouchableOpacity style={styles.adjBtn} onPress={() => adjustWeight(2.5)}>
              <Text style={styles.adjBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.controlUnit}>kg</Text>
        </View>

        <View style={styles.divider} />

        {/* Reps */}
        <View style={styles.controlBlock}>
          <Text style={styles.controlLabel}>REPS</Text>
          <View style={styles.controlRow}>
            <TouchableOpacity style={styles.adjBtn} onPress={() => adjustReps(-1)}>
              <Text style={styles.adjBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.bigNumber}>{reps}</Text>
            <TouchableOpacity style={styles.adjBtn} onPress={() => adjustReps(1)}>
              <Text style={styles.adjBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.controlUnit}>répétitions</Text>
        </View>
      </View>

      {/* Sélecteur RPE */}
      <View style={styles.rpeSection}>
        <Text style={styles.rpeLabel}>RPE RÉEL</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rpeRow}
        >
          {RPE_VALUES.map((val) => (
            <TouchableOpacity
              key={val}
              style={[styles.rpeChip, rpe === val && styles.rpeChipActive]}
              onPress={() => setRpe(val)}
            >
              <Text style={[styles.rpeChipText, rpe === val && styles.rpeChipTextActive]}>
                {val}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={styles.rirText}>
          = RIR {10 - rpe}  ·  {rpeDescription(rpe)}
        </Text>
      </View>

      {/* Bouton LOG SET */}
      <TouchableOpacity
        style={styles.logBtn}
        onPress={handleLogSet}
        activeOpacity={0.85}
      >
        <Text style={styles.logBtnText}>✓  LOG SET {sets.length + 1}</Text>
      </TouchableOpacity>

      {/* Sets loggés */}
      {sets.length > 0 && (
        <ScrollView style={styles.setsList} contentContainerStyle={{ paddingBottom: 20 }}>
          {sets.map((s) => (
            <View key={s.id} style={styles.setRow}>
              <Text style={styles.setRowNum}>#{s.setNumber}</Text>
              <Text style={styles.setRowData}>
                {s.weight} kg × {s.reps} @ RPE {s.rpe}
              </Text>
              <Text style={styles.setRowRir}>RIR {s.rir}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function rpeDescription(rpe: RPEValue): string {
  if (rpe <= 6) return '4+ reps en réserve';
  if (rpe <= 7) return '3 reps en réserve';
  if (rpe === 7.5) return '2-3 reps en réserve';
  if (rpe === 8) return '2 reps en réserve';
  if (rpe === 8.5) return '1-2 reps en réserve';
  if (rpe === 9) return '1 rep en réserve';
  if (rpe === 9.5) return 'Presque au max';
  return 'MAX — 0 rep en réserve';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.base,
    paddingTop: 56,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  closeBtn: {
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
  exerciseName: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  setCount: {
    fontFamily: 'JetBrains Mono',
    fontSize: 14,
    color: Colors.textSecondary,
    width: 56,
    textAlign: 'right',
  },
  progressBg: {
    height: 3,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
    borderRadius: 2,
    marginBottom: 40,
  },
  progressFill: {
    height: 3,
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  mainZone: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 40,
    alignItems: 'center',
    gap: 24,
  },
  controlBlock: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  controlLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 1.5,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  adjBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjBtnText: {
    fontFamily: 'Inter',
    fontSize: 22,
    color: Colors.textPrimary,
    lineHeight: 26,
  },
  bigNumber: {
    fontFamily: 'JetBrains Mono',
    fontSize: 56,
    fontWeight: '700',
    color: Colors.textPrimary,
    minWidth: 80,
    textAlign: 'center',
  },
  controlUnit: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: Colors.textSecondary,
  },
  divider: {
    width: 1,
    height: 80,
    backgroundColor: Colors.border,
  },
  rpeSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  rpeLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  rpeRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  rpeChip: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rpeChipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  rpeChipText: {
    fontFamily: 'JetBrains Mono',
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  rpeChipTextActive: {
    color: Colors.accentText,
  },
  rirText: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 10,
  },
  logBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 18,
    marginHorizontal: 20,
    alignItems: 'center',
    minHeight: Spacing.touchTarget,
    marginBottom: 24,
  },
  logBtnText: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '700',
    color: Colors.accentText,
  },
  setsList: {
    paddingHorizontal: 20,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  setRowNum: {
    fontFamily: 'JetBrains Mono',
    fontSize: 13,
    color: Colors.textMuted,
    width: 28,
  },
  setRowData: {
    fontFamily: 'JetBrains Mono',
    fontSize: 15,
    color: Colors.textPrimary,
    flex: 1,
  },
  setRowRir: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: Colors.textSecondary,
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
});
