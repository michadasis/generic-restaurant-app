import React from 'react';
import { DimensionValue, StyleSheet, View } from 'react-native';
import { SkeletonBlock, STAGGER_MS } from './Shimmer';
import { Theme } from '@/constants/theme';

// Mirrors a real SuggestionCard's layout (Suggestions.tsx) — number, a
// couple of content lines, then a footer row — so the loading state reads as
// "cards are arriving" rather than a generic spinner.
function SuggestionCardSkeleton({ th, delayOffset, contentLines }: {
  th: Theme;
  delayOffset: number;
  contentLines: DimensionValue[];
}) {
  const color = th.surfaceAlt;
  let i = delayOffset;
  const nextDelay = () => (i++) * STAGGER_MS;

  return (
    <View style={[s.card, { backgroundColor: th.surface }]}>
      <SkeletonBlock width={28} height={11} radius={3} color={th.border} delay={nextDelay()} />
      <View style={s.contentGroup}>
        {contentLines.map((w, idx) => (
          <SkeletonBlock key={idx} width={w} height={14} radius={4} color={color} delay={nextDelay()} />
        ))}
      </View>
      <View style={s.footer}>
        <SkeletonBlock width={60} height={12} radius={4} color={th.border} delay={nextDelay()} />
        <View style={s.voteRow}>
          <SkeletonBlock width={17} height={17} radius={9} color={color} delay={nextDelay()} />
          <SkeletonBlock width={16} height={13} radius={4} color={th.border} delay={nextDelay()} />
          <SkeletonBlock width={17} height={17} radius={9} color={color} delay={nextDelay()} />
        </View>
      </View>
    </View>
  );
}

// Varying line widths per card so the list doesn't look like a stack of
// identical bars.
const LINE_SETS: DimensionValue[][] = [
  ['90%', '55%'],
  ['70%'],
  ['85%', '40%'],
  ['60%'],
];

export function SuggestionSkeleton({ th }: { th: Theme }) {
  return (
    <View>
      {LINE_SETS.map((lines, idx) => (
        <SuggestionCardSkeleton key={idx} th={th} delayOffset={idx * 3} contentLines={lines} />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  card:        { borderRadius: 14, padding: 14, marginBottom: 12 },
  contentGroup:{ gap: 6, marginTop: 8, marginBottom: 10 },
  footer:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  voteRow:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
