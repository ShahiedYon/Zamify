# v0.9.0 follow-up fixes and app QA

31 October 2026. PR #1, `improve-home-and-welcome`. This report supplements the first verification in `V0_9_VERIFICATION.md`.

## Fixes

- Guided highlights now always use exact question-clue text. Summary/key-point sentences no longer suppress highlighting on IDs 76–83.
- Unsubmitted choices survive Save & exit, reload and cold startup in all four formats, including partly filled matching questions. Draft choices do not become scored attempts, and submission/next clear the draft. Invalid drafts and stale question IDs fail safely.
- Locked paid attempts, old revisions, recall dates and unfinished sessions are preserved separately across free launches and saves. They stay excluded from free practice until the matching pack is supplied. Reset clears archived progress too.
- Release pack insertion checks the expected ID set and SHA-256 digest, rejects malformed/changed payloads and handles concurrent/repeated callbacks without duplicates. These are content-integrity checks, not purchase authentication.
- Removed the SharedPreferences-based native unlock shortcut. Billing URLs report unavailable; there is no native entitlement grant. The decryption method is reserved for a future verified billing integration. Real purchases still cannot be implemented under the handoff's no-external-AAR/no-permission constraints without changing that architecture.
- Isolated modern Android inset/Back types in SDK-guarded helpers, guarded late WebView callbacks after Activity destruction, and added a native update screen for an obsolete/missing WebView. Android 8 remains the OS minimum; the study page requires an updated WebView with Chromium 80+ for its JavaScript syntax. The old-image test explicitly distinguishes the update/recovery screen from a full study-flow pass.
- Added Android cloud-backup and device-transfer exclusions for all storage domains, plus an API-33 monochrome launcher icon. Policy text now covers these rules and the optional Google Play update link.
- Added a test-signed optimized release APK, separate from the development preview and unsigned publishing AAB. This is a development signing key, never a production upload key.

## Verification

Local checks: content sync/export, logic verification, home/welcome, all 83 questions and formats, learning/results/catalogue, regression suite, generated-release suite, clean Gradle debug/release APK + AAB build and release lint, compiled-AAB encryption checks, direct SDK APK compilation/signing and optimized release test signing.

New regression coverage includes eight highlighted-clue questions, incomplete selections in four formats, corrupt drafts/stale IDs, malformed/altered/concurrent pack callbacks, locked progress restoration and full reset.

Native emulator QA uses the **Test Android Apps / android-emulator-qa** workflow: ADB install/launch, UI-tree-derived taps/swipes, screenshots, XML and logcat. CI tests both debug and optimized release on API 26, 33 and 36. The test script refuses non-emulator devices before clearing test data. Full study-flow checks include offline launch, a deterministic lesson, draft cold resume, rotation, Android Back, answer grading, answered-session cold resume, privacy and release/developer-tool separation. API-26 images with obsolete WebView must display the update screen and exit safely; that result is not represented as full study QA.

Actual hosted job results are recorded in the PR after the jobs complete. No physical Samsung device or Play Console was accessed. Human content review, supported Play Billing, private production signing and Play policy/account setup remain launch requirements.

## Commands

```sh
python3 sync_content.py
python3 export_review_sheet.py
node verify.cjs
node test-home-welcome.cjs
node test-browser.cjs
node test-zamify.cjs
node test-catalogue.cjs
node test-regressions.cjs
python3 prepare_release.py
node test-release.cjs
./gradlew clean assembleDebug assembleRelease bundleRelease lintRelease --no-daemon
python3 verify_release.py
python3 build-test-apk.py
python3 sign-test-release.py
# On a dedicated emulator only:
python3 test-android.py --apk app/build/outputs/apk/debug/app-debug.apk
python3 test-android.py --apk test-build/Zamify_Release_Test.apk --release
```

The optimized release contains only ten plaintext questions. The debug/direct SDK test APK contains the labelled developer preview. Do not confuse a test-signed APK with a Play-signed production build. Bundled encryption cannot prevent extraction by an APK owner.
