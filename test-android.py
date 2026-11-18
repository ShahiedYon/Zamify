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
parser.add_argument('--preview', action='store_true',help='Test the separately installed preview package')
args = parser.parse_args()
sdk = os.environ.get('ANDROID_HOME') or os.environ.get('ANDROID_SDK_ROOT')
adb_bin = shutil.which('adb') or str(Path(sdk or '')/'platform-tools/adb')
adb = [adb_bin] + (['-s', args.serial] if args.serial else [])
pkg = 'com.zamify.preview' if args.preview else 'com.zamify.study'
mode = 'preview' if args.preview else 'release' if args.release else 'debug'
out = Path('test-output/android') / mode
out.mkdir(parents=True, exist_ok=True)
step = 0

def command(*cmd, check=True, binary=False, timeout=40):
    result = subprocess.run(adb + list(cmd), capture_output=True, timeout=timeout)
    if check and result.returncode:
        raise RuntimeError('ADB '+ ' '.join(cmd)+': '+result.stderr.decode('utf-8',errors='replace')+' '+result.stdout.decode('utf-8',errors='replace'))
    return result.stdout if binary else result.stdout.decode('utf-8', errors='replace')

def shell(*cmd, **kw):
    return command('shell', *cmd, **kw)

def dump():
    global step
    step += 1
    errors=[]
    for attempt in range(5):
        # /dev/tty avoids external-storage permission/version differences.
        result=subprocess.run(adb+['exec-out','uiautomator','dump','/dev/tty'],capture_output=True,timeout=35)
        text=result.stdout.decode('utf-8',errors='replace')
        start=text.find('<?xml')
        if start<0:start=text.find('<hierarchy')
        end=text.find('</hierarchy>')
        if start>=0 and end>=0:
            xml=text[start:end+len('</hierarchy>')]
            (out/f'{step:03d}.xml').write_text(xml)
            return ET.fromstring(xml)
        errors.append(text+'\n'+result.stderr.decode('utf-8',errors='replace'))
        time.sleep(2)
    (out/f'{step:03d}-dump-errors.txt').write_text('\n'.join(errors))
    raise AssertionError('Could not obtain UI tree: '+' | '.join(errors)[-1500:])

def label(node):
    return re.sub(r'\s+', ' ', node.get('text', '') or node.get('content-desc', '')).strip()

def bounds(node):
    match = re.fullmatch(r'\[(\d+),(\d+)\]\[(\d+),(\d+)\]', node.get('bounds', ''))
    if not match:
        return None
    x1, y1, x2, y2 = map(int, match.groups())
    return (x1, y1, x2, y2) if x2 > x1 and y2 > y1 else None

def visible_nodes(node, clip=None):
    box=bounds(node)
    visible=box
    if box and clip:
        visible=(max(box[0],clip[0]),max(box[1],clip[1]),min(box[2],clip[2]),min(box[3],clip[3]))
        if visible[2]<=visible[0] or visible[3]<=visible[1]:visible=None
    if visible:yield node,visible
    # WebView accessibility bounds can extend under a fixed footer even when
    # the DOM scroll pane clips them. Respect the UI-tree scroll ancestor.
    if node.get('scrollable')=='true':
        if visible is None:return
        clip=visible
    for child in node:yield from visible_nodes(child,clip)

def find(root, text):
    matches=[(n,b) for n,b in visible_nodes(root) if text.casefold() in label(n).casefold() and
             (n.get('clickable')!='true' or b[3]-b[1]>=48)]
    if not matches:return None
    node,box=min(matches,key=lambda pair:(pair[0].get('clickable')!='true',label(pair[0]).casefold()!=text.casefold(),len(label(pair[0]))))
    node.set('bounds',f'[{box[0]},{box[1]}][{box[2]},{box[3]}]')
    return node

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
    shell('am', 'start', '-W', '-n', pkg+'/com.zamify.study.MainActivity')

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
    command('root',check=False)
    command('wait-for-device')
    command('uninstall', pkg, check=False)  # Debug and release-test variants use separate test signing keys.
    command('install', '-r', str(args.apk.resolve()), timeout=90)
    shell('pm', 'clear', pkg)
    shell('settings', 'put', 'system', 'accelerometer_rotation', '0')
    shell('settings', 'put', 'system', 'user_rotation', '0')
    shell('svc', 'wifi', 'disable')
    shell('svc', 'data', 'disable')
    command('logcat', '-c', check=False)  # Some old images cannot clear every log buffer.
    print('Launching '+mode+' APK',flush=True)
    launch()
    time.sleep(3)  # Allow the first WebView renderer/Accessibility provider to start.
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
        wait('YOUR NEXT CHAPTER')
        screenshot('offline-catalogue')
        tap('Open COF-C03 study path')
        wait('COF-C03')
        tap('Official exam information')
        root=dump()
        browser_packages={n.get('package','') for n in root.iter('node')}
        activity=shell('dumpsys','activity','activities')
        assert any('chrome' in x or 'browser' in x for x in browser_packages) or 'ResolverActivity' in activity or 'ChooserActivity' in activity, 'Official source did not hand off to browser selection'
        (out/'source-link-activity.txt').write_text(activity)
        screenshot('external-source-browser')
        shell('input','keyevent','4')
        locate('COF-C03')
        tap('Start 10 free questions')
        wait('LEARN & PRACTICE')
        root=dump();all_text=' '.join(label(n) for n in root.iter('node'))
        snow=next(p for p in json.loads(Path('study/packs.json').read_text()) if p['id']=='snowpro-core')
        current=next((q for q in snow['questions'] if q['q'] in all_text),None)
        assert current,'Could not identify rendered question from UI text'
        tap(current['options'][current['answer']])
        screenshot('snowpro-draft')
        tap('Save & return to study path')
        shell('am','force-stop',pkg);launch()
        wait('YOUR NEXT CHAPTER')
        tap('Open COF-C03 study path')
        tap('Resume saved session')
        shell('settings','put','system','user_rotation','1')
        locate('Check answer');screenshot('landscape-draft')
        shell('settings','put','system','user_rotation','0')
        tap('Check answer');locate('Correct — now explain why.');screenshot('feedback')
        shell('input','keyevent','4');locate('Your place is saved.')
        tap('View full study pack');root,_=locate('Purchases not available')
        # Preview tools may be below the fold, so use rendered label search with scrolling.
        try:locate('Developer preview',attempts=4);has_demo=True
        except AssertionError:has_demo=False
        assert has_demo != args.release,'Developer preview escaped into release'
        if args.preview:
            tap('Developer preview')
            tap('Try full tools')
            tap('Flashcards')
            tap('Show answer')
            tap('Got it')
            screenshot('preview-flashcards')
            shell('input','keyevent','4')
            tap('About');tap('Study');locate('SnowPro Core')
            tap('Learn');locate('Understand the decision.')
            screenshot('preview-lessons')
        shell('input','keyevent','4');tap('About');tap('Privacy policy');locate('info@zamify.net');screenshot('privacy')
        crash_check()
        print('PASS',mode,': offline catalogue, SnowPro free question, draft/cold resume, rotation, Back, grading, privacy and release isolation',flush=True)

finally:
    if not args.release and not args.preview:
        try:
            subprocess.run(['node','diagnose-android.cjs',adb_bin,args.serial or '',str(out/'webview.json')],check=False,timeout=30)
        except subprocess.TimeoutExpired:
            print('Optional WebView diagnostic timed out',flush=True)
    (out/'logcat.txt').write_text(command('logcat', '-d', check=False))
    screenshot('final')
    shell('settings', 'put', 'system', 'user_rotation', '0', check=False)
