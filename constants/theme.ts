// Color palette derived from the UoWM Canteen logo
// Teal background + amber/gold accents

export const palette = {
  teal:       '#0e9bb5',   // logo background teal
  tealDark:   '#0a7a90',   // deeper teal for pressed states
  tealLight:  '#e6f7fb',   // light teal tint for light mode
  amber:      '#d4a843',   // logo gold/amber accent
  amberLight: '#f5d98b',   // lighter amber
  amberDark:  '#a87e28',   // deeper amber

  // Neutrals
  black:      '#0d0d0d',
  dark1:      '#151515',
  dark2:      '#1e1e1e',
  dark3:      '#2a2a2a',
  dark4:      '#363636',
  gray1:      '#666666',
  gray2:      '#999999',
  gray3:      '#cccccc',
  white:      '#ffffff',
  offWhite:   '#f5f5f0',
  light1:     '#ebebeb',
  light2:     '#d8d8d8',
};

export const darkTheme = {
  bg:         palette.dark1,
  surface:    palette.dark2,
  surfaceAlt: palette.dark3,
  border:     palette.dark4,
  accent:     palette.teal,
  accentAlt:  palette.amber,
  textPrimary:   palette.white,
  textSecondary: palette.gray3,
  textMuted:     palette.gray2,
};

export const lightTheme = {
  bg:         palette.offWhite,
  surface:    palette.white,
  surfaceAlt: palette.light1,
  border:     palette.light2,
  accent:     palette.teal,
  accentAlt:  palette.amber,
  textPrimary:   palette.black,
  textSecondary: '#333333',
  textMuted:     palette.gray1,
};

export type Theme = typeof darkTheme;

// Legacy compat for _layout.tsx
export const Colors = {
  light: { tint: palette.teal, text: palette.black, background: palette.offWhite, icon: palette.gray1, tabIconDefault: palette.gray1, tabIconSelected: palette.teal },
  dark:  { tint: palette.teal, text: palette.white, background: palette.dark1,    icon: palette.gray2, tabIconDefault: palette.gray2, tabIconSelected: palette.teal },
};