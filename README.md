# Honey & Hearth

A cozy, apiary-first mobile idle game. One full-screen backyard, a busy colony, and a little room to grow. **Honey & Hearth** is a working display name for the HoneyGame project. The same game runs in a browser and in a Capacitor Android app.

## Overview

Honey & Hearth begins with one small beehive in a quiet village backyard. The player checks on their colony, grows bee-friendly flowers, discovers how bee and plant varieties influence honey, and gradually expands the apiary without stressful deadlines or permanent loss.

The garden is the main game screen. Players tap locations in the illustrated backyard to tend the hive, plant forage, manage their pantry, read village letters, or visit the weekly farmers market. Honey continues accumulating while the player is away until the hive or storage reaches capacity.

### Core loop

1. Tend the colony and choose the plants the bees should forage.
2. Return later to harvest honey and beeswax from the hive.
3. Keep goods, craft with them, or place them in the home sale bin.
4. Receive coins when the weekly market day ends.
5. Spend coins on plants, recipes, bee varieties, storage, equipment, and more backyard space.
6. Adapt gently as four seasonal cycles change forage, production, and available activities.

The current first playable demonstrates this loop with two honey varieties, rotating market stock, village guidance, offline progression, and local save management. It is intentionally apiary-first: gardening and village systems support beekeeping rather than becoming a general farming simulator.

## Play locally

Requires Node.js 22.12+ (Node 24 recommended).

```sh
npm install
npm run dev
```

Open the localhost URL printed by Vite. For testing on a phone on your local network, use `npm run dev -- --host 0.0.0.0` and open your computer's LAN address at the printed port.

## The first playable

- An edge-to-edge garden with portrait and landscape compositions, floating resource controls, and thumb-friendly navigation.
- Tap the hive, house, or flower beds to open a bottom sheet; close it to return to the garden without changing screens.
- Gently animated bees, seasonal scenery, bundled fonts, and 44-pixel minimum primary touch targets.
- One colony, daily inspections, weekly hive care, manual honey and beeswax harvesting.
- Clover and lavender forage, two discoverable honeybee varieties, and a small discovery record.
- A shared-capacity pantry and home sale bin, with automatic weekly shipping payments.
- Rotating market inventory: seeds, hive and storage upgrades, garden space, a collector, a candle recipe, an apple tree, and a second bee variety.
- Village letters that introduce the systems as you progress.
- Device-local saving, export/import, recoverable resets, invalid-save protection, and single-writer browser tab protection where Web Locks are available.
- Android project with immersive fullscreen, native Preferences saves, share-sheet save exports, lifecycle catch-up, and Back-button dismissal of panels.

### Getting started

1. Tap the hive in the garden (or **Hive** in the bottom dock), then check on your bees and give the hive a little care.
2. Let a whole jar accumulate (roughly 20–30 seconds), then gather honey and wax.
3. Open **Pantry** and put goods in your home sale bin.
4. Your shipment pays out at the **end of the weekly market day**; market attendance is not required.
5. Browse **Village market** on day 7 of each week. Spend coins on whichever available improvement appeals to you.
6. Tap the flower beds or **Plant**, place the starter lavender packet in an empty bed, and select lavender forage to try another honey.

Panels scroll independently; the garden itself never becomes a scrolling page. Use the close button, Escape, or Android Back to dismiss a panel. The book button on the garden toggles the introductory guidance card.

### Clock and offline rules

A day is ten real minutes. A week is seven days, a season is four weeks, and a year is four seasons. The clock advances while away, capped at fourteen in-game days **per continuous absence**. Returning frequently can advance the calendar farther than one long absence.

Production uses elapsed real time and fills available containers safely. The starter hive needs manual harvesting. An optional collector moves whole units into the pantry; the hive buffer fills and then production pauses when no more can be stored. Items do not spoil or disappear. Shipping and pantry goods share storage capacity.

After capped calendar catch-up, any remaining offline production uses the final simulated season. Only simulated market boundaries settle shipments. Care gives bonuses rather than imposing permanent penalties for missing a visit.

### Try the rhythm without waiting

Open the settings icon in the upper-right to find the **beekeeper's notebook**. Its clearly labeled time-preview controls advance a minute, a day, the next market, or a long absence. These controls change the current save and are included for evaluating the first playable.

Browser progress is stored on the current origin. Android progress is stored in native Preferences, with one-time migration of existing WebView saves. Neither uses a cloud account. Use **Export save** before clearing app data, uninstalling, or moving devices. Android exports open the system share sheet; browser exports download JSON.

## Android and Google Play

The native project is in `android/`. The app bundles its game code, illustrations, and fonts, so it does not depend on a running development server. It uses application ID `com.alexslep04.honeygame` and targets Android API 36.

Install Android Studio with Android SDK 36, then run:

```sh
npm run android:sync     # build and copy the game into the Android project
npm run android:open     # open the project in Android Studio
```

Select a device/emulator and run it from Android Studio. `npm run android:run` is the CLI alternative. For publishing, generate a signed Android App Bundle through Android Studio and upload it to a Google Play testing track.

See [the Android setup and release guide](docs/android.md) for details. Asset synchronization is verified; APK compilation and real-device testing require an Android SDK, which was unavailable in the implementation environment.

## Verification

```sh
npm test                 # deterministic simulation and save tests
npm run build           # strict TypeScript check and production bundle
npx playwright install chromium
npm run test:e2e         # desktop + mobile browser journeys
npm run check           # formatting, tests, build, and browser checks
```

Browser tests include the real care → harvest → shipping → payout → purchase → reload journey, offline catch-up, save recovery, and viewport checks. Screenshots and failing traces are generated under the ignored `test-results/` directory.

## Project guide

- `docs/requirements.md` — agreed game rules and first-playable boundaries.
- `docs/verification.md` — local verification results and review coverage.
- `src/game/game.ts` — deterministic simulation, economy, actions, and content definitions.
- `src/game/save.ts` — versioned save validation.
- `docs/android.md` — Android Studio setup, device testing, and Google Play bundle instructions.
- `src/useGame.ts` — browser/native lifecycle, offline catch-up, and save tools.
- `src/platform/` — native persistence, lifecycle, Android Back, and save export adapters.
- `src/components/GardenScene.tsx` — original procedural SVG backyard illustration.
- `src/components/BottomSheet.tsx` — accessible, independently scrolling game panels.
- `src/components/GamePanels.tsx` — hive, planting, pantry, market, and letters.
- `src/App.tsx` — full-screen game HUD, navigation, and notebook.
- `capacitor.config.ts` and `android/` — Android app configuration and native host.
- `src/styles.css` — responsive presentation and reduced-motion support.

## Later content

This is a first playable, not the complete game. Larger bee collections, multiple hives, crop variety, special-event markets, and deeper seasonal activities remain future work. Rates, prices, capacity sizes, forage selection, and the current visual direction are ready for playtesting. Google Play release signing, physical-device acceptance testing, and store materials remain release work.
