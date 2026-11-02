import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { palette, Theme } from '@/constants/theme';

// Shared header for every top-level screen — a screen-specific icon, a title,
// and a short description below it — so Home/Calendar/Suggestions/Settings all
// read as the same app while each screen is still recognisable at a glance.
// Pass icon="app-logo" to show the UOWM app icon instead of an Ionicon.
export function PageHeader({ icon, iconColor = palette.teal, title, subtitle, th, right }: {
  icon: keyof typeof Ionicons.glyphMap | 'app-logo';
  iconColor?: string;
  title: string;
  subtitle: string;
  th: Theme;
  right?: React.ReactNode;
}) {
  return (
    <View style={s.header}>
      <View style={s.row}>
        <View style={s.titleRow}>
          {icon === 'app-logo'
            ? <Image source={require('../assets/images/icon.png')} style={s.logo} />
            : <Ionicons name={icon} size={22} color={iconColor} />}
          <Text style={[s.title, { color: th.textPrimary }]}>{title}</Text>
        </View>
        {right}
      </View>
      <Text style={[s.subtitle, { color: th.textMuted }]}>{subtitle}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  header:   { paddingHorizontal: 20, paddingTop: 20, marginBottom: 16 },
  row:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo:     { width: 40, height: 40, borderRadius: 10, overflow: 'hidden' },
  title:    { fontSize: 19, fontWeight: '800', letterSpacing: -0.3 },
  subtitle: { fontSize: 13, marginTop: 6 },
});
