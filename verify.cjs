const fs=require('fs'),vm=require('vm'),assert=require('assert');
const root=__dirname,html=fs.readFileSync(root+'/Preview.html','utf8'),script=html.match(/<script>([\s\S]*?)<\/script>/)[1],data=new Map();
function launch(fail=false){const main={innerHTML:''},gloss={innerHTML:''};const context=vm.createContext({document:{querySelector:s=>s==='#main'?main:s==='#glossary'?gloss:null,querySelectorAll:()=>[],addEventListener:()=>{}},window:{scrollTo(){}},localStorage:{getItem:k=>{if(fail)throw Error('storage');return data.get(k)||null},setItem:(k,v)=>{if(fail)throw Error('storage');data.set(k,v)}}});vm.runInContext(script,context);return{run:s=>vm.runInContext(s,context),main,gloss};}
let x=launch();assert.equal(x.run('pool().length'),10);assert.equal(x.run('new Set(pool().map(q=>q.kind)).size'),4);
for(let d=1;d<=5;d++){x.run(`start('domain',${d})`);assert(x.run('state.session.ids.every(id=>FREE_IDS.includes(id))'));}
x.run("start('all')");assert.equal(x.run('state.session.ids.length'),10);
x.run('hint();selected=Array.isArray(currentQuestion().answer)?currentQuestion().answer.slice():currentQuestion().answer;check()');assert.equal(x.run('state.missed.length'),1);x.run('check()');assert.equal(x.run('state.attempts.length'),1);
let restored=launch();restored.run("tab='quiz';quiz()");assert(restored.main.innerHTML.includes('Hint used'));
restored.run("start('review');selected=Array.isArray(currentQuestion().answer)?currentQuestion().answer.slice():currentQuestion().answer;check();next()");assert.equal(restored.run('state.missed.length'),0);
restored.run("saveTier(true);start('all')");assert.equal(restored.run('state.session.ids.length'),65);
for(let i=0;i<65;i++){restored.run('selected=Array.isArray(currentQuestion().answer)?currentQuestion().answer.slice():currentQuestion().answer;check()');assert.equal(restored.run('state.session.answers[state.session.index].correct'),true);assert(restored.main.innerHTML.includes('Key insight · spot the clue'));restored.run('next()');}
assert(restored.main.innerHTML.includes('SESSION COMPLETE'));assert.equal(restored.run('visited()'),65);
for(const id of [5,10,29]){restored.run(`state.session={ids:[${id}],index:0,answers:[],assisted:[],title:'QA'};selected=currentQuestion().answer.slice();[selected[0],selected[1]]=[selected[1],selected[0]];if(currentQuestion().kind==='multi')selected=[0,1];check()`);assert.equal(restored.run('state.session.answers[0].correct'),false);}
assert.equal(restored.run("validChoice(BANK.find(q=>q.id===10),[0,0,2,3])"),false);assert.equal(restored.run("validChoice(BANK.find(q=>q.id===5),[1,3,4])"),false);
restored.run('saveTier(false)');assert.equal(restored.run('pool().length'),10);assert.equal(restored.run('state.session'),null);
restored.run("tab='learn';learn();filterGloss('MCP')");assert(restored.gloss.innerHTML.includes('<h2>MCP</h2>'));
let blocked=launch(true);assert(blocked.main.innerHTML.includes('Progress storage is unavailable'));
data.set('exam-sprint-aif-v1',JSON.stringify({v:2,attempts:[{id:1,choice:1,correct:true},{id:10,choice:1,correct:true}],missed:[10],session:null}));let migrated=launch();assert.equal(migrated.run('state.attempts.length'),1);assert.equal(migrated.run('state.missed.length'),0);
const bank=JSON.parse(fs.readFileSync(root+'/questions.json','utf8'));assert.equal(bank.length,65);assert.equal(new Set(bank.map(q=>q.id)).size,65);assert.deepEqual([1,2,3,4,5].map(d=>bank.filter(q=>q.domain===d).length),[13,16,18,9,9]);assert.deepEqual(['single','multi','order','match'].map(k=>bank.filter(q=>q.kind===k).length),[57,4,2,2]);
console.log('PASS: all 65 questions and four formats; all-or-nothing scoring; free10/demo65; hints; review; progress restore/migration; blocked storage; content integrity.');
