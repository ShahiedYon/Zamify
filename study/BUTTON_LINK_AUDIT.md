# Button and link audit — 18 November 2026

Build: v0.10.1 (Android versionCode 11).

## Coverage

- All 39 shared-engine action routes exercised through actual controls across all three exam packs, including free gates and developer tools. Every lesson and domain button was visited; disclosures, search, valid/invalid plan input, card ratings, empty states, reset cancel/confirm, session replacement/resumption, flags, next/finish and mock jump/submit/review were checked.
- All 153 questions checked in the shared engine, with 661 option interactions, four response formats, grading, rationale disclosure and source anchors.
- 121 unique embedded link targets returned HTTP 200 (following redirects) and match the Android external-navigation policy. This is a point-in-time health check; remote sites can change. The local browser click audit collected 90 screen links.
- Existing AWS engine, state migration, blocked-storage, draft/revision recovery, release-content isolation, Android Back/welcome and 320–1440px layout suites retained.

## Fixes

1. About now belongs to the shared hub; returning to Study/Learn/Progress preserves the selected exam instead of opening legacy AWS pages. Current navigation is visibly marked.
2. Recall notes now survive lesson completion, navigation and reload.
3. Switching exams resets transient lesson/card positions.
4. The keyboard Search/Enter action submits glossary searches.
5. Leaving developer preview preserves a locked paid-question session rather than discarding it on Resume.
6. Kiro and Strands source links were valid online but silently blocked by Android. Their exact HTTPS hosts are now allowed, retaining port/user-info restrictions and blocked WebView network/file access.

## Deliberate limitations

Purchase controls remain disabled and say so. This audit does not claim real purchases work. Native tests check external-browser handoff; the remote documentation itself requires connectivity in that browser. API 26 with an obsolete WebView exercises the update-required recovery screen. Browser health does not guarantee identical external-service behavior on every device.

Structured evidence is emitted into test-output/ by test-all-actions.cjs, test-hub-questions.cjs and audit-links.py. The CI also tests Android app flows and the separately installed preview on API 36.
