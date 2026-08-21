import React, { useEffect } from 'react';
import { DimensionValue, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { Theme } from '@/constants/theme';

function SkeletonBlock({ width, height, radius = 6, color }: {
  width: DimensionValue;
  height: number;
  radius?: number;
  color: string;
}) {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[{ width, height, borderRadius: radius, backgroundColor: color }, animatedStyle]} />;
}

function MealBlockSkeleton({ color }: { color: string }) {
  return (
    <View style={s.mealBlock}>
      <SkeletonBlock width={90} height={13} radius={4} color={color} />
      <SkeletonBlock width="88%" height={15} color={color} />
      <SkeletonBlock width="70%" height={15} color={color} />
    </View>
  );
}

// Placeholder shown in place of a day's menu while it's loading — mirrors the
// layout of the real card (MealSection x2, optionally a header) so content
// doesn't visibly jump into place once it arrives.
export function MenuSkeleton({ th, showHeader = true, padded = true }: { th: Theme; showHeader?: boolean; padded?: boolean }) {
  const color = th.surfaceAlt;
  return (
    <View style={[s.root, padded && s.rootPadded]}>
      {showHeader && (
        <View style={[s.header, { borderBottomColor: th.border }]}>
          <SkeletonBlock width={120} height={20} radius={5} color={color} />
          <SkeletonBlock width={64} height={13} radius={4} color={color} />
        </View>
      )}
      <MealBlockSkeleton color={color} />
      <View style={[s.divider, { backgroundColor: th.border }]} />
      <MealBlockSkeleton color={color} />
    </View>
  );
}

const s = StyleSheet.create({
  // No flex:1 here — this sits inside contexts with different height rules
  // (a flex column in index.tsx, an auto-sized ScrollView card in
  // Calendar.tsx), so it just sizes to its own content in both.
  root:        {},
  rootPadded:  { padding: 14 },
  header:    { gap: 8, borderBottomWidth: 1, paddingBottom: 9, marginBottom: 14 },
  mealBlock: { gap: 10 },
  divider:   { height: 1, marginVertical: 14 },
});
