# Zamify: build to Google Play

Living checklist, started 31 October 2026. Work on draft PR #1 (`improve-home-and-welcome`); merge only after the release gates are met. The first certification is AWS Certified AI Practitioner (AIF-C01). The product model is ten free questions and a one-time paid 65-question pack (65 total, not 65 extra). Future certifications should be separate data/content packs using the same study engine.

## Current position

- [x] Android project targets API 36 and builds a debug APK and unsigned release AAB in CI.
- [x] Release AAB contains only the ten free questions and no developer-demo unlock.
- [x] Ten free questions received an AWS-source-checked editorial pass; source review is AI-assisted, not independent expert approval.
- [x] Guided highlights, hints, feedback, review, searchable Terms & Services, a linked lesson and local progress work in the draft build.
- [x] Browser checks, Android build, release lint and release-asset inspection passed on commit `6e6456e` (Actions run `41227391880`).
- [x] WebView mixed content corrected to `MIXED_CONTENT_NEVER_ALLOW`; a full in-app privacy policy and `privacy.html` are drafted for the current offline free build.
- [ ] Production release is **not** ready. The unsigned CI AAB is for inspection only.

## 1. Finish the learning content and study loop

- [ ] Review the other 55 questions against the current AWS exam guide and primary AWS product documentation. Record objective, source, date, answer rationale for every option, realistic near-miss alternative, hint, common trap and transfer example. Fix or replace weak items.
- [ ] Map the whole 65-question bank to individual AIF-C01 objectives; identify thin topics and avoid claiming complete exam coverage without evidence.
- [ ] Add delayed recall: an assisted or incorrect answer returns later; a correct unaided answer clears it. Show due reviews and progress without equating practice accuracy with exam readiness. Preserve existing local progress across migrations.
- [ ] Extend the terms reference to the concepts and AWS services actually used by this pack. Keep each entry short: meaning, example, what it is often confused with, and a primary reference. Let future exam packs supply their own terms.
- [ ] Obtain an independent subject-matter review of the release content. Resolve findings and record the reviewer/date and changes without implying AWS endorsement.

**Gate:** All 65 items are reviewed, objective coverage is documented, and a learner can read, practise, review later, and explain the correct choice. Free users still see only ten questions.

## 2. Build the paid pack safely

- [ ] Define the one-time Google Play in-app product, price and regions in Play Console. Confirm the exact product ID before wiring code.
- [ ] Add Google Play Billing purchase, acknowledgement, pending/cancelled handling and restore on reinstall/device change. Test with license testers and Play test tracks.
- [ ] Verify purchase state through a trusted entitlement path; do not treat a local flag or a client-side response as proof of purchase. Keep paid questions out of the free bundle, or document and test an equivalent protected delivery design.
- [ ] Make offline use and purchase restoration understandable to users. Update privacy policy and Data safety answers for any new network, payment or account data flows.
- [ ] Remove development-only full-pack controls from production. Test failed purchase, refund, revoked purchase, no connectivity and app update cases.

**Gate:** A free install cannot unlock the 55 extra questions, a valid purchase can, and a legitimate purchase can be restored. The purchase flow follows the current Google Play payments policy.

## 3. Security and privacy release review

- [ ] Review the final manifest and signed package for permissions, exported components, WebView settings, network traffic, embedded secrets, third-party SDKs and release debugging. Check dependency advisories before release.
- [ ] Test untrusted content, source-link handling, local storage reset, upgrade/migration and tampering with entitlement state. Use OWASP MASVS as a review framework; record evidence and residual risks, not a claim of certification.
- [ ] Publish `privacy.html` at a stable public, non-geofenced HTML URL, ideally under `zamify.com`. Verify `info@zamify.com` receives mail and that the developer identity in the policy matches the Play listing.
- [ ] Put the public policy URL in Play Console and retain the in-app policy. Reconcile the policy and Data safety declarations with the **actual** release build, including Billing and any future SDKs.
- [ ] Complete content rating, ads, target-audience, app-access and other applicable Play Console declarations truthfully. Recheck current policy immediately before submission.

**Gate:** Security findings are closed or accepted with a documented reason; declarations describe the exact shipped behavior; the public policy works without login.

## 4. Test on devices and create the production bundle

- [ ] Install on Shahied's Samsung phone. Check Android 16 status/navigation bars and keyboard, first-run animation, Back, rotation, small text/large text, screen reader, offline launch, external links, progress persistence and reset.
- [ ] Run browser regression, Android build/lint, release-bundle inspection and Google Play pre-launch report; fix crashes, layout issues and accessibility failures. Ask testers to try unfamiliar questions and report confusing explanations.
- [ ] Confirm package ID `com.zamify.study`, version code and app name. Create and privately protect an upload key, enroll in Play App Signing, and build a signed production AAB. Never commit keys or upload the debug APK.
- [ ] Verify the **signed** AAB's manifest, assets, ten-free/paid behavior, install/update path and signing identity. Keep a recovery procedure for the upload key.

**Gate:** Signed AAB behaves correctly on real devices, Play pre-launch results are addressed, and release artifacts are reproducible without exposing signing secrets.

## 5. Prepare the Play listing and testing track

- [ ] Register/verify the Play developer account and decide whether the public developer identity is Shahied Yon or a registered Zamify business. Use the verified `info@zamify.com` support address.
- [ ] Create the Play Console app and complete the store listing: original icon, feature graphic, phone screenshots from the real release build, short/full descriptions, support contact and privacy URL. State independent AWS preparation and avoid affiliation or pass guarantees.
- [ ] Upload the signed AAB to internal testing, then closed testing. Recruit testers who will actually use the study flow and record issues and fixes.
- [ ] If this is a personal developer account created after 13 November 2023, maintain at least 12 opted-in closed testers continuously for 14 days, then apply for production access. Check the account's actual Console requirements.
- [ ] Review price, countries, payments profile, tax and merchant information for the paid product in Play Console. Submit to production only after the gates above and tester feedback are resolved.

**Gate:** Play Console accepts the release, required testing/verification is complete, listing claims match the app, and production access is granted. Google decides approval.

## 6. After launch and future exam packs

- [ ] Monitor crashes, reviews, purchase failures and support mail; ship fixes with higher version codes and current policy checks.
- [ ] Extract a reusable pack schema for exam metadata, objective map, questions, terms, references, revision and entitlement ID. Keep learner progress isolated by certification and question revision.
- [ ] Apply the same editorial, security and release gates to each new certification. Do not assume AWS terms or scoring rules fit other exams.

## Immediate next action

Start phase 1 with the remaining 55-question editorial and objective-coverage pass. Keep the Play submission work behind the content, purchase and signed-build gates. `PLAY_RELEASE_READINESS.md` holds the technical release notes; `CONTENT_REVIEW_FREE.md` records the ten free-item revision.

## Official references

- Google Play target API: https://support.google.com/googleplay/android-developer/answer/11926878
- Privacy and user data: https://support.google.com/googleplay/android-developer/answer/10144311
- Data safety: https://support.google.com/googleplay/android-developer/answer/10787469
- Payments: https://support.google.com/googleplay/android-developer/answer/9858738
- Personal-account closed testing: https://support.google.com/googleplay/android-developer/answer/14151465
- Functionality and content: https://support.google.com/googleplay/android-developer/answer/9898783
- Play App Signing: https://developer.android.com/studio/publish/app-signing
- OWASP MASVS: https://mas.owasp.org/MASVS/
