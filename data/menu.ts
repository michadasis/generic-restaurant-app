import { menu as raw } from '../data/restaurantMenu';

export interface Meal {
  first: string[];
  main: string[];
}

export interface DayMenu {
  lunch: Meal;
  dinner: Meal;
  extra: string[];
}

export type WeekMenu = {
  [day: string]: DayMenu;
};

export interface Menu {
  cycleWeeks: number;
  [week: string]: WeekMenu | number;
}

type Lang = 'gr' | 'en';

function transformMeal(meal: any, lang: Lang): Meal {
  return {
    first: meal.first[lang],
    main: meal.main[lang],
  };
}

function transformWeek(week: any, lang: Lang): WeekMenu {
  const result: WeekMenu = {};
  for (const day of Object.keys(week)) {
    result[day] = {
      lunch: transformMeal(week[day].lunch, lang),
      dinner: transformMeal(week[day].dinner, lang),
      extra: week[day].extra[lang],
    };
  }
  return result;
}

export function buildMenu(lang: Lang): Menu {
  const result: Menu = { cycleWeeks: raw.cycleWeeks };
  for (let i = 1; i <= raw.cycleWeeks; i++) {
    const key = `week${i}`;
    result[key] = transformWeek((raw as any)[key], lang);
  }
  return result;
}

export const CYCLE_WEEKS: number = raw.cycleWeeks;

export const menu: Menu = buildMenu('gr');