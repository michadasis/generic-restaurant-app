type DayKey = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

const DAYS_BY_JS_INDEX: DayKey[] = [
  "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",
];

export function getDayKeyForDate(date: Date): DayKey {
  return DAYS_BY_JS_INDEX[date.getDay()];
}

export function getTodayKey(): DayKey {
  return getDayKeyForDate(new Date());
}

export function getTodayLabel(lang: 'gr' | 'en' = 'gr'): string {
  const labels: Record<'gr' | 'en', Record<DayKey, string>> = {
    gr: {
      monday: "Δευτέρα", tuesday: "Τρίτη", wednesday: "Τετάρτη",
      thursday: "Πέμπτη", friday: "Παρασκευή", saturday: "Σάββατο", sunday: "Κυριακή",
    },
    en: {
      monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday",
      thursday: "Thursday", friday: "Friday", saturday: "Saturday", sunday: "Sunday",
    },
  };
  return labels[lang][getTodayKey()];
}