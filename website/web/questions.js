export const QUESTIONS = [
  {
    "id": 1,
    "domain": 1,
    "q": "A retailer needs to predict next week’s revenue in rand for each store using historical sales and promotions. Managers will later label each prediction as above or below target. Which technique should produce the revenue estimate?",
    "options": [
      "Classification into revenue bands",
      "Regression on historical sales and promotions",
      "Clustering stores by sales patterns",
      "Anomaly detection on weekly revenue"
    ],
    "answer": 1,
    "why": "Regression predicts the numeric revenue amount. The later above/below-target label is a separate calculation using that prediction.",
    "clues": [
      {
        "text": "revenue in rand",
        "why": "The model must estimate an amount, not a group or label."
      }
    ],
    "hint": "Identify the output required before the manager applies the target rule.",
    "analysis": "Separate the prediction from the later report. Revenue in rand is a numeric target; a threshold label does not turn the underlying amount prediction into classification.",
    "trap": "Choosing a technique for the downstream label instead of the requested prediction.",
    "reasons": [
      "Classification predicts a category or band, rather than the requested revenue amount.",
      "Regression learns a relationship between input features and a numeric target such as revenue.",
      "Clustering groups similar stores without directly learning the requested revenue target.",
      "Anomaly detection identifies unusual observations rather than predicting the expected revenue amount."
    ],
    "kind": "single",
    "reviewedOn": "2026-10-30",
    "objective": "1.2",
    "concept": "Regression versus classification",
    "difficulty": "Foundation",
    "transfer": "Predicting a lease payment amount is regression; predicting whether a lease will default is classification.",
    "contentRevision": 2,
    "reviewStatus": "AWS-source-checked; independent expert review pending",
    "source": "https://docs.aws.amazon.com/aws-certification/latest/ai-practitioner-01/ai-practitioner-01-domain1.html",
    "objectiveSource": "https://docs.aws.amazon.com/aws-certification/latest/ai-practitioner-01/ai-practitioner-01-domain1.html",
    "keyPoints": [
      "revenue in rand",
      "later label"
    ]
  },
  {
    "id": 29,
    "domain": 1,
    "kind": "order",
    "q": "A team has defined a churn-prediction goal and collected historical records. Order the remaining stages so the final test data does not influence model selection. Use each stage once.",
    "options": [
      "Train candidates and select settings using the training and validation sets",
      "Deploy the accepted model and monitor real-world outcomes",
      "Prepare suitable training, validation and untouched test sets",
      "Evaluate the selected model on the untouched test set against acceptance criteria"
    ],
    "answer": [
      2,
      0,
      3,
      1
    ],
    "reasons": [
      "Training fits candidates; validation supports model selection without using final test results.",
      "Deployment follows an acceptable evaluation, and monitoring checks real-world behavior.",
      "Establish the splits before fitting; learn preprocessing parameters from training data and apply them to held-out data.",
      "Use the untouched test set for final assessment after model selection, rather than repeatedly tuning to its results."
    ],
    "why": "Separate the data first, train and select using development data, evaluate on the untouched test set, then deploy only if acceptance criteria are met.",
    "clues": [
      {
        "text": "final test data does not influence model selection",
        "why": "Keep the test set separate from training and validation."
      }
    ],
    "hint": "Identify when data must be reserved and which evidence should support the release decision.",
    "analysis": "The split must precede fitting and model selection. Test results should support a release decision rather than become another tuning signal; monitor after deployment.",
    "trap": "Selecting settings using the final test set, which makes the reported final assessment overly optimistic.",
    "reviewedOn": "2026-10-30",
    "objective": "1.3",
    "concept": "ML lifecycle and data leakage",
    "difficulty": "Applied",
    "source": "https://docs.aws.amazon.com/prescriptive-guidance/latest/ml-operations-planning/splits-leakage.html",
    "transfer": "If you repeatedly change a prompt after reading its test results, reserve a fresh assessment set before claiming general performance.",
    "contentRevision": 2,
    "reviewStatus": "AWS-source-checked; independent expert review pending",
    "objectiveSource": "https://docs.aws.amazon.com/aws-certification/latest/ai-practitioner-01/ai-practitioner-01-domain1.html",
    "keyPoints": [
      "final test data does not influence model selection",
      "Use each stage once"
    ]
  },
  {
    "id": 6,
    "domain": 2,
    "q": "A team uses a model priced per input token. Two prompts ask the same question with different wording. Their word counts are equal, but their quoted input costs differ. Which measurement best explains the difference?",
    "options": [
      "The number of user requests submitted",
      "The number of complete words supplied",
      "The number of tokens produced by the model’s tokenizer",
      "The number of characters displayed to the user"
    ],
    "answer": 2,
    "why": "Token-based input pricing uses the token count for the selected model. Equal word counts do not guarantee equal token counts.",
    "clues": [
      {
        "text": "priced per input token",
        "why": "The measurement must match the stated pricing unit."
      }
    ],
    "hint": "Use the provider’s stated billing unit rather than a convenient text-length estimate.",
    "analysis": "The scenario specifies input-token pricing. Compare tokenized inputs using the same model and price; total inference cost can also include output tokens.",
    "trap": "Treating one word as exactly one token, or confusing input cost with the total bill.",
    "reasons": [
      "Both prompts are single requests; request count does not explain different input-token charges.",
      "A word may be represented by one or several tokens, so equal word counts can have different costs.",
      "The tokenizer determines the model’s input units, which are used for the stated pricing model.",
      "Character counts can be a rough proxy but are not the billing unit in this scenario."
    ],
    "kind": "single",
    "reviewedOn": "2026-10-30",
    "objective": "2.1",
    "concept": "Tokens and input cost",
    "difficulty": "Foundation",
    "transfer": "Changing languages or including code can change token counts even when the request means the same thing.",
    "contentRevision": 2,
    "reviewStatus": "AWS-source-checked; independent expert review pending",
    "source": "https://docs.aws.amazon.com/aws-certification/latest/ai-practitioner-01/ai-practitioner-01-domain2.html",
    "objectiveSource": "https://docs.aws.amazon.com/aws-certification/latest/ai-practitioner-01/ai-practitioner-01-domain2.html",
    "keyPoints": [
      "priced per input token",
      "word counts are equal"
    ]
  },
  {
    "id": 10,
    "domain": 2,
    "kind": "match",
    "q": "An internal assistant must connect to tools, respect access limits, use changing policies and adopt a response style. Match each requirement to the most direct concept. Use each option once.",
    "options": [
      "IAM authorization",
      "Fine-tuning",
      "Model Context Protocol (MCP)",
      "Retrieval-Augmented Generation (RAG)"
    ],
    "answer": [
      2,
      0,
      3,
      1
    ],
    "reasons": [
      "IAM policies control permitted actions on AWS resources; a tool connection does not grant those permissions.",
      "Fine-tuning adapts weights using training examples; it is different from inserting documents into a prompt.",
      "MCP standardizes connections to external tools and context; authorization is still needed.",
      "RAG retrieves relevant source material for the current request without retraining the foundation model."
    ],
    "why": "MCP connects tools, IAM authorizes access, RAG supplies retrieved context and fine-tuning adapts model weights. These capabilities can complement one another.",
    "clues": [
      {
        "text": "most direct concept",
        "why": "Match each responsibility rather than choosing an entire architecture."
      }
    ],
    "hint": "Distinguish connection, permission, runtime information and training.",
    "analysis": "Match the verb in each requirement to the capability. An application may use all four, but each requirement asks for one primary role.",
    "trap": "Assuming that connecting a tool authorizes it, or that retrieving a document trains the model.",
    "prompts": [
      "Standardize discovery and calls to supported external tools",
      "Decide which AWS resources its identity may access",
      "Supply current policy passages at request time",
      "Adapt model weights using approved response examples"
    ],
    "reviewedOn": "2026-10-30",
    "objective": "2.1",
    "relatedObjectives": [
      "3.1",
      "3.3",
      "5.1"
    ],
    "concept": "Connection, authorization, retrieval and training",
    "difficulty": "Applied",
    "transfer": "A connected expense tool still needs access checks; retrieving its latest policy does not change the model’s weights.",
    "contentRevision": 2,
    "reviewStatus": "AWS-source-checked; independent expert review pending",
    "source": "https://docs.aws.amazon.com/aws-certification/latest/ai-practitioner-01/ai-practitioner-01-domain2.html",
    "objectiveSource": "https://docs.aws.amazon.com/aws-certification/latest/ai-practitioner-01/ai-practitioner-01-domain2.html",
    "keyPoints": [
      "most direct concept",
      "Use each option once"
    ]
  },
  {
    "id": 11,
    "domain": 3,
    "q": "An employee assistant must answer from a large policy library that changes daily and show supporting passages. The team will keep its existing foundation model. Which design best meets both requirements?",
    "options": [
      "Retrieve relevant passages from a synchronized policy index and attach source references",
      "Fine-tune weekly on the policies and ask the model to name its sources",
      "Cache generated policy answers and refresh them after users report changes",
      "Add a link to the policy website in the system prompt without retrieving its content"
    ],
    "answer": 0,
    "why": "RAG can supply current, relevant policy passages and their source references at answer time. The source-to-index synchronization must also stay current.",
    "clues": [
      {
        "text": "changes daily",
        "why": "The information pipeline must reflect updates."
      },
      {
        "text": "supporting passages",
        "why": "The answer needs retrieved evidence, not just a source name."
      }
    ],
    "hint": "Check how each approach obtains updated evidence and makes it traceable.",
    "analysis": "Both daily changes and supporting passages matter. Choose current retrieval with source metadata, then check that answers are supported by the retrieved text.",
    "trap": "Assuming that a generated citation or a current-looking URL proves the answer is grounded.",
    "reasons": [
      "Retrieval from an updated index supplies both current evidence and traceable passages.",
      "Weekly training can lag daily changes, and naming a source is not evidence that its passage was retrieved.",
      "Cached answers can remain stale until a user notices; they do not meet the requirement for current supporting passages.",
      "A URL alone does not give the model access to the page or retrieve supporting text."
    ],
    "kind": "single",
    "reviewedOn": "2026-10-30",
    "objective": "3.1",
    "concept": "RAG for current, traceable knowledge",
    "difficulty": "Applied",
    "source": "https://docs.aws.amazon.com/prescriptive-guidance/latest/retrieval-augmented-generation-options/rag-vs-fine-tuning.html",
    "transfer": "For a changing product catalogue, refresh retrieval data and check grounding; retraining alone does not supply current source passages.",
    "contentRevision": 2,
    "reviewStatus": "AWS-source-checked; independent expert review pending",
    "objectiveSource": "https://docs.aws.amazon.com/aws-certification/latest/ai-practitioner-01/ai-practitioner-01-domain3.html",
    "keyPoints": [
      "changes daily",
      "supporting passages",
      "existing foundation model"
    ]
  },
  {
    "id": 13,
    "domain": 3,
    "q": "Repeated runs of the same summarization prompt produce too much variation. The model exposes temperature and a maximum-output-token setting. The team wants less sampling randomness while retaining room for a complete summary. Which change best fits?",
    "options": [
      "Lower temperature while keeping the output-token budget unchanged",
      "Lower the output-token budget while keeping temperature unchanged",
      "Add stop sequences while keeping temperature unchanged",
      "Cache the first summary and reuse it for every later document"
    ],
    "answer": 0,
    "why": "Lower temperature generally favors higher-probability next tokens, reducing sampling variation without directly shortening the output allowance.",
    "clues": [
      {
        "text": "less sampling randomness",
        "why": "The requested behavior is controlled by a sampling parameter."
      }
    ],
    "hint": "Distinguish a sampling control from a length control or response reuse.",
    "analysis": "The requested change concerns variability, with output space preserved. Evaluate lower temperature on representative summaries and check factual accuracy separately.",
    "trap": "Assuming less randomness guarantees truth, or reducing length when the problem is variability.",
    "reasons": [
      "This adjusts sampling randomness while preserving room for the summary; it does not guarantee identical or factual responses.",
      "The token budget limits length and may truncate a summary, rather than directly controlling sampling randomness.",
      "Stop sequences terminate generation at specified text; they do not directly adjust the sampling distribution.",
      "Reusing one answer for different documents can return the wrong summary and does not tune generation."
    ],
    "kind": "single",
    "reviewedOn": "2026-10-30",
    "objective": "3.1",
    "concept": "Temperature versus output length",
    "difficulty": "Applied",
    "source": "https://docs.aws.amazon.com/bedrock/latest/userguide/inference-parameters.html",
    "transfer": "For repeated extraction tasks, lower temperature may improve consistency, but schema validation and factual checks remain necessary.",
    "contentRevision": 2,
    "reviewStatus": "AWS-source-checked; independent expert review pending",
    "objectiveSource": "https://docs.aws.amazon.com/aws-certification/latest/ai-practitioner-01/ai-practitioner-01-domain3.html",
    "keyPoints": [
      "less sampling randomness",
      "retaining room for a complete summary"
    ]
  },
  {
    "id": 45,
    "domain": 3,
    "kind": "multi",
    "q": "A support assistant must use a changing product manual and follow a demonstrated response format. The team will keep the existing model weights and cannot fit the entire manual in one prompt. Which TWO approaches jointly meet the requirements?",
    "options": [
      "Retrieve relevant manual passages for each request",
      "Fine-tune on pairs of customer questions and approved replies",
      "Include a few demonstrations of the required format in the prompt",
      "Continue pre-training on the complete manual",
      "Cache a successful response and reuse it for similar requests"
    ],
    "answer": [
      0,
      2
    ],
    "reasons": [
      "Retrieval selects relevant passages from the manual within the available context; its index must be kept current.",
      "Fine-tuning can adapt responses but updates model weights, violating the stated constraint.",
      "Few-shot demonstrations guide the requested format at inference time without training.",
      "Continued pre-training changes model weights and does not meet the no-training constraint.",
      "Reused responses can contain stale or mismatched facts and do not jointly provide current evidence and format demonstrations."
    ],
    "why": "Retrieval supplies relevant manual evidence at request time, while few-shot examples demonstrate the format. Neither approach changes the model’s weights.",
    "clues": [
      {
        "text": "existing model weights",
        "why": "Eliminate training-based changes."
      },
      {
        "text": "changing product manual",
        "why": "The facts must come from updated request-time context."
      }
    ],
    "hint": "One approach must supply relevant facts; the other must demonstrate the format without training.",
    "analysis": "Check both requirements together. Prompt examples show how to respond, while retrieval supplies what the current answer should be based on.",
    "trap": "Choosing two methods that address style but do not provide fresh product facts.",
    "reviewedOn": "2026-10-30",
    "objective": "3.1",
    "relatedObjectives": [
      "3.2"
    ],
    "concept": "RAG plus few-shot prompting",
    "difficulty": "Applied",
    "transfer": "A lease assistant can retrieve the relevant contract section and use a few examples to produce a consistent summary format.",
    "contentRevision": 2,
    "reviewStatus": "AWS-source-checked; independent expert review pending",
    "source": "https://docs.aws.amazon.com/aws-certification/latest/ai-practitioner-01/ai-practitioner-01-domain3.html",
    "objectiveSource": "https://docs.aws.amazon.com/aws-certification/latest/ai-practitioner-01/ai-practitioner-01-domain3.html",
    "keyPoints": [
      "changing product manual",
      "demonstrated response format",
      "existing model weights",
      "cannot fit the entire manual"
    ]
  },
  {
    "id": 16,
    "domain": 4,
    "q": "A hiring model has high overall accuracy. One demographic group reports more mistaken rejections, but few members of that group appear in the evaluation data. What is the best first investigation?",
    "options": [
      "Compare average model confidence across all applicants",
      "Compare subgroup false-rejection rates and whether each sample supports a reliable conclusion",
      "Remove demographic labels from the evaluation data and repeat the aggregate score",
      "Apply the same decision threshold to every group and report the original accuracy"
    ],
    "answer": 1,
    "why": "Subgroup error rates investigate the reported harm, while sample adequacy determines how confidently those rates can be compared.",
    "clues": [
      {
        "text": "mistaken rejections",
        "why": "Investigate the relevant error, not confidence alone."
      },
      {
        "text": "few members",
        "why": "A small sample can make comparisons unreliable."
      }
    ],
    "hint": "Measure the reported harm for the affected group, then check the strength of the evidence.",
    "analysis": "A high average does not answer a subgroup question. Investigate error rates and representation before selecting a mitigation; handle demographic data with suitable privacy controls.",
    "trap": "Treating equal thresholds, confidence or aggregate accuracy as proof of fairness.",
    "reasons": [
      "Overall confidence can conceal subgroup errors and is not a measure of the reported false rejections.",
      "This directly investigates the reported error and the strength of the supporting evidence.",
      "Removing labels prevents the proposed subgroup comparison; it does not establish fairness.",
      "A common threshold alone does not establish comparable error rates or fix an inadequate evaluation sample."
    ],
    "kind": "single",
    "reviewedOn": "2026-10-30",
    "objective": "4.1",
    "concept": "Fairness and subgroup evaluation",
    "difficulty": "Applied",
    "source": "https://docs.aws.amazon.com/wellarchitected/latest/responsible-ai-lens/raidp03-bp02.html",
    "transfer": "A service can score well overall while working poorly for a language or region with little evaluation data.",
    "contentRevision": 2,
    "reviewStatus": "AWS-source-checked; independent expert review pending",
    "objectiveSource": "https://docs.aws.amazon.com/aws-certification/latest/ai-practitioner-01/ai-practitioner-01-domain4.html",
    "keyPoints": [
      "mistaken rejections",
      "few members",
      "first investigation"
    ]
  },
  {
    "id": 59,
    "domain": 4,
    "kind": "multi",
    "q": "A model will serve three regions. One region has very few examples in both training and evaluation data. Before claiming comparable regional performance, which TWO actions most directly address this evidence gap?",
    "options": [
      "Evaluate each region with an adequately sized, suitable held-out sample",
      "Increase the size of the existing majority-region evaluation sample",
      "Curate appropriately sourced examples for the underrepresented region and reassess after model changes",
      "Apply the same confidence threshold across regions without collecting additional evidence",
      "Report a population-weighted average of the existing regional scores"
    ],
    "answer": [
      0,
      2
    ],
    "reasons": [
      "Adequate, suitable regional samples support meaningful comparisons without using training outcomes as proof.",
      "More examples from the already well-represented region do not fill the missing region’s evidence gap.",
      "Relevant representative data can address the coverage gap; separate evaluation must test the resulting model.",
      "A shared threshold does not supply missing data or establish comparable performance.",
      "A weighted average can hide poor performance in a small region and leaves the evidence gap unresolved."
    ],
    "why": "Suitable held-out evaluation measures regional outcomes, and representative data addresses the coverage gap. Reassess all regions after changes.",
    "clues": [
      {
        "text": "both training and evaluation data",
        "why": "The gap affects learning and the evidence used to assess it."
      }
    ],
    "hint": "Choose a measurement step and a representation step that address the missing region.",
    "analysis": "Both training coverage and evaluation evidence are limited. Improve representation where appropriate, keep evaluation independent and check for new disparities after changes.",
    "trap": "Treating a large total dataset or a strong weighted average as proof of regional performance.",
    "reviewedOn": "2026-10-30",
    "objective": "4.1",
    "concept": "Representative data and reliable evaluation",
    "difficulty": "Applied",
    "source": "https://docs.aws.amazon.com/wellarchitected/latest/responsible-ai-lens/raidp03-bp02.html",
    "transfer": "Adding more English examples does not establish reliable performance for a language missing from the test set.",
    "contentRevision": 2,
    "reviewStatus": "AWS-source-checked; independent expert review pending",
    "objectiveSource": "https://docs.aws.amazon.com/aws-certification/latest/ai-practitioner-01/ai-practitioner-01-domain4.html",
    "keyPoints": [
      "very few examples",
      "training and evaluation data",
      "comparable regional performance",
      "TWO"
    ]
  },
  {
    "id": 65,
    "domain": 5,
    "kind": "multi",
    "q": "An order assistant may read order status but must not issue refunds. Even if an injected instruction makes the model request a refund, which TWO controls independently restrict what can execute?",
    "options": [
      "Use a runtime identity whose downstream permissions allow only order lookup",
      "Put the no-refund rule in the system prompt and inspect its wording during testing",
      "Authorize each tool call at the execution boundary against an approved read-only action set",
      "Record refund attempts in an audit log and review them after execution",
      "Require a high model-confidence score before executing a refund request"
    ],
    "answer": [
      0,
      2
    ],
    "reasons": [
      "The actual credential must lack refund capability; hiding a tool while retaining broad credentials is insufficient.",
      "Prompt instructions guide behavior but cannot serve as the permission boundary if the model requests a forbidden action.",
      "The execution layer rejects operations outside the approved read-only set before any side effect occurs.",
      "Logging helps detection and investigation but does not prevent the prohibited refund.",
      "A confident unsafe request is still unsafe; a confidence threshold does not authorize an action."
    ],
    "why": "Least-privilege downstream permissions and execution-time authorization enforce the action boundary even when the model generates an unsafe request.",
    "clues": [
      {
        "text": "restrict what can execute",
        "why": "The controls must block the action outside the model’s text decision."
      }
    ],
    "hint": "Distinguish prevention before a side effect from model guidance and after-the-fact detection.",
    "analysis": "Trace the request through to the credential and API that would perform it. Both identity permissions and tool authorization must restrict the actual action path.",
    "trap": "Confusing an instruction, an audit record or model confidence with an enforceable permission.",
    "reviewedOn": "2026-10-30",
    "objective": "5.1",
    "concept": "Least privilege and agent action boundaries",
    "difficulty": "Applied",
    "source": "https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-permissions.html",
    "transfer": "A reporting assistant needs read-only access to accounting data even if its prompt says never to edit records.",
    "contentRevision": 2,
    "reviewStatus": "AWS-source-checked; independent expert review pending",
    "objectiveSource": "https://docs.aws.amazon.com/aws-certification/latest/ai-practitioner-01/ai-practitioner-01-domain5.html",
    "keyPoints": [
      "must not issue refunds",
      "Even if an injected instruction",
      "TWO",
      "restrict what can execute"
    ]
  }
];
export const DOMAINS = ["AI & machine learning", "Generative AI", "Foundation model applications", "Responsible AI", "Security & governance"];
