"""Inspect the compiled AAB, round-trip its pack, and reject tampered ciphertext.
These checks do not certify Google Play policy compliance or purchase security.
"""
from pathlib import Path
from zipfile import ZipFile
import json
import os
import xml.etree.ElementTree as ET
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
    assert 's.previewFullPack=paidAuthorized===true;' in page
    assert 's.previewFullPack=raw.previewFullPack===true;' not in page
    assert 'getSharedPreferences(' not in native
    assert 'android:dataExtractionRules="@xml/data_extraction_rules"' in manifest
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
    rules = ET.parse(root / 'app/src/main/res/xml/data_extraction_rules.xml').getroot()
    domains = {'root','file','database','sharedpref','external','device_root','device_file','device_database','device_sharedpref'}
    for section in ['cloud-backup','device-transfer']:
        assert {(x.attrib['domain'],x.attrib['path']) for x in rules.find(section)} == {(d,'.') for d in domains}
    sdk = os.environ.get('ANDROID_HOME') or os.environ.get('ANDROID_SDK_ROOT')
    apk = root / 'app/build/outputs/apk/release/app-release-unsigned.apk'
    if sdk and apk.exists():
        aapt = Path(sdk) / 'build-tools/35.0.0/aapt2'
        badging = subprocess.run([str(aapt),'dump','badging',str(apk)],check=True,capture_output=True,text=True).stdout
        assert "name='com.zamify.study'" in badging
        assert "versionCode='9'" in badging and "versionName='0.9.0'" in badging
        assert re.search(r"(?:minSdkVersion|sdkVersion):'26'",badging) and "targetSdkVersion:'36'" in badging
        assert 'uses-permission:' not in badging
        compiled_manifest=subprocess.run([str(aapt),'dump','xmltree',str(apk),'--file','AndroidManifest.xml'],check=True,capture_output=True,text=True).stdout
        for attr in ['allowBackup','fullBackupContent','usesCleartextTraffic']:
            assert re.search(attr+r'\([^)]*\)=false',compiled_manifest),attr
        assert 'dataExtractionRules(' in compiled_manifest
        assert not re.search(r'debuggable\([^)]*\)=true',compiled_manifest)
        with ZipFile(apk) as archive:
            verify_assets(archive.read('assets/index.html').decode('utf-8'),archive.read('assets/paid_pack.enc'),archive.namelist())
    print('Verified release: 10 free, 73 encrypted; round-trip/tamper rejection, backup exclusions and compiled APK metadata pass; billing pending')
