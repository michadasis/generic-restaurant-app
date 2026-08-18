import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WidgetTaskHandler } from 'react-native-android-widget';
import * as React from 'react';
import { i18n, type Lang } from '../constants/i18n';
import { buildMenu, type DayMenu } from '../data/menu';
import { getTodayKey } from '../utils/getToday';
import { getCurrentWeekKey } from '../utils/getWeek';
import { TodayMenuCompactWidget } from './TodayMenuCompactWidget';
import { TodayMenuFullWidget } from './TodayMenuFullWidget';

const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

async function getLang(): Promise<Lang> {
  const stored = await AsyncStorage.getItem('lang');
  return stored === 'en' ? 'en' : 'gr';
}

function getTodayContext(lang: Lang) {
  const t = i18n[lang];
  const menu = buildMenu(lang);
  const dayKey = getTodayKey();
  const weekKey = getCurrentWeekKey(menu);
  const dayMenu = (menu[weekKey] as Record<string, DayMenu> | undefined)?.[dayKey];
  const dayLabel = t.fullDays[DAY_KEYS.indexOf(dayKey as (typeof DAY_KEYS)[number])];
  return { t, dayMenu, dayLabel };
}

export const widgetTaskHandler: WidgetTaskHandler = async ({
  widgetInfo,
  widgetAction,
  renderWidget,
}) => {
  if (widgetAction === 'WIDGET_DELETED') return;

  const lang = await getLang();
  const { t, dayMenu, dayLabel } = getTodayContext(lang);

  if (!dayMenu) return;

  if (widgetInfo.widgetName === 'TodayMenuCompact') {
    // Lunch window is 09:00-15:30; dinner covers the rest, wrapping past midnight.
    const now = new Date();
    const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
    const isLunch = minutesSinceMidnight >= 9 * 60 && minutesSinceMidnight < 15 * 60 + 30;
    const meal = isLunch ? dayMenu.lunch : dayMenu.dinner;
    const mealLabel = isLunch ? t.lunch : t.dinner;

    renderWidget({
      light: React.createElement(TodayMenuCompactWidget, {
        dayLabel,
        mealLabel,
        main: meal.main,
        dark: false,
      }),
      dark: React.createElement(TodayMenuCompactWidget, {
        dayLabel,
        mealLabel,
        main: meal.main,
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
      lunch: { label: t.lunch, main: dayMenu.lunch.main, first: dayMenu.lunch.first },
      dinner: { label: t.dinner, main: dayMenu.dinner.main, first: dayMenu.dinner.first },
      dark: false,
    }),
    dark: React.createElement(TodayMenuFullWidget, {
      dayLabel,
      mainLabel: t.main,
      firstLabel: t.firstCourse,
      lunch: { label: t.lunch, main: dayMenu.lunch.main, first: dayMenu.lunch.first },
      dinner: { label: t.dinner, main: dayMenu.dinner.main, first: dayMenu.dinner.first },
      dark: true,
    }),
  });
};
