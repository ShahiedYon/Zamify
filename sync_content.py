from pathlib import Path
import json,re
root=Path(__file__).resolve().parent
bank=json.loads((root/'questions.json').read_text())
assert len({q['id'] for q in bank})==len(bank)
for q in bank:
 n=len(q['options']);assert q['kind'] in ['single','multi','order','match'];assert len(q['reasons'])==n and all(q['reasons']);assert all(c['text'] in q['q'] for c in q['clues']);assert q['hint'] and q['analysis'] and q['trap']
 a=q['answer']
 if q['kind']=='single':assert isinstance(a,int) and 0<=a<n
 else:
  assert isinstance(a,list) and len(set(a))==len(a) and all(isinstance(i,int) and 0<=i<n for i in a)
  if q['kind']=='multi':assert 1<len(a)<n
  else:assert len(a)==n
  if q['kind']=='match':assert len(q['prompts'])==n
path=root/'app/src/main/assets/index.html';html=path.read_text()
replacement='const BANK='+json.dumps(bank,ensure_ascii=False).replace('<','\\u003c')+';\nconst DOMAINS='
html,count=re.subn(r'const BANK=.*?;\nconst DOMAINS=',lambda m:replacement,html,count=1,flags=re.S);assert count==1
path.write_text(html);(root/'Preview.html').write_text(html)
print('Synced and validated',len(bank),'questions across four formats')
