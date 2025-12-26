import React, { ReactNode, useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable, SafeAreaView, StatusBar, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { menu } from '../../data/menu';
import { getTodayKey, getTodayLabel } from '@/utils/getToday';
import { getCurrentWeekIndex } from '@/utils/getWeek';


type DayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

type WeekKey = 'week1' | 'week2' | 'week3' | 'week4';

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

const DAYS: { key: DayKey; label: string }[] = [
  { key: 'monday', label: 'Δευ' },
  { key: 'tuesday', label: 'Τρι' },
  { key: 'wednesday', label: 'Τετ' },
  { key: 'thursday', label: 'Πεμ' },
  { key: 'friday', label: 'Παρ' },
  { key: 'saturday', label: 'Σαβ' },
  { key: 'sunday', label: 'Κυρ' },
];

export default function HomeScreen() {
  const [darkMode, setDarkMode] = useState<boolean | null>(null);

  const todayKey = getTodayKey();
  const todayLabel = getTodayLabel();

  const [selectedDay, setSelectedDay] = useState<DayKey>(todayKey);

  const weekKeys: WeekKey[] = ['week1', 'week2', 'week3', 'week4'];
  const [selectedWeek, setSelectedWeek] = useState<WeekKey>(
    weekKeys[getCurrentWeekIndex()]
  );

  useEffect(() => {
    AsyncStorage.getItem('theme').then(saved => setDarkMode(saved === 'dark'));
  }, []);

  useEffect(() => {
    if (darkMode !== null) {
      AsyncStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }
  }, [darkMode]);

  if (darkMode === null) return null;

  const todayMenu: DailyMenu = menu[selectedWeek][selectedDay];
  const themeStyles = darkMode ? darkStyles : lightStyles;
  const safePaddingTop =
    Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

  return (
    <SafeAreaView
      style={[styles.root, themeStyles.container, { paddingTop: safePaddingTop }]}
    >
      <View style={[styles.header, themeStyles.header]}>
        <View>
          <Text style={themeStyles.headerDay}>{todayLabel}</Text>
          <Text style={themeStyles.headerSubtitle}>Weekly Menu</Text>
        </View>

        <Pressable onPress={() => setDarkMode(v => !v)} style={styles.themeButton}>
          <Text style={themeStyles.toggleButtonText}>
            {darkMode ? '☀️' : '🌙'}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
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
              {index + 1}ή Εβδομάδα
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.daySelector}
      >
        {DAYS.map(day => {
          const active = day.key === selectedDay;
          return (
            <Pressable
              key={day.key}
              onPress={() => setSelectedDay(day.key)}
              style={[styles.dayChip, active && styles.dayChipActive]}
            >
              <Text
                style={[
                  styles.dayChipText,
                  active && styles.dayChipTextActive,
                ]}
              >
                {day.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 60 }]}>
        <Section title="Lunch" themeStyles={themeStyles}>
          <Card title="First Course" themeStyles={themeStyles}>
            {todayMenu.lunch.first.map((item, i) => (
              <Item key={i} text={item} themeStyles={themeStyles} />
            ))}
          </Card>

          <Card title="Main Course" themeStyles={themeStyles}>
            {todayMenu.lunch.main.map((item, i) => (
              <Item key={i} text={item} themeStyles={themeStyles} />
            ))}
          </Card>
        </Section>

        <Section title="Dinner" themeStyles={themeStyles}>
          <Card title="First Course" themeStyles={themeStyles}>
            {todayMenu.dinner.first.map((item, i) => (
              <Item key={i} text={item} themeStyles={themeStyles} />
            ))}
          </Card>

          <Card title="Main Course" themeStyles={themeStyles}>
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
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
  },
  themeButton: {
    padding: 8,
    borderRadius: 20,
  },
  daySelector: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  dayChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginRight: 8,
    backgroundColor: 'rgba(0,0,0,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 32,
  },
  dayChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    lineHeight: 18,
    textAlign: 'center',
  },
    dayChipActive: {
    backgroundColor: '#2e7d32',
  },
  dayChipTextActive: {
    color: '#fff',
  },
  scrollContent: {
    padding: 16,
  },
  weekSelector: {
  paddingHorizontal: 16,
  paddingTop: 10,
  paddingBottom: 4,
},

weekChip: {
  paddingVertical: 6,
  paddingHorizontal: 16,
  borderRadius: 18,
  marginRight: 8,
  backgroundColor: 'rgba(0,0,0,0.08)',
  minHeight: 32,
  justifyContent: 'center',
  alignItems: 'center',
},

weekChipActive: {
  backgroundColor: '#2e7d32',
},

weekChipText: {
  fontSize: 14,
  fontWeight: '600',
  color: '#555',
  lineHeight: 18,
},

weekChipTextActive: {
  color: '#fff',
}
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