import { useCallback, useEffect, useMemo, useState } from 'react';
import { RawMenu, DayMenuRaw, LangText, getCachedRawMenu, loadRawMenu } from './menuService';

export interface Meal {
  first: string[];
  main: string[];
}

export interface DayMenu {
  lunch: Meal;
  dinner: Meal;
  lunchExtra: string[];
  dinnerExtra: string[];
}

export type WeekMenu = {
  [day: string]: DayMenu;
};

// Breakfast is the same every day (not part of the weekly rotation) — a flat
// map of category -> localized item names, e.g. { staples: [...], breads: [...] }.
export type BreakfastMenu = Record<string, string[]>;

export interface Menu {
  cycleWeeks: number;
  breakfast: BreakfastMenu;
  [week: string]: WeekMenu | BreakfastMenu | number;
}

type Lang = 'gr' | 'en';

function transformMeal(meal: any, lang: Lang): Meal {
  return {
    first: meal.first[lang],
    main: meal.main[lang],
  };
}

function transformBreakfast(raw: Record<string, LangText>, lang: Lang): BreakfastMenu {
  const result: BreakfastMenu = {};
  for (const category of Object.keys(raw)) {
    result[category] = raw[category][lang];
  }
  return result;
}

function transformWeek(week: Record<string, DayMenuRaw>, lang: Lang): WeekMenu {
  const result: WeekMenu = {};
  for (const day of Object.keys(week)) {
    result[day] = {
      lunch:       transformMeal(week[day].lunch, lang),
      dinner:      transformMeal(week[day].dinner, lang),
      lunchExtra:  week[day].lunchExtra?.[lang]  ?? [],
      dinnerExtra: week[day].dinnerExtra?.[lang] ?? [],
    };
  }
  return result;
}

export function buildMenu(raw: RawMenu, lang: Lang): Menu {
  const result: Menu = { cycleWeeks: raw.cycleWeeks, breakfast: transformBreakfast(raw.breakfast, lang) };
  for (let i = 1; i <= raw.cycleWeeks; i++) {
    const key = `week${i}`;
    result[key] = transformWeek(raw[key] as Record<string, DayMenuRaw>, lang);
  }
  return result;
}

// Loads the menu from the database, showing any cached copy instantly while
// a fresh copy is fetched in the background. `menu` is null only on a very
// first launch with no cache and no network yet.
export function useMenu(lang: Lang) {
  const [raw, setRaw] = useState<RawMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let haveData = false;

    setLoading(true);
    setError(null);

    (async () => {
      // Paint instantly from whatever's on disk, if anything.
      try {
        const cached = await getCachedRawMenu();
        if (cached) {
          haveData = true;
          if (!cancelled) {
            setRaw(cached);
            setLoading(false);
          }
        }
      } catch {
        // Ignore — loadRawMenu below is the source of truth either way.
      }

      // Then get the freshest copy the network will give us (loadRawMenu
      // already falls back to the cache internally if this can't reach the
      // network), so a menu change on the server — like the yearly
      // switch-over — shows up as soon as there's connectivity.
      try {
        const fresh = await loadRawMenu();
        haveData = true;
        if (!cancelled) {
          setRaw(fresh);
          setLoading(false);
          setError(null);
        }
      } catch (e) {
        if (!cancelled && !haveData) setError(e as Error);
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [attempt]);

  // Lets the UI offer a retry button when the very first load fails with
  // nothing cached yet (no network on a brand new install).
  const refresh = useCallback(() => setAttempt(a => a + 1), []);

  const menu = useMemo(() => (raw ? buildMenu(raw, lang) : null), [raw, lang]);

  return { menu, cycleWeeks: raw?.cycleWeeks ?? null, loading: loading && !raw, error, refresh };
}
