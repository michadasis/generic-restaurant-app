import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Platform, StatusBar, Linking, Image, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useFocusEffect } from 'expo-router';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { i18n, Lang } from '@/constants/i18n';
import { darkTheme, lightTheme, palette, Theme } from '@/constants/theme';

const GITHUB_URL = 'https://github.com/michadasis/generic-restaurant-app';
const UNI_URL     = 'https://www.uowm.gr/';

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
  // The tab bar floats over the screen (position: 'absolute' in the tabs layout),
  // so its height isn't reserved automatically — pad the scroll content ourselves.
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <SafeAreaView style={[s.root, { backgroundColor: th.bg, paddingTop: safePT }]}>
      <ScrollView contentContainerStyle={[s.scroll, { paddingBottom: tabBarHeight + 20 }]}>

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

        {/* About card */}
        <View style={[s.card, { backgroundColor: th.surface }]}>
          <CardHeading icon="information-circle-outline" label={t.aboutTitle} th={th} />
          <Text style={[s.body, { color: th.textSecondary }]}>{t.aboutDesc1}</Text>
          <Text style={[s.body, { color: th.textSecondary, marginBottom: 14 }]}>{t.aboutDesc2}</Text>
          <View style={[s.techChip, { backgroundColor: palette.teal + '18' }]}>
            <Ionicons name="code-slash-outline" size={13} color={palette.teal} />
            <Text style={[s.techChipText, { color: palette.teal }]}>{t.techBuiltWith}</Text>
          </View>
        </View>

        {/* Credits card */}
        <View style={[s.card, { backgroundColor: th.surface }]}>
          <CardHeading icon="people-outline" label={t.creditsTitle} th={th} />
          <CreditRow icon="code-slash-outline" role={t.roleDeveloper} name={t.devName} th={th} />
          <View style={[s.rowDivider, { backgroundColor: th.border }]} />
          <CreditRow icon="brush-outline" role={t.roleDesigner} name={t.designerName} th={th} />
        </View>

        {/* Links card */}
        <View style={[s.card, { backgroundColor: th.surface, paddingVertical: 6 }]}>
          <LinkRow icon="logo-github" label={t.aboutGithub} th={th} onPress={() => Linking.openURL(GITHUB_URL)} />
          <View style={[s.rowDivider, { backgroundColor: th.border }]} />
          <LinkRow icon="bug-outline" label={t.reportIssue} th={th} onPress={() => Linking.openURL(`${GITHUB_URL}/issues/new`)} />
        </View>

        {/* University badge */}
        <Pressable
          style={[s.uniBadge, { backgroundColor: palette.teal + '18' }]}
          onPress={() => Linking.openURL(UNI_URL)}
        >
          <Ionicons name="school-outline" size={15} color={palette.teal} />
          <Text style={[s.uniText, { color: palette.teal }]}>
            {lang === 'gr' ? 'Πανεπιστήμιο Δυτικής Μακεδονίας' : 'University of Western Macedonia'}
          </Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

// Subcomponents

function CardHeading({ icon, label, th }: { icon: keyof typeof Ionicons.glyphMap; label: string; th: Theme }) {
  return (
    <>
      <View style={s.cardHeadingRow}>
        <Ionicons name={icon} size={17} color={palette.teal} />
        <Text style={[s.cardTitle, { color: th.textPrimary }]}>{label}</Text>
      </View>
      <View style={[s.divider, { backgroundColor: th.border }]} />
    </>
  );
}

function CreditRow({ icon, role, name, th }: { icon: keyof typeof Ionicons.glyphMap; role: string; name: string; th: Theme }) {
  return (
    <View style={s.creditRow}>
      <View style={[s.creditIconWrap, { backgroundColor: th.surfaceAlt }]}>
        <Ionicons name={icon} size={16} color={palette.amber} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.creditName, { color: th.textPrimary }]}>{name}</Text>
        <Text style={[s.creditRole, { color: th.textMuted }]}>{role}</Text>
      </View>
    </View>
  );
}

function LinkRow({ icon, label, th, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; th: Theme; onPress: () => void }) {
  return (
    <Pressable style={s.linkRow} onPress={onPress} hitSlop={4}>
      <Ionicons name={icon} size={18} color={th.textSecondary} style={{ width: 22 }} />
      <Text style={[s.linkRowText, { color: th.textPrimary }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={th.textMuted} />
    </Pressable>
  );
}

// Styles

const s = StyleSheet.create({
  root:     { flex: 1 },
  scroll:   { padding: 20 },
  header:   { alignItems: 'center', marginBottom: 16, gap: 8 },
  logoImg:  { width: 64, height: 64, borderRadius: 16, overflow: 'hidden' },
  appName:  { fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  versionBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  versionText:  { fontSize: 12, fontWeight: '600' },
  accentBar:    { height: 3, borderRadius: 2, marginBottom: 20 },
  card:     { borderRadius: 16, padding: 18, marginBottom: 16 },
  cardHeadingRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 4 },
  cardTitle:{ fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },
  divider:  { height: 1, marginVertical: 12 },
  body:     { fontSize: 14, lineHeight: 22, marginBottom: 8 },
  techChip: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  techChipText: { fontSize: 12, fontWeight: '700' },
  // Credits
  creditRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  creditIconWrap:{ width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  creditName:    { fontSize: 14, fontWeight: '700' },
  creditRole:    { fontSize: 12, marginTop: 1 },
  rowDivider:    { height: 1, marginVertical: 10 },
  // Links
  linkRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  linkRowText: { flex: 1, fontSize: 14, fontWeight: '600' },
  // University badge
  uniBadge: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, borderRadius: 12, padding: 14 },
  uniText:  { fontSize: 13, fontWeight: '700', letterSpacing: 0.2 },
});