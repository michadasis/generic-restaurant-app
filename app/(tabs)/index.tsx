import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildMenu, CYCLE_WEEKS, WeekMenu, DayMenu } from '../../data/menu';
import { getTodayKey } from '@/utils/getToday';
import { getCurrentWeekKey } from '@/utils/getWeek';
import { useUpdateChecker } from '@/hooks/useUpdateChecker';
import { UpdateModal } from '@/components/UpdateModal';
import { i18n, Lang } from '@/constants/i18n';
import { darkTheme, lightTheme, palette, type Theme } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PEEK = 28;
const CARD_GAP = 10;
const CARD_WIDTH = SCREEN_WIDTH - PEEK * 2 - CARD_GAP;

type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
const DAY_KEYS: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function HomeScreen() {
  const [lang, setLang]         = useState<Lang>('gr');
  const [dark, setDark]         = useState(true);
  const { updateInfo, dismiss } = useUpdateChecker();

  const todayKey   = getTodayKey();
  const todayIndex = DAY_KEYS.indexOf(todayKey);

  const [selectedWeek, setSelectedWeek] = useState<string>(getCurrentWeekKey());
  const [currentDayIndex, setCurrentDayIndex] = useState(todayIndex);
  const currentIndexRef = useRef(todayIndex);
  const flatListRef     = useRef<FlatList>(null);

  const safePT = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

  useEffect(() => {
    AsyncStorage.multiGet(['lang', 'theme']).then(pairs => {
      const map = Object.fromEntries(pairs);
      if (map.lang === 'en' || map.lang === 'gr') setLang(map.lang as Lang);
      if (map.theme !== null) setDark(map.theme === 'dark');
    });
  }, []);

  useEffect(() => { AsyncStorage.setItem('lang',  lang); }, [lang]);
  useEffect(() => { AsyncStorage.setItem('theme', dark ? 'dark' : 'light'); }, [dark]);

  useEffect(() => {
    const timer = setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: todayIndex, animated: false });
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const th = dark ? darkTheme : lightTheme;
  const t  = i18n[lang];
  const menu = buildMenu(lang);

  const cycleWeek = (dir: 1 | -1, landIndex: number) => {
    setSelectedWeek(prev => {
      const cur  = parseInt(prev.replace('week', ''), 10);
      const next = ((cur - 1 + dir + CYCLE_WEEKS) % CYCLE_WEEKS) + 1;
      return `week${next}`;
    });
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: landIndex, animated: false });
      currentIndexRef.current = landIndex;
      setCurrentDayIndex(landIndex);
    }, 50);
  };

  const lastOffsetX = useRef(0);

  const onScrollEnd = (e: any) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const idx     = Math.round(offsetX / (CARD_WIDTH + CARD_GAP));
    const clamped = Math.max(0, Math.min(idx, DAY_KEYS.length - 1));
    const swipedRight = offsetX >= lastOffsetX.current;
    const swipedLeft  = offsetX <= lastOffsetX.current;

    if (clamped === DAY_KEYS.length - 1 && swipedRight && currentIndexRef.current === DAY_KEYS.length - 1) {
      cycleWeek(1, 0);
    } else if (clamped === 0 && swipedLeft && currentIndexRef.current === 0) {
      cycleWeek(-1, DAY_KEYS.length - 1);
    } else {
      currentIndexRef.current = clamped;
      setCurrentDayIndex(clamped);
    }

    lastOffsetX.current = offsetX;
  };

  const getDayDate = (dayKey: DayKey) => {
    const now   = new Date();
    const diff  = DAY_KEYS.indexOf(dayKey) - DAY_KEYS.indexOf(todayKey);
    const d     = new Date(now);
    d.setDate(now.getDate() + diff);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const renderCard = ({ item: dayKey, index }: { item: DayKey; index: number }) => {
    const dayMenu = (menu[selectedWeek] as WeekMenu)?.[dayKey] as DayMenu & { extra?: string[] };
    const isToday = dayKey === todayKey;
    const dateStr = getDayDate(dayKey);
    const fullDay = t.fullDays[index];

    return (
      <ScrollView
        style={[s.card, { width: CARD_WIDTH, backgroundColor: th.surface }]}
        contentContainerStyle={s.cardContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {/* Card header */}
        <View style={[s.cardHeader, { borderBottomColor: th.border }]}>
          <View>
            <Text style={[s.cardDay, { color: th.textPrimary }]}>{fullDay}</Text>
            <Text style={[s.cardDate, { color: th.textMuted }]}>{dateStr}</Text>
          </View>
          {isToday && (
            <View style={[s.todayBadge, { backgroundColor: palette.amber }]}>
              <Text style={s.todayBadgeText}>{lang === 'gr' ? 'Σήμερα' : 'Today'}</Text>
            </View>
          )}
        </View>

        {dayMenu ? (
          <>
            <MealSection label={t.lunch} meal={dayMenu.lunch} t={t} th={th} />
            <View style={[s.sectionDivider, { backgroundColor: th.border }]} />
            <MealSection label={t.dinner} meal={dayMenu.dinner} t={t} th={th} />
            {dayMenu.extra && dayMenu.extra.length > 0 && (
              <>
                <View style={[s.sectionDivider, { backgroundColor: th.border }]} />
                <View style={s.mealSection}>
                  <Text style={[s.mealSectionLabel, { color: palette.amber }]}>{t.extra}</Text>
                  {dayMenu.extra.map((item: string, i: number) => (
                    <Text key={i} style={[s.mealItem, { color: th.textSecondary }]}>{item}</Text>
                  ))}
                </View>
              </>
            )}
          </>
        ) : (
          <Text style={[s.noData, { color: th.textMuted }]}>—</Text>
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={[s.root, { backgroundColor: th.bg, paddingTop: safePT }]}>
      {updateInfo && (
        <UpdateModal updateInfo={updateInfo} onDismiss={dismiss} darkMode={dark} lang={lang} />
      )}

      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Image source={require('../../assets/images/icon.png')} style={s.logoImg} />
          <View>
            <Text style={[s.appTitle, { color: th.textPrimary }]}>{t.appTitle}</Text>
            <Text style={[s.appSubtitle, { color: palette.teal }]}>{t.subtitle}</Text>
          </View>
        </View>
        <View style={s.headerRight}>
          <Pressable onPress={() => setDark(d => !d)} style={[s.iconBtn, { backgroundColor: th.surfaceAlt }]}>
            <Text style={s.iconBtnText}>{dark ? '☀️' : '🌙'}</Text>
          </Pressable>
          <Pressable onPress={() => setLang(l => l === 'gr' ? 'en' : 'gr')} style={[s.iconBtn, { backgroundColor: th.surfaceAlt }]}>
            <Text style={[s.iconBtnLabel, { color: th.textPrimary }]}>{lang === 'gr' ? 'EN' : 'ΕΛ'}</Text>
          </Pressable>
        </View>
      </View>

      {/* Week indicator */}
      <View style={[s.weekBar, { backgroundColor: th.surfaceAlt }]}>
        <Pressable onPress={() => cycleWeek(-1, currentIndexRef.current)} style={s.weekArrow}>
          <Text style={[s.weekArrowText, { color: palette.teal }]}>‹</Text>
        </Pressable>
        <Text style={[s.weekLabel, { color: th.textPrimary }]}>
          {t.week(parseInt(selectedWeek.replace('week', ''), 10))}
        </Text>
        <Pressable onPress={() => cycleWeek(1, currentIndexRef.current)} style={s.weekArrow}>
          <Text style={[s.weekArrowText, { color: palette.teal }]}>›</Text>
        </Pressable>
      </View>

      {/* Day dots */}
      <View style={s.dotRow}>
        {DAY_KEYS.map((key, i) => {
          const isActive = i === currentDayIndex;
          return (
            <Pressable
              key={key}
              onPress={() => {
                flatListRef.current?.scrollToIndex({ index: i, animated: true });
                currentIndexRef.current = i;
                setCurrentDayIndex(i);
              }}
              style={s.dotWrap}
            >
              <Text style={[s.dotLabel, { color: key === todayKey ? palette.amber : th.textMuted }]}>
                {t.days[i]}
              </Text>
              <View style={[
                s.dot,
                { backgroundColor: key === todayKey ? palette.amber : th.border },
                isActive && { backgroundColor: palette.teal, transform: [{ scale: 1.3 }] },
              ]} />
            </Pressable>
          );
        })}
      </View>

      {/* Cards */}
      <FlatList
        ref={flatListRef}
        data={DAY_KEYS}
        renderItem={renderCard}
        keyExtractor={k => k}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_GAP}
        snapToAlignment="center"
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: PEEK }}
        ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
        onMomentumScrollEnd={onScrollEnd}
        getItemLayout={(_, i) => ({ length: CARD_WIDTH + CARD_GAP, offset: (CARD_WIDTH + CARD_GAP) * i, index: i })}
        style={{ flex: 1, marginTop: 8 }}
      />
    </SafeAreaView>
  );
}

// Subcomponents

function MealSection({
  label, meal, extra, t, th,
}: {
  label: string;
  meal: { first: string[]; main: string[] };
  extra?: string[];
  t: typeof i18n['gr'];
  th: Theme;
}) {
  return (
    <View style={s.mealSection}>
      <Text style={[s.mealSectionLabel, { color: palette.teal }]}>{label}</Text>

      <Text style={[s.mealSubLabel, { color: th.textMuted }]}>{t.main}</Text>
      {meal.main.map((item, i) => (
        <Text key={i} style={[s.mealItem, { color: th.textPrimary }]}>{item}</Text>
      ))}

      {meal.first.length > 0 && (
        <>
          <Text style={[s.mealSubLabel, { color: th.textMuted, marginTop: 10 }]}>{t.firstCourse}</Text>
          {meal.first.map((item, i) => (
            <Text key={i} style={[s.mealItem, { color: th.textSecondary }]}>{item}</Text>
          ))}
        </>
      )}

      {extra && extra.length > 0 && (
        <>
          <Text style={[s.mealSubLabel, { color: th.textMuted, marginTop: 10 }]}>{t.extra}</Text>
          {extra.map((item, i) => (
            <Text key={i} style={[s.mealItem, { color: th.textSecondary }]}>{item}</Text>
          ))}
        </>
      )}
    </View>
  );
}

// Styles

const s = StyleSheet.create({
  root:       { flex: 1 },
  // Header
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoImg:    { width: 40, height: 40, borderRadius: 10, overflow: 'hidden' },
  appTitle:   { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  appSubtitle:{ fontSize: 11, fontWeight: '500', letterSpacing: 0.3, marginTop: 1 },
  headerRight:{ flexDirection: 'row', gap: 8 },
  iconBtn:    { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  iconBtnText:{ fontSize: 16 },
  iconBtnLabel:{ fontSize: 13, fontWeight: '700' },
  // Week bar
  weekBar:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 16, borderRadius: 12, paddingVertical: 6, paddingHorizontal: 4, marginBottom: 8 },
  weekArrow:  { padding: 8 },
  weekArrowText: { fontSize: 22, fontWeight: '300', lineHeight: 24 },
  weekLabel:  { fontSize: 14, fontWeight: '700', letterSpacing: 0.2 },
  // Dot row
  dotRow:     { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 4 },
  dotWrap:    { alignItems: 'center', gap: 4 },
  dotLabel:   { fontSize: 10, fontWeight: '600' },
  dot:        { width: 6, height: 6, borderRadius: 3 },
  // Card
  card:       { borderRadius: 20, overflow: 'hidden' },
  cardContent:{ padding: 18, paddingBottom: 40 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', borderBottomWidth: 1, paddingBottom: 12, marginBottom: 14 },
  cardDay:    { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  cardDate:   { fontSize: 12, marginTop: 2 },
  todayBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  todayBadgeText: { fontSize: 11, fontWeight: '800', color: '#1a1a1a' },
  sectionDivider: { height: 1, marginVertical: 14 },
  noData:     { textAlign: 'center', marginTop: 40, fontSize: 14 },
  // Meal
  mealSection:   { marginBottom: 4 },
  mealSectionLabel: { fontSize: 15, fontWeight: '800', marginBottom: 8, letterSpacing: 0.2 },
  mealSubLabel:  { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 },
  mealItem:      { fontSize: 13, lineHeight: 20, marginBottom: 2 },
});