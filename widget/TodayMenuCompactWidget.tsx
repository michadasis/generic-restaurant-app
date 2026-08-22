"use no memo";

import * as React from 'react';
import { FlexWidget, ImageWidget, TextWidget } from 'react-native-android-widget';
import { darkTheme, lightTheme, palette } from '../constants/theme';

type Hex = `#${string}`;
const hex = (color: string): Hex => color as Hex;

export interface TodayMenuCompactWidgetProps {
  mealLabel: string;
  dayLabel: string;
  main: string[];
  isLunch: boolean;
  dark: boolean;
  heightDp: number;
}

// Header row (icon + labels, incl. its margin-bottom) plus the outer padding
// take up roughly this much vertical space before any dish line is drawn.
const HEADER_AND_PADDING = 37;
const ITEM_LINE_HEIGHT = 16;

export function TodayMenuCompactWidget({
  mealLabel,
  dayLabel,
  main,
  isLunch,
  dark,
  heightDp,
}: TodayMenuCompactWidgetProps) {
  const th = dark ? darkTheme : lightTheme;
  const mealColor = isLunch ? palette.teal : palette.amberDark;
  const available = Math.max(heightDp - HEADER_AND_PADDING, ITEM_LINE_HEIGHT);
  const maxItems = Math.max(1, Math.floor(available / ITEM_LINE_HEIGHT));
  const items = main.slice(0, maxItems);

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
      <FlexWidget
        style={{ flexDirection: 'row', alignItems: 'center', flexGap: 4, marginBottom: 3 }}
      >
        <ImageWidget
          image={require('../assets/images/icon.png')}
          imageWidth={14}
          imageHeight={14}
          radius={4}
        />
        <FlexWidget style={{ flex: 1 }}>
          <TextWidget
            text={dayLabel}
            maxLines={1}
            truncate="END"
            style={{ fontSize: 10, fontWeight: '800', color: hex(th.textMuted) }}
          />
        </FlexWidget>
        <TextWidget
          text={mealLabel}
          maxLines={1}
          style={{ fontSize: 10, fontWeight: '800', color: hex(mealColor) }}
        />
      </FlexWidget>
      <FlexWidget style={{ flexDirection: 'column' }}>
        {items.map((item, i) => (
          <TextWidget
            key={i}
            text={`• ${item}`}
            maxLines={1}
            truncate="END"
            style={{ fontSize: 12.5, fontWeight: '600', color: hex(th.textPrimary), lineHeight: 16 }}
          />
        ))}
      </FlexWidget>
    </FlexWidget>
  );
}
