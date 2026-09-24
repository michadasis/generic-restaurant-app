import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Platform, StatusBar, Pressable, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { i18n, Lang } from '@/constants/i18n';
import { darkTheme, lightTheme, palette, Theme } from '@/constants/theme';
import { PageHeader } from '@/components/PageHeader';

export default function SettingsScreen() {
  const router = useRouter();
  const [dark, setDark]     = useState(true);
  const [lang, setLang]     = useState<Lang>('gr');
  const [showBreakfast, setShowBreakfast] = useState(false);

  useFocusEffect(useCallback(() => {
    AsyncStorage.multiGet(['theme', 'lang', 'showBreakfast']).then(pairs => {
      const map = Object.fromEntries(pairs);
      if (map.theme !== null) setDark(map.theme === 'dark');
      if (map.lang === 'en' || map.lang === 'gr') setLang(map.lang as Lang);
      setShowBreakfast(map.showBreakfast === 'true');
    });
  }, []));

  const th     = dark ? darkTheme : lightTheme;
  const t      = i18n[lang];
  const safePT = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
  const insets = useSafeAreaInsets();

  const toggleDark = (value: boolean) => {
    setDark(value);
    AsyncStorage.setItem('theme', value ? 'dark' : 'light');
  };

  const changeLang = (value: Lang) => {
    setLang(value);
    AsyncStorage.setItem('lang', value);
  };

  const toggleBreakfast = (value: boolean) => {
    setShowBreakfast(value);
    AsyncStorage.setItem('showBreakfast', String(value));
  };

  return (
    <SafeAreaView style={[s.root, { backgroundColor: th.bg, paddingTop: safePT }]}>
      <Pressable onPress={() => router.back()} style={[s.backBtn, { backgroundColor: th.surfaceAlt }]} hitSlop={8}>
        <Ionicons name="chevron-back" size={20} color={th.textPrimary} />
      </Pressable>

      <ScrollView contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 20 }]}>
        <PageHeader th={th} title={t.settingsTitle} subtitle={t.settingsSubtitle} />

        {/* Appearance */}
        <SettingsCard icon="contrast-outline" label={t.sectionAppearance} th={th}>
          <ToggleRow label={t.darkModeLabel} value={dark} onValueChange={toggleDark} th={th} />
          <View style={[s.rowDivider, { backgroundColor: th.border }]} />
          <View style={s.toggleRow}>
            <Text style={[s.rowLabel, { color: th.textPrimary }]}>{t.languageLabel}</Text>
            <View style={s.langPills}>
              <Pressable
                onPress={() => changeLang('gr')}
                style={[s.pill, { backgroundColor: lang === 'gr' ? palette.teal : th.surfaceAlt }]}
              >
                <Text style={[s.pillText, { color: lang === 'gr' ? '#fff' : th.textPrimary }]}>ΕΛ</Text>
              </Pressable>
              <Pressable
                onPress={() => changeLang('en')}
                style={[s.pill, { backgroundColor: lang === 'en' ? palette.teal : th.surfaceAlt }]}
              >
                <Text style={[s.pillText, { color: lang === 'en' ? '#fff' : th.textPrimary }]}>EN</Text>
              </Pressable>
            </View>
          </View>
        </SettingsCard>

        {/* Menu preferences */}
        <SettingsCard icon="cafe-outline" label={t.sectionMenuPrefs} th={th}>
          <ToggleRow
            label={t.showBreakfastLabel}
            description={t.showBreakfastDesc}
            value={showBreakfast}
            onValueChange={toggleBreakfast}
            th={th}
          />
        </SettingsCard>

        {/* About */}
        <View style={[s.card, { backgroundColor: th.surface, paddingVertical: 6 }]}>
          <Pressable style={s.linkRow} onPress={() => router.push('/About')} hitSlop={4}>
            <Ionicons name="information-circle-outline" size={18} color={th.textSecondary} style={{ width: 22 }} />
            <Text style={[s.linkRowText, { color: th.textPrimary }]}>{t.tabAbout}</Text>
            <Ionicons name="chevron-forward" size={16} color={th.textMuted} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Subcomponents

function SettingsCard({ icon, label, th, children }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  th: Theme;
  children: React.ReactNode;
}) {
  return (
    <View style={[s.card, { backgroundColor: th.surface }]}>
      <View style={s.cardHeadingRow}>
        <Ionicons name={icon} size={17} color={palette.teal} />
        <Text style={[s.cardTitle, { color: th.textPrimary }]}>{label}</Text>
      </View>
      <View style={[s.divider, { backgroundColor: th.border }]} />
      {children}
    </View>
  );
}

function ToggleRow({ label, description, value, onValueChange, th }: {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  th: Theme;
}) {
  return (
    <View style={s.toggleRow}>
      <View style={s.toggleTextWrap}>
        <Text style={[s.rowLabel, { color: th.textPrimary }]}>{label}</Text>
        {description && <Text style={[s.rowDesc, { color: th.textMuted }]}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: th.border, true: palette.teal }}
        thumbColor="#fff"
      />
    </View>
  );
}

// Styles

const s = StyleSheet.create({
  root:    { flex: 1 },
  backBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginLeft: 16, marginTop: 8 },
  scroll:  { padding: 20 },
  card:    { borderRadius: 16, padding: 18, marginBottom: 16 },
  cardHeadingRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },
  divider: { height: 1, marginVertical: 12 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  toggleTextWrap: { flex: 1, marginRight: 12 },
  rowLabel: { fontSize: 14, fontWeight: '700' },
  rowDesc:  { fontSize: 12, marginTop: 3, lineHeight: 17 },
  rowDivider: { height: 1, marginVertical: 12 },
  langPills: { flexDirection: 'row', gap: 8 },
  pill:      { borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  pillText:  { fontSize: 13, fontWeight: '700' },
  // About link row
  linkRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  linkRowText: { flex: 1, fontSize: 14, fontWeight: '600' },
});
