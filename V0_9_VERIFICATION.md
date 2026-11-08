# v0.9.0 execution and verification — 31 October 2026

Branch: `improve-home-and-welcome`. This is a development candidate, not Play approval.

## Completed checks

| Check | Result |
|---|---|
| `python3 sync_content.py` | PASS: 83 items, all clue substrings, all four formats, identical HTML assets |
| `python3 export_review_sheet.py` | PASS: 83 review rows |
| `node verify.cjs` | PASS: counts, 14 primary objectives, scoring, hints, progress migration and delayed recall |
| `node test-home-welcome.cjs` | PASS: responsive home/welcome, lifecycle, Back and reduced motion |
| `node test-browser.cjs` | PASS: all 83 questions, all formats, grading, reload/resume, overflow and no JavaScript errors |
| `node test-zamify.cjs` | PASS: focus sprint, results and remediation |
| `node test-catalogue.cjs` | PASS: navigation, five topic modules, free/paid copy and disabled purchase UI |
| `node test-release.cjs` | PASS: generated release HTML, stale-demo rejection, malformed/repeated unlock callback, decrypted paid item scoring, return-to-free and reload restrictions |
| Generated encrypted pack | PASS: exact 73-item round-trip; altered ciphertext and altered GCM tag rejected |
| `./gradlew assembleDebug bundleRelease lintRelease --no-daemon` | PASS: debug APK, shrunk release AAB and release lint (82 tasks) |
| `python3 verify_release.py` | PASS: compiled AAB has ten free items and exactly matching 73-item encrypted payload; tamper tests pass |
| `python3 build-test-apk.py` | PASS: final direct SDK build and APK v2/v3 signature verification |

Local environment: JDK 17, Node, Playwright 1.56.1 with Chromium 141, SDK platform 36 and Build Tools 35.0.0. Gradle 8.13 distribution checksum was verified. Host-specific proxy settings were supplied to Java; they are not committed. The host exposed its compiler through the JDK compiler module; the direct SDK compilation also succeeded against `android.jar` without external dependencies.

## Corrections found during execution

- The handoff's exact replacement code has no Google Play Billing client, entitlement writer, purchase verification or acknowledgement. Kept checkout disabled and corrected the privacy policy and release plan instead of claiming these were complete.
- A derivable embedded AES key is not secure entitlement enforcement. Used fresh random GCM nonces and documented the extraction/modified-client limitations.
- Added robust callback validation, duplicate protection, a return-to-free boundary, decryption failure handling and retained IME resize behavior.
- Qualified universal/guaranteed claims in the eight supplied question drafts (long-context saturation, latency, LoRA savings, numerical precision and distillation model availability). Updated CPT/LoRA/DPO references to more relevant AWS pages. Human review remains pending; no human sign-off was fabricated.
- Existing `test-browser.cjs` expected one review card despite the already-implemented recall card plus weak-topic card. It now asserts each intended card explicitly.
- Release lint flags the legacy Back override even when a platform API-33+ callback is present. Added only a method-level `GestureBackNavigation` suppression, with an explanation: the override is the API-26–32 fallback, and modern devices use `OnBackInvokedCallback`. No global lint disable or baseline was added.
- Updated direct SDK helper from API 35/version 0.8 to API 36/version 0.9, and allowed SDK environment variables so the requested no-argument CI command works.
- Extended CI with content regeneration/drift checks, review-sheet generation, encrypted-release browser checks and direct SDK APK packaging. CSV export uses LF line endings for clean diffs.

## Remaining release gates

Independent SME review; learner pilot; actual supported Billing integration and entitlement threat review; production upload signing; Samsung/API-26/API-33/API-36 device QA; public privacy URL; support email verification; Play declarations, store listing, pre-launch report and account-specific closed testing. No physical device or Play Console was accessed in this task.

The release AAB is unsigned unless private signing environment variables are supplied. Debug/test APKs contain the development preview and are not the Play release edition. The generated release callback and local preference are scaffolding, not proof of purchase.

Release lint completed with zero errors and five warnings: API-33-only manifest attribute, intentional JavaScript use, Android 12 data-extraction guidance, redundant v26 icon directory and missing monochrome icon. These are not a security certification; device-transfer behavior and themed icons remain QA items. A stale intermediate AAB from a preceding partial build was removed before the successful packaging retry.
