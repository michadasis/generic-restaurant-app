// Generalized form of getCurrentWeekKey — works for any date, past or
// future, so the calendar screen can look up a week from a picked date
// the same way the home screen looks up the current one.
export const getWeekKeyForDate = (date: Date, cycleWeeks: number): string => {
  const startDate = new Date(2025, 8, 8); // Sep 8 2025
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((target.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const weeksElapsed = Math.floor(diffDays / 7);
  const weekInCycle = (((weeksElapsed % cycleWeeks) + cycleWeeks) % cycleWeeks) + 1;
  return `week${weekInCycle}`;
};

export const getCurrentWeekKey = (cycleWeeks: number): string => getWeekKeyForDate(new Date(), cycleWeeks);

export const getPreviousWeekKey = (cycleWeeks: number): string => {
  const current = parseInt(getCurrentWeekKey(cycleWeeks).replace('week', ''), 10);
  const previous = ((current - 2 + cycleWeeks) % cycleWeeks) + 1;
  return `week${previous}`;
};
