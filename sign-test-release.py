"""Sign the optimized release APK with a development key for emulator QA only.
Never configure this key as the Play upload/release signing identity.
"""
import os
import subprocess
from pathlib import Path

root = Path(__file__).resolve().parent
sdk = os.environ.get('ANDROID_HOME') or os.environ.get('ANDROID_SDK_ROOT')
if not sdk:
    raise SystemExit('Set ANDROID_HOME or ANDROID_SDK_ROOT')
tools = Path(sdk) / 'build-tools/35.0.0'
source = root / 'app/build/outputs/apk/release/app-release-unsigned.apk'
assert source.exists(), 'Run ./gradlew assembleRelease first (without production signing variables)'
key = root / 'development-signing/zamify-debug.keystore'
assert key.exists(), 'Run python3 build-test-apk.py first to create the test-only key'
out = root / 'test-build'
out.mkdir(exist_ok=True)
aligned = out / 'release-aligned.apk'
output = out / 'Zamify_Release_Test.apk'
subprocess.run([str(tools/'zipalign'), '-f', '-p', '4', str(source), str(aligned)], check=True)
subprocess.run([str(tools/'apksigner'), 'sign', '--v4-signing-enabled', 'false', '--ks', str(key),
                '--ks-key-alias', 'androiddebugkey', '--ks-pass', 'pass:android', '--key-pass', 'pass:android',
                '--out', str(output), str(aligned)], check=True)
subprocess.run([str(tools/'apksigner'), 'verify', '--verbose', str(output)], check=True)
print('Created test-signed optimized release APK:', output)
