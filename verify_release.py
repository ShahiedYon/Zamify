"""Inspect the compiled AAB, round-trip its pack, and reject tampered ciphertext.
These checks do not certify Google Play policy compliance or purchase security.
"""
from pathlib import Path
from zipfile import ZipFile
import json
import re
import subprocess
import tempfile

root = Path(__file__).resolve().parent
manifest = (root / 'app/src/main/AndroidManifest.xml').read_text()
native = (root / 'app/src/main/java/com/zamify/study/MainActivity.java').read_text()
assert '<uses-permission' not in manifest
for expected in ['android:allowBackup="false"', 'android:usesCleartextTraffic="false"',
                 'android:configChanges="orientation|screenSize|screenLayout|smallestScreenSize|keyboardHidden|uiMode"',
                 'android:enableOnBackInvokedCallback="true"']:
    assert expected in manifest
for expected in ['setBlockNetworkLoads(true)', 'setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW)',
                 'setAllowFileAccess(false)', 'setAllowContentAccess(false)', 'FLAG_DEBUGGABLE',
                 'WindowInsetsController', 'OnBackInvokedCallback', 'AES/GCM/NoPadding']:
    assert expected in native
assert 'addJavascriptInterface' not in native
assert 'android.useAndroidX=false' in (root / 'gradle.properties').read_text()

def verify_assets(page, enc_bytes, names):
    bank = json.loads(re.search(r'const BANK=(.*?);\nconst DOMAINS=', page, re.S).group(1))
    free_ids = {1, 29, 6, 10, 11, 13, 45, 16, 59, 65}
    assert len(bank) == 10 and {q['id'] for q in bank} == free_ids
    assert 'Developer preview tools' not in page
    assert 'Preview full pack — no payment' not in page
    assert 'data-action="demo"' not in page and "case'demo':" not in page
    assert 'previewFullPack?BANK' not in page
    assert 's.previewFullPack=false;' in page
    assert '<summary>Privacy policy</summary>' in page and 'info@zamify.com' in page
    assert len(enc_bytes) > 1024
    full = json.loads((root / 'questions.json').read_text())
    paid = [q for q in full if q['id'] not in free_ids]
    for q in paid:
        assert q['q'] not in page, f"Paid question {q['id']} leaked into HTML"
        assert q['q'].encode() not in enc_bytes
    assert not any(n.endswith(('.json', '.csv')) for n in names if '/assets/' in n)
    # Node built-in crypto matches Java's ciphertext|tag representation.
    with tempfile.TemporaryDirectory(prefix='zamify-verify-') as tmp:
        enc = Path(tmp) / 'pack.enc'; enc.write_bytes(enc_bytes)
        script = '''
const fs=require('fs'),crypto=require('crypto'),assert=require('assert');
const raw=fs.readFileSync(process.argv[1]);
const key=crypto.createHash('sha256').update('com.zamify.study:zamify_aif_c01_full_pack:v1').digest();
function decrypt(b){const d=crypto.createDecipheriv('aes-256-gcm',key,b.subarray(0,12));d.setAuthTag(b.subarray(-16));return Buffer.concat([d.update(b.subarray(12,-16)),d.final()])}
const decoded=decrypt(raw); const bad=Buffer.from(raw);bad[12]^=1;assert.throws(()=>decrypt(bad));
const wrongTag=Buffer.from(raw);wrongTag[wrongTag.length-1]^=1;assert.throws(()=>decrypt(wrongTag));
process.stdout.write(decoded);
'''
        decoded = subprocess.run(['node', '-e', script, str(enc)], capture_output=True, check=True).stdout
        assert json.loads(decoded) == paid

if __name__ == '__main__':
    bundle = root / 'app/build/outputs/bundle/release/app-release.aab'
    with ZipFile(bundle) as archive:
        names = archive.namelist()
        assert names.count('base/assets/index.html') == 1
        assert names.count('base/assets/paid_pack.enc') == 1
        assert not any(n.endswith('.so') for n in names), 'Review native library page-size compatibility'
        verify_assets(archive.read('base/assets/index.html').decode('utf-8'), archive.read('base/assets/paid_pack.enc'), names)
    print('Verified AAB: 10 free, 73 encrypted; round-trip and GCM tamper rejection pass; billing pending')
