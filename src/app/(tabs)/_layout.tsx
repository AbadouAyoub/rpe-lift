/**
 * app/(tabs)/_layout.tsx
 * Tab bar principale : Accueil · Programmes · Historique · Réglages
 */

import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Colors } from '@/lib/theme';

// Icônes SVG simples inline pour éviter une dépendance icône lourde
function HomeIcon({ color }: { color: string }) {
  const { View } = require('react-native');
  return (
    <View style={{
      width: 24, height: 24,
      borderWidth: 2, borderColor: color,
      borderRadius: 4,
      alignItems: 'center', justifyContent: 'center',
    }}>
      <View style={{ width: 8, height: 8, backgroundColor: color, borderRadius: 2 }} />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          height: Platform.OS === 'ios' ? 84 : 64,
        },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontFamily: 'Inter',
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }) => (
            <HomeIcon color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="programs"
        options={{
          title: 'Programmes',
          tabBarIcon: ({ color, size }) => {
            const { View } = require('react-native');
            return (
              <View style={{ gap: 3 }}>
                {[0, 1, 2].map((i) => (
                  <View key={i} style={{
                    width: size - 4,
                    height: 3,
                    backgroundColor: color,
                    borderRadius: 2,
                  }} />
                ))}
              </View>
            );
          },
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Historique',
          tabBarIcon: ({ color, size }) => {
            const { View } = require('react-native');
            return (
              <View style={{
                width: size,
                height: size,
                borderWidth: 2,
                borderColor: color,
                borderRadius: size / 2,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <View style={{ width: 2, height: 7, backgroundColor: color, position: 'absolute', top: 4 }} />
                <View style={{ width: 7, height: 2, backgroundColor: color, position: 'absolute', right: 4, top: 10 }} />
              </View>
            );
          },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Réglages',
          tabBarIcon: ({ color, size }) => {
            const { View } = require('react-native');
            return (
              <View style={{
                width: size,
                height: size,
                borderWidth: 2,
                borderColor: color,
                borderRadius: size / 2,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <View style={{
                  width: size * 0.4,
                  height: size * 0.4,
                  borderWidth: 2,
                  borderColor: color,
                  borderRadius: size * 0.2,
                }} />
              </View>
            );
          },
        }}
      />
    </Tabs>
  );
}
