"""Generate the free-only Play asset. Paid questions stay out of the AAB."""
from pathlib import Path
import json
import re

root = Path(__file__).resolve().parent
source = (root / "Preview.html").read_text()
bank = json.loads((root / "questions.json").read_text())
free_ids = [1, 29, 6, 10, 11, 13, 45, 16, 59, 65]
free = [q for q in bank if q["id"] in free_ids]
assert len(free) == len(free_ids) == 10 and len(bank) == 75

replacement = "const BANK=" + json.dumps(free, ensure_ascii=False).replace("<", "\\u003c") + ";\nconst DOMAINS="
source, count = re.subn(r"const BANK=.*?;\nconst DOMAINS=", lambda _: replacement, source, count=1, flags=re.S)
assert count == 1

# Old developer-demo progress may remain on a tester's phone. Discard its
# entitlement and any session containing questions absent from this build.
old = "s.previewFullPack=raw.previewFullPack===true;"
assert source.count(old) == 1
source = source.replace(old, "s.previewFullPack=false;")
old = "function pool(){return state.previewFullPack?BANK:BANK.filter(q=>FREE_IDS.includes(q.id))}"
assert source.count(old) == 1
source = source.replace(old, "function pool(){return BANK}")
old = "case'demo':return saveTier(true);"
assert source.count(old) == 1
source = source.replace(old, "")
old = '<details><summary>Developer preview tools</summary><p class="small muted">Test access only. This does not represent a purchase or a production content lock.</p><button class="btn secondary" data-action="demo">Preview full pack — no payment</button></details>'
assert source.count(old) == 1
source = source.replace(old, "")
source = source.replace("Payments are not available in this test build.", "The full pack is not yet available.")
source = source.replace("This prototype uses clearly labeled demo access, not Google Play Billing.", "Purchases are not available yet.")
source = source.replace("Zamify · 0.8 preview", "Zamify · free edition")

dest = root / "app/build/generated/freeReleaseAssets/index.html"
dest.parent.mkdir(parents=True, exist_ok=True)
dest.write_text(source)
assert 'data-action="demo"' not in source
assert "case'demo':" not in source
assert "s.previewFullPack=false;" in source
assert len(json.loads(re.search(r"const BANK=(.*?);\nconst DOMAINS=", source, re.S).group(1))) == 10
print("Prepared free-only Android release asset with 10 questions")
