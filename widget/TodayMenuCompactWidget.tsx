"use no memo";

import * as React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import { darkTheme, lightTheme, palette } from '../constants/theme';

type Hex = `#${string}`;
const hex = (color: string): Hex => color as Hex;

export interface TodayMenuCompactWidgetProps {
  mealLabel: string;
  dayLabel: string;
  main: string[];
  dark: boolean;
}

export function TodayMenuCompactWidget({
  mealLabel,
  dayLabel,
  main,
  dark,
}: TodayMenuCompactWidgetProps) {
  const th = dark ? darkTheme : lightTheme;

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: hex(th.surface),
        borderRadius: 16,
        padding: 10,
      }}
    >
      <TextWidget
        text={`${dayLabel} · ${mealLabel}`}
        maxLines={1}
        truncate="END"
        style={{ fontSize: 10.5, fontWeight: '800', color: hex(palette.teal), marginBottom: 3 }}
      />
      <TextWidget
        text={main.join(' • ')}
        maxLines={2}
        truncate="END"
        style={{ fontSize: 12.5, fontWeight: '600', color: hex(th.textPrimary), lineHeight: 16 }}
      />
    </FlexWidget>
  );
}
