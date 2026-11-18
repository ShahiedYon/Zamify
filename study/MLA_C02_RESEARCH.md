# MLA-C02 research and implementation record

Checked 18 November 2026. Original question wording; content is a source-aligned candidate draft, not an independently reviewed release bank.

## Authoritative exam scope

[AWS exam guide](https://docs.aws.amazon.com/aws-certification/latest/machine-learning-engineer-associate-02/machine-learning-engineer-associate-02.html) and its linked domain pages govern objective coverage.

| Domain | Weight | Implemented coverage |
| --- | ---: | --- |
| Data preparation | 28% | Time/entity splits, leakage, deduplication, transformations, privacy, embeddings, retrieval metadata and algorithm formats |
| Model and FM development | 24% | RAG versus customization, metrics, overfitting, tuning, human evaluation and reranking |
| Deployment and orchestration | 24% | Serving choices, Pipelines, model lineage, controlled rollouts, agents, tool integration, state and AgentCore |
| Operations, monitoring and security | 24% | Data versus model quality, traces, least privilege, API auditing, cost, guardrails, credentials and validated baselines |

The [AWS certification landing page](https://aws.amazon.com/certification/certified-machine-learning-engineer-associate/) currently lists an English MLA-C02 beta: 85 questions, 170 minutes. Its comparison table has an inconsistent `ME1-C02` code; the guide and surrounding page identify MLA-C02. The general guide describes 50 scored plus 15 unscored questions and a scaled passing score of 720, with a beta exception to the normal results designation. Do not represent 72% raw practice accuracy as the official passing score. Check appointment-specific timing and revisit the metadata before launch.

The app supplies timed **mini mocks**, not a replica of the beta. A 40-question draft does not support multiple independent unseen 85-question papers.

## User-shared Gemini guide

Read the supplied [Gemini preparation guide](https://share.gemini.google/ax2ZNZLgEQhI). Used its topic suggestions to identify gaps: AgentCore responsibilities, inference comparisons, serialization contracts, terminology and evaluation distinctions. The guide itself reproduces third-party questions, including dump-site material; none was imported. Its blanket suggestions about preferring managed services or resetting a monitoring baseline were not adopted as universal answer rules. Investigate a quality alarm before approving a new representative baseline.

## Primary documentation used for additions

- [MLA-C01/C02 comparison](https://docs.aws.amazon.com/aws-certification/latest/machine-learning-engineer-associate-02/mla-02-comparison.html): GenAI, agent workflows, retrieval, evaluation and operational changes.
- [Inference choices](https://docs.aws.amazon.com/sagemaker/latest/dg/deploy-model-options.html): real-time, serverless, asynchronous and batch; detailed quotas can change and are not treated as timeless app constants.
- [Built-in algorithm training parameters](https://docs.aws.amazon.com/sagemaker/latest/dg/common-info-all-im-models.html), [DeepAR](https://docs.aws.amazon.com/sagemaker/latest/dg/deepar.html): distinguish training and inference serialization.
- [AgentCore overview](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html), [session isolation](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-sessions.html): managed agent hosting and responsibilities.
- [Gateway](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway.html), [Memory](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/memory.html), [Identity](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/identity.html), [Code Interpreter](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/code-interpreter-tool.html): focused component questions and comparison map.
- [Reranking](https://docs.aws.amazon.com/bedrock/latest/userguide/rerank.html): retrieval ordering versus generation quality.
- [Model Monitor](https://docs.aws.amazon.com/sagemaker/latest/dg/model-monitor.html): monitoring signals, investigation and model quality.

Each question has a primary documentation link and option-level reasoning. The current pack covers each domain but does not claim exhaustive coverage of every skill statement. Larger, balanced, independently reviewed banks remain a release milestone.
