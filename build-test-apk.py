#!/usr/bin/env python3
"""Build a signed test APK using the official Android SDK tools and JDK 17.
No Gradle dependencies are required for this platform-only application.
Run: python3 build-test-apk.py --sdk /path/to/android-sdk
The key is a local development/test key, never a production publishing key.
"""
from pathlib import Path
import argparse,subprocess,zipfile,xml.etree.ElementTree as ET,os,shutil
parser=argparse.ArgumentParser();parser.add_argument('--sdk',required=True);args=parser.parse_args()
root=Path(__file__).resolve().parent;sdk=Path(args.sdk).resolve();tools=sdk/'build-tools/35.0.0';android=sdk/'platforms/android-35/android.jar';out=root/'test-build';out.mkdir(exist_ok=True)
classes=out/'classes';classes.mkdir(exist_ok=True);gen=out/'generated';gen.mkdir(exist_ok=True);dex=out/'dex';dex.mkdir(exist_ok=True)
def run(*cmd):print('Running',Path(str(cmd[0])).name,flush=True);subprocess.run([str(x) for x in cmd],check=True)
ns='http://schemas.android.com/apk/res/android';ET.register_namespace('android',ns)
manifest=ET.parse(root/'app/src/main/AndroidManifest.xml');manifest.getroot().set('package','com.zamify.study');manifest.getroot().find('application').set('{'+ns+'}debuggable','true');manifest.write(out/'AndroidManifest.xml',encoding='utf-8',xml_declaration=True)
run(tools/'aapt2','compile','--dir',root/'app/src/main/res','-o',out/'resources.zip')
run(tools/'aapt2','link','-I',android,'--manifest',out/'AndroidManifest.xml','--java',gen,'--min-sdk-version','26','--target-sdk-version','35','--version-code','8','--version-name','0.8.0','-o',out/'unsigned.apk',out/'resources.zip')
sources=list((root/'app/src/main/java').rglob('*.java'))+list(gen.rglob('*.java'))
compiler=['javac'] if shutil.which('javac') else ['java','-m','jdk.compiler/com.sun.tools.javac.Main']
run(*compiler,'-encoding','UTF-8','-source','8','-target','8','-classpath',android,'-d',classes,*sources)
with zipfile.ZipFile(out/'classes.jar','w',zipfile.ZIP_DEFLATED) as z:
 for p in classes.rglob('*.class'):z.write(p,str(p.relative_to(classes)))
run(tools/'d8','--lib',android,'--min-api','26','--output',dex,out/'classes.jar')
with zipfile.ZipFile(out/'unsigned.apk','a',zipfile.ZIP_DEFLATED) as z:
 for p in dex.glob('*.dex'):z.write(p,p.name)
 for p in (root/'app/src/main/assets').rglob('*'):
  if p.is_file():z.write(p,'assets/'+str(p.relative_to(root/'app/src/main/assets')))
run(tools/'zipalign','-f','-p','4',out/'unsigned.apk',out/'aligned.apk')
key=root/'development-signing/zamify-debug.keystore'
key.parent.mkdir(exist_ok=True)
if not key.exists():run('keytool','-genkeypair','-keystore',key,'-storepass','android','-alias','androiddebugkey','-keypass','android','-keyalg','RSA','-keysize','2048','-validity','10000','-dname','CN=Android Debug,O=Zamify,C=ZA')
run(tools/'apksigner','sign','--v4-signing-enabled','false','--ks',key,'--ks-key-alias','androiddebugkey','--ks-pass','pass:android','--key-pass','pass:android','--out',out/'Zamify_Test.apk',out/'aligned.apk')
run(tools/'apksigner','verify','--verbose',out/'Zamify_Test.apk')
with zipfile.ZipFile(out/'Zamify_Test.apk') as z: assert z.testzip() is None
print('Created',out/'Zamify_Test.apk',flush=True)
