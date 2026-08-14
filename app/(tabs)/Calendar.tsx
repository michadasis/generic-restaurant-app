import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Platform, StatusBar, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { buildMenu, WeekMenu, DayMenu } from '@/data/menu';
import { getDayKeyForDate } from '@/utils/getToday';
import { getWeekKeyForDate } from '@/utils/getWeek';
import { i18n, Lang } from '@/constants/i18n';
import { darkTheme, lightTheme, palette } from '@/constants/theme';
import { MealSection } from '@/components/MealSection';

type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
const DAY_KEYS: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export default function CalendarScreen() {
  const [dark, setDark] = useState(true);
  const [lang, setLang] = useState<Lang>('gr');

  const today = useMemo(() => new Date(), []);
  const [viewMonth, setViewMonth]     = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today);
  // Full month grid by default; picking a date collapses it to a single-row
  // week strip so the day's menu below doesn't need to compete for space.
  const [expanded, setExpanded] = useState(true);

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
  // The tab bar floats over the screen (position: 'absolute' in the tabs layout),
  // so its height isn't reserved automatically — pad the scroll content ourselves.
  const tabBarHeight = useBottomTabBarHeight();
  const menu    = buildMenu(lang);

  const dayKey  = getDayKeyForDate(selectedDate);
  const weekKey = getWeekKeyForDate(selectedDate);
  const dayMenu = (menu[weekKey] as WeekMenu)?.[dayKey] as DayMenu;
  const fullDay = t.fullDays[DAY_KEYS.indexOf(dayKey)];
  const dateStr = `${String(selectedDate.getDate()).padStart(2, '0')}/${String(selectedDate.getMonth() + 1).padStart(2, '0')}/${selectedDate.getFullYear()}`;

  const goMonth = (delta: 1 | -1) => {
    // Picking a month only makes sense against the full grid — re-expand.
    setExpanded(true);
    setViewMonth(m => new Date(m.getFullYear(), m.getMonth() + delta, 1));
  };

  const goToday = () => {
    setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  const pickDate = (date: Date) => {
    setSelectedDate(date);
    setExpanded(false);
  };

  // Monday-first grid: leading blanks for days before the 1st, then the
  // month's days, padded to a full row so the grid height stays stable.
  const gridCells = useMemo(() => {
    const year  = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0..Sun=6
    const daysInMonth  = new Date(year, month + 1, 0).getDate();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewMonth]);

  // Mon..Sun of the week containing selectedDate — shown as a compact strip
  // once the grid is collapsed, so switching days nearby doesn't require
  // re-expanding.
  const weekStripDates = useMemo(() => {
    const dow    = (selectedDate.getDay() + 6) % 7; // Mon=0..Sun=6
    const monday = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - dow);
    return Array.from({ length: 7 }, (_, i) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i));
  }, [selectedDate]);

  return (
    <SafeAreaView style={[s.root, { backgroundColor: th.bg, paddingTop: safePT }]}>
      <ScrollView contentContainerStyle={[s.scroll, { paddingBottom: tabBarHeight + 20 }]}>

        {/* Header */}
        <View style={s.header}>
          <View style={s.headerTitleRow}>
            <Ionicons name="calendar-outline" size={22} color={palette.teal} />
            <Text style={[s.title, { color: th.textPrimary }]}>{t.tabCalendar}</Text>
          </View>
          <Text style={[s.subtitle, { color: th.textMuted }]}>{t.calendarSubtitle}</Text>
        </View>

        {/* Month nav */}
        <View style={[s.card, { backgroundColor: th.surface }]}>
          <View style={s.monthRow}>
            <Pressable onPress={() => goMonth(-1)} style={[s.navBtn, { backgroundColor: th.surfaceAlt }]}>
              <Ionicons name="chevron-back" size={18} color={th.textPrimary} />
            </Pressable>
            <Pressable onPress={goToday} hitSlop={6}>
              <Text style={[s.monthLabel, { color: th.textPrimary }]}>
                {t.months[viewMonth.getMonth()]} {viewMonth.getFullYear()}
              </Text>
            </Pressable>
            <Pressable onPress={() => goMonth(1)} style={[s.navBtn, { backgroundColor: th.surfaceAlt }]}>
              <Ionicons name="chevron-forward" size={18} color={th.textPrimary} />
            </Pressable>
          </View>

          {expanded ? (
            <>
              {/* Weekday header */}
              <View style={s.weekRow}>
                {t.days.map((d, i) => (
                  <Text key={i} style={[s.weekLabel, { color: th.textMuted }]}>{d}</Text>
                ))}
              </View>

              {/* Day grid */}
              <View style={s.grid}>
                {gridCells.map((date, i) => {
                  if (!date) return <View key={i} style={s.cell} />;
                  const isSelected = isSameDay(date, selectedDate);
                  const isToday    = isSameDay(date, today);
                  return (
                    <Pressable key={i} onPress={() => pickDate(date)} style={s.cell}>
                      <View
                        style={[
                          s.cellInner,
                          isSelected && { backgroundColor: palette.teal },
                          !isSelected && isToday && { borderWidth: 1.5, borderColor: palette.amber },
                        ]}
                      >
                        <Text
                          style={[
                            s.cellText,
                            { color: isSelected ? '#fff' : isToday ? palette.amber : th.textPrimary },
                          ]}
                        >
                          {date.getDate()}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : (
            /* Collapsed week strip */
            <View style={s.stripRow}>
              {weekStripDates.map((date, i) => {
                const isSelected = isSameDay(date, selectedDate);
                const isToday    = isSameDay(date, today);
                return (
                  <Pressable key={i} onPress={() => setSelectedDate(date)} style={s.stripCell}>
                    <Text style={[s.stripDayLabel, { color: th.textMuted }]}>{t.days[i]}</Text>
                    <View
                      style={[
                        s.cellInner,
                        isSelected && { backgroundColor: palette.teal },
                        !isSelected && isToday && { borderWidth: 1.5, borderColor: palette.amber },
                      ]}
                    >
                      <Text
                        style={[
                          s.cellText,
                          { color: isSelected ? '#fff' : isToday ? palette.amber : th.textPrimary },
                        ]}
                      >
                        {date.getDate()}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          <Pressable onPress={() => setExpanded(e => !e)} style={s.toggleBtn} hitSlop={8}>
            <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={th.textMuted} />
          </Pressable>
        </View>

        {/* Selected day's menu */}
        <View style={[s.card, { backgroundColor: th.surface }]}>
          <View style={[s.dayHeader, { borderBottomColor: th.border }]}>
            <View>
              <Text style={[s.dayName, { color: th.textPrimary }]}>{fullDay}</Text>
              <Text style={[s.dayDate, { color: th.textMuted }]}>{dateStr}</Text>
            </View>
            {isSameDay(selectedDate, today) && (
              <View style={[s.todayBadge, { backgroundColor: palette.amber }]}>
                <Text style={s.todayBadgeText}>{t.today}</Text>
              </View>
            )}
          </View>

          {dayMenu ? (
            <>
              <MealSection label={t.lunch} meal={dayMenu.lunch} extra={dayMenu.lunchExtra} t={t} th={th} />
              <View style={[s.sectionDivider, { backgroundColor: th.border }]} />
              <MealSection label={t.dinner} meal={dayMenu.dinner} extra={dayMenu.dinnerExtra} t={t} th={th} />
            </>
          ) : (
            <Text style={[s.noData, { color: th.textMuted }]}>—</Text>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { padding: 20 },
  // Header
  header:        { marginBottom: 16 },
  headerTitleRow:{ flexDirection: 'row', alignItems: 'center', gap: 8 },
  title:         { fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  subtitle:      { fontSize: 13, marginTop: 3 },
  // Card
  card: { borderRadius: 16, padding: 16, marginBottom: 16 },
  // Month nav
  monthRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  navBtn:     { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  monthLabel: { fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },
  // Weekday header
  weekRow:   { flexDirection: 'row', marginBottom: 6 },
  weekLabel: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700' },
  // Grid
  grid:      { flexDirection: 'row', flexWrap: 'wrap' },
  cell:      { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 2 },
  cellInner: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  cellText:  { fontSize: 13, fontWeight: '600' },
  // Collapsed week strip
  stripRow:      { flexDirection: 'row' },
  stripCell:     { flex: 1, alignItems: 'center', gap: 4 },
  stripDayLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  // Expand/collapse toggle
  toggleBtn: { alignItems: 'center', paddingTop: 8 },
  // Selected day
  dayHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', borderBottomWidth: 1, paddingBottom: 9, marginBottom: 11 },
  dayName:   { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  dayDate:   { fontSize: 13, marginTop: 1 },
  todayBadge:{ borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  todayBadgeText: { fontSize: 11, fontWeight: '800', color: '#1a1a1a' },
  sectionDivider: { height: 1, marginVertical: 9 },
  noData:    { textAlign: 'center', marginTop: 20, marginBottom: 10, fontSize: 15 },
});
