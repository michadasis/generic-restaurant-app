export type Lang = 'gr' | 'en';

export const i18n = {
  gr: {
    appTitle:    'Λέσχη UoWM',
    subtitle:    'Εβδομαδιαίο Μενού',
    week:        (n: number) => `${n}η Εβδομάδα`,
    days:        ['Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ', 'Κυρ'],
    fullDays:    ['Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο', 'Κυριακή'],
    lunch:       'Μεσημεριανό',
    dinner:      'Βραδινό',
    firstCourse: 'Πρώτο Πιάτο',
    mainCourse:  'Κυρίως Πιάτο',
    main:        'Κυρίως',
    side:        'Συνοδευτικό',
    extra:       'Επιδόρπιο',
    // Update modal
    updateTitle:    'Νέα Ενημέρωση',
    updateBody:     (v: string) => `Η έκδοση v${v} είναι διαθέσιμη.`,
    updateQuestion: 'Θέλεις να κατεβάσεις το νέο APK;',
    later:    'Αργότερα',
    download: 'Λήψη',
    // About
    aboutTitle: 'Σχετικά με την εφαρμογή',
    aboutDesc1: 'Η εφαρμογή αναπτύχθηκε για τους φοιτητές του Πανεπιστημίου Δυτικής Μακεδονίας, ώστε να έχουν πιο εύκολη πρόσβαση στο εβδομαδιαίο μενού.',
    aboutDesc2: 'Αναπτύχθηκε με React Native (Expo) και σχεδιάστηκε για κινητά.',
    aboutDesc3: 'Προγραμματίστηκε απο τον Μιχαδάση Ιωάννη, λογότυπο σχεδιασμένο απο την Μάκη Κατερίνα.',
    aboutGithub: 'GitHub',
    // Tab labels
    tabHome:  'Αρχική',
    tabAbout: 'Σχετικά',
  },
  en: {
    appTitle:    'UoWM Restaurant',
    subtitle:    'Weekly Menu',
    week:        (n: number) => `Week ${n}`,
    days:        ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    fullDays:    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    lunch:       'Lunch',
    dinner:      'Dinner',
    firstCourse: 'First Course',
    mainCourse:  'Main Course',
    main:        'Main',
    side:        'Side Dish',
    extra:       'Dessert',
    // Update modal
    updateTitle:    'New Update',
    updateBody:     (v: string) => `Version v${v} is available.`,
    updateQuestion: 'Would you like to download the new APK?',
    later:    'Later',
    download: 'Download',
    // About
    aboutTitle: 'About this app',
    aboutDesc1: "This app was developed for the University of Western Macedonia's students to have easier access to the weekly menu.",
    aboutDesc2: 'Developed with React Native and designed for mobile devices.',
    aboutDesc3: 'Programmed by Michadasis Ioannis, logo designed by Maki Katerina.',
    aboutGithub: 'GitHub',
    // Tab labels
    tabHome:  'Home',
    tabAbout: 'About',
  },
};