"""Inspect the actual unsigned AAB rather than trusting generated source."""
from pathlib import Path
from zipfile import ZipFile
import json
import re

bundle = Path("app/build/outputs/bundle/release/app-release.aab")
with ZipFile(bundle) as archive:
    names = archive.namelist()
    assert names.count("base/assets/index.html") == 1, names
    page = archive.read("base/assets/index.html").decode("utf-8")

bank = json.loads(re.search(r"const BANK=(.*?);\nconst DOMAINS=", page, re.S).group(1))
assert len(bank) == 10
assert {q["id"] for q in bank} == {1, 29, 6, 10, 11, 13, 45, 16, 59, 65}
assert 'data-action="demo"' not in page and "case'demo':" not in page
assert "function pool(){return BANK}" in page
print("Verified AAB: 10 free questions, no developer unlock")
