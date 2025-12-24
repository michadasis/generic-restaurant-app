import React, { ReactNode, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { menu } from '../../data/menu';
import { getTodayKey, getTodayLabel } from '@/utils/getToday';
import { getCurrentWeekIndex } from '@/utils/getWeek';

type DayKey = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
type WeekKey = "week1" | "week2" | "week3" | "week4";

interface Meal { first: string[]; main: string[]; }
interface DailyMenu { lunch: Meal; dinner: Meal; }
interface SectionProps { title: string; children: ReactNode; }
interface CardProps { title: string; children: ReactNode; }

export default function HomeScreen() {
  const [darkMode, setDarkMode] = useState(false);

  const todayKey: DayKey = getTodayKey();
  const todayLabel: string = getTodayLabel();

  const weekKeys: WeekKey[] = ["week1", "week2", "week3", "week4"];
  const currentWeekKey: WeekKey = weekKeys[getCurrentWeekIndex()];

  const todayMenu: DailyMenu = menu[currentWeekKey][todayKey];

  const themeStyles = darkMode ? darkStyles : lightStyles;

  return (
    <View style={{ flex: 1 }}>
      <Pressable
        style={[styles.toggleButton, themeStyles.toggleButton]}
        onPress={() => setDarkMode(!darkMode)}
        android_ripple={{ color: darkMode ? '#444' : '#ccc', borderless: true }}
      >
        <Text style={themeStyles.toggleButtonText}>
          {darkMode ? '☀️' : '🌙'}
        </Text>
      </Pressable>

      <ScrollView
        contentContainerStyle={{ paddingTop: 100, paddingHorizontal: 16 }}
        style={[themeStyles.container]}
      >
        <Text style={[styles.day, themeStyles.day]}>{todayLabel}</Text>

        <Section title="🍽 Γεύμα" themeStyles={themeStyles}>
          <Card title="Πρώτο Πιάτο" themeStyles={themeStyles}>
            {todayMenu.lunch.first.map((item, i) => (
              <Item key={i} text={item} themeStyles={themeStyles} />
            ))}
          </Card>

          <Card title="Κυρίως Πιάτο" themeStyles={themeStyles}>
            {todayMenu.lunch.main.map((item, i) => (
              <Item key={i} text={item} themeStyles={themeStyles} />
            ))}
          </Card>
        </Section>

        <Section title="🌙 Δείπνο" themeStyles={themeStyles}>
          <Card title="Πρώτο Πιάτο" themeStyles={themeStyles}>
            {todayMenu.dinner.first.map((item, i) => (
              <Item key={i} text={item} themeStyles={themeStyles} />
            ))}
          </Card>

          <Card title="Κυρίως Πιάτο" themeStyles={themeStyles}>
            {todayMenu.dinner.main.map((item, i) => (
              <Item key={i} text={item} themeStyles={themeStyles} />
            ))}
          </Card>
        </Section>
      </ScrollView>
    </View>
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
      {children}
    </View>
  );
}

function Item({ text, themeStyles }: { text: string, themeStyles: any }) {
  return <Text style={themeStyles.item}>• {text}</Text>;
}

//styles
const styles = StyleSheet.create({
  day: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  toggleButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    padding: 10,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 10,
  },
});

const lightStyles = StyleSheet.create({
  container: { backgroundColor: '#f2f2f2' },
  day: { color: '#000' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '600', marginBottom: 8, color: '#000' },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 6, color: '#000' },
  item: { fontSize: 15, marginVertical: 2, color: '#000' },
  toggleButton: { backgroundColor: '#000' },
  toggleButtonText: { color: '#fff', fontSize: 18 },
});

const darkStyles = StyleSheet.create({
  container: { backgroundColor: '#1e1e1e' },
  day: { color: '#fff' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '600', marginBottom: 8, color: '#fff' },
  card: { backgroundColor: '#2c2c2c', padding: 14, borderRadius: 12, marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 6, color: '#fff' },
  item: { fontSize: 15, marginVertical: 2, color: '#fff' },
  toggleButton: { backgroundColor: '#fff' },
  toggleButtonText: { color: '#000', fontSize: 18 },
});