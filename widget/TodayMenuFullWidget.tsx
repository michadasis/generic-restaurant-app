"use no memo";

import * as React from 'react';
import { FlexWidget, ImageWidget, TextWidget } from 'react-native-android-widget';
import { darkTheme, lightTheme, palette } from '../constants/theme';

type Hex = `#${string}`;
const hex = (color: string): Hex => color as Hex;

export interface TodayMenuMealBlock {
  label: string;
  main: string[];
  first: string[];
}

export interface TodayMenuFullWidgetProps {
  dayLabel: string;
  mainLabel: string;
  firstLabel: string;
  nowLabel: string;
  lunch: TodayMenuMealBlock;
  dinner: TodayMenuMealBlock;
  isLunchNow: boolean;
  dark: boolean;
}

export function TodayMenuFullWidget({
  dayLabel,
  mainLabel,
  firstLabel,
  nowLabel,
  lunch,
  dinner,
  isLunchNow,
  dark,
}: TodayMenuFullWidgetProps) {
  const th = dark ? darkTheme : lightTheme;

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
        accent={hex(palette.teal)}
        active={isLunchNow}
        nowLabel={nowLabel}
      />

      <MealBlock
        title={dinner.label}
        mainLabel={mainLabel}
        firstLabel={firstLabel}
        main={dinner.main}
        first={dinner.first}
        th={th}
        accent={hex(palette.amberDark)}
        active={!isLunchNow}
        nowLabel={nowLabel}
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
  accent,
  active,
  nowLabel,
}: {
  title: string;
  mainLabel: string;
  firstLabel: string;
  main: string[];
  first: string[];
  th: typeof darkTheme;
  accent: Hex;
  active: boolean;
  nowLabel: string;
}) {
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
        borderColor: accent,
        padding: 8,
      }}
    >
      <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', flexGap: 5, marginBottom: 3 }}>
        <FlexWidget style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: accent }} />
        <TextWidget
          text={title.toUpperCase()}
          maxLines={1}
          style={{ fontSize: 11.5, fontWeight: '800', letterSpacing: 0.5, color: hex(palette.teal) }}
        />
        {active && (
          <FlexWidget
            style={{
              backgroundColor: accent,
              borderRadius: 6,
              paddingHorizontal: 5,
              paddingVertical: 1,
            }}
          >
            <TextWidget
              text={nowLabel}
              maxLines={1}
              style={{ fontSize: 8, fontWeight: '800', color: hex(palette.white), letterSpacing: 0.4 }}
            />
          </FlexWidget>
        )}
      </FlexWidget>
      {main.length > 0 && (
        <TextWidget
          text={`${mainLabel}: ${main.join(', ')}`}
          maxLines={3}
          truncate="END"
          style={{ fontSize: 11.5, color: hex(th.textPrimary), lineHeight: 15 }}
        />
      )}
      {first.length > 0 && (
        <TextWidget
          text={`${firstLabel}: ${first.join(', ')}`}
          maxLines={2}
          truncate="END"
          style={{ fontSize: 10.5, color: hex(th.textSecondary), marginTop: 2, lineHeight: 14 }}
        />
      )}
    </FlexWidget>
  );
}
