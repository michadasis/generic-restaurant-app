"use no memo";

import * as React from 'react';
import { FlexWidget, ImageWidget, TextWidget } from 'react-native-android-widget';
import { darkTheme, lightTheme, palette } from '../constants/theme';

type Hex = `#${string}`;
const hex = (color: string): Hex => color as Hex;

// Gold marks whichever meal is happening right now; the inactive one stays neutral.
const ACTIVE_COLOR = palette.amberDark;

export interface TodayMenuMealBlock {
  label: string;
  main: string[];
  first: string[];
}

export interface TodayMenuFullWidgetProps {
  dayLabel: string;
  mainLabel: string;
  firstLabel: string;
  lunch: TodayMenuMealBlock;
  dinner: TodayMenuMealBlock;
  isLunchNow: boolean;
  dark: boolean;
  heightDp: number;
}

// Vertical budget for everything that isn't a meal block: outer padding,
// the day-label header row, and the two flexGaps around it.
const OUTER_PADDING = 24;
const HEADER_ROW = 22;
const OUTER_GAPS = 16;

// Vertical budget inside a single meal block before its dish text starts.
const BLOCK_PADDING = 16;
const BLOCK_HEADER = 18;
const FIRST_MARGIN_TOP = 2;

const MAIN_LINE_HEIGHT = 15;
const FIRST_LINE_HEIGHT = 14;
const MAX_MAIN_LINES = 3;
const MAX_FIRST_LINES = 2;

export function TodayMenuFullWidget({
  dayLabel,
  mainLabel,
  firstLabel,
  lunch,
  dinner,
  isLunchNow,
  dark,
  heightDp,
}: TodayMenuFullWidgetProps) {
  const th = dark ? darkTheme : lightTheme;

  const totalBlockSpace = Math.max(heightDp - OUTER_PADDING - HEADER_ROW - OUTER_GAPS, 0);
  const perBlockContent = Math.max(totalBlockSpace / 2 - BLOCK_PADDING - BLOCK_HEADER, 0);

  const mainLines = Math.min(MAX_MAIN_LINES, Math.max(1, Math.floor(perBlockContent / MAIN_LINE_HEIGHT)));
  const spaceAfterMain = Math.max(perBlockContent - mainLines * MAIN_LINE_HEIGHT - FIRST_MARGIN_TOP, 0);
  const firstLines = Math.min(MAX_FIRST_LINES, Math.floor(spaceAfterMain / FIRST_LINE_HEIGHT));

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        backgroundColor: hex(th.surface),
        borderRadius: 20,
        borderWidth: 1,
        borderColor: hex(th.border),
        padding: 12,
        flexGap: 8,
      }}
    >
      <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', flexGap: 6 }}>
        <ImageWidget
          image={require('../assets/images/icon.png')}
          imageWidth={22}
          imageHeight={22}
          radius={6}
        />
        <TextWidget
          text={dayLabel}
          maxLines={1}
          style={{ fontSize: 15, fontWeight: '800', color: hex(th.textPrimary) }}
        />
      </FlexWidget>

      <MealBlock
        title={lunch.label}
        mainLabel={mainLabel}
        firstLabel={firstLabel}
        main={lunch.main}
        first={lunch.first}
        th={th}
        active={isLunchNow}
        mainLines={mainLines}
        firstLines={firstLines}
      />

      <MealBlock
        title={dinner.label}
        mainLabel={mainLabel}
        firstLabel={firstLabel}
        main={dinner.main}
        first={dinner.first}
        th={th}
        active={!isLunchNow}
        mainLines={mainLines}
        firstLines={firstLines}
      />
    </FlexWidget>
  );
}

function MealBlock({
  title,
  mainLabel,
  firstLabel,
  main,
  first,
  th,
  active,
  mainLines,
  firstLines,
}: {
  title: string;
  mainLabel: string;
  firstLabel: string;
  main: string[];
  first: string[];
  th: typeof darkTheme;
  active: boolean;
  mainLines: number;
  firstLines: number;
}) {
  const color = active ? hex(ACTIVE_COLOR) : hex(th.textMuted);

  return (
    <FlexWidget
      style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        width: 'match_parent',
        backgroundColor: hex(active ? th.surfaceAlt : th.surface),
        borderRadius: 12,
        borderWidth: active ? 1 : 0,
        borderColor: color,
        padding: 8,
      }}
    >
      <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', flexGap: 5, marginBottom: 3 }}>
        <FlexWidget style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
        <TextWidget
          text={title.toUpperCase()}
          maxLines={1}
          style={{ fontSize: 11.5, fontWeight: '800', letterSpacing: 0.5, color }}
        />
      </FlexWidget>
      {main.length > 0 && (
        <TextWidget
          text={`${mainLabel}: ${main.join(', ')}`}
          maxLines={mainLines}
          truncate="END"
          style={{ fontSize: 11.5, color: hex(th.textPrimary), lineHeight: 15 }}
        />
      )}
      {first.length > 0 && firstLines > 0 && (
        <TextWidget
          text={`${firstLabel}: ${first.join(', ')}`}
          maxLines={firstLines}
          truncate="END"
          style={{ fontSize: 10.5, color: hex(th.textSecondary), marginTop: 2, lineHeight: 14 }}
        />
      )}
    </FlexWidget>
  );
}
