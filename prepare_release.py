"""Package 10 free questions and 73 encrypted candidates; billing remains disabled.
The bundled derivable key deters casual extraction, not a hostile APK owner.
Format: 12-byte random nonce | AES-256-GCM ciphertext | 16-byte tag.
"""
from pathlib import Path
import hashlib
import json
import re
import secrets
import subprocess
import tempfile

root = Path(__file__).resolve().parent
source = (root / 'Preview.html').read_text(encoding='utf-8')
bank = json.loads((root / 'questions.json').read_text(encoding='utf-8'))
free_ids = [1, 29, 6, 10, 11, 13, 45, 16, 59, 65]
free = [q for q in bank if q['id'] in free_ids]
paid = [q for q in bank if q['id'] not in free_ids]
assert len(free) == 10 and len(paid) == 73 and len(bank) == 83
replacement = 'const BANK=' + json.dumps(free, ensure_ascii=False).replace('<', '\\u003c') + ';\nconst DOMAINS='
source, count = re.subn(r'const BANK=.*?;\nconst DOMAINS=', lambda _: replacement, source, count=1, flags=re.S)
assert count == 1

def replace_once(old, new):
    global source
    assert source.count(old) == 1, old
    source = source.replace(old, new)

replace_once('s.previewFullPack=raw.previewFullPack===true;', 's.previewFullPack=false;')
replace_once('function pool(){return state.previewFullPack?BANK:BANK.filter(q=>FREE_IDS.includes(q.id))}', 'function pool(){return BANK.filter(q=>state.previewFullPack||FREE_IDS.includes(q.id))}')
replace_once("case'demo':return saveTier(true);", '')
replace_once('<details><summary>Developer preview tools</summary><p class="small muted">Test access only. This does not represent a purchase or a production content lock.</p><button class="btn secondary" data-action="demo">Preview full pack — no payment</button></details>', '')
source = source.replace('Payments are not available in this test build.', 'The full pack is not yet available.')
source = source.replace('This prototype uses clearly labeled demo access, not Google Play Billing.', 'Purchases are not available yet.')
source = source.replace('Zamify · 0.9 preview', 'Zamify · 0.9 free edition')
# Do not describe a future native entitlement as developer demo access.
source = source.replace('FULL-PACK DEMO · No purchase has been made.', 'Full study pack')
source = source.replace('Draft-bank demo', 'Full study pack')
unlock_hook = '''
// Native scaffold only. This callback is not a purchase-verification boundary.
window.onZamifyPaidPackUnlocked = function(paidItems) {
  if (!Array.isArray(paidItems) || paidItems.length !== 73) return;
  const ids = new Set(BANK.map(q => q.id));
  if (new Set(paidItems.map(q => q.id)).size !== 73 ||
      paidItems.some(q => !Number.isInteger(q.id) || ids.has(q.id))) return;
  paidItems.forEach(q => BANK.push(q));
  state.previewFullPack = true;
  render();
};
</script>'''
replace_once('</script>', unlock_hook)
out_dir = root / 'app/build/generated/freeReleaseAssets'
out_dir.mkdir(parents=True, exist_ok=True)
key = hashlib.sha256(b'com.zamify.study:zamify_aif_c01_full_pack:v1').digest()
# A fresh nonce per encryption avoids GCM nonce reuse across packaging runs.
iv = secrets.token_bytes(12)
node_script = '''
const crypto = require('crypto'), fs = require('fs');
const key = Buffer.from(process.argv[1], 'hex'), iv = Buffer.from(process.argv[2], 'hex');
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
const enc = Buffer.concat([iv, cipher.update(fs.readFileSync(process.argv[3])), cipher.final(), cipher.getAuthTag()]);
fs.writeFileSync(process.argv[4], enc);
'''
with tempfile.TemporaryDirectory(prefix='zamify-pack-') as tmp:
    plain = Path(tmp) / 'paid.json'
    plain.write_bytes(json.dumps(paid, ensure_ascii=False).encode('utf-8'))
    subprocess.run(['node', '-e', node_script, key.hex(), iv.hex(), str(plain), str(out_dir / 'paid_pack.enc')], check=True)
(out_dir / 'index.html').write_text(source, encoding='utf-8')
assert 'Developer preview tools' not in source
assert 'Preview full pack — no payment' not in source
assert 'data-action="demo"' not in source and "case'demo':" not in source
assert 'previewFullPack?BANK' not in source
assert len(json.loads(re.search(r'const BANK=(.*?);\nconst DOMAINS=', source, re.S).group(1))) == 10
print('Prepared release: 10 free + 73 AES-256-GCM encrypted candidates; purchases disabled')
