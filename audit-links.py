"""Check public link health and Android external-host compatibility; no credentials."""
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urlsplit
from urllib.request import urlopen, Request
from pathlib import Path
import json,sys,re
root=Path(__file__).resolve().parent
urls=json.loads((root/'test-output/all-link-targets.json').read_text())
native=(root/'app/src/main/java/com/zamify/study/MainActivity.java').read_text()
allowed=set(re.findall(r'"([^"]+)"\.equals\(uri\.getHost\(\)\)',native))
policy='https://zamify-study.syon04.chatgpt.site/privacy/'
def check(url):
    u=urlsplit(url)
    result={'url':url,'native_allowed':u.scheme=='https' and not u.username and not u.password and not u.port and (u.hostname in allowed or url==policy)}
    if '--reuse-health' in sys.argv:
        cached=next(r for r in previous if r['url']==url)
        result.update({k:v for k,v in cached.items() if k not in ['url','native_allowed']})
        return result
    try:
        with urlopen(Request(url,headers={'User-Agent':'Zamify-Link-Check/1.0'}),timeout=25) as response:
            result.update(status=response.status,final_url=response.url)
    except Exception as error:result['error']=str(error)
    return result
previous=json.loads((root/'test-output/link-audit.json').read_text()) if '--reuse-health' in sys.argv else []
results=list(ThreadPoolExecutor(max_workers=10).map(check,urls))
(root/'test-output/link-audit.json').write_text(json.dumps(results,indent=2)+'\n')
failed=[r for r in results if not r['native_allowed'] or r.get('status')!=200]
print(json.dumps({'checked':len(results),'failed':failed},indent=2))
if failed:raise SystemExit(1)
