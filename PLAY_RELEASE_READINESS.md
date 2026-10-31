# Zamify Google Play release gate — 25 October 2026

Status: **free ten-question release candidate under review; no paid purchase yet**.

## Verified in source

- The Android manifest requests no device permissions, disables cleartext traffic and cloud backup, and exposes only the launcher activity.
- The app loads its bundled HTML under a local HTTPS origin, blocks other WebView resources, and sends allowlisted AWS documentation links to the external browser.
- WebView file/content access, file-origin bridges, automatic windows, network loads and release WebView debugging are disabled; Safe Browsing is enabled. Bundled HTML has a restrictive CSP.
- Practice progress stays in WebView local storage. Users can reset it in About. No account, analytics SDK, advertising SDK, or payment SDK appears in this source.
- Android target and compile SDK are 36, with AGP 8.13.2 / Gradle 8.13. CI checks the browser, builds a debug APK and an unsigned release AAB, runs release lint, and inspects the AAB's HTML asset.
- The release variant generates its own HTML asset from the editor preview and bundles only the ten free questions. The 65 paid candidates (55 earlier plus ten newly drafted) remain in the source bank, not in the release AAB. They have an AI-assisted source/editorial pass and still require independent review. The release UI has no developer full-pack control.

## Release blockers

1. **Paid content and entitlements.** The first Play release is free with ten questions. A separate expansion of 65 new paid questions (75 unique questions including the free ten) remains planned. Before selling it, configure the in-app product in Play Console, implement Google Play Billing and purchase acknowledgement/restore, verify entitlements, and decide how the paid content is delivered or protected. A client-only gate is insufficient. Do not market the current build as purchasable.
2. **Privacy policy and Play Console declarations.** A full in-app policy and matching `privacy.html` are prepared for the current free build. Publish that HTML at a non-editable, public, non-geofenced URL and enter it in Play Console. Verify the contact mailbox and match the final developer identity. Confirm app behavior and the Play Console Data safety, target audience, content rating, ads and app-access answers. Revisit the policy and declarations before adding billing, accounts, analytics or other data flows.
3. **Release signing and ownership.** Enroll in Play App Signing and retain a private upload key. The local development key and CI debug key are not release keys. Verify the Play Console package name `com.zamify.study`, developer account and app ownership before signing.
4. **Content and device review.** The ten free questions have an AI-assisted source/editorial revision recorded in CONTENT_REVIEW_FREE.md. Obtain independent expert review and obtain independent expert review of all paid candidates and resolve any findings before selling the full pack. Check this target-36 build on the Samsung phone for top/bottom insets, Back behavior, offline launch, external reference links, accessibility, rotation and saved-progress migration. CI/browser results do not replace device testing.
5. **Store assets and declarations.** Supply original screenshots, app icon, descriptions and support contact with accurate, non-affiliation claims; complete all required Play Console forms. Confirm any account-specific testing requirement in the actual console before production rollout.

## Security review — 31 October 2026

Source inspection found no INTERNET or other requested Android permission, exported component beyond the launcher, third-party SDK, JavaScript bridge, account, analytics, ad or payment flow. The bundled WebView blocks network requests, file/content access, automatic windows and mixed content. The prior numeric mixed-content setting was `0` (always allow) and was corrected to `MIXED_CONTENT_NEVER_ALLOW` in this review. The WebView allows the local app document and opens only exact `docs.aws.amazon.com` HTTPS links outside the app. Cleartext traffic and Android backup are disabled, and release WebView debugging is disabled. The page uses a restrictive CSP and escapes question/term text inserted into HTML. The release generator removes the full question bank and demo unlock; `verify_release.py` inspects the AAB.

This is a source and CI review, not a penetration test, a certification against a named standard, or a Google approval. Remaining checks: inspect the signed production AAB and merged manifest, run Play's pre-launch report and an actual Samsung install, check dependency vulnerability notices before each release, confirm the privacy contact and hosted URL, and verify Play Console declarations against the exact shipped build. The paid edition needs a separate purchase and entitlement threat review; do not use a client-side demo flag as proof of purchase.

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
