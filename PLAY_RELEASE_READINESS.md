# Zamify Google Play release gate — 25 October 2026

Status: **free ten-question release candidate under review; no paid purchase yet**.

## Verified in source

- The Android manifest requests no device permissions, disables cleartext traffic and cloud backup, and exposes only the launcher activity.
- The app loads its bundled HTML under a local HTTPS origin, blocks other WebView resources, and sends allowlisted AWS documentation links to the external browser.
- WebView file/content access, file-origin bridges, automatic windows, network loads and release WebView debugging are disabled; Safe Browsing is enabled. Bundled HTML has a restrictive CSP.
- Practice progress stays in WebView local storage. Users can reset it in About. No account, analytics SDK, advertising SDK, or payment SDK appears in this source.
- Android target and compile SDK are 36, with AGP 8.13.2 / Gradle 8.13. CI checks the browser, builds a debug APK and an unsigned release AAB, runs release lint, and inspects the AAB's HTML asset.
- The release variant generates its own HTML asset from the editor preview and bundles only the ten free questions. The other 55 remain in the source bank for editorial work, not in the release AAB. The release UI has no developer full-pack control.

## Release blockers

1. **Paid content and entitlements.** The first Play release is free with ten questions. The separate 65-question pack remains planned. Before selling it, configure the in-app product in Play Console, implement Google Play Billing and purchase acknowledgement/restore, verify entitlements, and decide how the paid content is delivered or protected. A client-only gate is insufficient. Do not market the current build as purchasable.
2. **Privacy policy and Play Console declarations.** Publish a non-editable, public, non-geofenced HTML privacy-policy URL with the developer identity and privacy contact; link it from the Play listing and within the app. Confirm app behavior and the Play Console Data safety, target audience, content rating, ads and app-access answers. The in-app privacy summary is not a complete published policy.
3. **Release signing and ownership.** Enroll in Play App Signing and retain a private upload key. The local development key and CI debug key are not release keys. Verify the Play Console package name `com.zamify.study`, developer account and app ownership before signing.
4. **Content and device review.** Finish the editorial review of all 65 questions and review the ten rewritten free samples in Linear. Check this target-36 build on the Samsung phone for top/bottom insets, Back behavior, offline launch, external reference links, accessibility, rotation and saved-progress migration. CI/browser results do not replace device testing.
5. **Store assets and declarations.** Supply original screenshots, app icon, descriptions and support contact with accurate, non-affiliation claims; complete all required Play Console forms. Confirm any account-specific testing requirement in the actual console before production rollout.

## Build verification

Run `python3 sync_content.py && node verify.cjs && python3 prepare_release.py` and the browser tests. CI runs `./gradlew assembleDebug bundleRelease lintRelease --no-daemon` then `python3 verify_release.py`, which inspects the actual AAB. The release AAB from CI is **unsigned**, for inspection only. Do not distribute the debug APK or submit the unsigned AAB.

## Official references

- Target API requirements: https://support.google.com/googleplay/android-developer/answer/11926878
- User data and privacy policy: https://support.google.com/googleplay/android-developer/answer/10144311
- Data safety form: https://support.google.com/googleplay/android-developer/answer/10787469
- Google Play payments: https://support.google.com/googleplay/android-developer/answer/9858738
- Play App Signing and app bundles: https://developer.android.com/studio/publish/upload-bundle
- WebView security: https://developer.android.com/privacy-and-security/risks/webview-unsafe-file-inclusion
- Android 16 behavior changes: https://developer.android.com/about/versions/16/behavior-changes-16
