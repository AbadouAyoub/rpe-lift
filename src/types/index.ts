/**
 * types/index.ts
 * Types partagés pour RPE Lift.
 */

// ─── Unités ──────────────────────────────────────────────────────────────────

export type WeightUnit = 'kg' | 'lb';

// ─── RPE ─────────────────────────────────────────────────────────────────────

/** RPE de 6 à 10, par incrément de 0.5 */
export type RPEValue = 6 | 6.5 | 7 | 7.5 | 8 | 8.5 | 9 | 9.5 | 10;

// ─── Set loggé ───────────────────────────────────────────────────────────────

export interface LoggedSet {
  id: string;
  exerciseId: string;
  setNumber: number;
  weight: number;        // toujours en kg en storage, converti à l'affichage
  reps: number;
  rpe: RPEValue;
  rir: number;           // calculé : 10 - rpe
  note?: string;
  completedAt: string;   // ISO 8601
}

// ─── Session ─────────────────────────────────────────────────────────────────

export interface Session {
  id: string;
  programDayId?: string;
  startedAt: string;     // ISO 8601
  completedAt?: string;
  sets: LoggedSet[];
  fatigueRating?: number; // 1-5, ajustement fatigue (Pro)
  note?: string;
}

// ─── Exercice ────────────────────────────────────────────────────────────────

export interface Exercise {
  id: string;
  name: string;
  category: 'squat' | 'bench' | 'deadlift' | 'overhead' | 'row' | 'accessory';
  primaryMuscles: string[];
}

// ─── Programme ───────────────────────────────────────────────────────────────

export interface ProgramSet {
  targetReps: number;
  targetRPE: RPEValue;
}

export interface ProgramExercise {
  exerciseId: string;
  sets: ProgramSet[];
  note?: string;
}

export interface ProgramDay {
  id: string;
  name: string;
  exercises: ProgramExercise[];
}

export interface Program {
  id: string;
  name: string;
  days: ProgramDay[];
  createdAt: string;
  updatedAt: string;
}
