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
    now:         'ΤΩΡΑ',
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
    tabHome:     'Αρχική',
    tabCalendar: 'Ημερολόγιο',
    tabAbout:    'Σχετικά',
    // Seasonal closure notice
    closingNotice:  'Η λέσχη ενδέχεται να είναι κλειστή αυτή την περίοδο λόγω καλοκαιρινού διαλείμματος.',
    reopeningNotice:'Η λέσχη ενδέχεται να μην έχει ανοίξει ακόμα για τη νέα ακαδημαϊκή χρονιά.',
    // Calendar screen
    calendarSubtitle: 'Δες το μενού οποιασδήποτε ημέρας',
    today:    'Σήμερα',
    months: ['Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος',
             'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'],
  },
  en: {
    appTitle:    'UoWM Restaurant',
    subtitle:    'Weekly Menu',
    week:        (n: number) => `Week ${n}`,
    days:        ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    fullDays:    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    lunch:       'Lunch',
    dinner:      'Dinner',
    now:         'NOW',
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
    tabHome:     'Home',
    tabCalendar: 'Calendar',
    tabAbout:    'About',
    // Seasonal closure notice
    closingNotice:  'The restaurant might be closed at this time due to the summer break.',
    reopeningNotice:'The restaurant may not have reopened yet for the new academic year.',
    // Calendar screen
    calendarSubtitle: "View any day's menu",
    today:    'Today',
    months: ['January', 'February', 'March', 'April', 'May', 'June',
             'July', 'August', 'September', 'October', 'November', 'December'],
  },
};