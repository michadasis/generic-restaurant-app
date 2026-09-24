import React, { useEffect, useState } from 'react';
import { DimensionValue, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { palette } from '@/constants/theme';

// Stagger between consecutive blocks' shine, and how long each one takes —
// together these read as a wave that cascades down through the placeholder
// text line by line, rather than one sweep crossing everything at once.
export const STAGGER_MS = 160;
export const SHINE_DURATION_MS = 2500;

// A soft brand-tinted band that sweeps once across its own block, clipped to
// that block's bounds (the block itself is overflow:hidden), so each line
// shines individually instead of one light source gliding over everything.
export function ShimmerSweep({ containerWidth, delay }: { containerWidth: number; delay: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: SHINE_DURATION_MS, easing: Easing.inOut(Easing.quad) }), -1, false)
    );
  }, [progress, delay]);

  const bandWidth = Math.max(containerWidth * 0.7, 40);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(progress.value, [0, 1], [-bandWidth, containerWidth + bandWidth]) }],
  }));

  if (containerWidth <= 0) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View style={[s.sweepBand, { width: bandWidth }, style]}>
        <LinearGradient
          colors={['transparent', `${palette.teal}55`, `${palette.teal}22`, 'transparent']}
          locations={[0, 0.45, 0.7, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

export function SkeletonBlock({ width, height, radius = 6, color, delay }: {
  width: DimensionValue;
  height: number;
  radius?: number;
  color: string;
  delay: number;
}) {
  const [blockWidth, setBlockWidth] = useState(0);

  return (
    <View
      style={{ width, height, borderRadius: radius, backgroundColor: color, overflow: 'hidden' }}
      onLayout={e => setBlockWidth(e.nativeEvent.layout.width)}
    >
      <ShimmerSweep containerWidth={blockWidth} delay={delay} />
    </View>
  );
}

const s = StyleSheet.create({
  sweepBand: { position: 'absolute', top: 0, bottom: 0 },
});
