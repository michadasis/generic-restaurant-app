import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WidgetTaskHandler } from 'react-native-android-widget';
import * as React from 'react';
import { i18n, type Lang } from '../constants/i18n';
import { buildMenu, type DayMenu } from '../data/menu';
import { loadRawMenu } from '../data/menuService';
import { getTodayKey } from '../utils/getToday';
import { getCurrentWeekKey } from '../utils/getWeek';
import { TodayMenuCompactWidget } from './TodayMenuCompactWidget';
import { TodayMenuFullWidget } from './TodayMenuFullWidget';

const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

async function getLang(): Promise<Lang> {
  const stored = await AsyncStorage.getItem('lang');
  return stored === 'en' ? 'en' : 'gr';
}

async function getTodayContext(lang: Lang) {
  const t = i18n[lang];
  // Network-first with a cache fallback (see data/menuService.ts) — picks up
  // menu changes on its own refresh schedule without needing the app opened,
  // and still renders from the last-known copy if there's no connectivity.
  const raw = await loadRawMenu();
  const menu = buildMenu(raw, lang);
  const dayKey = getTodayKey();
  const weekKey = getCurrentWeekKey(raw.cycleWeeks);
  const dayMenu = (menu[weekKey] as Record<string, DayMenu> | undefined)?.[dayKey];
  const dayLabel = t.fullDays[DAY_KEYS.indexOf(dayKey as (typeof DAY_KEYS)[number])];
  return { t, dayMenu, dayLabel };
}

// Lunch window is 09:00-15:30; dinner covers the rest, wrapping past midnight.
function isLunchTime(): boolean {
  const now = new Date();
  const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
  return minutesSinceMidnight >= 9 * 60 && minutesSinceMidnight < 15 * 60 + 30;
}

export const widgetTaskHandler: WidgetTaskHandler = async ({
  widgetInfo,
  widgetAction,
  renderWidget,
}) => {
  if (widgetAction === 'WIDGET_DELETED') return;

  const lang = await getLang();
  let context: Awaited<ReturnType<typeof getTodayContext>>;
  try {
    context = await getTodayContext(lang);
  } catch {
    // No cache yet and no network reachable — nothing to render this cycle;
    // the widget keeps showing whatever it last successfully rendered.
    return;
  }
  const { t, dayMenu, dayLabel } = context;

  if (!dayMenu) return;

  const isLunch = isLunchTime();

  if (widgetInfo.widgetName === 'TodayMenuCompact') {
    const meal = isLunch ? dayMenu.lunch : dayMenu.dinner;
    const mealLabel = isLunch ? t.lunch : t.dinner;

    renderWidget({
      light: React.createElement(TodayMenuCompactWidget, {
        dayLabel,
        mealLabel,
        main: meal.main,
        isLunch,
        dark: false,
      }),
      dark: React.createElement(TodayMenuCompactWidget, {
        dayLabel,
        mealLabel,
        main: meal.main,
        isLunch,
        dark: true,
      }),
    });
    return;
  }

  renderWidget({
    light: React.createElement(TodayMenuFullWidget, {
      dayLabel,
      mainLabel: t.main,
      firstLabel: t.firstCourse,
      nowLabel: t.now,
      lunch: { label: t.lunch, main: dayMenu.lunch.main, first: dayMenu.lunch.first },
      dinner: { label: t.dinner, main: dayMenu.dinner.main, first: dayMenu.dinner.first },
      isLunchNow: isLunch,
      dark: false,
    }),
    dark: React.createElement(TodayMenuFullWidget, {
      dayLabel,
      mainLabel: t.main,
      firstLabel: t.firstCourse,
      nowLabel: t.now,
      lunch: { label: t.lunch, main: dayMenu.lunch.main, first: dayMenu.lunch.first },
      dinner: { label: t.dinner, main: dayMenu.dinner.main, first: dayMenu.dinner.first },
      isLunchNow: isLunch,
      dark: true,
    }),
  });
};
