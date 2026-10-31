const fs=require('fs'),vm=require('vm'),assert=require('assert');
const root=__dirname,html=fs.readFileSync(root+'/Preview.html','utf8'),script=html.match(/<script>([\s\S]*?)<\/script>/)[1],data=new Map();
function launch(fail=false){const main={innerHTML:''},gloss={innerHTML:''};const context=vm.createContext({document:{querySelector:s=>s==='#main'?main:s==='#glossary'?gloss:null,querySelectorAll:()=>[],addEventListener:()=>{}},window:{scrollTo(){}},localStorage:{getItem:k=>{if(fail)throw Error('storage');return data.get(k)||null},setItem:(k,v)=>{if(fail)throw Error('storage');data.set(k,v)}}});vm.runInContext(script,context);return{run:s=>vm.runInContext(s,context),main,gloss};}
let x=launch();x.run('state.guidedHighlights=false;save()');assert.equal(x.run('pool().length'),10);assert.equal(x.run('new Set(pool().map(q=>q.kind)).size'),4);
for(let d=1;d<=5;d++){x.run(`start('domain',${d})`);assert(x.run('state.session.ids.every(id=>FREE_IDS.includes(id))'));}
x.run("start('all')");assert.equal(x.run('state.session.ids.length'),10);
x.run('hint();selected=Array.isArray(currentQuestion().answer)?currentQuestion().answer.slice():currentQuestion().answer;check()');assert.equal(x.run('state.missed.length'),1);x.run('check()');assert.equal(x.run('state.attempts.length'),1);
let restored=launch();restored.run("tab='quiz';quiz()");assert(restored.main.innerHTML.includes('Hint used'));
restored.run("start('review');selected=Array.isArray(currentQuestion().answer)?currentQuestion().answer.slice():currentQuestion().answer;check();next()");assert.equal(restored.run('state.missed.length'),0);
restored.run("saveTier(true);start('all')");assert.equal(restored.run('state.session.ids.length'),75);
for(let i=0;i<75;i++){restored.run('selected=Array.isArray(currentQuestion().answer)?currentQuestion().answer.slice():currentQuestion().answer;check()');assert.equal(restored.run('state.session.answers[state.session.index].correct'),true);assert(restored.main.innerHTML.includes('Key insight · spot the clue'));restored.run('next()');}
assert(restored.main.innerHTML.includes('SESSION COMPLETE'));assert.equal(restored.run('visited()'),75);
for(const id of [5,10,29]){restored.run(`state.session={ids:[${id}],index:0,answers:[],assisted:[],title:'QA'};selected=currentQuestion().answer.slice();[selected[0],selected[1]]=[selected[1],selected[0]];if(currentQuestion().kind==='multi')selected=[0,1];check()`);assert.equal(restored.run('state.session.answers[0].correct'),false);}
assert.equal(restored.run("validChoice(BANK.find(q=>q.id===10),[0,0,2,3])"),false);assert.equal(restored.run("validChoice(BANK.find(q=>q.id===5),[1,3,4])"),false);
restored.run('saveTier(false)');assert.equal(restored.run('pool().length'),10);assert.equal(restored.run('state.session'),null);
restored.run("tab='learn';learn();filterGloss('MCP')");assert(restored.gloss.innerHTML.includes('<h2>MCP</h2>'));
let blocked=launch(true);assert(blocked.main.innerHTML.includes('Progress storage is unavailable'));
data.set('exam-sprint-aif-v1',JSON.stringify({v:2,attempts:[{id:2,choice:2,correct:true},{id:10,choice:1,correct:true}],missed:[10],session:null}));let migrated=launch();assert.equal(migrated.run('state.attempts.length'),1);assert.equal(migrated.run('state.missed.length'),0);assert.equal(migrated.run('state.historicalAttempts.length'),1);
// Revised wording must never inherit a score or a partially completed session.
data.set('exam-sprint-aif-v1',JSON.stringify({v:3,previewFullPack:true,attempts:[{id:1,choice:1,correct:true},{id:2,choice:2,correct:true}],missed:[1],session:{ids:[1,2],index:1,answers:[{id:1,choice:1,correct:true}],assisted:[]}}));
let updated=launch();assert.equal(updated.run('state.attempts.length'),1);assert.equal(updated.run('state.attempts[0].id'),2);assert.equal(updated.run('state.historicalAttempts.length'),1);assert.equal(updated.run('state.session'),null);assert.equal(updated.run('state.previewFullPack'),true);assert.equal(updated.run('state.missed.includes(1)'),true);
updated.run("state.session={ids:[1],index:0,answers:[],assisted:[],title:'Revised question'};selected=currentQuestion().answer;check();save()");
let resumed=launch();assert.equal(resumed.run('state.session.answers[0].contentRevision'),2);assert.equal(resumed.run('state.attempts.length'),2);assert.equal(resumed.run('state.historicalAttempts.length'),1);resumed.run("go('progress')");assert(resumed.main.innerHTML.includes('earlier answer is'));
resumed.run("tab='quiz';quiz()");assert(resumed.main.innerHTML.includes('AWS objective 1.2'));assert(resumed.main.innerHTML.includes('Try the idea elsewhere'));
// Highlights teach before answering, survive reload as assistance, and can be
// turned off for a genuinely unaided later attempt. Hiding them is not a reset.
data.clear();let guided=launch();assert.equal(guided.run('state.guidedHighlights'),true);
guided.run("state.session={ids:[59],index:0,answers:[],assisted:[],title:'Guided learning'};tab='quiz';quiz()");
assert(guided.main.innerHTML.includes('<mark>very few examples</mark>'));assert(guided.main.innerHTML.includes('<mark>TWO</mark>'));assert.equal(guided.run('state.session.guided.includes(59)'),true);
guided.run('toggleHighlights()');assert(!guided.main.innerHTML.includes('<mark>'));
let guidedRestored=launch();assert.equal(guidedRestored.run('state.guidedHighlights'),false);assert.equal(guidedRestored.run('state.session.guided.includes(59)'),true);
guidedRestored.run('selected=currentQuestion().answer.slice();check()');assert.equal(guidedRestored.run('state.attempts[0].assisted'),true);assert.equal(guidedRestored.run('state.attempts[0].guided'),true);assert.equal(guidedRestored.run('state.missed.includes(59)'),true);assert(guidedRestored.main.innerHTML.includes('Highlights used'));
guidedRestored.run('reviewOne(59);selected=currentQuestion().answer.slice();check()');assert.equal(guidedRestored.run('state.attempts[1].assisted'),false);assert.equal(guidedRestored.run('state.missed.includes(59)'),false);
const bank=JSON.parse(fs.readFileSync(root+'/questions.json','utf8'));assert.equal(bank.length,75);assert.equal(new Set(bank.map(q=>q.id)).size,75);assert.deepEqual([1,2,3,4,5].map(d=>bank.filter(q=>q.domain===d).length),[15,18,21,10,11]);assert.deepEqual(['single','multi','order','match'].map(k=>bank.filter(q=>q.kind===k).length),[65,6,2,2]);
assert.equal(bank.filter(q=>![1,29,6,10,11,13,45,16,59,65].includes(q.id)).length,65);
assert.equal(new Set(bank.map(q=>q.objective)).size,14);
for(const q of bank){assert(/^\d\.\d$/.test(q.objective));assert(q.objectiveSource?.startsWith('https://docs.aws.amazon.com/aws-certification/'))}
for(const q of bank.filter(q=>q.id>=66)){assert(q.source&&q.transfer&&q.concept&&q.reviewStatus&&q.reasons.length===q.options.length)}
data.clear();let terms=launch();terms.run("go('learn');filterGloss('AWS S3')");assert(terms.main.innerHTML.includes('Fresh facts, format or trained behavior?'));assert(terms.gloss.innerHTML.includes('Amazon S3'));
terms.run("state.guidedHighlights=false;state.session={ids:[45],index:0,answers:[],assisted:[],title:'Term practice'};tab='quiz';quiz()");assert(terms.main.innerHTML.includes('Need a term explained?'));
terms.run("openTermHelp('Fine-tuning')");let termReload=launch();assert.equal(termReload.run("state.session.terms[45]"),'Fine-tuning');
termReload.run("tab='quiz';quiz();selected=currentQuestion().answer.slice();check()");assert.equal(termReload.run('state.attempts[0].assisted'),true);assert.equal(termReload.run('state.attempts[0].termUsed'),true);assert(termReload.main.innerHTML.includes('Term help used'));
// A missed or assisted item returns after 24 hours; unaided success clears it.
data.clear();let delayed=launch();delayed.run("state.guidedHighlights=false;state.session={ids:[11],index:0,answers:[],assisted:[],title:'Recall'};selected=1;check()");
assert.equal(delayed.run('state.missed.includes(11)'),true);
assert.equal(delayed.run('dueReviews().length'),0);
assert.equal(delayed.run('dueReviews(Date.now()+REVIEW_DELAY_MS+1).includes(11)'),true);
let later=launch();assert.equal(later.run('state.reviewDue[11]'),delayed.run('state.reviewDue[11]'));
later.run('state.reviewDue[11]=Date.now()-1;save();go("home")');assert(later.main.innerHTML.includes('Review due (1)'));
later.run("start('due');selected=currentQuestion().answer;check()");assert.equal(later.run('state.missed.includes(11)'),false);assert.equal(later.run('state.reviewDue[11]'),undefined);
later.run("state.session={ids:[11],index:0,answers:[],assisted:[],title:'Assisted'};hint();selected=currentQuestion().answer;check()");assert.equal(later.run('dueReviews().length'),0);
later.run('state.reviewDue[11]=Date.now()-1;save();saveTier(false)');assert.equal(later.run('dueReviews().length'),1);
later.run('saveTier(true)');assert.equal(later.run('dueReviews().length'),1);
data.set('exam-sprint-aif-v1',JSON.stringify({v:4,missed:[11],attempts:[]}));let legacyQueue=launch();assert.equal(legacyQueue.run('dueReviews().includes(11)'),true);
console.log('PASS: all 75 questions and four formats; free10/demo75; hints, term help and assisted scoring; review; progress restore/migration; blocked storage; content integrity.');

