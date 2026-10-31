# Independent content review and learner pilot

Status: **prepared, not yet performed**. This protocol covers the ten free and 65 new paid AIF-C01 candidates. Use `python3 export_review_sheet.py` to regenerate `review_sheet.csv` from the current bank. Keep the completed sheet and reviewer identity with the release record. The source sheet has empty verdict fields; no independent approval is implied.

## Subject reviewer

Use an independent reviewer with current AIF-C01 or relevant AWS AI subject knowledge who did not write these questions. Give them the official exam guide, source links and the worksheet. For each of the 75 rows, ask them to:

1. Answer without the key first. Identify the exact wording that makes the best answer correct, and challenge the closest alternative.
2. Check the AWS task, service names, reference, current behavior and all option explanations. Flag ambiguity, outdated claims, unsupported distractors, poor accessibility or accidental clues.
3. Mark `Accept`, `Revise` or `Reject` in `reviewer_verdict`; record a specific fix and source in `issue_and_proposed_fix`, plus name and date. For ordering/matching, check that each step or pair is uniquely determined. Do not mark unresolved questions accepted.
4. After fixes, review the changed question again and fill `retest_after_fix`. Bump `contentRevision` when learner-facing wording or the key changes, so old attempts are kept in history without scoring against a new item.

Acceptance requires every row accepted after any fixes, no unresolved incorrect keys or ambiguous closest alternatives, and a documented reviewer and date. Do not claim AWS endorsement or calibrated exam difficulty.

## Learner pilot

Ask several people preparing for AIF-C01 to try the free starter and a draft paid session. Include a beginner and someone with AWS familiarity. Do not show the answer key in advance. Observe first-run comprehension, question reading, highlights, term help, feedback, due review and the 10-free/65-new offer. On a later day, give a changed scenario that tests the same concept without copying the question wording.

Record question ID, whether the learner understood the task, whether two options seemed equally defensible, whether the explanation changed their reasoning, any misleading clue, and mobile usability issues. Record the later recall attempt separately from immediate re-answering. Use these notes to revise content and interaction. A practice score or a small pilot is not an AWS pass prediction.

## Release decision

The content gate closes only after the reviewer has signed off all release items and the learner pilot findings have been resolved. The paid purchase, entitlement, signed bundle and Play gates remain separate in `ZAMIFY_BUILD_TO_PLAY_PLAN.md`.
