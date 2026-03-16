type DayKey = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export function getTodayKey(): DayKey {
  const days: DayKey[] = [
    "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",
  ];
  return days[new Date().getDay()];
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