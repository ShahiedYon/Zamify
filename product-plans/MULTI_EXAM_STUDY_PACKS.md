# Zamify study packs

Product and implementation blueprint · 18 November 2026

## Product decision

Zamify becomes a catalogue of complete exam study packs. Every published exam offers ten fixed free questions. Buying an exam pack unlocks its learning plan, lessons, flashcards, drills, practical exercises, mock assessments, exam playbook and targeted review.

The unit of purchase in this blueprint is one exam pack. This is an implementation assumption based on the existing AIF-C01 product. Pricing for the expanded offer, bundles and exam-version upgrades still needs a business decision. Keep one clear purchase per exam for the first implementation.

The study journey follows the SnowPro Core Sprint structure. Zamify retains its own Zami identity, beige palette and readable Android presentation. The change is in the learning experience and content model.

This checkpoint contains the product specification and an original ten-question SnowPro content draft. It does not implement the Android redesign, enable purchases or publish a new app release.

## Three exam tracks

| Track | Baseline | Free entry | Paid pack scope | Content status |
| --- | --- | --- | --- | --- |
| AWS Certified AI Practitioner | AIF-C01 | Preserve the ten approved IDs | Existing 73 paid candidates plus the study features below | Migrate and complete review |
| SnowPro Core | COF-C03 | Ten original questions in the accompanying draft | A complete SnowPro learning journey with separately reviewed assessment content | Starter draft prepared; paid bank needs authoring |
| AWS Certified Machine Learning Engineer – Associate | MLA-C02 | Ten original questions when this track is ready | Practical ML and AI engineering study pack | Blueprint and coverage baseline; content needs authoring |

AWS's current English guide identifies MLA-C02 as the exam in use from 29 September 2026. Its four domain weights are 28%, 24%, 24% and 24%. Include foundation models, retrieval-augmented generation, agent workflows, deployment, evaluation and security alongside traditional ML. Match each release to the current guide before publication.

Preserve AIF-C01's existing 83 question IDs and current division of ten free plus 73 paid candidates. The new study tools do not themselves increase that bank. SnowPro and MLA-C02 paid counts remain unset until their coverage and review are complete.

## Free and paid access

| Capability | Ten-question starter | Purchased exam pack |
| --- | --- | --- |
| Exam catalogue, exam overview and objectives | Included | Included |
| Fixed ten questions with repeat access | Included | Included |
| Hints, optional key-point highlighting and explanations for those ten | Included | Included |
| Saved starter attempts and a clearly labelled starter result | Included | Included |
| Full learning plan and objective lessons | Locked | Included |
| Full flashcard deck and due-card review | Locked | Included |
| Full domain drills and topic selection | Locked | Included |
| Timed mock mode with saved attempts | Locked | Included |
| Review queue for mock mistakes and flagged questions | Locked | Included |
| Worked exercises, scenario labs and exam playbook | Locked | Included |
| Detailed domain trends and personal focus plan | Locked | Included |
| Purchase restoration and support access | Available | Available |

Show what each locked feature contains and its price before checkout. Do not expose complete premium flashcards, lessons or answer banks in public starter payloads. Keep the free explanations complete so learners can understand each free answer.

If an exam's paid pack is not ready, label it as in preparation and disable checkout for that exam. No payment is taken for unfinished content.

## Screen structure

1. Catalogue. Each exam card shows the exam code, provider, ten free questions, content status and purchase state. Progress belongs to the selected exam.
2. Exam home. Show Continue, the learner's next task, study plan, topic map and review items. Zami introduces the selected exam once and can repeat the welcome on demand.
3. Study plan. Ask for the exam date and realistic minutes per day. Offer a suggested schedule that can be adjusted. Add a retake path based on domain feedback. Avoid prescribing eight days to every learner.
4. Learn. Short lessons explain one idea, show a memory cue and worked example, then check recall. A learner can proceed one definition at a time.
5. Drill Lab. Original scenarios, domain practice and immediate teaching feedback. Offer a clue before revealing the answer. Track hints and highlights as assistance.
6. Flashcards. Search, filter by objective, reveal, mark for review and spaced recall. Expand acronyms on first use. A concept's related lesson and drill remain accessible.
7. Practice exam. Configure an appropriate exam simulation or an explicitly shorter practice sitting. Persist timer deadline, question and option order, answer IDs and flags. Full mock mode hides hints, answer clues and correctness until submission or timeout.
8. Results and focus. Show raw score, attempted count and per-domain correct/total. Separate weak evidence, unattempted objectives and completed mastery checks. Link weak domains directly to their lessons and drills.
9. Mistake review. Retry incorrect, unanswered and flagged items. Preserve the original assessment score. Clear an item only after a correct unaided retry, then check the concept again with a different scenario later.
10. Exam Playbook. Teach comparisons, wording traps and decision criteria. Avoid implying that keyword memorization predicts live exam answers.
11. Exercises. SnowPro uses SQL prediction and small sandbox tasks. AWS uses configuration, architecture, permissions and troubleshooting scenarios. Clearly label local simulations. Real cloud labs need the learner's own account and can incur charges.
12. Pack and account support. Show included features, store-loaded price, purchase and restore state, support and privacy information.

Group the smaller screens under five mobile navigation destinations — Home, Learn, Practice, Review and Progress. Keep catalogue switching and restore accessible. Show labels with icons and support large text and short screens.

## Assessment integrity

Study mode can show hints and guided highlights. Mock mode assesses answers without those supports. Mark assisted and previously seen items so repeat accuracy is interpreted correctly. A practice score remains a raw practice score and is never converted into a provider's scaled score or a pass probability.

The initial SnowPro site mock uses 50 questions in 58 minutes. That is a shortened practice sitting. Each app pack needs its own verified format, weighting, question count and duration metadata. Do not reuse SnowPro timing for the AWS exams. AIF-C01 currently lists single-answer, multiple-response, ordering and matching formats. MLA-C02 currently lists single-answer and multiple-response formats.

Separate the teaching bank from reserved mock scenarios. Randomize options using stable IDs and remap keys correctly. Keep an existing attempt's order through reload. When question meaning changes, keep its old result as history and remove it from current mastery statistics.

Use correct/total and explicit coverage labels on domain charts. Ten starter questions are an introduction. Full domain diagnosis requires a broader set of attempts. Distinguish unseen, assisted, incorrect, correct once and recalled later.

## Shared content model

An exam manifest defines exam ID, provider, exam code, guide URL, checked date, domains, objective references, available question types, free question IDs, pack product ID, content revision and publication status.

Content items have stable exam-scoped IDs. Each question includes the scenario, response type, option IDs and keys, objective, source, hint, decisive clue, explanation for every option, misconception, transfer example, revision and review state. Lessons, flashcards and labs link to the same objectives and concepts.

The accompanying SnowPro draft uses the existing questions.json field names as far as possible. It adds exam-scoped metadata. It is authoring input and is not part of the current APK asset pipeline.

Progress records use exam ID, content ID and revision. Sessions snapshot item revisions and shuffled orders. Attempts and review queues are scoped to an exam so SnowPro progress cannot overwrite AWS progress.

## Purchase and content delivery

Keep the existing product ID zamify_aif_c01_full_pack. Proposed additional product IDs require availability checks and Play Console configuration before release. Query localized price and product details from Google Play instead of hardcoding a dollar amount.

Implement pending, purchased, cancelled, failed, restored and revoked states. Pending purchases keep premium features locked. Verify the purchase for the correct application and product before granting access. Acknowledge eligible purchases and make retries idempotent. Complete refund and revocation handling and restoration across reinstall and device changes.

Verified entitlement authorizes the purchased exam's content. A local flag or a bundled decryption key is insufficient evidence. The current deterministic encrypted-pack key offers extraction deterrence. Choose and document a supported purchase-verification service and authenticated delivery before selling protected premium content. Cache authorized content for offline study under a documented refresh policy.

Keep the study WebView's existing network and file restrictions. Native billing and content delivery require a narrowly scoped, validated path. Preserve the ban on addJavascriptInterface unless a separately reviewed design changes it. Never put purchase tokens, signing secrets or premium delivery secrets into public JavaScript or Git history.

## Migration from the current app

Current inspected branch is improve-home-and-welcome at 0cf8b365c2e89a5ece706f6cbd6a44ddb5841c62. PR #1 holds the Android work. PR #2 separately backs up the website.

Existing single-exam assumptions appear in Preview.html, sync_content.py, prepare_release.py, verify_release.py and MainActivity.java. The release packager asserts 83 AIF questions and the native code binds one product and one encrypted payload. Refactor those entry points together rather than adding only a catalogue tile.

1. Extract an exam registry and content adapters while preserving existing AIF IDs and attempts.
2. Migrate exam-sprint-aif-v1 records once into the AIF namespace with an atomic migration marker. Preserve drafts, assistance and delayed review. Keep a recoverable old snapshot.
3. Add the shared learner screens and separate mock sessions from teaching sessions.
4. Add the reviewed SnowPro starter and the separately reviewed premium learning content.
5. Replace the single-product purchase bridge with product-to-exam entitlement mapping and verified delivery.
6. Add MLA-C02 using its own domain map and content. Publish its starter only when the full free set is reviewed, and enable checkout only when the complete paid offer is ready.
7. Update the public Zamify website with the same catalogue, starter boundaries and offer descriptions after app behaviour is verified.

## Delivery sequence and acceptance

### Phase 1 — Product and content contract

This checkpoint contains the specification, source review and ten SnowPro draft questions. Validate answer structures, clue substrings, objective coverage and original wording. Obtain independent subject review before publication.

### Phase 2 — Working multi-exam app

A user can switch exams, run each available free starter and retain separate progress after restart. All existing AIF content formats and saved drafts work. A free user cannot enter premium routes through navigation or forged local storage. Test the generated release assets as well as the developer preview.

### Phase 3 — Complete study journey

Both first packs have objective lessons, flashcards, drills, worked exercises, mock review and a configurable plan. Mock timers expire correctly across reload, wrong option order never changes marking, flags persist and the original score survives review retries.

### Phase 4 — Verified paid access

Complete product setup, verification, acknowledgement and restore. Run Google Play license-tester flows for success, pending, cancellation, retry, reinstall, changed accounts, refunds and revocation. Inspect data safety and privacy against actual data flows. Complete production signing and physical-device checks.

### Phase 5 — ML Engineer content and release

Finish MLA-C02's original content with objective mapping and independent review. Repeat all content, payment and native QA gates. Decide final content counts and prices based on the reviewed offer.

## Sources and checkpoints

- [AWS AI Practitioner guide](https://docs.aws.amazon.com/aws-certification/latest/ai-practitioner-01/ai-practitioner-01.html)
- [AWS ML Engineer MLA-C02 guide](https://docs.aws.amazon.com/aws-certification/latest/machine-learning-engineer-associate-02/machine-learning-engineer-associate-02.html)
- [AWS C01/C02 comparison](https://docs.aws.amazon.com/aws-certification/latest/machine-learning-engineer-associate-02/mla-02-comparison.html)
- [SnowPro Core guide entry](https://learn.snowflake.com/en/certifications/snowpro-core-c03/)
- Existing Zamify_Exam_Pack_Quality_Standard.md and Zamify_Launch_Checklist.md, read 18 November 2026.

The SnowPro starter uses an editorial spread of 3 architecture, 2 governance, 2 loading, 2 performance and 1 collaboration questions. This small sample does not establish complete objective coverage. Every paid bank and learning tool requires its own coverage review.
