export function getCurrentWeekIndex(): number {
//year, month(0-11), day | adding/subtracting 7 from this date moves the menu a week forward/back
  const startDate = new Date(2025, 0, 6);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7) % 4;
}
