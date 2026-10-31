# Zamify Build-to-Play Master Plan — v0.9.0

Updated 31 October 2026. Status: **engineering candidate; purchases unavailable; not approved for Play production**.

## 1. Content and learning

- [x] Expand Tasks 2.2 and 3.3 from three to seven primary items each (IDs 76–83). Total: **83 unique questions = 10 free + 73 new paid candidates**. This explicitly supersedes the earlier 10 + 65 offer.
- [x] Keep guided highlights, hints, all-option rationales, progress revisions, and the existing 24-hour delayed-recall queue.
- [x] Regenerate the 83-row `review_sheet.csv` and synchronized HTML assets.
- [ ] Obtain independent human subject-matter review and record findings/sign-off. The new items remain agent-authored drafts; advanced detail is not a guarantee of exam coverage.
- [ ] Pilot with learners and evaluate retention. Existing delayed recall is a missed/assisted-answer queue, not a completed mastered-streak scheduler.

## 2. Android and packaging

- [x] Compile and target SDK 36; versionCode 9 / versionName 0.9.0; min SDK 26.
- [x] Preserve pure Android SDK, no external AAR dependencies, `android.useAndroidX=false`, no requested permissions, and no JavaScript interface bridge.
- [x] Add configuration handling, modern system-bar appearance, IME inset pass-through and API-33 Back callback with earlier-platform fallback.
- [x] Return explicit local-resource 404 responses with `Cache-Control: no-store`; preserve WebView network/file/content/mixed-content restrictions.
- [x] Enable R8/resource shrinking; configure optional release signing using environment variables. `ndk.debugSymbolLevel 'FULL'` is configured, but there are no native `.so` libraries to generate symbols for.
- [x] Package only the original ten free items in release HTML; bundle 73 candidates as AES-256-GCM `paid_pack.enc` with fresh random 12-byte nonce and 16-byte authentication tag.
- [x] Add compiled-AAB checks for free IDs, paid-question leakage, exact decryption round-trip and ciphertext/tag tamper rejection.
- [ ] Finish physical Samsung testing, including API-26/older Android compatibility, API-33+ Back, API-36 edge-to-edge, rotation, resizing, keyboard, cutouts, offline startup, local progress and accessibility.

## 3. Paid entitlement — RELEASE BLOCKER

- [x] Implement native in-memory decryption and an idempotent HTML insertion callback as a scaffold.
- [ ] Implement supported Google Play Billing, purchase verification, pending/cancelled handling, acknowledgement, restoration and refund/revocation behavior; test with Play license testers.
- [ ] Resolve the handoff's platform-only/no-dependency/no-permission constraints before billing integration. The supported Google integration uses the Play Billing Library; a SharedPreferences flag is not a Play entitlement.
- [ ] Complete a paid-content threat review. The embedded SHA-256-derived AES key is recoverable from the app. Encryption prevents plaintext packaging and detects ciphertext tampering; it does **not** provide DRM, secure purchase verification or resistance to a modified app. R8 does not change this boundary.

No code in this version grants or writes a purchase entitlement. Unlock/restore routes only consult an existing local preference. Checkout stays disabled. Do not claim purchase/restore support in the privacy policy or listing, or sell this candidate as a working paid pack.

## 4. Verification

Run from the repository root with JDK 17, Node, SDK platform 36 and Build Tools 35.0.0:

```sh
python3 sync_content.py
python3 export_review_sheet.py
node verify.cjs
node test-home-welcome.cjs
node test-browser.cjs
node test-zamify.cjs
node test-catalogue.cjs
./gradlew assembleDebug bundleRelease lintRelease --no-daemon
python3 verify_release.py
python3 build-test-apk.py
```

`build-test-apk.py` accepts `--sdk`, `ANDROID_HOME` or `ANDROID_SDK_ROOT`. Additional generated-release browser test: `python3 prepare_release.py` then `node test-release.cjs`. CI also checks generated files for drift. See `V0_9_VERIFICATION.md` for actual results; source changes alone are not evidence of passing checks.

## 5. Signing, policy and Play Console

- [ ] Generate and privately back up an upload keystore. Example: `keytool -genkeypair -v -keystore zamify-upload.jks -keyalg RSA -keysize 4096 -validity 9125 -alias zamify-upload`. Never commit the key or passwords.
- [ ] Set `ZAMIFY_UPLOAD_STORE_FILE`, `ZAMIFY_UPLOAD_STORE_PASSWORD`, `ZAMIFY_UPLOAD_KEY_ALIAS` and `ZAMIFY_UPLOAD_KEY_PASSWORD` privately, enroll in Play App Signing, build and inspect the signed AAB. Without these variables the AAB is unsigned.
- [ ] Publish `privacy.html` at a public HTTPS URL, verify `info@zamify.com`, and confirm the final operator/developer identity. The policy accurately describes this free offline version; revisit it before enabling payments.
- [ ] Complete Data safety, target audience, content rating, ads and app-access declarations against the exact shipped build.
- [ ] Install through a Play internal track or Internal App Sharing; run the pre-launch report and resolve findings.
- [ ] Prepare original store screenshots and title **Zamify: AI Cert Practice** (24 characters). Place the independent-preparation/non-affiliation disclaimer early in the full description. Do not promise a pass or imply AWS endorsement.
- [ ] Confirm account-specific testing requirements in Play Console. For personal accounts created after 13 November 2023, current guidance requires at least 12 testers continuously opted in for 14 days before applying for production access. Recruit 15–20 as a buffer and record feedback. Completing this period is not automatic production approval.

## Official references checked

- Billing integration: https://developer.android.com/google/play/billing/integrate
- Personal account testing: https://support.google.com/googleplay/android-developer/answer/14151465
- Privacy requirements: https://support.google.com/googleplay/android-developer/answer/10144311
- Android 16 changes: https://developer.android.com/about/versions/16/behavior-changes-16

This plan is an engineering checklist, not a cybersecurity certification or a guarantee of Google Play acceptance.
