import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Theme } from '@/constants/theme';

// Shared header for every top-level screen — the app logo, a title, and a
// short description below it — so Home/Calendar/Suggestions all read as the
// same app instead of each screen inventing its own header treatment.
export function PageHeader({ title, subtitle, th, right }: {
  title: string;
  subtitle: string;
  th: Theme;
  right?: React.ReactNode;
}) {
  return (
    <View style={s.header}>
      <View style={s.row}>
        <View style={s.titleRow}>
          <Image source={require('../assets/images/icon.png')} style={s.logoImg} />
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
  logoImg:  { width: 30, height: 30, borderRadius: 8, overflow: 'hidden' },
  title:    { fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  subtitle: { fontSize: 13, marginTop: 6 },
});
