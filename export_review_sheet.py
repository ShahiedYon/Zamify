"""Export the draft question bank for independent editorial review."""

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BANK = json.loads((ROOT / "questions.json").read_text(encoding="utf-8"))
FREE = {1, 29, 6, 10, 11, 13, 45, 16, 59, 65}
FIELDS = [
    "id", "pack", "objective", "revision", "format", "question", "options",
    "correct_key", "why", "all_option_reasons", "clues", "hint", "trap",
    "transfer", "source", "reviewer_verdict", "issue_and_proposed_fix",
    "reviewer_name", "review_date", "retest_after_fix",
]


def label(i):
    return chr(ord("A") + i)


with (ROOT / "review_sheet.csv").open("w", encoding="utf-8-sig", newline="") as output:
    writer = csv.DictWriter(output, fieldnames=FIELDS)
    writer.writeheader()
    for q in BANK:
        answer = q["answer"]
        key = label(answer) if isinstance(answer, int) else ", ".join(label(i) for i in answer)
        writer.writerow({
            "id": q["id"], "pack": "Free" if q["id"] in FREE else "Paid candidate",
            "objective": q["objective"], "revision": q.get("contentRevision", 1),
            "format": q["kind"], "question": q["q"],
            "options": " | ".join(f"{label(i)}. {o}" for i, o in enumerate(q["options"])),
            "correct_key": key, "why": q["why"],
            "all_option_reasons": " | ".join(f"{label(i)}. {reason}" for i, reason in enumerate(q["reasons"])),
            "clues": " | ".join(f"{c['text']}: {c['why']}" for c in q["clues"]),
            "hint": q["hint"], "trap": q["trap"], "transfer": q["transfer"],
            "source": q["source"],
        })

print(f"Exported {len(BANK)} questions to review_sheet.csv")
