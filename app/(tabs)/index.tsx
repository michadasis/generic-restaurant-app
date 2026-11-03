import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AppState,
  Dimensions,
  FlatList,
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
import { useFocusEffect, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useMenu, WeekMenu, DayMenu } from '../../data/menu';
import { getDayKeyForDate } from '@/utils/getToday';
import { getWeekKeyForDate } from '@/utils/getWeek';
import { getClosureNotice } from '@/utils/getClosureNotice';
import { useUpdateChecker } from '@/hooks/useUpdateChecker';
import { UpdateModal } from '@/components/UpdateModal';
import { i18n, Lang } from '@/constants/i18n';
import { darkTheme, lightTheme, palette } from '@/constants/theme';
import { MealSection } from '@/components/MealSection';
import { BreakfastSection } from '@/components/BreakfastSection';
import { MenuSkeleton } from '@/components/MenuSkeleton';
import { PageHeader } from '@/components/PageHeader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PEEK = 20;
const CARD_GAP = 10;
const CARD_WIDTH = SCREEN_WIDTH - PEEK * 2;
const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;
const CARD_TOP_SPACING = 14; // must match s.card's marginTop
const CARD_BOTTOM_SPACING = 20; // gap between the card and the floating tab bar
// Card height is fixed to the measured available space, so on devices with a
// larger system font size the meal text can grow past it and force the card's
// internal ScrollView to scroll. Cap scaling on that text so it stays legible
// without ever pushing content past the fixed card height.
const CARD_FONT_SCALE_CAP = 1.3;

type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
const DAY_KEYS: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// The FlatList is padded with one card from the adjacent week on each side
// (the "buffer"). Their content is computed to be pixel-identical to what the
// real card at the landing index will show right after the week swap, so
// snapping to it (animated: false) the instant the swipe settles is invisible —
// swiping across a week boundary feels like scrolling to just another day.
type VirtualDay = { key: string; dayKey: DayKey; weekKey: string; weekDelta: number };

const dayStamp = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

const shiftWeekKey = (weekKey: string, dir: 1 | -1, cycleWeeks: number) => {
  const cur  = parseInt(weekKey.replace('week', ''), 10);
  const next = ((cur - 1 + dir + cycleWeeks) % cycleWeeks) + 1;
  return `week${next}`;
};

export default function HomeScreen() {
  const router = useRouter();
  const [lang, setLang]         = useState<Lang>('gr');
  const [dark, setDark]         = useState(true);
  const [showBreakfast, setShowBreakfast] = useState(false);
  const { updateInfo, dismiss } = useUpdateChecker();
  const { menu, cycleWeeks, loading: menuLoading, error: menuError, refresh: refreshMenu } = useMenu(lang);

  // "Today" is held in state rather than read from new Date() on every render:
  // the app can sit in memory for days, and everything below (selected week,
  // week offset, current card) is anchored to the day it was computed on. When
  // the date rolls over we re-anchor all of it at once in syncToday().
  const [today, setToday] = useState(() => new Date());
  const todayKey   = getDayKeyForDate(today);
  const todayIndex = DAY_KEYS.indexOf(todayKey);
  const todayStamp = dayStamp(today);

  // Measured height of the area below the dots row — cards size themselves to
  // fit exactly within it, so they never get clipped by the tab bar regardless
  // of how much space the header/notice bar/week bar take up.
  const [cardAreaHeight, setCardAreaHeight]   = useState(0);
  // Null until cycleWeeks arrives from the DB — no hardcoded cycle length to
  // compute a guess with in the meantime, see the effect below.
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
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

  // useFocusEffect (not a plain useEffect) so returning from the Settings
  // screen — where these are actually changed now — picks up the new values.
  useFocusEffect(useCallback(() => {
    AsyncStorage.multiGet(['lang', 'theme', 'showBreakfast']).then(pairs => {
      const map = Object.fromEntries(pairs);
      if (map.lang === 'en' || map.lang === 'gr') setLang(map.lang as Lang);
      if (map.theme !== null) setDark(map.theme === 'dark');
      setShowBreakfast(map.showBreakfast === 'true');
    });
  }, []));

  useEffect(() => { AsyncStorage.setItem('lang',  lang); }, [lang]);
  useEffect(() => { AsyncStorage.setItem('theme', dark ? 'dark' : 'light'); }, [dark]);

  // Seed selectedWeek as soon as we know the real cycle length — can't do
  // this synchronously at init since cycleWeeks only exists once the menu
  // has loaded from cache/network.
  useEffect(() => {
    if (cycleWeeks !== null && selectedWeek === null) {
      setSelectedWeek(getWeekKeyForDate(today, cycleWeeks));
    }
  }, [cycleWeeks, selectedWeek, today]);

  // If the calendar day changed while the app was backgrounded (or sitting on
  // another tab), snap everything back to the new today. The FlatList is keyed
  // on todayStamp, so it remounts and lands on the new day via
  // initialScrollIndex — no timed scrollToIndex needed.
  const syncToday = useCallback(() => {
    const now = new Date();
    if (dayStamp(now) === todayStamp) return;
    const idx = DAY_KEYS.indexOf(getDayKeyForDate(now)) + 1;
    pendingRecenter.current = null;
    currentIndexRef.current = idx;
    setToday(now);
    setCurrentDayIndex(idx);
    setWeekOffset(0);
    setSelectedWeek(cycleWeeks !== null ? getWeekKeyForDate(now, cycleWeeks) : null);
  }, [todayStamp, cycleWeeks]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') syncToday();
    });
    return () => sub.remove();
  }, [syncToday]);

  useFocusEffect(syncToday);

  const virtualDays: VirtualDay[] = useMemo(() => {
    if (selectedWeek === null || cycleWeeks === null) return [];
    const prevWeek = shiftWeekKey(selectedWeek, -1, cycleWeeks);
    const nextWeek = shiftWeekKey(selectedWeek, 1, cycleWeeks);
    return [
      { key: 'buffer-prev', dayKey: 'sunday', weekKey: prevWeek, weekDelta: -1 },
      ...DAY_KEYS.map(dayKey => ({ key: dayKey, dayKey, weekKey: selectedWeek, weekDelta: 0 })),
      { key: 'buffer-next', dayKey: 'monday', weekKey: nextWeek, weekDelta: 1 },
    ];
  }, [selectedWeek, cycleWeeks]);
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
  const closureNotice = getClosureNotice(today);

  // Day/date are known immediately (unlike the menu itself), so the loading
  // skeleton can show today's real header instead of a placeholder block —
  // it's always today's card since we land there right after data arrives.
  const todayFullDay = t.fullDays[todayIndex];
  const todayDateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}`;

  const goToDay = (localIndex: number) => {
    const target = localIndex + 1;
    if (target === currentIndexRef.current) return;
    flatListRef.current?.scrollToIndex({ index: target, animated: true });
    currentIndexRef.current = target;
    setCurrentDayIndex(target);
  };

  const onScrollEnd = (e: any) => {
    if (cycleWeeks === null) return;
    const offsetX = e.nativeEvent.contentOffset.x;
    const idx     = Math.round(offsetX / SNAP_INTERVAL);
    const clamped = Math.max(0, Math.min(idx, lastVirtualIndex));
    const wasUserDrag = didUserDrag.current;
    didUserDrag.current = false;

    if (wasUserDrag && clamped === lastVirtualIndex) {
      // Landed on the next-week-Monday buffer — commit the week forward.
      setSelectedWeek(prev => shiftWeekKey(prev!, 1, cycleWeeks));
      setWeekOffset(o => o + 1);
      pendingRecenter.current = 1;
      currentIndexRef.current = 1;
      setCurrentDayIndex(1);
    } else if (wasUserDrag && clamped === 0) {
      // Landed on the prev-week-Sunday buffer — commit the week back.
      setSelectedWeek(prev => shiftWeekKey(prev!, -1, cycleWeeks));
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
    const diff  = DAY_KEYS.indexOf(dayKey) - DAY_KEYS.indexOf(todayKey);
    const d     = new Date(today);
    d.setDate(today.getDate() + diff + (weekOffset + weekDelta) * 7);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const cardHeight = Math.max(0, cardAreaHeight - CARD_TOP_SPACING - CARD_BOTTOM_SPACING);

  const renderCard = ({ item }: { item: VirtualDay; index: number }) => {
    if (!menu) return null;
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
            <Text style={[s.cardDay, { color: th.textPrimary }]} maxFontSizeMultiplier={CARD_FONT_SCALE_CAP}>{fullDay}</Text>
            <Text style={[s.cardDate, { color: th.textMuted }]} maxFontSizeMultiplier={CARD_FONT_SCALE_CAP}>{dateStr}</Text>
          </View>
          {isToday && (
            <View style={[s.todayBadge, { backgroundColor: palette.amber }]}>
              <Text style={s.todayBadgeText} maxFontSizeMultiplier={CARD_FONT_SCALE_CAP}>{lang === 'gr' ? 'Σήμερα' : 'Today'}</Text>
            </View>
          )}
        </View>

        {showBreakfast && menu.breakfast && (
          <>
            <BreakfastSection breakfast={menu.breakfast} t={t} th={th} />
            <View style={[s.sectionDivider, { backgroundColor: th.border }]} />
          </>
        )}

        {dayMenu ? (
          <>
            <MealSection label={t.lunch} meal={dayMenu.lunch} extra={dayMenu.lunchExtra} t={t} th={th} />
            <View style={[s.sectionDivider, { backgroundColor: th.border }]} />
            <MealSection label={t.dinner} meal={dayMenu.dinner} extra={dayMenu.dinnerExtra} t={t} th={th} />
          </>
        ) : (
          <Text style={[s.noData, { color: th.textMuted }]} maxFontSizeMultiplier={CARD_FONT_SCALE_CAP}>—</Text>
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={[s.root, { backgroundColor: th.bg, paddingTop: safePT, paddingBottom: tabBarHeight }]}>
      {updateInfo && (
        <UpdateModal updateInfo={updateInfo} onDismiss={dismiss} darkMode={dark} lang={lang} />
      )}

      <PageHeader
        th={th}
        icon="app-logo"
        title={t.appTitle}
        subtitle={t.subtitle}
        right={
          <Pressable onPress={() => router.push('/Settings')} style={[s.iconBtn, { backgroundColor: th.surfaceAlt }]}>
            <Ionicons name="settings-outline" size={18} color={th.textPrimary} />
          </Pressable>
        }
      />

      {closureNotice && (
        <View style={[s.noticeBar, { backgroundColor: palette.amber }]}>
          <Text style={s.noticeText}>
            {closureNotice === 'closing' ? t.closingNotice : t.reopeningNotice}
          </Text>
        </View>
      )}

      {/* Wait for virtualDays too (selectedWeek is seeded one render after the
          menu arrives) so the FlatList mounts with all 9 items present and
          initialScrollIndex can land on today on the very first frame. */}
      {menu && virtualDays.length > 0 ? (
        <>
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
              key={todayStamp}
              ref={flatListRef}
              data={virtualDays}
              initialScrollIndex={todayIndex + 1}
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
        </>
      ) : menuError && !menuLoading ? (
        <View style={s.loadingWrap}>
          <Text style={[s.noData, { color: th.textMuted }]}>{t.menuLoadError}</Text>
          <Pressable onPress={refreshMenu} style={[s.iconBtn, { backgroundColor: th.surfaceAlt, marginTop: 14, paddingHorizontal: 16, width: undefined }]}>
            <Text style={[s.iconBtnLabel, { color: th.textPrimary }]}>{t.retry}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={s.skeletonWrap}>
          {/* Slivers of the adjacent days' cards peeking in from off-screen,
              matching the FlatList carousel's peek/snap layout once it's live. */}
          <View style={[s.skeletonSliver, s.skeletonSliverLeft, { backgroundColor: th.surface }]} />
          <View style={[s.skeletonSliver, s.skeletonSliverRight, { backgroundColor: th.surface }]} />

          <View style={[s.card, s.skeletonCard, { backgroundColor: th.surface }]}>
            <View style={s.skeletonContent}>
              <View style={[s.cardHeader, { borderBottomColor: th.border }]}>
                <View>
                  <Text style={[s.cardDay, { color: th.textPrimary }]}>{todayFullDay}</Text>
                  <Text style={[s.cardDate, { color: th.textMuted }]}>{todayDateStr}</Text>
                </View>
                <View style={[s.todayBadge, { backgroundColor: palette.amber }]}>
                  <Text style={s.todayBadgeText}>{lang === 'gr' ? 'Σήμερα' : 'Today'}</Text>
                </View>
              </View>
              <MenuSkeleton th={th} t={t} showHeader={false} padded={false} fill showBreakfast={showBreakfast} />
            </View>
          </View>
        </View>
      )}
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
  loadingWrap:{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  iconBtn:    { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
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
  skeletonWrap:   { flex: 1 },
  // Thin strips of card color peeking in from the screen edges — same width
  // as what's actually visible of a neighboring day's card in the real
  // carousel (PEEK minus the inter-card gap), so the loading state doesn't
  // look like a single static page the way the old full-bleed skeleton did.
  skeletonSliver: { position: 'absolute', top: CARD_TOP_SPACING, bottom: CARD_BOTTOM_SPACING, width: PEEK - CARD_GAP },
  skeletonSliverLeft:  { left: 0, borderTopRightRadius: 20, borderBottomRightRadius: 20 },
  skeletonSliverRight: { right: 0, borderTopLeftRadius: 20, borderBottomLeftRadius: 20 },
  skeletonCard:   { flex: 1, marginLeft: PEEK, marginRight: PEEK, marginBottom: CARD_BOTTOM_SPACING },
  skeletonContent:{ flex: 1, padding: 14, paddingBottom: 18 },
  cardContent:{ padding: 14, paddingBottom: 18 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', borderBottomWidth: 1, paddingBottom: 9, marginBottom: 11 },
  cardDay:    { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  cardDate:   { fontSize: 13, marginTop: 1 },
  todayBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  todayBadgeText: { fontSize: 11, fontWeight: '800', color: '#1a1a1a' },
  sectionDivider: { height: 1, marginVertical: 9 },
  noData:     { textAlign: 'center', marginTop: 40, fontSize: 15 },
});