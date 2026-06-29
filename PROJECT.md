# RPE Lift — Project Spec

> Fichier de référence pour l'IDE et GitHub Copilot.
> But : app mobile de tracking musculation/powerlifting centrée sur l'autorégulation (RPE/RIR).
> Cible : lifters intermédiaires-avancés. iOS d'abord, Android ensuite.

---

## 1. Stack technique

| Couche | Choix | Raison |
|---|---|---|
| Framework | **Expo (SDK 54+) + React Native** | iOS + Android, un seul codebase, build cloud EAS |
| Langage | **TypeScript** (strict) | Sécurité de types, meilleur support Copilot |
| Navigation | **Expo Router** | File-based routing, natif Expo |
| Styling | **NativeWind** (Tailwind pour RN) | Design tokens cohérents, syntaxe Tailwind |
| Primitives UI | **react-native-reusables (RN Primitives)** | Équivalent shadcn/Radix pour mobile : unstyled, accessible, code possédé |
| Composants natifs | **@expo/ui** | Sliders/switches au vrai rendu SwiftUI iOS (anti "sent l'IA") |
| Haptique | **expo-haptics** | Feedback tactile à la validation d'un set |
| Animations | **react-native-reanimated** | Transitions fluides 60fps |
| Stockage local | **react-native-mmkv** | Rapide, synchrone, pour data offline |
| Abonnements | **RevenueCat** (`react-native-purchases`) | Gère reçus Apple/Google, cross-platform |
| Pubs (Android) | **AdMob** (`react-native-google-mobile-ads`) | Monétisation Android (pas de subs au Maroc) |

> Note : **Radix UI / shadcn / Base UI sont web-only** et ne fonctionnent PAS en React Native.
> `react-native-reusables` est l'équivalent mobile fidèle de leur philosophie.

---

## 2. Design system (tokens)

Définir ces couleurs dans `tailwind.config.js`. Esthétique : instrument de précision sombre, PAS fitness lifestyle.

```
bg-base        #14140F   (fond near-black)
surface        #1F1F17   (cards)
border         #3A3A30   (hairlines)
accent         #5DCAA5   (vert menthe, UNIQUE accent)
accent-text    #04342C   (texte sur accent)
text-primary   #F1EFE8
text-secondary #888780
text-muted     #5F5E5A
```

Règles :
- **Mono** (`font-mono`) pour TOUS les chiffres (charges, reps, RPE, stats).
- **Sans-serif** (Inter) pour les labels UI.
- Cibles tactiles **min 56px** de haut (utilisé en salle, mains moites).
- **Un seul accent**. Pas de dégradés, pas d'ombres. Card radius 12px.
- Dark mode uniquement (pas de light mode en v1).

---

## 3. Écrans (MVP v1)

1. **Onboarding** (3 écrans) — explique RPE, ajustement fatigue, niveau de départ.
2. **Dashboard / Accueil** — séance du jour, tendances RPE, stats (volume, sets, RPE moyen, streak).
3. **Set Logging** (CŒUR) — charge + reps + RPE réel en un tap, gros chiffres mono, barre de progression des sets.
4. **Program Builder** — jours d'entraînement, exercices avec cibles (sets×reps @ RPE).
5. **Paywall** — annual-first (41,99 €/an mis en avant), 7j d'essai, mensuel secondaire, bouton "Restaurer un achat" OBLIGATOIRE.
6. **Réglages** — compte, restauration achat, unités (kg/lb), gestion abonnement.

Tab bar : Accueil · Programmes · Historique · Réglages.

---

## 4. Logique de monétisation

- **Free** : logging RPE illimité, 1 programme actif, historique 4 dernières semaines.
- **Pro** (abonnement iOS) : ajustement par fatigue, historique illimité, programmes multiples, export.
- **Android** : pas d'abonnement (Maroc non éligible Merchant). "Pro" verrouillé, ads discrètes ENTRE les sessions, JAMAIS pendant un set.
- Tout le gating passe par un hook unique `usePro()` qui lit RevenueCat.

---

## 5. Architecture / conventions

```
app/                 # Expo Router (écrans)
  (tabs)/
    index.tsx        # Dashboard
    programs.tsx
    history.tsx
    settings.tsx
  onboarding/
  log/[sessionId].tsx
  paywall.tsx
components/
  ui/                # primitives react-native-reusables (copiées ici)
  ...                # composants métier
lib/
  storage.ts         # wrapper MMKV
  purchases.ts       # init + hook usePro() RevenueCat
  ads.ts             # init AdMob + consentement UMP
  theme.ts           # tokens / helpers
types/
```

Conventions :
- Composants fonctionnels + hooks uniquement.
- Pas de logique métier dans les composants UI — extraire dans `lib/` ou des hooks.
- Tout nombre affiché passe par un arrondi explicite (pas de float brut à l'écran).
- Centraliser la frontière free/pro dans `usePro()`, jamais en dur dans un écran.

---

## 6. Setup initial (commandes)

```bash
# 1. Créer le projet
npx create-expo-app@latest rpe-lift --template default
cd rpe-lift

# 2. NativeWind + Tailwind
npm install nativewind tailwindcss react-native-reanimated
npx tailwindcss init

# 3. Primitives (équivalent shadcn mobile) — via la CLI de react-native-reusables
npx @react-native-reusables/cli@latest init

# 4. Natif + haptique + storage
npx expo install @expo/ui expo-haptics react-native-mmkv

# 5. Monétisation
npm install react-native-purchases react-native-google-mobile-ads

# 6. Lancer
npx expo start
```

> Vérifier la doc officielle de chaque package pour la version compatible avec ton SDK Expo
> (les commandes ci-dessus sont indicatives, confirmer les noms exacts au moment du setup).

---

## 7. Priorités de build (ordre)

1. Setup projet + design tokens (`tailwind.config.js`) + un composant de test.
2. Configurer comptes : App Store Connect, AdMob, RevenueCat (AVANT de coder, délais d'approbation).
3. Écran **Set Logging** (le cœur) avec haptique.
4. Dashboard + navigation tabs.
5. Program Builder.
6. Paywall + intégration RevenueCat (`usePro()`).
7. AdMob + consentement UMP (Android).
8. Onboarding + Réglages.
9. Tests sandbox (achat, restauration) + TestFlight.

---

## 8. Checklist anti-rejet Apple

- [ ] Bouton "Restaurer un achat" présent et fonctionnel.
- [ ] Lien privacy policy dans l'app ET dans App Store Connect.
- [ ] Paywall : prix, durée, renouvellement auto clairement affichés.
- [ ] Section "App Privacy" remplie (déclaration collecte AdMob).
- [ ] App pas vide / valeur réelle (guideline 4.2).
- [ ] Achat testé en sandbox AVANT soumission.
