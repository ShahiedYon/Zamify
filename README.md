# Zamify

An offline Android study app with a standalone HTML preview. This repository contains the 0.9.0 development version. It is not a production release.

## Source layout

- `app/`: Android wrapper and bundled offline HTML.
- `Preview.html`: browser preview.
- `questions.json`: 83 draft practice questions covering four question formats.
- `brand/`: SVG artwork.
- `verify.cjs` and `test-*.cjs`: logic and browser checks.

## Build

Install Android Studio, JDK 17 and Android SDK 36. Configure your SDK location locally using Android Studio.

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

The logic checks passed during import for all 83 questions, scoring, free/demo boundaries, hints, review and saved progress. The HTML preview and Android asset were verified identical.

Browser tests require Playwright and Chromium. Use `EXAM_SPRINT_CHROME` to select a compatible browser when needed. Tests include `test-browser.cjs`, `test-zamify.cjs`, `test-catalogue.cjs` and `test-welcome.cjs`. Current check results are recorded in `V0_9_VERIFICATION.md`; physical-device verification remains necessary.

## Free starter question revision — 30 October 2026

The ten free questions now use stronger scenarios and closer alternatives,
with AWS objective tags, direct source links and short transfer examples in
the post-answer feedback. Of the 55 earlier paid candidates, 26 were rewritten and 29 introductory checks retained with explicit limits. Ten new paid questions were drafted. Independent expert review remains pending.
See [CONTENT_REVIEW_FREE.md](CONTENT_REVIEW_FREE.md) for the review matrix.
Source review is AI-assisted; independent expert review is still pending.

Progress records question revisions. Earlier-wording answers are retained as
local history and excluded from current progress. Sessions involving changed
wording restart; current-version sessions and unchanged-question results remain
compatible. The original ten free IDs are preserved. The development bank now has 83 unique items: ten free and 73 paid candidates.

## Guided question highlights

Guided highlights are on by default. The question toolbar can switch them off
for unaided practice. Seeing highlights counts as learning support for that
attempt, including after a reload or after hiding them again. Correct guided
answers remain in review until a later correct answer without support.

## Development limitations

The app includes 10 free practice questions and a 83-question draft-bank developer demonstration (ten free plus 73 paid candidates). Checkout and production purchase entitlements are not implemented. Content is practice material, not official exam content or a guarantee of certification. Progress is stored locally.

## Home and welcome update

The home screen centres Zami, with a direct free-practice/resume action, a single available exam and five topic shortcuts. The muted beige palette is retained.

The native WebView now signals when content is ready to draw before starting the welcome. The welcome runs once per page load, pauses its dismissal while the page is hidden, supports skip/Back/Escape and respects reduced motion. This addresses a suspected startup timing issue; real-device validation is still required.

`node test-home-welcome.cjs` covers home navigation, responsive widths, intro lifecycle and the simulated native readiness signal. The GitHub Actions workflow runs browser checks and builds a debug APK. Its temporary debug signing identity differs from previously installed test builds. Do not uninstall an existing app if you need to preserve its local progress; use the original signing key locally for a compatible update.

## v0.9.0 release candidate

The expanded offer is 10 free plus 73 new paid candidates (83 total). Release packaging includes the 73 candidates as AES-256-GCM ciphertext, with only ten questions in HTML. The bundled key is recoverable; this is extraction deterrence, not secure purchase verification. No Google Play Billing integration exists and checkout remains disabled. See `ZAMIFY_BUILD_TO_PLAY_PLAN.md`, `CONTENT_COVERAGE_83.md` and `V0_9_VERIFICATION.md`.

Follow-up fixes and Android emulator QA are documented in `V0_9_FIX_VERIFICATION.md`. `test-regressions.cjs` covers draft retention/highlights, and `test-android.py` uses ADB with UI-tree coordinates to test debug and optimized release APKs. `sign-test-release.py` prepares the release test APK with a development key; it never configures production signing.
