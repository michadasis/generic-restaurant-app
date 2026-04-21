import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Ionicons from '@expo/vector-icons/Ionicons';
import { palette } from '@/constants/theme';
import { i18n, Lang } from '@/constants/i18n';

export default function TabLayout() {
  const [dark, setDark] = useState(true);
  const [lang, setLang] = useState<Lang>('gr');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    AsyncStorage.multiGet(['theme', 'lang']).then(pairs => {
      const map = Object.fromEntries(pairs);
      if (map.theme !== null) setDark(map.theme === 'dark');
      if (map.lang === 'en' || map.lang === 'gr') setLang(map.lang as Lang);
    });
  }, []);

  const t             = i18n[lang];
  const bg            = dark ? '#151515' : '#f5f5f0';
  const border        = dark ? '#2a2a2a' : '#e0e0e0';
  const inactiveColor = dark ? '#666' : '#999';
  const bottomPad     = Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: palette.teal,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: bg,
          borderTopColor: border,
          borderTopWidth: 1,
          height: 48 + bottomPad,
          paddingBottom: bottomPad,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabHome,
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="About"
        options={{
          title: t.tabAbout,
          tabBarIcon: ({ color, size }) => <Ionicons name="information-circle-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen name="modal" options={{ href: null }} />
      <Tabs.Screen name="(tabs)" options={{ href: null }} />
    </Tabs>
  );
}