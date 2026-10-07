# Android setup and Google Play

## What is in the project

Honey & Hearth uses Capacitor 8 to package the existing React/TypeScript game in a native Android host. All game code, illustrations, and fonts ship inside the app; no server URL is configured.

- Application ID: `com.alexslep04.honeygame`.
- Display name: `Honey & Hearth` (working title).
- Version: `0.1.0`, Android version code `1`.
- Minimum Android API: `24`; compile/target API: `36`.
- Android sources: `android/`.
- Native entry point: `android/app/src/main/java/com/alexslep04/honeygame/MainActivity.java`.

The garden fills the usable display in portrait and landscape. Native system bars are hidden for immersive play and can be revealed with an edge swipe. HUD controls account for safe-area insets. Android Back closes an open game sheet; from the garden it minimizes the app.

Progress uses Capacitor Preferences, independent of WebView localStorage. App pause/resume feeds the same capacity-limited, fourteen-day-capped simulation as the browser. Save export writes a cache file and opens Android's share sheet. There is no cloud save or sign-in requirement.

## Run on a device

1. Install a current stable [Android Studio](https://developer.android.com/studio).
2. In SDK Manager, install Android SDK Platform 36, SDK Build-Tools, and Platform-Tools. Use JDK 21 or a compatible Android Studio Gradle JDK.
3. From the project root, install dependencies and synchronize the web bundle:

   ```sh
   npm install
   npm run android:sync
   npm run android:open
   ```

4. Allow Android Studio to synchronize Gradle. It can create the ignored `android/local.properties` with the local SDK location. Alternatively, configure `ANDROID_HOME` in your environment.
5. Connect an Android phone with USB debugging enabled, or create an emulator with an updated Android System WebView. Select it in Android Studio and press **Run**.

After changing the game, run `npm run android:sync` again before rebuilding the native app. `npm run android:run` builds, synchronizes, and launches through the Capacitor CLI when a device and SDK are configured.

For a debug APK from PowerShell in the `android/` directory:

```powershell
.\gradlew.bat :app:assembleDebug
```

The APK is generated at `android/app/build/outputs/apk/debug/app-debug.apk`.

## Before the first Google Play upload

Confirm the application ID and final display name before creating the Play listing. The application ID identifies future updates and should stay stable after publication.

Use Android Studio's **Build → Generate Signed App Bundle / APK → Android App Bundle** flow. Create or select your release upload key, then generate the signed release `.aab`. Keep the key and its passwords outside version control; the repository ignores common signing-key files.

Upload the bundle to a Google Play Console testing track first. Complete the required listing and declarations for the actual game, supply screenshots and store artwork, and follow the account's current testing and publication requirements. Confirm the current target-API requirement when you publish; API 36 is the project's present target, not a promise about future Play policies.

Increment `versionCode` in `android/app/build.gradle` for every uploaded update. Keep the web package version and Android `versionName` aligned.

The notebook's time-preview controls are deliberately available for this first playable. Decide whether to remove or gate them before a public release.

## Device validation

On a real Android device, check these app-specific paths before release:

- HUD, touch targets, and sheets in portrait, landscape, and with system bars temporarily visible.
- Back closes the current sheet, then minimizes from the garden.
- Backgrounding, force-stopping, and relaunching preserve progress and apply offline catch-up once.
- Export, import, and backup restore retain a real save; export opens Android's share sheet.
- Airplane-mode launch works with packaged illustrations, fonts, and gameplay.

Browser emulation and mocked plugin tests exercise the integration contracts, but do not replace these native checks.

## Verification in the implementation environment

`npm run android:sync` completed and included the App, Filesystem, Preferences, and Share plugins. Gradle 8.14.3 started successfully with Java 21 and configured the project. `:app:assembleDebug` then stopped with **SDK location not found** because Android Studio/SDK were not installed. No APK or signed app bundle has been produced or device-tested here.

## References

- [Capacitor Android workflow](https://capacitorjs.com/docs/android)
- [Capacitor Google Play deployment](https://capacitorjs.com/docs/android/deploying-to-google-play)
- [Capacitor Preferences](https://capacitorjs.com/docs/apis/preferences)
- [Capacitor app lifecycle](https://capacitorjs.com/docs/apis/app)
