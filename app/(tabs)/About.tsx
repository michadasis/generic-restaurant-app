import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Platform, StatusBar, Linking, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useFocusEffect } from 'expo-router';
import { i18n, Lang } from '@/constants/i18n';
import { darkTheme, lightTheme, palette } from '@/constants/theme';

export default function AboutScreen() {
  const [dark, setDark] = useState(true);
  const [lang, setLang] = useState<Lang>('gr');

  useFocusEffect(useCallback(() => {
    AsyncStorage.multiGet(['theme', 'lang']).then(pairs => {
      const map = Object.fromEntries(pairs);
      if (map.theme !== null) setDark(map.theme === 'dark');
      if (map.lang === 'en' || map.lang === 'gr') setLang(map.lang as Lang);
    });
  }, []));

  const th      = dark ? darkTheme : lightTheme;
  const t       = i18n[lang];
  const safePT  = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
  const version = Constants.expoConfig?.version ?? '—';

  return (
    <SafeAreaView style={[s.root, { backgroundColor: th.bg, paddingTop: safePT }]}>
      <ScrollView contentContainerStyle={s.scroll}>

        {/* Header */}
        <View style={s.header}>
          <Image source={require('../../assets/images/icon.png')} style={s.logoImg} />
          <Text style={[s.appName, { color: th.textPrimary }]}>{t.appTitle}</Text>
          <View style={[s.versionBadge, { backgroundColor: th.surfaceAlt }]}>
            <Text style={[s.versionText, { color: th.textMuted }]}>v{version}</Text>
          </View>
        </View>

        {/* Teal accent bar */}
        <View style={[s.accentBar, { backgroundColor: palette.teal }]} />

        {/* Info card */}
        <View style={[s.card, { backgroundColor: th.surface }]}>
          <Text style={[s.cardTitle, { color: th.textPrimary }]}>{t.aboutTitle}</Text>
          <View style={[s.divider, { backgroundColor: th.border }]} />
          <Text style={[s.body, { color: th.textSecondary }]}>{t.aboutDesc1}</Text>
          <Text style={[s.body, { color: th.textSecondary }]}>{t.aboutDesc2}</Text>
          <Text style={[s.body, { color: th.textSecondary }]}>{t.aboutDesc3}</Text>
          <Text
            style={[s.link, { color: palette.teal, marginBottom: 8 }]}
            onPress={() => Linking.openURL('https://github.com/michadasis/generic-restaurant-app')}
          >
            {t.aboutGithub}
          </Text>
        </View>

        {/* University badge */}
        <View style={[s.uniBadge, { backgroundColor: palette.teal + '18' }]}>
          <Text style={[s.uniText, { color: palette.teal }]}>
            {lang === 'gr' ? 'Πανεπιστήμιο Δυτικής Μακεδονίας' : 'University of Western Macedonia'}
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:     { flex: 1 },
  scroll:   { padding: 20, paddingBottom: 60 },
  header:   { alignItems: 'center', marginBottom: 16, gap: 8 },
  logoImg:  { width: 64, height: 64, borderRadius: 16, overflow: 'hidden' },
  appName:  { fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  versionBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  versionText:  { fontSize: 12, fontWeight: '600' },
  accentBar:    { height: 3, borderRadius: 2, marginBottom: 20 },
  card:     { borderRadius: 16, padding: 18, marginBottom: 16 },
  cardTitle:{ fontSize: 16, fontWeight: '800', marginBottom: 4, letterSpacing: -0.2 },
  divider:  { height: 1, marginVertical: 12 },
  body:     { fontSize: 14, lineHeight: 22, marginBottom: 8 },
  link:     { fontWeight: '700', textDecorationLine: 'underline' },
  uniBadge: { borderRadius: 12, padding: 14, alignItems: 'center' },
  uniText:  { fontSize: 13, fontWeight: '700', letterSpacing: 0.2 },
});