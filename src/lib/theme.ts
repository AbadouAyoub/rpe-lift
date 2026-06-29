/**
 * lib/theme.ts
 * Design tokens centralisés pour RPE Lift.
 * Esthétique : instrument de précision sombre, PAS fitness lifestyle.
 */

export const Colors = {
  base: '#14140F',
  surface: '#1F1F17',
  border: '#3A3A30',
  accent: '#5DCAA5',
  accentText: '#04342C',
  textPrimary: '#F1EFE8',
  textSecondary: '#888780',
  textMuted: '#5F5E5A',
} as const;

export const Typography = {
  fontSans: 'Inter',
  fontMono: 'JetBrains Mono',
} as const;

export const Spacing = {
  touchTarget: 56, // min height pour cibles tactiles (mains moites en salle)
  cardRadius: 12,
} as const;

/** Arrondi RPE à la demi-unité (ex: 8.5) */
export function roundRPE(value: number): number {
  return Math.round(value * 2) / 2;
}

/** Arrondi charge à 0.5 kg / 1 lb */
export function roundWeight(value: number, unit: 'kg' | 'lb' = 'kg'): number {
  const step = unit === 'kg' ? 0.5 : 1;
  return Math.round(value / step) * step;
}

/** Formate une charge pour affichage (toujours arrondie, jamais de float brut) */
export function formatWeight(value: number, unit: 'kg' | 'lb' = 'kg'): string {
  const rounded = roundWeight(value, unit);
  return `${rounded} ${unit}`;
}
