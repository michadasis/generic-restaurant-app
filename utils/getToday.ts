type DayKey = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export function getTodayKey(): DayKey {
  const days: DayKey[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const today = new Date().getDay();
  return days[today];
}

export function getTodayLabel(): string {
  const labels: Record<DayKey, string> = {
    monday: "Δευτέρα",
    tuesday: "Τρίτη",
    wednesday: "Τετάρτη",
    thursday: "Πέμπτη",
    friday: "Παρασκευή",
    saturday: "Σάββατο",
    sunday: "Κυριακή",
  };

  return labels[getTodayKey()];
}