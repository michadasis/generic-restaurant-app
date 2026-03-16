import React, { ReactNode, useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildMenu, WeekMenu, CYCLE_WEEKS } from '../../data/menu';
import { getTodayKey, getTodayLabel } from '@/utils/getToday';
import { getCurrentWeekKey } from '@/utils/getWeek';
import { useUpdateChecker } from '@/hooks/useUpdateChecker';
import { UpdateModal } from '@/components/UpdateModal';
import { i18n, Lang } from '@/constants/i18n';

type DayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

type WeekKey = string;

interface Meal {
  first: string[];
  main: string[];
}

interface DailyMenu {
  lunch: Meal;
  dinner: Meal;
}

interface SectionProps {
  title: string;
  children: ReactNode;
}

interface CardProps {
  title: string;
  children: ReactNode;
}

const DAY_KEYS: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function HomeScreen() {
  const [darkMode, setDarkMode] = useState<boolean | null>(null);
  const [lang, setLang] = useState<Lang>('gr');
  const { updateInfo, dismiss } = useUpdateChecker();

  const todayKey = getTodayKey();
  const todayLabel = getTodayLabel(lang);
  const [selectedDay, setSelectedDay] = useState<DayKey>(todayKey);
  const [selectedWeek, setSelectedWeek] = useState<WeekKey>(getCurrentWeekKey());

  useEffect(() => {
    AsyncStorage.getItem('theme').then(saved => setDarkMode(saved === 'dark'));
    AsyncStorage.getItem('lang').then(saved => { if (saved === 'en' || saved === 'gr') setLang(saved as Lang); });
  }, []);

  useEffect(() => {
    if (darkMode !== null) {
      AsyncStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    AsyncStorage.setItem('lang', lang);
  }, [lang]);

  if (darkMode === null) return null;

  const menu = buildMenu(lang);
  const weekKeys: WeekKey[] = Array.from({ length: CYCLE_WEEKS }, (_, i) => `week${i + 1}`);
  const todayMenu: DailyMenu = (menu[selectedWeek] as WeekMenu)[selectedDay];
  const themeStyles = darkMode ? darkStyles : lightStyles;

  return (
    <SafeAreaView style={[styles.root, themeStyles.container]}>
      {updateInfo && (
        <UpdateModal updateInfo={updateInfo} onDismiss={dismiss} darkMode={darkMode} lang={lang} />
      )}
      <View style={[styles.header, themeStyles.header]}>
        <View>
          <Text style={themeStyles.headerDay}>{todayLabel}</Text>
          <Text style={themeStyles.headerSubtitle}>{i18n[lang].subtitle}</Text>
        </View>

        <View style={styles.headerButtons}>
          <Pressable onPress={() => setLang(l => l === 'gr' ? 'en' : 'gr')} style={styles.langButton}>
            <Text style={themeStyles.toggleButtonText}>{lang === 'gr' ? 'EN' : 'ΕΛ'}</Text>
          </Pressable>
          <Pressable onPress={() => setDarkMode(v => !v)} style={styles.themeButton}>
            <Text style={themeStyles.toggleButtonText}>
              {darkMode ? '☀️' : '🌙'}
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.selectorContainer}
        contentContainerStyle={styles.weekSelector}
      >
        {weekKeys.map((week, index) => {
          const active = week === selectedWeek;
          return (
            <Pressable
              key={week}
              onPress={() => setSelectedWeek(week)}
              style={[styles.weekChip, active && styles.weekChipActive]}
            >
              <Text
                style={[
                  styles.weekChipText,
                  active && styles.weekChipTextActive,
                ]}
              >
                {i18n[lang].week(index + 1)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.selectorContainer}
        contentContainerStyle={styles.daySelector}
      >
        {DAY_KEYS.map((key, index) => {
          const active = key === selectedDay;
          return (
            <Pressable
              key={key}
              onPress={() => setSelectedDay(key)}
              style={[styles.dayChip, active && styles.dayChipActive]}
            >
              <Text
                style={[
                  styles.dayChipText,
                  active && styles.dayChipTextActive,
                ]}
              >
                {i18n[lang].days[index]}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 60 }]}>
        <Section title={i18n[lang].lunch} themeStyles={themeStyles}>
          <Card title={i18n[lang].firstCourse} themeStyles={themeStyles}>
            {todayMenu.lunch.first.map((item, i) => (
              <Item key={i} text={item} themeStyles={themeStyles} />
            ))}
          </Card>

          <Card title={i18n[lang].mainCourse} themeStyles={themeStyles}>
            {todayMenu.lunch.main.map((item, i) => (
              <Item key={i} text={item} themeStyles={themeStyles} />
            ))}
          </Card>
        </Section>

        <Section title={i18n[lang].dinner} themeStyles={themeStyles}>
          <Card title={i18n[lang].firstCourse} themeStyles={themeStyles}>
            {todayMenu.dinner.first.map((item, i) => (
              <Item key={i} text={item} themeStyles={themeStyles} />
            ))}
          </Card>

          <Card title={i18n[lang].mainCourse} themeStyles={themeStyles}>
            {todayMenu.dinner.main.map((item, i) => (
              <Item key={i} text={item} themeStyles={themeStyles} />
            ))}
          </Card>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

//ui
function Section({ title, children, themeStyles }: SectionProps & { themeStyles: any }) {
  return (
    <View style={themeStyles.section}>
      <Text style={themeStyles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Card({ title, children, themeStyles }: CardProps & { themeStyles: any }) {
  return (
    <View style={themeStyles.card}>
      <Text style={themeStyles.cardTitle}>{title}</Text>
      <View style={themeStyles.divider} />
      {children}
    </View>
  );
}

function Item({ text, themeStyles }: { text: string; themeStyles: any }) {
  return <Text style={themeStyles.item}>• {text}</Text>;
}

//styles
const styles = StyleSheet.create({
  root: { flex: 1 },
  selectorContainer: {
    flexShrink: 0,
  },
  header: {
    padding: 16,
    paddingTop: (Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0) + 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  themeButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  langButton: {
    padding: 8,
    borderRadius: 20,
  },
  weekSelector: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  daySelector: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  dayChip: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    marginRight: 8,
    backgroundColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    lineHeight: 20,
    includeFontPadding: false,
  },
  dayChipActive: {
    backgroundColor: '#2e7d32',
  },
  dayChipTextActive: {
    color: '#fff',
  },
  weekChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekChipActive: {
    backgroundColor: '#2e7d32',
  },
  weekChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    lineHeight: 20,
    includeFontPadding: false,
  },
  weekChipTextActive: {
    color: '#fff',
  },
  scrollContent: {
    padding: 16,
  },
});

const lightStyles = StyleSheet.create({
  container: { backgroundColor: '#fafafa' },
  header: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerDay: { fontSize: 20, fontWeight: '700', color: '#111' },
  headerSubtitle: { fontSize: 13, color: '#666' },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#2e7d32' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 10, marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#111' },
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.06)', marginVertical: 8 },
  item: { fontSize: 14, color: '#222', marginVertical: 4 },
  toggleButtonText: { fontSize: 18, color: '#111' },
});

const darkStyles = StyleSheet.create({
  container: { backgroundColor: '#181818' },
  header: { backgroundColor: '#202020', borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  headerDay: { fontSize: 20, fontWeight: '700', color: '#fff' },
  headerSubtitle: { fontSize: 13, color: '#aaa' },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#81c784' },
  card: { backgroundColor: '#252525', padding: 16, borderRadius: 10, marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#fff' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 8 },
  item: { fontSize: 14, color: '#eee', marginVertical: 4 },
  toggleButtonText: { fontSize: 18, color: '#fff' },
});