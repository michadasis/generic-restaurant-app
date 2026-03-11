import { menu, Menu } from '../data/menu';

export const getCurrentWeekKey = (menuData: Menu = menu): string => {
  const { cycleWeeks } = menuData;
  const startDate = new Date(2025, 0, 6);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const weeksElapsed = Math.floor(diffDays / 7);
  const weekInCycle = (weeksElapsed % cycleWeeks) + 1;
  const key = `week${weekInCycle}`;
  return menuData[key] ? key : 'week1';
};

export const getPreviousWeekKey = (menuData: Menu = menu): string => {
  const { cycleWeeks } = menuData;
  const current = parseInt(getCurrentWeekKey(menuData).replace('week', ''), 10);
  const previous = ((current - 2 + cycleWeeks) % cycleWeeks) + 1;
  const key = `week${previous}`;
  return menuData[key] ? key : 'week1';
};