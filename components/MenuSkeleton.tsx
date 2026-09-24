import React from 'react';
import { DimensionValue, StyleSheet, Text, View } from 'react-native';
import { SkeletonBlock, STAGGER_MS } from './Shimmer';
import { i18n } from '@/constants/i18n';
import { palette, Theme } from '@/constants/theme';

// The sub-label (MAIN / FIRST COURSE / DESSERT) is real, known-ahead-of-time
// text — only the dish names under it are unknown until the menu loads, so
// only those are skeleton blocks.
function LabelGroup({ label, lines, color, th, nextDelay }: {
  label: string;
  lines: DimensionValue[];
  color: string;
  th: Theme;
  nextDelay: () => number;
}) {
  return (
    <View style={s.group}>
      <Text style={[s.mealSubLabel, { color: th.textMuted }]}>{label}</Text>
      {lines.map((w, i) => (
        <SkeletonBlock key={i} width={w} height={14} color={color} delay={nextDelay()} />
      ))}
    </View>
  );
}

// Same for the meal label itself (Lunch / Dinner) — real text, not a block.
function MealBlockSkeleton({ mealLabel, t, color, th, nextDelay }: {
  mealLabel: string;
  t: typeof i18n['gr'];
  color: string;
  th: Theme;
  nextDelay: () => number;
}) {
  return (
    <View style={s.mealBlock}>
      <Text style={[s.mealSectionLabel, { color: palette.teal }]}>{mealLabel}</Text>
      <LabelGroup label={t.main} lines={['92%', '68%']} color={color} th={th} nextDelay={nextDelay} />
      <LabelGroup label={t.firstCourse} lines={['58%']} color={color} th={th} nextDelay={nextDelay} />
      <LabelGroup label={t.extra} lines={['40%']} color={color} th={th} nextDelay={nextDelay} />
    </View>
  );
}

// Breakfast has no first-course/extra split — just a couple of category
// groups — so it gets its own, shorter block instead of reusing MealBlockSkeleton.
function BreakfastBlockSkeleton({ t, color, th, nextDelay }: {
  t: typeof i18n['gr'];
  color: string;
  th: Theme;
  nextDelay: () => number;
}) {
  return (
    <View style={s.mealBlock}>
      <Text style={[s.mealSectionLabel, { color: palette.amber }]}>{t.breakfastLabel}</Text>
      <LabelGroup label={t.breakfastStaples} lines={['70%', '50%']} color={color} th={th} nextDelay={nextDelay} />
      <LabelGroup label={t.breakfastDrinks} lines={['45%']} color={color} th={th} nextDelay={nextDelay} />
    </View>
  );
}

// Placeholder shown in place of a day's menu while it's loading — mirrors the
// layout of the real card exactly, down to the real Lunch/Dinner and
// Main/First Course/Dessert labels (all known ahead of time via i18n); only
// the dish names themselves — the part that actually depends on the menu
// having loaded — are skeleton blocks. Each one shines in turn, cascading
// top to bottom.
export function MenuSkeleton({ th, t, showHeader = true, padded = true, fill = padded, showBreakfast = false }: {
  th: Theme;
  t: typeof i18n['gr'];
  showHeader?: boolean;
  padded?: boolean;
  fill?: boolean;
  showBreakfast?: boolean;
}) {
  const color = th.surfaceAlt;
  const accentColor = th.border;

  // Assigns each block a later shine delay than the one before it, in the
  // order they're created below (header first, then top-to-bottom through
  // every meal block) — a single running counter shared across the tree.
  let blockIndex = 0;
  const nextDelay = () => (blockIndex++) * STAGGER_MS;

  return (
    <View style={[s.root, padded && s.rootPadded, fill && s.rootFill]}>
      {showHeader && (
        <View style={[s.header, { borderBottomColor: th.border }]}>
          <View style={s.headerGroup}>
            <SkeletonBlock width={110} height={19} radius={5} color={color} delay={nextDelay()} />
            <SkeletonBlock width={64} height={12} radius={4} color={accentColor} delay={nextDelay()} />
          </View>
          <SkeletonBlock width={54} height={20} radius={6} color={`${palette.amber}33`} delay={nextDelay()} />
        </View>
      )}
      {showBreakfast && (
        <>
          <BreakfastBlockSkeleton t={t} color={color} th={th} nextDelay={nextDelay} />
          <View style={[s.divider, { backgroundColor: th.border }]} />
        </>
      )}
      <MealBlockSkeleton mealLabel={t.lunch} t={t} color={color} th={th} nextDelay={nextDelay} />
      <View style={[s.divider, { backgroundColor: th.border }]} />
      <MealBlockSkeleton mealLabel={t.dinner} t={t} color={color} th={th} nextDelay={nextDelay} />
    </View>
  );
}

const s = StyleSheet.create({
  // No flex:1 here — this sits inside contexts with different height rules
  // (a flex column in index.tsx, an auto-sized ScrollView card in
  // Calendar.tsx), so it just sizes to its own content in both.
  root:        { overflow: 'hidden' },
  rootPadded:  { padding: 14 },
  // Stretches root to the full height of its (flex) parent so the card
  // still reads as full-size even though the content itself stays pinned
  // to the top.
  rootFill:    { flex: 1 },
  header:      { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, borderBottomWidth: 1, paddingBottom: 9, marginBottom: 14 },
  headerGroup: { gap: 8 },
  mealBlock:   { gap: 10 },
  // Matches MealSection's own label styles exactly, so the real labels sit
  // in precisely the layout the loaded card will replace them into.
  mealSectionLabel: { fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },
  mealSubLabel:     { fontSize: 10.5, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  group:       { gap: 6 },
  divider:     { height: 1, marginVertical: 14 },
});
