# Zamify shared study hub — v0.10 development build

Implemented inside the existing hardened offline WebView, retaining the original AWS practice engine and its migration path. `Preview.html` is the self-contained developer preview; `app/src/main/assets/index.html` is the identical debug asset. `hub.js` and `hub.css` are the maintained engine sources.

| Exam | Total candidate questions | Free | Lessons / exercises |
| --- | ---: | ---: | ---: |
| AWS AI Practitioner AIF-C01 | 83 | 10 existing IDs | 5 |
| SnowPro Core COF-C03 | 30 | 10 | 5 |
| AWS ML Engineer Associate MLA-C02 | 40 | 10 including AgentCore | 6 |

All packs have plans, lessons, recall cards, domain drills, timed mini mocks, flags, saved sessions, post-submit review, practical exercises, comparison maps and terminology. MLA has five detailed visual comparison tables and a dedicated acronym glossary. The other packs derive comparison/definition summaries from their lesson content.

## Rebuild and verify

```bash
python3 study/author_packs.py
python3 sync_content.py
python3 export_review_sheet.py
node verify.cjs
python3 prepare_release.py
node test-study-hub.cjs
```

Run the existing browser/release suites as well. Gradle builds execute release packaging automatically. The CI checks browser flows and builds debug/release/AAB, with emulator smoke tests on API 26/33/36. API 26 can exercise the explicit outdated-WebView recovery screen rather than the full study flow.

## Behavioral boundaries

- Independent exam state under `zamify-study-hub-v1`; original AWS key is retained. Legacy AWS outcomes are copied once, with the original session accessible through its own entry. Old and new engines do not continuously merge histories.
- Hinted answers remain in learning/mistake review and do not count as unaided progress. Domain summaries use latest unaided evidence; retakes are explicitly not fresh exam evidence.
- Learning explanations appear only after checking an answer. Mock mode has no hints or answer feedback before submission; the absolute deadline survives reload and app suspension. Mini mocks sample by domain weights where the bank permits, without duplicate IDs.
- A mock is graded once, with exact-set multi-response scoring and incorrect unanswered/incomplete responses. No official score conversion or readiness guarantee.
- Practical exercises are offline guided tasks, not live AWS or Snowflake sandboxes. Notes and recall answers are self-assessed.
- Release HTML includes only 10 questions per pack. Lessons, cards, glossary and maps are stripped; full data is encrypted in `study_packs.enc`, in addition to the original AWS encrypted pack. Encryption is an extraction deterrent, not strong DRM: an APK owner can derive the bundled offline key.
- Release ignores local developer flags. Native purchase/restore/verification for the multi-pack engine is **not implemented** and checkout is disabled. Metadata names future per-exam products but does not create them in Play Console. No money can be charged by this build.
- Source links allow only HTTPS on exact official AWS/Snowflake hosts, preserving existing WebView network/file restrictions.

## Before paid launch

Independent subject-matter review, larger coverage-balanced banks, verified Play purchase/restore/revocation handling, entitlement-to-pack integration, final pricing/product configuration, production signing and Play Console account testing. This build is for functional review, not a claim of Play release readiness.
