# Zamify

An offline Android study app with a standalone HTML preview. This repository contains the 0.8.0 development version. It is not a production release.

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

## Free starter question revision — 30 October 2026

The ten free questions now use stronger scenarios and closer alternatives,
with AWS objective tags, direct source links and short transfer examples in
the post-answer feedback. The other 55 items retain their earlier wording.
See [CONTENT_REVIEW_FREE.md](CONTENT_REVIEW_FREE.md) for the review matrix.
Source review is AI-assisted; independent expert review is still pending.

Progress records question revisions. Earlier-wording answers are retained as
local history and excluded from current progress. Sessions involving changed
wording restart; current-version sessions and unchanged-question results remain
compatible. The original ten free IDs and 65-question total are preserved.

## Guided question highlights

Guided highlights are on by default. The question toolbar can switch them off
for unaided practice. Seeing highlights counts as learning support for that
attempt, including after a reload or after hiding them again. Correct guided
answers remain in review until a later correct answer without support.

## Development limitations

The app includes 10 free practice questions and a 65-question developer demonstration. Checkout and production purchase entitlements are not implemented. Content is practice material, not official exam content or a guarantee of certification. Progress is stored locally.

## Home and welcome update

The home screen centres Zami, with a direct free-practice/resume action, a single available exam and five topic shortcuts. The muted beige palette is retained.

The native WebView now signals when content is ready to draw before starting the welcome. The welcome runs once per page load, pauses its dismissal while the page is hidden, supports skip/Back/Escape and respects reduced motion. This addresses a suspected startup timing issue; real-device validation is still required.

`node test-home-welcome.cjs` covers home navigation, responsive widths, intro lifecycle and the simulated native readiness signal. The GitHub Actions workflow runs browser checks and builds a debug APK. Its temporary debug signing identity differs from previously installed test builds. Do not uninstall an existing app if you need to preserve its local progress; use the original signing key locally for a compatible update.
