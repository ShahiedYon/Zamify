from pathlib import Path
import json,re
R=Path(__file__).resolve().parents[1]
def embed(html):
    packs=json.loads((R/'study/packs.json').read_text())
    for p in packs:
        assert len(set(p['freeIds']))==10
        assert len({q['id'] for q in p['questions']})==len(p['questions'])
        assert all(any(q['id']==i for q in p['questions']) for i in p['freeIds'])
        assert set(q['domain'] for q in p['questions'] if q['id'] in p['freeIds'])==set(range(1,len(p['domains'])+1))
        for q in p['questions']:
            assert 1<=q['domain']<=len(p['domains']) and len(q['options'])==len(q['reasons'])
            assert q['hint'] and q['why'] and q['source'].startswith('https://')
            assert all(c['text'] in q['q'] for c in q['clues'])
            a=q['answer']
            if q['kind']=='single':assert isinstance(a,int) and 0<=a<len(q['options'])
            else:assert isinstance(a,list) and len(set(a))==len(a) and all(0<=i<len(q['options']) for i in a)
    script=(R/'study/hub.js').read_text().replace('__STUDY_PACKS__',json.dumps(packs,ensure_ascii=False).replace('<','\\u003c'))
    css=(R/'study/hub.css').read_text()
    html=re.sub(r'\n*/\* HUB_STYLE_START \*/.*?/\* HUB_STYLE_END \*/\n*','',html,flags=re.S)
    html=html.replace('</style>','\n/* HUB_STYLE_START */\n'+css+'/* HUB_STYLE_END */\n</style>')
    html=re.sub(r'// HUB_ENGINE_START\n.*?// HUB_ENGINE_END\n','',html,flags=re.S)
    # Insert before the initial render, retaining one inline script for hardened release packaging.
    marker='render();\nif(typeof location'
    assert html.count(marker)==1
    return html.replace(marker,'// HUB_ENGINE_START\n'+script+'\n// HUB_ENGINE_END\n'+marker)
if __name__=='__main__':
    p=R/'app/src/main/assets/index.html'
    html=embed(p.read_text());p.write_text(html);(R/'Preview.html').write_text(html)
    print('Synced three-exam study hub')
