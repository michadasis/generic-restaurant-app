# UoWM Restaurant Menu App

A React Native mobile application for viewing the weekly dining menu of the University of Western Macedonia (UoWM) restaurant. The app automatically determines the correct week in the menu cycle based on the current date, supports full dark and light mode theming, and provides a scrollable day selector for quick navigation.

Built with Expo and TypeScript. Currently available for Android only.

## Screenshots

<div style="display:flex; gap:8px;">
  <img src="assets/images/Light.jpg" width="300"/>
  <img src="assets/images/Dark.jpg" width="300"/>
</div>

## Features

**Menu Display**
Each day shows a structured view of breakfast, lunch, and dinner. Meals are organized into first courses, main courses, and extras such as fruit or dessert. Breakfast items are constant across the entire school year.

**Automatic Week Detection**
The app uses a 2-week rotating cycle spanning the full academic year (September 2025 through June 2026, covering 40 school weeks). On launch it calculates which week in the cycle is currently active and displays that week's menu without any user input.

**Day Navigation**
A horizontally scrollable tab bar lists all seven days of the week. The app opens on the current day by default, and tapping any day instantly switches the displayed menu.

**Dark and Light Theme**
The app respects the system color scheme and switches automatically between dark and light appearances. Theme preference is persisted across sessions using AsyncStorage.

## Installation

Download the latest `.apk` from the [releases page](https://github.com/michadasis/generic-restaurant-app/releases) and install it on any Android device.

iOS is not currently supported.

## Development Setup

**Prerequisites**

Node.js 18 or later and the Expo CLI are required. Install dependencies with:

```bash
git clone https://github.com/michadasis/generic-restaurant-app.git
cd generic-restaurant-app
npm install
```

**Running the app**

```bash
npx expo start
```

This opens the Expo developer menu. From there you can launch the app in an Android emulator, iOS simulator, or on a physical device using the Expo Go app.

To run directly on a connected Android device or emulator:

```bash
npx expo start --android
```

**Building a release APK**

This project is configured for EAS Build. To produce a standalone APK:

```bash
npx eas build --platform android --profile preview
```

## Project Structure

```
app/
  (tabs)/
    index.tsx       Main menu screen
    About.tsx       About screen
    _layout.tsx     Tab navigation layout
  _layout.tsx       Root layout with theme provider

components/         Reusable UI components (ThemedText, ThemedView, etc.)
constants/
  theme.ts          Color and font definitions for light and dark modes
data/
  menu.ts           Full 2-week menu cycle with TypeScript interfaces
hooks/
  use-color-scheme  System color scheme detection (native and web)
utils/
  getToday.ts       Returns the current day key and Greek label
  getWeek.ts        Calculates the active week in the menu rotation cycle
```

## Menu Data

The menu is defined in `data/menu.ts` as a statically typed TypeScript object. It encodes a 2-week cycle used for the entire 2025 to 2026 academic year. Each day contains a `lunch` object, a `dinner` object, and an `extra` field. Lunch and dinner each have `first` and `main` arrays holding the course options for that meal. The week currently shown is computed at runtime by `utils/getWeek.ts` based on a fixed reference start date.

To update the menu for a new school year, replace the `week1` and `week2` objects in `data/menu.ts` and update the `startDate` value in `utils/getWeek.ts`.

## Tech Stack

| Technology | Version |
|---|---|
| React Native | 0.81 |
| Expo | 54 |
| Expo Router | 6 |
| TypeScript | 5.9 |
| React Navigation | 7 |
| AsyncStorage | 2.2 |

## License

MIT. See [LICENSE](./LICENSE) for details.