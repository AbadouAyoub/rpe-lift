/**
 * app/onboarding/index.tsx
 * Onboarding 3 écrans — explique RPE, ajustement fatigue, niveau de départ.
 */

import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, FlatList } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing } from '@/lib/theme';
import { setBoolean, STORAGE_KEYS } from '@/lib/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    emoji: '⚖️',
    title: 'RPE — Rate of Perceived Exertion',
    subtitle: 'Arrête de compter uniquement les kilos. Compte l\'effort.',
    body: `L'échelle RPE va de 6 à 10.\n\nRPE 8 = 2 répétitions en réserve.\nRPE 9 = 1 répétition en réserve.\nRPE 10 = maximum absolu.\n\nC'est la méthode utilisée par les meilleurs powerlifters mondiaux.`,
    accent: '8.5',
    accentLabel: 'RPE',
  },
  {
    id: '2',
    emoji: '🔋',
    title: 'Ajustement par la fatigue',
    subtitle: 'Ton corps ne performe pas pareil tous les jours.',
    body: `Avant chaque séance, tu notes ta fatigue sur 5.\n\nL'app ajuste automatiquement les charges cibles en fonction de ton niveau d'énergie du jour.\n\nPlus de séances ratées parce que tu forçais sur une mauvaise journée.`,
    accent: 'PRO',
    accentLabel: 'Feature',
  },
  {
    id: '3',
    emoji: '🎯',
    title: 'Quel est ton niveau ?',
    subtitle: 'Pour calibrer tes premières charges suggérées.',
    body: null,
    levels: [
      { id: 'beginner', label: 'Débutant', desc: '< 1 an de pratique' },
      { id: 'intermediate', label: 'Intermédiaire', desc: '1-3 ans, bases solides' },
      { id: 'advanced', label: 'Avancé', desc: '3+ ans, compétition' },
    ],
    accent: null,
    accentLabel: null,
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const isLast = currentIndex === SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      setBoolean(STORAGE_KEYS.ONBOARDING_DONE, true);
      router.replace('/(tabs)');
      return;
    }
    const next = currentIndex + 1;
    flatListRef.current?.scrollToIndex({ index: next });
    setCurrentIndex(next);
  };

  const canProceed = !isLast || selectedLevel !== null;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>

            {item.accent && (
              <View style={styles.accentBadge}>
                <Text style={styles.accentValue}>{item.accent}</Text>
                <Text style={styles.accentLabel}>{item.accentLabel}</Text>
              </View>
            )}

            {item.body && (
              <Text style={styles.body}>{item.body}</Text>
            )}

            {item.levels && (
              <View style={styles.levelsContainer}>
                {item.levels.map((level) => (
                  <TouchableOpacity
                    key={level.id}
                    style={[
                      styles.levelCard,
                      selectedLevel === level.id && styles.levelCardActive,
                    ]}
                    onPress={() => setSelectedLevel(level.id)}
                  >
                    <Text style={[styles.levelLabel, selectedLevel === level.id && styles.levelLabelActive]}>
                      {level.label}
                    </Text>
                    <Text style={[styles.levelDesc, selectedLevel === level.id && styles.levelDescActive]}>
                      {level.desc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      />

      {/* Indicateurs de progression */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
        ))}
      </View>

      {/* Bouton suivant */}
      <TouchableOpacity
        style={[styles.nextBtn, !canProceed && styles.nextBtnDisabled]}
        onPress={handleNext}
        disabled={!canProceed}
      >
        <Text style={styles.nextBtnText}>
          {isLast ? 'Commencer' : 'Suivant →'}
        </Text>
      </TouchableOpacity>

      {!isLast && (
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => {
            setBoolean(STORAGE_KEYS.ONBOARDING_DONE, true);
            router.replace('/(tabs)');
          }}
        >
          <Text style={styles.skipBtnText}>Passer</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.base,
    paddingTop: 80,
    paddingBottom: 48,
  },
  slide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 28,
    gap: 16,
  },
  emoji: {
    fontSize: 52,
    marginBottom: 8,
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 32,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  accentBadge: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.cardRadius,
    borderWidth: 1,
    borderColor: Colors.accent + '60',
    padding: 20,
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  accentValue: {
    fontFamily: 'JetBrains Mono',
    fontSize: 48,
    fontWeight: '700',
    color: Colors.accent,
  },
  accentLabel: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  body: {
    fontFamily: 'Inter',
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  levelsContainer: {
    gap: 12,
    marginTop: 8,
  },
  levelCard: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.cardRadius,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 16,
    gap: 4,
    minHeight: Spacing.touchTarget,
    justifyContent: 'center',
  },
  levelCardActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '12',
  },
  levelLabel: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  levelLabelActive: {
    color: Colors.accent,
  },
  levelDesc: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: Colors.textSecondary,
  },
  levelDescActive: {
    color: Colors.accent + 'AA',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginVertical: 24,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: 20,
    backgroundColor: Colors.accent,
  },
  nextBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Spacing.cardRadius,
    paddingVertical: 18,
    marginHorizontal: 24,
    alignItems: 'center',
    minHeight: Spacing.touchTarget,
  },
  nextBtnDisabled: {
    opacity: 0.4,
  },
  nextBtnText: {
    fontFamily: 'Inter',
    fontSize: 17,
    fontWeight: '700',
    color: Colors.accentText,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  skipBtnText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: Colors.textMuted,
  },
});
