/**
 * lib/storage.ts
 * Wrapper MMKV centralisé pour le stockage offline rapide.
 * Tout accès au storage de l'app passe par ce module.
 */

import { MMKV } from 'react-native-mmkv';

// Instance globale MMKV
export const storage = new MMKV({
  id: 'rpe-lift-storage',
});

// ─── Helpers typés ───────────────────────────────────────────────────────────

export function getString(key: string): string | undefined {
  return storage.getString(key);
}

export function setString(key: string, value: string): void {
  storage.set(key, value);
}

export function getBoolean(key: string, defaultValue = false): boolean {
  const val = storage.getBoolean(key);
  return val !== undefined ? val : defaultValue;
}

export function setBoolean(key: string, value: boolean): void {
  storage.set(key, value);
}

export function getNumber(key: string, defaultValue = 0): number {
  const val = storage.getNumber(key);
  return val !== undefined ? val : defaultValue;
}

export function setNumber(key: string, value: number): void {
  storage.set(key, value);
}

export function getObject<T>(key: string): T | undefined {
  const raw = storage.getString(key);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

export function setObject<T>(key: string, value: T): void {
  storage.set(key, JSON.stringify(value));
}

export function removeKey(key: string): void {
  storage.delete(key);
}

// ─── Clés de storage (centralisées ici) ─────────────────────────────────────

export const STORAGE_KEYS = {
  // Préférences utilisateur
  UNIT: 'pref_unit',               // 'kg' | 'lb'
  ONBOARDING_DONE: 'onboarding_done',
  // Sessions
  SESSIONS: 'sessions',
  // Programmes
  PROGRAMS: 'programs',
  ACTIVE_PROGRAM_ID: 'active_program_id',
} as const;
