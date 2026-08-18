"use no memo";

import * as React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
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
  lunch: TodayMenuMealBlock;
  dinner: TodayMenuMealBlock;
  dark: boolean;
}

export function TodayMenuFullWidget({
  dayLabel,
  mainLabel,
  firstLabel,
  lunch,
  dinner,
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
        borderRadius: 16,
        padding: 12,
      }}
    >
      <TextWidget
        text={dayLabel}
        maxLines={1}
        style={{ fontSize: 15, fontWeight: '800', color: hex(th.textPrimary), marginBottom: 6 }}
      />

      <MealBlock title={lunch.label} mainLabel={mainLabel} firstLabel={firstLabel} main={lunch.main} first={lunch.first} th={th} />

      <FlexWidget
        style={{ height: 1, width: 'match_parent', backgroundColor: hex(th.border), marginVertical: 6 }}
      />

      <MealBlock title={dinner.label} mainLabel={mainLabel} firstLabel={firstLabel} main={dinner.main} first={dinner.first} th={th} />
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
}: {
  title: string;
  mainLabel: string;
  firstLabel: string;
  main: string[];
  first: string[];
  th: typeof darkTheme;
}) {
  return (
    <FlexWidget style={{ flexDirection: 'column', width: 'match_parent' }}>
      <TextWidget
        text={title}
        maxLines={1}
        style={{ fontSize: 12, fontWeight: '800', color: hex(palette.teal), marginBottom: 2 }}
      />
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
