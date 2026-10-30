# Free starter: question quality revision

30 October 2026. Ten original questions revised against public AWS sources.
This is an editorial and source review, not independent expert approval or a
validated prediction of exam performance. Difficulty labels are editorial.

| ID | Objective | Decision tested | Closest competing idea |
|---|---|---|---|
| 1 | 1.2 | Predict a revenue amount before a later threshold report | Classification into bands |
| 6 | 2.1 | Measure input cost in the model's billing unit | Equal words versus equal tokens |
| 10 | 2.1; related 3.1, 3.3, 5.1 | Separate connection, authorization, retrieval and training | A connection does not grant permission |
| 11 | 3.1 | Supply changing evidence and source passages | Fine-tuned knowledge or cached answers |
| 13 | 3.1 | Reduce sampling variation while preserving output room | Length limits and stop sequences |
| 16 | 4.1 | Investigate reported subgroup errors with adequate evidence | Equal thresholds and aggregate scores |
| 29 | 1.3 | Keep the final test set outside model selection | Repeated tuning against final test results |
| 45 | 3.1; related 3.2 | Combine current retrieval and format demonstrations | Training-based adaptation or cached answers |
| 59 | 4.1 | Address regional representation and evaluation gaps | More majority data or a weighted average |
| 65 | 5.1 | Prevent forbidden actions outside model generation | Prompt rules, confidence and audit logging |

Each revised item carries a primary AWS source, exam-objective source,
review date, content revision, rationale for every option, a reasoning hint,
a clue tied to its scenario, a common confusion and a transfer example.
The example appears in a disclosure after answering, keeping the question
screen focused. Exact source URLs are stored with each item in questions.json.

The ten original free IDs and all four answer formats remain. The total bank
remains 65; the other 55 items have not been rewritten in this revision.

## Progress compatibility

Storage v4 records the content revision on each submitted answer and the
revision snapshot for an in-progress session. Results from older wording move
to local historicalAttempts, excluded from current accuracy and coverage.
Answers to unchanged questions, review IDs and developer-preview access are
preserved. A session involving revised wording is closed rather than resumed
against changed questions. A current-revision session can resume normally.
The Progress page explains the historical-answer count. The normal explicit
reset action still clears local history.

## Checks

- sync_content.py validates answer structures, clue text and synchronized HTML.
- verify.cjs checks scoring, four formats, hints, free/full boundaries, storage
  failures, legacy progress and the revised-content migration/resume behavior.
- prepare_release.py generates the ten-question-only release asset.
- Interactive browser QA completed all ten revised questions through the 390px
  preview, exercising all four formats and feedback. A 320px check confirmed
  no horizontal overflow and separation between content and navigation.
- Existing automated browser checks and Android build remain in GitHub Actions;
  they were not run remotely for this local commit. No new APK/AAB was built.
- Local source/scoring/migration checks and ten-only asset generation passed.

Before calling the pack comprehensive exam preparation, review the remaining
55 items and map coverage to individual objectives. Independent expert review
and real-device testing remain required before a paid release.

## Guided highlights — 30 October 2026

Guided highlights are on by default and can be switched off on a question.
The ten revised items have curated keyPoints; other items use their existing
clue phrases. Multiple-answer instructions such as TWO are emphasized too.
Only question text is highlighted; answer choices are not marked as correct.

Once highlights have been displayed for an attempt, that attempt remains
assisted even if the user hides them before submitting. The preference and
per-question assistance survive reload. A later correct attempt with highlights
off and no hint can clear the review queue. Unaided metrics exclude both hints
and guided highlights. Source facts, keys and content revisions are unchanged.

Local regression checks cover default visibility, switching off, reload,
assisted scoring and later unaided review. Interactive 320px preview confirmed
the requested question highlights before answering and assisted feedback.
The automated browser disclosure assertion now targets the named analysis
disclosure instead of relying on its position after adding transfer examples.
