import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { i18n } from '@/constants/i18n';
import { palette, type Theme } from '@/constants/theme';

// The home card's height is fixed to the screen's measured available space, so
// on devices with a larger system font size this text can grow past it and
// force the card to scroll internally. Cap scaling here so it stays legible
// without ever pushing content past the fixed card height.
export const FONT_SCALE_CAP = 1.3;

export function MealSection({
  label, meal, extra, t, th,
}: {
  label: string;
  meal: { first: string[]; main: string[] };
  extra?: string[];
  t: typeof i18n['gr'];
  th: Theme;
}) {
  return (
    <View style={s.mealSection}>
      <Text style={[s.mealSectionLabel, { color: palette.teal }]} maxFontSizeMultiplier={FONT_SCALE_CAP}>{label}</Text>

      <Text style={[s.mealSubLabel, { color: th.textMuted }]} maxFontSizeMultiplier={FONT_SCALE_CAP}>{t.main}</Text>
      {meal.main.map((item, i) => (
        <Text key={i} style={[s.mealItem, { color: th.textPrimary }]} maxFontSizeMultiplier={FONT_SCALE_CAP}>{item}</Text>
      ))}

      {meal.first.length > 0 && (
        <>
          <Text style={[s.mealSubLabel, { color: th.textMuted, marginTop: 6 }]} maxFontSizeMultiplier={FONT_SCALE_CAP}>{t.firstCourse}</Text>
          {meal.first.map((item, i) => (
            <Text key={i} style={[s.mealItem, { color: th.textSecondary }]} maxFontSizeMultiplier={FONT_SCALE_CAP}>{item}</Text>
          ))}
        </>
      )}

      {extra && extra.length > 0 && (
        <>
          <Text style={[s.mealSubLabel, { color: th.textMuted, marginTop: 6 }]} maxFontSizeMultiplier={FONT_SCALE_CAP}>{t.extra}</Text>
          {extra.map((item, i) => (
            <Text key={i} style={[s.mealItem, { color: th.textSecondary }]} maxFontSizeMultiplier={FONT_SCALE_CAP}>{item}</Text>
          ))}
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  mealSection:   { marginBottom: 2 },
  mealSectionLabel: { fontSize: 16, fontWeight: '800', marginBottom: 5, letterSpacing: 0.2 },
  mealSubLabel:  { fontSize: 10.5, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 3 },
  mealItem:      { fontSize: 14.5, lineHeight: 19, marginBottom: 2 },
});
