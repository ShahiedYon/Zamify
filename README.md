# Zamify

An offline Android study app with a standalone HTML preview. This repository contains the existing 0.7.0 development baseline. It is not a production release.

## Source layout

- `app/`: Android wrapper and bundled offline HTML.
- `Preview.html`: browser preview.
- `questions.json`: 65 practice questions covering four question formats.
- `brand/`: SVG artwork.
- `verify.cjs` and `test-*.cjs`: logic and browser checks.

## Build

Install Android Studio, JDK 17 and Android SDK 35. Configure your SDK location locally using Android Studio.

```sh
./gradlew assembleDebug
```

On Windows run `gradlew.bat assembleDebug`. Output: `app/build/outputs/apk/debug/app-debug.apk`. Minimum Android version: Android 8 (API 26).

Alternatively, install SDK Build Tools 35.0.0 and run:

```sh
python3 build-test-apk.py --sdk /path/to/android-sdk
```

The helper writes `test-build/Zamify_Test.apk` and generates a local debug key if none exists. Signing keys and APKs are excluded from this repository. A new signing key cannot update an installation signed with a different key; retain any original key privately if update compatibility is needed. Never use debug keys for production.

## Content and checks

Edit `questions.json`, then run:

```sh
python3 sync_content.py
node verify.cjs
```

The logic checks passed during import for all 65 questions, scoring, free/demo boundaries, hints, review and saved progress. The HTML preview and Android asset were verified identical.

Browser tests require Playwright and Chromium. Use `EXAM_SPRINT_CHROME` to select a compatible browser when needed. Tests include `test-browser.cjs`, `test-zamify.cjs`, `test-catalogue.cjs` and `test-welcome.cjs`. Browser tests and Android builds were not rerun during this source import; physical-device verification remains necessary.

## Development limitations

The app includes 10 free practice questions and a 65-question developer demonstration. Checkout and production purchase entitlements are not implemented. Content is practice material, not official exam content or a guarantee of certification. Progress is stored locally.
