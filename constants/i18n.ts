export type Lang = 'gr' | 'en';

export const i18n = {
  gr: {
    // Header
    subtitle: 'Εβδομαδιαίο Μενού',
    // Week selector
    week: (n: number) => `${n}η Εβδομάδα`,
    // Day labels
    days: ['Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ', 'Κυρ'],
    // Meal sections
    lunch: 'Μεσημεριανό',
    dinner: 'Βραδινό',
    firstCourse: 'Πρώτο Πιάτο',
    mainCourse: 'Κυρίως Πιάτο',
    // Update modal
    updateTitle: 'Νέα Ενημέρωση',
    updateBody: (v: string) => `Η έκδοση v${v} είναι διαθέσιμη.`,
    updateQuestion: 'Θέλεις να κατεβάσεις το νέο APK;',
    later: 'Αργότερα',
    download: 'Λήψη',
  },
  en: {
    // Header
    subtitle: 'Weekly Menu',
    // Week selector
    week: (n: number) => `Week ${n}`,
    // Day labels
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    // Meal sections
    lunch: 'Lunch',
    dinner: 'Dinner',
    firstCourse: 'First Course',
    mainCourse: 'Main Course',
    // Update modal
    updateTitle: 'New Update',
    updateBody: (v: string) => `Version v${v} is available.`,
    updateQuestion: 'Would you like to download the new APK?',
    later: 'Later',
    download: 'Download',
  },
};