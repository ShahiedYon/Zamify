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
ANDROID = '{http://schemas.android.com/apk/res/android}'
BILLING_VERSION = '9.1.0'
BILLING_PERMISSION = 'com.android.vending.BILLING'
PRIVATE_PERMISSION = 'com.zamify.study.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION'
# The official SDK's transport dependencies add network access. AndroidX's
# receiver guard is app-private and must retain signature protection.
PLAY_PERMISSIONS = {BILLING_PERMISSION, PRIVATE_PERMISSION,
                    'android.permission.INTERNET', 'android.permission.ACCESS_NETWORK_STATE'}

def permissions(document):
    return {e.get(ANDROID + 'name') for e in document if e.tag.startswith('uses-permission')}

assert permissions(ET.fromstring(manifest)) == {BILLING_PERMISSION}
for expected in ['android:allowBackup="false"', 'android:usesCleartextTraffic="false"',
                 'android:configChanges="orientation|screenSize|screenLayout|smallestScreenSize|keyboardHidden|uiMode"',
                 'android:enableOnBackInvokedCallback="true"']:
    assert expected in manifest
for expected in ['setBlockNetworkLoads(true)', 'setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW)',
                 'setAllowFileAccess(false)', 'setAllowContentAccess(false)', 'FLAG_DEBUGGABLE',
                 'WindowInsetsController', 'OnBackInvokedCallback', 'AES/GCM/NoPadding']:
    assert expected in native
assert 'addJavascriptInterface' not in native
assert 'android.useAndroidX=true' in (root / 'gradle.properties').read_text()
assert f"implementation 'com.android.billingclient:billing:{BILLING_VERSION}'" in (root / 'app/build.gradle').read_text()
# Phase 1 bundles the SDK only; it must not initiate payment or grant access.
assert 'startConnection(' not in native and 'launchBillingFlow(' not in native

def verify_billing_manifest(variant):
    path = root / f'app/build/intermediates/merged_manifests/{variant}/process{variant.title()}Manifest/AndroidManifest.xml'
    document = ET.parse(path).getroot()
    assert permissions(document) == PLAY_PERMISSIONS, (path, permissions(document))
    declared = document.findall('permission')
    assert len(declared) == 1
    assert declared[0].get(ANDROID + 'name') == PRIVATE_PERMISSION
    assert declared[0].get(ANDROID + 'protectionLevel') == 'signature'
    app = document.find('application')
    metadata = {e.get(ANDROID + 'name'): e.get(ANDROID + 'value') for e in app.findall('meta-data')}
    assert metadata.get('com.google.android.play.billingclient.version') == BILLING_VERSION
    activities = {e.get(ANDROID + 'name'): e for e in app.findall('activity')}
    for name in ['com.android.billingclient.api.ProxyBillingActivity', 'com.android.billingclient.api.ProxyBillingActivityV2']:
        assert activities[name].get(ANDROID + 'exported') == 'false'
    exported = {(e.tag, e.get(ANDROID + 'name'), e.get(ANDROID + 'permission'))
                for e in app if e.tag in {'activity','activity-alias','service','receiver','provider'}
                and (e.get(ANDROID + 'exported') == 'true' or
                     (e.get(ANDROID + 'exported') is None and e.find('intent-filter') is not None))}
    assert exported == {('activity','com.zamify.study.MainActivity',None),
                        ('receiver','androidx.profileinstaller.ProfileInstallReceiver','android.permission.DUMP')}, exported

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
    policy_url = re.search(r'PRIVACY_POLICY_URL = "([^"]+)"', native).group(1)
    assert '<summary>Privacy policy</summary>' in page and 'info@zamify.net' in page
    assert f'href="{policy_url}"' in page
    assert 'PRIVACY_POLICY_URL.equals(uri.toString())' in native
    assert len(enc_bytes) > 1024
    full = json.loads((root / 'questions.json').read_text())
    paid = [q for q in full if q['id'] not in free_ids]
    for q in paid:
        assert q['q'] not in page, f"Paid question {q['id']} leaked into HTML"
        assert q['q'].encode() not in enc_bytes
    assert not any(n.endswith(('.json', '.csv')) for n in names if '/assets/' in n or n.startswith('assets/'))
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
    for variant in ['debug', 'release']:
        verify_billing_manifest(variant)
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
    apk_dir = root / 'app/build/outputs/apk/release'
    output_metadata = json.loads((apk_dir / 'output-metadata.json').read_text())
    assert len(output_metadata['elements']) == 1, 'Review split APK verification'
    apk = apk_dir / output_metadata['elements'][0]['outputFile']
    assert sdk and apk.exists(), 'Set ANDROID_HOME and run assembleDebug assembleRelease bundleRelease first'
    if sdk and apk.exists():
        aapt = Path(sdk) / 'build-tools/35.0.0/aapt2'
        badging = subprocess.run([str(aapt),'dump','badging',str(apk)],check=True,capture_output=True,text=True).stdout
        assert "name='com.zamify.study'" in badging
        assert "versionCode='9'" in badging and "versionName='0.9.0'" in badging
        assert re.search(r"(?:minSdkVersion|sdkVersion):'26'",badging) and "targetSdkVersion:'36'" in badging
        compiled_permissions = set(re.findall(r"^uses-permission[^:]*: name='([^']+)'", badging, re.M))
        assert compiled_permissions == PLAY_PERMISSIONS, compiled_permissions
        compiled_manifest=subprocess.run([str(aapt),'dump','xmltree',str(apk),'--file','AndroidManifest.xml'],check=True,capture_output=True,text=True).stdout
        for attr in ['allowBackup','fullBackupContent','usesCleartextTraffic']:
            assert re.search(attr+r'\([^)]*\)=false',compiled_manifest),attr
        assert 'dataExtractionRules(' in compiled_manifest
        assert not re.search(r'debuggable\([^)]*\)=true',compiled_manifest)
        assert 'com.google.android.play.billingclient.version' in compiled_manifest and f'"{BILLING_VERSION}"' in compiled_manifest
        with ZipFile(apk) as archive:
            verify_assets(archive.read('assets/index.html').decode('utf-8'),archive.read('assets/paid_pack.enc'),archive.namelist())
    print(f'Verified release: 10 free, 73 encrypted; tamper rejection, backup exclusions, Billing {BILLING_VERSION}, exact permission allowlist and compiled APK metadata pass; checkout disabled')
