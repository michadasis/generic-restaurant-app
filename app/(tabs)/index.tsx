import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { buildMenu, CYCLE_WEEKS, WeekMenu, DayMenu } from '../../data/menu';
import { getTodayKey } from '@/utils/getToday';
import { getCurrentWeekKey } from '@/utils/getWeek';
import { getClosureNotice } from '@/utils/getClosureNotice';
import { useUpdateChecker } from '@/hooks/useUpdateChecker';
import { UpdateModal } from '@/components/UpdateModal';
import { i18n, Lang } from '@/constants/i18n';
import { darkTheme, lightTheme, palette } from '@/constants/theme';
import { MealSection } from '@/components/MealSection';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PEEK = 20;
const CARD_GAP = 10;
const CARD_WIDTH = SCREEN_WIDTH - PEEK * 2;
const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;
const CARD_TOP_SPACING = 14; // must match s.card's marginTop

type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
const DAY_KEYS: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// The FlatList is padded with one card from the adjacent week on each side
// (the "buffer"). Their content is computed to be pixel-identical to what the
// real card at the landing index will show right after the week swap, so
// snapping to it (animated: false) the instant the swipe settles is invisible —
// swiping across a week boundary feels like scrolling to just another day.
type VirtualDay = { key: string; dayKey: DayKey; weekKey: string; weekDelta: number };

const shiftWeekKey = (weekKey: string, dir: 1 | -1) => {
  const cur  = parseInt(weekKey.replace('week', ''), 10);
  const next = ((cur - 1 + dir + CYCLE_WEEKS) % CYCLE_WEEKS) + 1;
  return `week${next}`;
};

export default function HomeScreen() {
  const [lang, setLang]         = useState<Lang>('gr');
  const [dark, setDark]         = useState(true);
  const { updateInfo, dismiss } = useUpdateChecker();

  const todayKey   = getTodayKey();
  const todayIndex = DAY_KEYS.indexOf(todayKey);

  // Measured height of the area below the dots row — cards size themselves to
  // fit exactly within it, so they never get clipped by the tab bar regardless
  // of how much space the header/notice bar/week bar take up.
  const [cardAreaHeight, setCardAreaHeight]   = useState(0);
  const [selectedWeek, setSelectedWeek] = useState<string>(getCurrentWeekKey());
  // Number of real calendar weeks the selected week is from the current one (can go negative).
  const [weekOffset, setWeekOffset]     = useState(0);
  // Index into virtualDays (0 = prev-week buffer, 1..7 = Mon..Sun, 8 = next-week buffer).
  const [currentDayIndex, setCurrentDayIndex] = useState(todayIndex + 1);
  const currentIndexRef = useRef(todayIndex + 1);
  const flatListRef     = useRef<FlatList>(null);
  // Only true while the FlatList is being scrolled by an actual touch drag —
  // never set for programmatic scrollToIndex calls (dot taps, week-cycle landing).
  const didUserDrag      = useRef(false);
  // Set right before a week swap; the effect below fires once virtualDays has
  // re-rendered for the new selectedWeek and silently re-centers the scroll
  // position from the buffer card onto its real-card equivalent.
  const pendingRecenter  = useRef<number | null>(null);

  const safePT = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;
  // The tab bar floats over the screen (position: 'absolute' in the tabs layout),
  // so its height isn't reserved automatically — pad the bottom ourselves.
  const tabBarHeight = useBottomTabBarHeight();

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
      flatListRef.current?.scrollToIndex({ index: todayIndex + 1, animated: false });
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const virtualDays: VirtualDay[] = useMemo(() => {
    const prevWeek = shiftWeekKey(selectedWeek, -1);
    const nextWeek = shiftWeekKey(selectedWeek, 1);
    return [
      { key: 'buffer-prev', dayKey: 'sunday', weekKey: prevWeek, weekDelta: -1 },
      ...DAY_KEYS.map(dayKey => ({ key: dayKey, dayKey, weekKey: selectedWeek, weekDelta: 0 })),
      { key: 'buffer-next', dayKey: 'monday', weekKey: nextWeek, weekDelta: 1 },
    ];
  }, [selectedWeek]);
  const lastVirtualIndex = virtualDays.length - 1;

  // Fires after a week swap re-renders virtualDays; lands the scroll on the
  // real card that already matches what the buffer card was showing.
  useEffect(() => {
    if (pendingRecenter.current !== null) {
      const index = pendingRecenter.current;
      pendingRecenter.current = null;
      flatListRef.current?.scrollToIndex({ index, animated: false });
    }
  }, [selectedWeek]);

  const th = dark ? darkTheme : lightTheme;
  const t  = i18n[lang];
  const menu = buildMenu(lang);
  const closureNotice = getClosureNotice();

  const goToDay = (localIndex: number) => {
    const target = localIndex + 1;
    if (target === currentIndexRef.current) return;
    flatListRef.current?.scrollToIndex({ index: target, animated: true });
    currentIndexRef.current = target;
    setCurrentDayIndex(target);
  };

  const onScrollEnd = (e: any) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const idx     = Math.round(offsetX / SNAP_INTERVAL);
    const clamped = Math.max(0, Math.min(idx, lastVirtualIndex));
    const wasUserDrag = didUserDrag.current;
    didUserDrag.current = false;

    if (wasUserDrag && clamped === lastVirtualIndex) {
      // Landed on the next-week-Monday buffer — commit the week forward.
      setSelectedWeek(prev => shiftWeekKey(prev, 1));
      setWeekOffset(o => o + 1);
      pendingRecenter.current = 1;
      currentIndexRef.current = 1;
      setCurrentDayIndex(1);
    } else if (wasUserDrag && clamped === 0) {
      // Landed on the prev-week-Sunday buffer — commit the week back.
      setSelectedWeek(prev => shiftWeekKey(prev, -1));
      setWeekOffset(o => o - 1);
      pendingRecenter.current = lastVirtualIndex - 1;
      currentIndexRef.current = lastVirtualIndex - 1;
      setCurrentDayIndex(lastVirtualIndex - 1);
    } else {
      currentIndexRef.current = clamped;
      setCurrentDayIndex(clamped);
    }
  };

  const getDayDate = (dayKey: DayKey, weekDelta: number) => {
    const now   = new Date();
    const diff  = DAY_KEYS.indexOf(dayKey) - DAY_KEYS.indexOf(todayKey);
    const d     = new Date(now);
    d.setDate(now.getDate() + diff + (weekOffset + weekDelta) * 7);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const cardHeight = Math.max(0, cardAreaHeight - CARD_TOP_SPACING);

  const renderCard = ({ item }: { item: VirtualDay; index: number }) => {
    const { dayKey, weekKey, weekDelta } = item;
    const dayMenu = (menu[weekKey] as WeekMenu)?.[dayKey] as DayMenu;
    const isToday = dayKey === todayKey && weekOffset + weekDelta === 0;
    const dateStr = getDayDate(dayKey, weekDelta);
    const fullDay = t.fullDays[DAY_KEYS.indexOf(dayKey)];

    return (
      <ScrollView
        style={[s.card, { width: CARD_WIDTH, height: cardHeight, backgroundColor: th.surface }]}
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
            <MealSection label={t.lunch} meal={dayMenu.lunch} extra={dayMenu.lunchExtra} t={t} th={th} />
            <View style={[s.sectionDivider, { backgroundColor: th.border }]} />
            <MealSection label={t.dinner} meal={dayMenu.dinner} extra={dayMenu.dinnerExtra} t={t} th={th} />
          </>
        ) : (
          <Text style={[s.noData, { color: th.textMuted }]}>—</Text>
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={[s.root, { backgroundColor: th.bg, paddingTop: safePT, paddingBottom: tabBarHeight }]}>
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

      {closureNotice && (
        <View style={[s.noticeBar, { backgroundColor: palette.amber }]}>
          <Text style={s.noticeText}>
            {closureNotice === 'closing' ? t.closingNotice : t.reopeningNotice}
          </Text>
        </View>
      )}

      {/* Day dots */}
      <View style={s.dotRow}>
        {DAY_KEYS.map((key, i) => {
          // currentDayIndex briefly visits the buffer slots (0, lastVirtualIndex)
          // for a single frame right as a week swap commits — map those back to
          // the real day they represent (Sunday / Monday) so the dots stay correct.
          const normalized =
            currentDayIndex === 0 ? DAY_KEYS.length - 1 :
            currentDayIndex === lastVirtualIndex ? 0 :
            currentDayIndex - 1;
          const isActive = i === normalized;
          const isToday  = key === todayKey && weekOffset === 0;
          return (
            <Pressable
              key={key}
              onPress={() => goToDay(i)}
              style={s.dotWrap}
            >
              <Text style={[s.dotLabel, { color: isActive ? palette.teal : isToday ? palette.amber : th.textMuted }]}>
                {t.days[i]}
              </Text>
              <DayDot isActive={isActive} isToday={isToday} idleColor={th.border} />
            </Pressable>
          );
        })}
      </View>

      {/* Cards */}
      <View
        style={{ flex: 1 }}
        onLayout={e => setCardAreaHeight(e.nativeEvent.layout.height)}
      >
        <FlatList
          ref={flatListRef}
          data={virtualDays}
          renderItem={renderCard}
          keyExtractor={item => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToOffsets={virtualDays.map((_, i) => i * SNAP_INTERVAL)}
          decelerationRate="fast"
          contentContainerStyle={{ paddingLeft: PEEK, paddingRight: PEEK - CARD_GAP }}
          onScrollBeginDrag={() => { didUserDrag.current = true; }}
          onMomentumScrollEnd={onScrollEnd}
          getItemLayout={(_, i) => ({ length: SNAP_INTERVAL, offset: SNAP_INTERVAL * i, index: i })}
          style={{ flex: 1 }}
        />
      </View>
    </SafeAreaView>
  );
}

// Subcomponents

function DayDot({ isActive, isToday, idleColor }: { isActive: boolean; isToday: boolean; idleColor: string }) {
  const progress = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isActive ? 1 : 0, { duration: 220, easing: Easing.out(Easing.cubic) });
  }, [isActive, progress]);

  const restColor = isToday ? palette.amber : idleColor;

  const style = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [restColor, palette.teal]),
    transform: [{ scale: 1 + progress.value * 0.3 }],
  }));

  return <Animated.View style={[s.dot, style]} />;
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
  // Seasonal closure notice
  noticeBar:  { marginHorizontal: 16, marginBottom: 8, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12 },
  noticeText: { fontSize: 12.5, fontWeight: '700', color: '#1a1a1a', lineHeight: 17 },
  // Dot row
  dotRow:     { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 4, marginBottom: 4 },
  dotWrap:    { alignItems: 'center', gap: 4 },
  dotLabel:   { fontSize: 10, fontWeight: '600' },
  dot:        { width: 6, height: 6, borderRadius: 3 },
  // Card
  card:       { borderRadius: 20, overflow: 'hidden', marginRight: CARD_GAP, marginTop: CARD_TOP_SPACING },
  cardContent:{ padding: 14, paddingBottom: 18 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', borderBottomWidth: 1, paddingBottom: 9, marginBottom: 11 },
  cardDay:    { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  cardDate:   { fontSize: 13, marginTop: 1 },
  todayBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  todayBadgeText: { fontSize: 11, fontWeight: '800', color: '#1a1a1a' },
  sectionDivider: { height: 1, marginVertical: 9 },
  noData:     { textAlign: 'center', marginTop: 40, fontSize: 15 },
});