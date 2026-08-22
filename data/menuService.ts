import AsyncStorage from '@react-native-async-storage/async-storage';

// Public, RLS-protected values only — see TEMP_FOLDER/.env for the full
// credential set. The service_role key, JWT secret and raw Postgres
// password must never appear here or anywhere in the app bundle: this
// project's tables grant the anon key SELECT only (enforced by Postgres
// Row Level Security), so it's safe to ship on-device.
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const CACHE_KEY = 'menuCache';

export interface LangText {
  gr: string[];
  en: string[];
}

export interface MealRaw {
  first: LangText;
  main: LangText;
}

export interface DayMenuRaw {
  lunch: MealRaw;
  dinner: MealRaw;
  lunchExtra: LangText;
  dinnerExtra: LangText;
}

export interface RawMenu {
  cycleWeeks: number;
  breakfast: Record<string, LangText>;
  [week: string]: Record<string, DayMenuRaw> | number | Record<string, LangText>;
}

type MenuItemRow = {
  week_num: number;
  day_name: string;
  meal_type: 'lunch' | 'dinner';
  course: 'first' | 'main' | 'extra';
  position: number;
  item_gr: string;
  item_en: string;
};

type BreakfastRow = {
  category: string;
  position: number;
  item_gr: string;
  item_en: string;
};

const FETCH_TIMEOUT_MS = 8000;

async function restFetch<T>(path: string): Promise<T> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase env vars are not configured (EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY).');
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`Supabase request failed (${res.status}): ${path}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function emptyMeal(): MealRaw {
  return { first: { gr: [], en: [] }, main: { gr: [], en: [] } };
}

function emptyDay(): DayMenuRaw {
  return {
    lunch: emptyMeal(),
    dinner: emptyMeal(),
    lunchExtra: { gr: [], en: [] },
    dinnerExtra: { gr: [], en: [] },
  };
}

export async function fetchRawMenu(): Promise<RawMenu> {
  const [metaRows, breakfastRows, menuRows] = await Promise.all([
    restFetch<{ cycle_weeks: number }[]>('menu_meta?select=cycle_weeks&id=eq.1'),
    restFetch<BreakfastRow[]>('breakfast_items?select=category,position,item_gr,item_en'),
    restFetch<MenuItemRow[]>('menu_items?select=week_num,day_name,meal_type,course,position,item_gr,item_en'),
  ]);

  if (!metaRows[0]) {
    throw new Error('menu_meta has no row (id=1) — cannot determine cycle_weeks.');
  }
  const cycleWeeks = metaRows[0].cycle_weeks;

  const breakfast: Record<string, LangText> = {};
  for (const row of [...breakfastRows].sort((a, b) => a.position - b.position)) {
    const bucket = (breakfast[row.category] ??= { gr: [], en: [] });
    bucket.gr.push(row.item_gr);
    bucket.en.push(row.item_en);
  }

  const raw: RawMenu = { cycleWeeks, breakfast };
  for (let i = 1; i <= cycleWeeks; i++) raw[`week${i}`] = {} as Record<string, DayMenuRaw>;

  for (const row of [...menuRows].sort((a, b) => a.position - b.position)) {
    const weekKey = `week${row.week_num}`;
    const week = raw[weekKey] as Record<string, DayMenuRaw> | undefined;
    if (!week) continue;
    const day = (week[row.day_name] ??= emptyDay());

    if (row.course === 'extra') {
      const bucket = row.meal_type === 'lunch' ? day.lunchExtra : day.dinnerExtra;
      bucket.gr.push(row.item_gr);
      bucket.en.push(row.item_en);
    } else {
      const bucket = day[row.meal_type][row.course as 'first' | 'main'];
      bucket.gr.push(row.item_gr);
      bucket.en.push(row.item_en);
    }
  }

  return raw;
}

function isRawMenu(value: any): value is RawMenu {
  if (!value || typeof value !== 'object') return false;
  if (typeof value.cycleWeeks !== 'number' || value.cycleWeeks < 1) return false;
  if (!value.breakfast || typeof value.breakfast !== 'object') return false;
  for (let i = 1; i <= value.cycleWeeks; i++) {
    if (!value[`week${i}`] || typeof value[`week${i}`] !== 'object') return false;
  }
  return true;
}

export async function getCachedRawMenu(): Promise<RawMenu | null> {
  try {
    const json = await AsyncStorage.getItem(CACHE_KEY);
    if (!json) return null;
    const parsed = JSON.parse(json);
    if (!isRawMenu(parsed)) {
      // Written by an app version with a different RawMenu shape, or
      // corrupted — don't trust it, and clear it so we don't keep tripping
      // on it. Nothing here needs manual bumping: isRawMenu checks the
      // shape the *current* code actually expects, so it rejects anything
      // else automatically.
      await AsyncStorage.removeItem(CACHE_KEY).catch(() => {});
      return null;
    }
    return parsed;
  } catch {
    // Malformed JSON or a storage read error — treat exactly like a cache miss.
    await AsyncStorage.removeItem(CACHE_KEY).catch(() => {});
    return null;
  }
}

export async function cacheRawMenu(raw: RawMenu): Promise<void> {
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(raw));
}

// Network-first with a cache fallback: always tries to pick up the latest
// menu (e.g. the yearly switch-over around the start of January) first,
// and only falls back to the last cached copy when there's no connectivity
// or the request times out — that's what keeps the app and the widget
// (which refreshes itself on its own schedule, not just when the app is
// opened) both working offline without going stale forever once online.
export async function loadRawMenu(): Promise<RawMenu> {
  try {
    const fresh = await fetchRawMenu();
    await cacheRawMenu(fresh);
    return fresh;
  } catch (networkError) {
    const cached = await getCachedRawMenu();
    if (cached) return cached;
    throw networkError;
  }
}
