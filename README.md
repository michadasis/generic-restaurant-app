<div align="center">
  <img src="assets/images/icon.png" width="100" style="border-radius: 20px" />
  <h1>UoWM Restaurant Menu App</h1>
  <p>The weekly menu for the University of Western Macedonia's student restaurant, in your pocket instead of taped to a wall.</p>
</div>

## Why this exists

The restaurant menu used to live on a printed sheet near the entrance, or buried somewhere on the university site. This app just puts it on your phone. Open it and you immediately see what's being served today, for both lunch and dinner.

## What it does

The menu runs on a two week cycle, and the app figures out on its own which week you're currently in, so you never have to think about it. It opens straight to today's menu. From there you can swipe left or right to move through the rest of the week, and if you keep swiping past the last day it just rolls into the next week for you.

## Screenshots

<div align="center">
  <img src="assets/images/Dark.jpg" width="220" />
  <img src="assets/images/Light.jpg" width="220" />
</div>

## Installation

Grab the latest APK from the releases page and install it on your Android phone.

https://github.com/michadasis/generic-restaurant-app/releases

It's Android only for now. There's no iOS build.

## Features

* Figures out the current week in the cycle on its own, based on today's date
* Swipe through the days, with the week rolling over automatically at the edges
* Dark mode and light mode, switchable with one tap, remembered for next time
* Greek and English, switchable the same way
* Checks GitHub on launch and lets you know if a newer version is out
* Colors pulled from the actual UoWM logo, teal and amber

## How the code is laid out

```
app/
  (tabs)/
    index.tsx       the main menu screen, this is where most of the logic lives
    About.tsx        the about screen
    _layout.tsx      tab navigation
  _layout.tsx        root layout

components/
  UpdateModal.tsx    the popup that shows up when a new version is available

constants/
  i18n.ts            every bit of text in the app, Greek and English
  theme.ts           the color palette and the dark and light theme objects

data/
  menu.ts            types plus the function that builds the menu for a given language
  restaurantMenu.js   the raw menu content itself

hooks/
  useUpdateChecker.ts  checks the GitHub releases API for a newer version

utils/
  getToday.ts        works out today's day and its label
  getWeek.ts          works out which week of the cycle we're in
```

## Running it yourself

You'll need the EAS CLI installed globally first.

```bash
npm i -g eas-cli
```

Then clone the repo and start it up.

```bash
git clone https://github.com/michadasis/generic-restaurant-app.git
cd generic-restaurant-app
npm i
npm run start
```

To build an APK for testing:

```bash
eas build --platform android --profile preview
```

To build the production version:

```bash
eas build --platform android --profile production
```

## Updating the menu

The actual menu text lives in `data/restaurantMenu.js`. Each week has a Greek and an English version for every meal, so updating it for a new cycle just means editing that one file.

## Credits

Built by [Ioannis Michadasis](github.com/michadasis).

Logo by Katerina Maki.
