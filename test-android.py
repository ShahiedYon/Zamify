"""ADB UI smoke test for an emulator. Standard library only; no app test bridge.
Follows Test Android Apps' android-emulator-qa workflow: derive every tap from
UI-tree bounds and retain screenshots, XML and logcat as evidence.
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import time
import xml.etree.ElementTree as ET
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('--apk', type=Path, required=True)
parser.add_argument('--serial')
parser.add_argument('--release', action='store_true')
args = parser.parse_args()
sdk = os.environ.get('ANDROID_HOME') or os.environ.get('ANDROID_SDK_ROOT')
adb_bin = shutil.which('adb') or str(Path(sdk or '')/'platform-tools/adb')
adb = [adb_bin] + (['-s', args.serial] if args.serial else [])
pkg = 'com.zamify.study'
mode = 'release' if args.release else 'debug'
out = Path('test-output/android') / mode
out.mkdir(parents=True, exist_ok=True)
step = 0

def command(*cmd, check=True, binary=False, timeout=40):
    result = subprocess.run(adb + list(cmd), capture_output=True, timeout=timeout, check=check)
    return result.stdout if binary else result.stdout.decode('utf-8', errors='replace')

def shell(*cmd, **kw):
    return command('shell', *cmd, **kw)

def dump():
    global step
    step += 1
    shell('uiautomator', 'dump', '/sdcard/zamify-ui.xml', timeout=35)
    xml = shell('cat', '/sdcard/zamify-ui.xml')
    (out / f'{step:03d}.xml').write_text(xml)
    return ET.fromstring(xml)

def label(node):
    return re.sub(r'\s+', ' ', node.get('text', '') or node.get('content-desc', '')).strip()

def bounds(node):
    match = re.fullmatch(r'\[(\d+),(\d+)\]\[(\d+),(\d+)\]', node.get('bounds', ''))
    if not match:
        return None
    x1, y1, x2, y2 = map(int, match.groups())
    return (x1, y1, x2, y2) if x2 > x1 and y2 > y1 else None

def find(root, text):
    matches = [n for n in root.iter('node') if text in label(n) and bounds(n)]
    if not matches:
        return None
    return min(matches, key=lambda n: (label(n) != text, n.get('clickable') != 'true', len(label(n))))

def wait(text, timeout=35):
    until = time.monotonic() + timeout
    while time.monotonic() < until:
        root = dump()
        node = find(root, text)
        if node is not None:
            return root, node
        time.sleep(.4)
    raise AssertionError(f'Missing UI: {text}')

def swipe(root, down=True):
    containers = [n for n in root.iter('node') if n.get('scrollable') == 'true' and bounds(n)]
    if not containers:
        # The WebView is the scroll container even when its accessibility node
        # does not publish scrollable=true. Still derive the gesture from XML.
        containers = [n for n in root.iter('node') if n.get('class') == 'android.webkit.WebView' and bounds(n)]
    assert containers, 'No UI-tree scroll container'
    x1, y1, x2, y2 = max((bounds(n) for n in containers), key=lambda b: (b[2]-b[0])*(b[3]-b[1]))
    x = (x1+x2)//2
    top, bottom = int(y1+(y2-y1)*.25), int(y1+(y2-y1)*.75)
    shell('input', 'swipe', str(x), str(bottom if down else top), str(x), str(top if down else bottom), '350')

def locate(text, down=True, attempts=15):
    for _ in range(attempts):
        root = dump()
        node = find(root, text)
        if node is not None:
            return root, node
        swipe(root, down)
    raise AssertionError(f'UI not found after scrolling: {text}')

def tap(text, down=True):
    _, node = locate(text, down)
    assert node.get('enabled') != 'false', f'Disabled control: {text}'
    x1,y1,x2,y2 = bounds(node)
    shell('input', 'tap', str((x1+x2)//2), str((y1+y2)//2))

def screenshot(name):
    (out / f'{name}.png').write_bytes(command('exec-out', 'screencap', '-p', binary=True))

def launch():
    shell('am', 'start', '-W', '-n', pkg+'/.MainActivity')

def crash_check():
    crash = command('logcat', '-b', 'crash', '-d')
    (out/'crash.txt').write_text(crash)
    assert pkg not in crash, 'App crash recorded in logcat'

try:
    command('wait-for-device')
    boot_deadline = time.monotonic()+180
    while shell('getprop', 'sys.boot_completed').strip() != '1':
        assert time.monotonic() < boot_deadline, 'Emulator did not boot'
        time.sleep(2)
    assert shell('getprop', 'ro.kernel.qemu').strip() == '1', 'This script clears test data and must run on an emulator'
    command('uninstall', pkg, check=False)  # Debug and release-test variants use separate test signing keys.
    command('install', '-r', str(args.apk.resolve()), timeout=90)
    shell('pm', 'clear', pkg)
    shell('settings', 'put', 'system', 'accelerometer_rotation', '0')
    shell('settings', 'put', 'system', 'user_rotation', '0')
    shell('svc', 'wifi', 'disable')
    shell('svc', 'data', 'disable')
    command('logcat', '-c')
    launch()
    # Old API-26 images have an obsolete WebView. Test the explicit recovery UI
    # instead of accepting a blank screen or calling it a full study-flow pass.
    root = dump()
    version = shell('dumpsys', 'webviewupdate')
    (out/'webview-provider.txt').write_text(version)
    if find(root, 'Update Android System WebView') is not None:
        assert find(root, 'Open Google Play') is not None
        screenshot('webview-update-required')
        assert int(shell('getprop', 'ro.build.version.sdk').strip()) < 30, 'Unexpected obsolete WebView on modern test image'
        shell('input', 'keyevent', '4')
        crash_check()
        print('PASS',mode,': old-WebView recovery UI launches offline and Back exits; full study flow requires a WebView update',flush=True)
    else:
        wait('Start my free practice')
        screenshot('offline-home')
        # Deterministic Q11 through the real public lesson flow.
        tap('Learn')
        tap('Try two connected questions')
        wait('Save & exit')
        screenshot('question')
        correct = next(q for q in json.loads(Path('questions.json').read_text()) if q['id']==11)
        tap(correct['options'][correct['answer']])
        _, check = locate('Check answer')
        assert check.get('enabled') != 'false'
        tap('Save & exit', down=False)
        shell('am', 'force-stop', pkg)
        launch()
        wait('Continue practising')
        tap('Continue practising')
        _, check = locate('Check answer')
        assert check.get('enabled') != 'false', 'Draft choice lost after cold launch'
        shell('settings', 'put', 'system', 'user_rotation', '1')
        _, check = locate('Check answer')
        assert check.get('enabled') != 'false', 'Draft lost on rotation'
        screenshot('landscape-draft')
        shell('settings', 'put', 'system', 'user_rotation', '0')
        shell('input', 'keyevent', '4')
        wait('Keep going.')
        tap('Continue learning')
        tap('Check answer')
        wait('Correct — check the insight.')
        screenshot('feedback')
        shell('am', 'force-stop', pkg)
        launch()
        wait('Continue practising')
        tap('Continue practising')
        wait('Correct — check the insight.')
        shell('input', 'keyevent', '4')
        tap('About')
        root,_ = wait('Study simply.')
        has_demo = find(root, 'Developer preview tools') is not None
        assert has_demo != args.release, 'Developer tools/release isolation mismatch'
        tap('Privacy policy')
        locate('info@zamify.com')
        screenshot('privacy')
        crash_check()
        print('PASS',mode,': offline launch, real lesson, draft/cold resume, rotation, Back, grading, answered resume, privacy and release isolation',flush=True)
finally:
    (out/'logcat.txt').write_text(command('logcat', '-d', check=False))
    screenshot('final')
    shell('settings', 'put', 'system', 'user_rotation', '0', check=False)
