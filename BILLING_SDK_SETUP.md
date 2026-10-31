# Billing step 1 — SDK preparation

Updated 1 November 2026. This step bundles Google's official **Play Billing
9.1.0** library in the Gradle debug/release builds. It does not initialize a
BillingClient, query products, start checkout, restore purchases or grant an
entitlement. The release still opens with ten free questions and a disabled
**Purchases coming soon** button.

## Dependency and permission boundary

`app/build.gradle` pins `com.android.billingclient:billing:9.1.0` from Google's
Maven repository. Its published dependencies include AndroidX, Google Play
services and Google DataTransport. `android.useAndroidX=true` is required for
those dependencies; MainActivity continues to use only platform APIs. No
dependency is excluded to bypass the SDK's requirements. The pinned Kotlin
1.8.22 BOM aligns its transitive standard libraries and avoids duplicate classes
from older jdk7/jdk8 artifacts; no Kotlin compiler plugin is needed.

The user's authorization for step 1 supersedes the original handoff's blanket
ban on external AARs and requested permissions for Gradle builds. It does not
relax WebView security, backup exclusions or the ban on JavaScript interfaces.

| Merged permission | Reason |
|---|---|
| `com.android.vending.BILLING` | Official Play Billing SDK |
| `android.permission.INTERNET` | SDK's Google DataTransport dependency |
| `android.permission.ACCESS_NETWORK_STATE` | SDK's Google DataTransport dependency |
| `com.zamify.study.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION` | AndroidX receiver guard, declared with signature protection |

There is no location or advertising permission. The SDK's billing activities
and transport components are not exported. AndroidX's profile installer
receiver is exported with the system `android.permission.DUMP` guard. Only
that guarded receiver and Zamify's launcher may be exported. The study
WebView still blocks network loads, file/content access and mixed content;
there is no JavaScript interface bridge or native purchase grant.

`build-test-apk.py` builds a distinct offline developer preview directly against
`android.jar`. It strips only the known billing permission from its temporary
manifest, rejects unexpected source permissions, omits all Gradle dependencies
and verifies that its final APK requests no permissions. Use the **Gradle
debug APK and test-signed optimized release APK** for SDK packaging/device QA.
The helper APK is not the Play build.

## Verification

The existing browser and release tests check that checkout remains disabled,
the stored demo flag cannot unlock release content, and release HTML contains
only the ten free items. `verify_release.py` additionally checks both merged
manifests, SDK version metadata, the exact permission allowlist, receiver
protection, exported components and the compiled release APK. The encrypted
pack round-trip, tamper rejection, backup and WebView restrictions remain
required checks.

Run the commands in `ZAMIFY_BUILD_TO_PLAY_PLAN.md`. CI also installs the Gradle
debug and optimized release APKs on API 26, 33 and 36 emulators. API 26's old
WebView exercises the recovery screen; it is not full study-flow coverage.

Local verification on 1 November passed: content sync/export; all six logic and
browser suites; generated-release browser tests; Gradle debug/release APK and
AAB builds; release lint; compiled release/permission checks; the direct SDK
preview build; and development signing verification. Native CI results for the
pushed commit are recorded in PR #1. Production signing and real Play purchase
tests are still outstanding.

## Remaining billing work

- Configure `zamify_aif_c01_full_pack` as a one-time product in Play Console,
  including price/availability and license testers.
- Implement the BillingClient lifecycle, product loading, purchase and restore
  flows, pending/cancelled states and acknowledgement.
- Choose and implement purchase verification and refund/revocation handling
  before granting content. Bundled encryption and a local preference are not
  proof of purchase.
- Test real Play purchase states with license testers, update privacy/Data
  safety declarations for actual data flows, and complete private release
  signing and Play-track testing.

No Play Console settings or production signing credentials were changed.

## Official sources checked

- https://developer.android.com/google/play/billing/integrate
- https://developer.android.com/google/play/billing/release-notes
- https://kotlinlang.org/docs/gradle-configure-project.html#versions-alignment-of-transitive-dependencies
- https://dl.google.com/dl/android/maven2/com/android/billingclient/billing/9.1.0/billing-9.1.0.pom
