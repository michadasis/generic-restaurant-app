import { menu, Menu } from '../data/menu';

// Generalized form of getCurrentWeekKey — works for any date, past or
// future, so the calendar screen can look up a week from a picked date
// the same way the home screen looks up the current one.
export const getWeekKeyForDate = (date: Date, menuData?: Menu): string => {
  const data = menuData ?? menu;
  const { cycleWeeks } = data;
  const startDate = new Date(2025, 8, 8); // Sep 8 2025
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((target.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const weeksElapsed = Math.floor(diffDays / 7);
  const weekInCycle = (((weeksElapsed % cycleWeeks) + cycleWeeks) % cycleWeeks) + 1;
  const key = `week${weekInCycle}`;
  return data[key] ? key : 'week1';
};

export const getCurrentWeekKey = (menuData?: Menu): string => getWeekKeyForDate(new Date(), menuData);

export const getPreviousWeekKey = (menuData?: Menu): string => {
  const data = menuData ?? menu;
  const { cycleWeeks } = data;
  const current = parseInt(getCurrentWeekKey(data).replace('week', ''), 10);
  const previous = ((current - 2 + cycleWeeks) % cycleWeeks) + 1;
  const key = `week${previous}`;
  return data[key] ? key : 'week1';
};