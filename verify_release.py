"""Inspect the actual unsigned AAB rather than trusting generated source."""
from pathlib import Path
from zipfile import ZipFile
import json
import re

manifest = Path("app/src/main/AndroidManifest.xml").read_text()
native = Path("app/src/main/java/com/zamify/study/MainActivity.java").read_text()
assert "<uses-permission" not in manifest
assert 'android:allowBackup="false"' in manifest
assert 'android:usesCleartextTraffic="false"' in manifest
assert "setBlockNetworkLoads(true)" in native
assert "setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW)" in native
assert "addJavascriptInterface" not in native

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
assert "<summary>Privacy policy</summary>" in page
assert "info@zamify.com" in page
print("Verified AAB: 10 free questions, no developer unlock")
