import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BreakfastMenu } from '@/data/menu';
import { i18n } from '@/constants/i18n';
import { palette, type Theme } from '@/constants/theme';
import { FONT_SCALE_CAP } from './MealSection';

// Breakfast is the same every day (it isn't part of the weekly rotation), so
// unlike MealSection it takes no day-specific data — just the category
// buckets straight from the menu. Order and labels are fixed here since the
// categories themselves (breads/staples/spreads/drinks) come from the DB as
// plain strings with no inherent order.
const CATEGORY_ORDER: (keyof Pick<
  typeof i18n['gr'], 'breakfastStaples' | 'breakfastBreads' | 'breakfastSpreads' | 'breakfastDrinks'
>)[] = ['breakfastStaples', 'breakfastBreads', 'breakfastSpreads', 'breakfastDrinks'];
const CATEGORY_KEYS = ['staples', 'breads', 'spreads', 'drinks'] as const;

export function BreakfastSection({ breakfast, t, th }: {
  breakfast: BreakfastMenu;
  t: typeof i18n['gr'];
  th: Theme;
}) {
  return (
    <View style={s.mealSection}>
      <Text style={[s.mealSectionLabel, { color: palette.amber }]} maxFontSizeMultiplier={FONT_SCALE_CAP}>
        {t.breakfastLabel}
      </Text>
      {CATEGORY_KEYS.map((key, i) => {
        const items = breakfast[key];
        if (!items || items.length === 0) return null;
        return (
          <View key={key} style={i > 0 ? s.group : undefined}>
            <Text style={[s.mealSubLabel, { color: th.textMuted }]} maxFontSizeMultiplier={FONT_SCALE_CAP}>
              {t[CATEGORY_ORDER[i]]}
            </Text>
            {items.map((item, j) => (
              <Text key={j} style={[s.mealItem, { color: th.textPrimary }]} maxFontSizeMultiplier={FONT_SCALE_CAP}>
                {item}
              </Text>
            ))}
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  mealSection:   { marginBottom: 2 },
  mealSectionLabel: { fontSize: 16, fontWeight: '800', marginBottom: 5, letterSpacing: 0.2 },
  mealSubLabel:  { fontSize: 10.5, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 3 },
  mealItem:      { fontSize: 14.5, lineHeight: 19, marginBottom: 2 },
  group:         { marginTop: 6 },
});
