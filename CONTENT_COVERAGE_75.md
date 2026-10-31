# AIF-C01 content coverage and editorial status

31 October 2026. AWS exam guide version 1.2 was published 29 October 2026. Its guide update may precede exam changes; this mapping is to the published guide, not a claim about a particular exam appointment. The guide's five domain weights are 20%, 24%, 28%, 14% and 14%. Primary task assignment gives each item one counting home even where it also tests another skill.

The draft bank now contains **75 unique questions: ten free IDs and 65 paid candidate IDs**. The paid count excludes the free ten. The ten new paid items are IDs 66–75. The release AAB still packages only the free ten; no paid checkout or entitlement exists.

| Task | IDs | Count | Review focus |
|---|---|---:|---|
| 1.1 AI terms and inference | 2, 30, 31, 33, 66 | 5 | Data shape and labels; check adjacent inference patterns. |
| 1.2 Practical AI use | 1, 4, 5, 26, 32 | 5 | Service selection versus non-AI rules. |
| 1.3 Development lifecycle | 3, 27, 28, 29, 67 | 5 | Monitoring and evaluation evidence. |
| 2.1 GenAI concepts | 6, 7, 10, 34, 35, 36, 37, 38, 40, 68 | 10 | Agent memory, connectivity and context. |
| 2.2 Capabilities and limits | 8, 44, 69 | 3 | Thin task; more than one model-choice situation may be needed. |
| 2.3 AWS GenAI technologies | 9, 39, 41, 42, 43 | 5 | Compare adjacent products by role. |
| 3.1 FM application design | 11, 13, 45, 47, 48, 49, 51, 57, 70 | 9 | Retrieval and model selection. |
| 3.2 Prompting | 12, 46, 50, 56 | 4 | Prompt versioning and limits. |
| 3.3 Training and fine-tuning | 14, 71, 72 | 3 | Distillation, data preparation and instruction-response tuning; other methods remain thin. |
| 3.4 Evaluation | 15, 52, 53, 54, 55 | 5 | End-to-end, RAG and judge calibration. |
| 4.1 Responsible AI | 16, 18, 19, 20, 59, 60 | 6 | Review the revised commercial-rights and sustainability cases. |
| 4.2 Transparency | 17, 58, 61, 73 | 4 | Explanation/privacy tradeoff and human review. |
| 5.1 Security | 21, 23, 24, 25, 64, 65, 74 | 7 | Distinguish safeguards from enforced controls. |
| 5.2 Governance | 22, 62, 63, 75 | 4 | Retention/residency beyond service recognition. |

Domain counts are **15 / 18 / 21 / 10 / 11**, close to the guide's weights for a 75-item practice bank. This is an inventory, not proof of skill coverage or calibrated exam difficulty. Task 3.3 and 2.2 remain particularly thin; individual guide skills need a second mapping pass. Service names and content may change, so recheck sources before publication.

## Review record

- The original ten free questions have the separate source/editorial revision in `CONTENT_REVIEW_FREE.md`.
- Ten new paid IDs 66–75 were drafted with direct or task-guide primary sources, objective mapping, option rationales, hints, clues, misconceptions and transfer examples. A second internal challenge checked each key and closest competing choice; this remains AI-assisted and is not independent subject review.
- Of the 55 earlier paid candidates, **26 were rewritten** (IDs 7, 9, 15, 17, 19, 20, 25, 31, 36, 38, 39, 40, 41, 42, 43, 44, 47, 48, 53, 54, 55, 56, 60, 61, 63, 64) with clearer constraints and more relevant alternatives. Their `contentRevision` is 2; earlier attempts move to local history rather than scoring against changed wording.
- The other **29 earlier paid candidates** were checked as introductory concept or service distinctions and retained at revision 1. Their `reviewNote` says that these simpler items alone do not demonstrate exam readiness. All paid items have primary task, source, concept, transfer and candid review status in `questions.json`.
- Q53 was revised again to test RAG retrieval versus answer grounding (revision 3); Q72 now tests instruction-response fine-tuning rather than duplicating prompt versioning (revision 2). Earlier-wording attempts are excluded from current results.
- This is an AI-assisted editorial and AWS-source pass, **not independent expert sign-off or validated difficulty**. A source link does not prove a question is unambiguous to real learners. The ten new paid items need a second human challenge of their closest alternatives.

## Next pass

1. Map individual guide skills, not only the 14 task statements. Task 3.3 and 2.2 remain thin, and 75 questions cannot exhaust the exam guide. Keep the pack description honest.
2. Have an independent AIF-C01 subject expert challenge every key, near-miss option, reference and version-sensitive service name; resolve findings with revision bumps.
3. Pilot with learners for comprehension, ambiguous wording and a later changed-scenario check. Do not call a score a scaled AWS exam score.
4. Finish delayed review, paid entitlement, actual-device checks and release gates before selling.

## Individual-skill gaps from guide version 1.2

These are the clearest remaining gaps after checking the objectives within each task. “Thin” means the topic is mentioned or appears in one item, not that it is fully taught or assessed.

| Task | Covered examples | Thin or absent skills to address in lessons or future items |
|---|---|---|
| 1.1 | Learning types, data labels, batch/real-time inference | Deep learning versus ML, neural networks, NLP and asynchronous/serverless inference |
| 1.2 | Regression, clustering, speech services, rules versus models | Traditional ML versus FM selection under regulatory and operational constraints; Lex and Comprehend use cases |
| 1.3 | Precision/recall, overfitting, holdout, monitoring | Pipeline stages, deployment choices and MLOps technical debt |
| 2.1 | Tokens, embeddings, multimodal, lifecycle, agent memory/MCP | Diffusion, multi-agent communication and orchestration beyond definitions |
| 2.2 | Hallucination, exact-output limits and model tradeoffs | Nondeterminism in practice and business ROI measures |
| 2.3 | Bedrock, Strands, AgentCore and Kiro roles | SageMaker JumpStart, Amazon Quick and regional/capacity cost tradeoffs |
| 3.1 | RAG, chunking, parameters and vector retrieval | Prompt caching and comparison of vector stores/customization approaches |
| 3.2 | Zero/few-shot, format and prompt versioning | Negative prompts, templates and prompt exposure/hijacking risk |
| 3.3 | Distillation, data preparation, instruction-response tuning | Continuous pre-training, RLHF and other adaptation tradeoffs |
| 3.4 | Metrics, RAG stages, agent completion and LLM judge | Human evaluation design and business-aligned comparison across systems |
| 4.1 | Group fairness, Guardrails, IP risk and sustainability | Robustness, label quality and bias/variance tradeoffs |
| 4.2 | Case explanations, model cards, human recourse | Open-source licensing transparency and explainability/performance tradeoffs |
| 5.1 | IAM, Macie, injection, encryption and action boundaries | PrivateLink, AgentCore Identity/Policy, logging and output validation depth |
| 5.2 | Config, CloudTrail, Artifact, retention and residency | Inspector, Trusted Advisor, review cadence and the Security Scoping Matrix |

The exam guide says its topic examples are not exhaustive. This table guides lessons and later revisions; it is not a claim that every listed skill must have a separate question in this 75-item pack.

Official guide: https://docs.aws.amazon.com/aws-certification/latest/ai-practitioner-01/ai-practitioner-01.html ; revisions: https://docs.aws.amazon.com/aws-certification/latest/ai-practitioner-01/aif-01-revisions.html .
