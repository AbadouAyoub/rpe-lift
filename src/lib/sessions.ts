/**
 * lib/sessions.ts
 * CRUD sessions + calcul stats — toute la logique data passe ici.
 */

import { getObject, setObject, STORAGE_KEYS } from './storage';
import type { Session, LoggedSet } from '@/types';

// ─── CRUD Sessions ────────────────────────────────────────────────────────────

export function getSessions(): Session[] {
  return getObject<Session[]>(STORAGE_KEYS.SESSIONS) ?? [];
}

export function saveSession(session: Session): void {
  const sessions = getSessions();
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = session;
  } else {
    sessions.unshift(session);
  }
  setObject(STORAGE_KEYS.SESSIONS, sessions);
}

export function deleteSession(id: string): void {
  const sessions = getSessions().filter((s) => s.id !== id);
  setObject(STORAGE_KEYS.SESSIONS, sessions);
}

export function getSession(id: string): Session | undefined {
  return getSessions().find((s) => s.id === id);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function createSession(): Session {
  return {
    id: Date.now().toString(),
    startedAt: new Date().toISOString(),
    sets: [],
  };
}

export function completeSession(session: Session): Session {
  return { ...session, completedAt: new Date().toISOString() };
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface WeekStats {
  streakDays: number;
  weekVolume: number;   // en kg
  avgRPE: number;
  totalSets: number;
}

export function getWeekStats(): WeekStats {
  const sessions = getSessions();
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const weekSessions = sessions.filter(
    (s) => s.completedAt && new Date(s.completedAt) >= oneWeekAgo,
  );

  let totalVolume = 0;
  let totalRPE = 0;
  let totalSets = 0;

  for (const session of weekSessions) {
    for (const set of session.sets) {
      totalVolume += set.weight * set.reps;
      totalRPE += set.rpe;
      totalSets++;
    }
  }

  const avgRPE = totalSets > 0 ? Math.round((totalRPE / totalSets) * 10) / 10 : 0;

  return {
    streakDays: calcStreak(sessions),
    weekVolume: Math.round(totalVolume),
    avgRPE,
    totalSets,
  };
}

export interface RecentSession {
  date: string;
  exercise: string;
  sets: number;
  topSet: string;
  sessionId: string;
}

export function getRecentSessions(limit = 5): RecentSession[] {
  const sessions = getSessions()
    .filter((s) => s.completedAt)
    .slice(0, limit);

  return sessions.map((s) => {
    const topSet = getBestSet(s.sets);
    const exerciseName = topSet?.exerciseId
      ? capitalizeFirst(topSet.exerciseId)
      : 'Séance';

    return {
      sessionId: s.id,
      date: formatRelativeDate(s.completedAt!),
      exercise: exerciseName,
      sets: s.sets.length,
      topSet: topSet
        ? `${topSet.weight} kg × ${topSet.reps} @ RPE ${topSet.rpe}`
        : '—',
    };
  });
}

/** Sessions des 4 dernières semaines (free) ou toutes (pro). */
export function getHistorySessions(isPro: boolean): Session[] {
  const sessions = getSessions().filter((s) => s.completedAt);
  if (isPro) return sessions;

  const cutoff = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
  return sessions.filter((s) => new Date(s.completedAt!) >= cutoff);
}

// ─── Privé ────────────────────────────────────────────────────────────────────

function getBestSet(sets: LoggedSet[]): LoggedSet | undefined {
  if (sets.length === 0) return undefined;
  return sets.reduce((best, s) =>
    s.weight * s.reps > best.weight * best.reps ? s : best,
  );
}

function calcStreak(sessions: Session[]): number {
  const completed = sessions
    .filter((s) => s.completedAt)
    .map((s) => dayKey(new Date(s.completedAt!)));

  const uniqueDays = [...new Set(completed)].sort().reverse();
  if (uniqueDays.length === 0) return 0;

  let streak = 0;
  let cursor = dayKey(new Date());

  for (const day of uniqueDays) {
    if (day === cursor) {
      streak++;
      cursor = prevDay(cursor);
    } else if (day === prevDay(cursor)) {
      streak++;
      cursor = day;
      cursor = prevDay(cursor);
    } else {
      break;
    }
  }

  return streak;
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function prevDay(key: string): string {
  const d = new Date(key);
  d.setDate(d.getDate() - 1);
  return dayKey(d);
}

function formatRelativeDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';

  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  if (diffDays < 7) return days[d.getDay()];

  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
