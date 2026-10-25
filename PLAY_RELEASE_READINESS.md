# Zamify Google Play release gate — 25 October 2026

Status: **not ready to submit or package as a paid product**. The current build is a developer preview.

## Verified in source

- The Android manifest requests no device permissions, disables cleartext traffic and cloud backup, and exposes only the launcher activity.
- The app loads its bundled HTML under a local HTTPS origin, blocks other WebView resources, and sends allowlisted AWS documentation links to the external browser.
- WebView file/content access, file-origin bridges, automatic windows, network loads and release WebView debugging are disabled; Safe Browsing is enabled. Bundled HTML has a restrictive CSP.
- Practice progress stays in WebView local storage. Users can reset it in About. No account, analytics SDK, advertising SDK, or payment SDK appears in this source.
- Android target and compile SDK are 36, with AGP 8.13.2 / Gradle 8.13. CI checks the browser, builds a debug APK and an unsigned release AAB, and runs release lint.

## Release blockers

1. **Paid content and entitlements.** The 65-question bank, including the planned 55 paid questions, is bundled in the preview and a developer demo control unlocks it. Client-side gates cannot protect paid content. Before a paid Play release, implement Google Play Billing for digital access, design restore/purchase-state handling, remove the developer demo route, and decide how paid content is delivered or protected. An alternative first release is genuinely free, with only the ten free questions bundled and all paid claims/demo controls removed. Do not market or submit the current demo as a purchasable pack.
2. **Privacy policy and Play Console declarations.** Publish a non-editable, public, non-geofenced HTML privacy-policy URL with the developer identity and privacy contact; link it from the Play listing and within the app. Confirm app behavior and the Play Console Data safety, target audience, content rating, ads and app-access answers. The in-app privacy summary is not a complete published policy.
3. **Release signing and ownership.** Enroll in Play App Signing and retain a private upload key. The local development key and CI debug key are not release keys. Verify the Play Console package name `com.zamify.study`, developer account and app ownership before signing.
4. **Content and device review.** Finish the editorial review of all 65 questions and review the ten rewritten free samples in Linear. Check this target-36 build on the Samsung phone for top/bottom insets, Back behavior, offline launch, external reference links, accessibility, rotation and saved-progress migration. CI/browser results do not replace device testing.
5. **Store assets and declarations.** Supply original screenshots, app icon, descriptions and support contact with accurate, non-affiliation claims; complete all required Play Console forms. Confirm any account-specific testing requirement in the actual console before production rollout.

## Build verification

Run `python3 sync_content.py && node verify.cjs` and the browser tests. CI runs `./gradlew assembleDebug bundleRelease lintRelease --no-daemon`. The release AAB from CI is **unsigned**, for inspection only. Do not distribute the debug APK or submit the unsigned AAB.

## Official references

- Target API requirements: https://support.google.com/googleplay/android-developer/answer/11926878
- User data and privacy policy: https://support.google.com/googleplay/android-developer/answer/10144311
- Data safety form: https://support.google.com/googleplay/android-developer/answer/10787469
- Google Play payments: https://support.google.com/googleplay/android-developer/answer/9858738
- Play App Signing and app bundles: https://developer.android.com/studio/publish/upload-bundle
- WebView security: https://developer.android.com/privacy-and-security/risks/webview-unsafe-file-inclusion
- Android 16 behavior changes: https://developer.android.com/about/versions/16/behavior-changes-16
