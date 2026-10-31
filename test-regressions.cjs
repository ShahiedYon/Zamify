const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('path');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.EXAM_SPRINT_CHROME||undefined,args:['--no-sandbox']});
 try{
 const p=await browser.newPage({viewport:{width:390,height:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.emulateMedia({reducedMotion:'reduce'});
 const url=require('url').pathToFileURL(path.join(__dirname,'Preview.html')).href;await p.goto(url);
 await p.evaluate(()=>{state.previewFullPack=true;save()});
 // All eight new items must highlight actual question clues, not summary sentences.
 for(let id=76;id<=83;id++){
  await p.evaluate(id=>{state.guidedHighlights=true;state.session={ids:[id],index:0,answers:[],assisted:[],title:'Highlight QA'};selected=null;tab='quiz';quiz()},id);
  const marked=await p.locator('.quiz h1 mark').allTextContents();
  const clues=await p.evaluate(()=>currentQuestion().clues.map(c=>c.text));
  assert(marked.length>0,`No highlights for Q${id}`);for(const clue of clues)assert(marked.includes(clue),`Clue not highlighted Q${id}: ${clue}`);
 }
 // Each format retains an unfinished selection through Save & exit and cold reload.
 for(const id of [1,59,10,29]){
  const expected=await p.evaluate(id=>{state.previewFullPack=true;state.session={ids:[id],index:0,answers:[],assisted:[],title:'Draft QA'};selected=null;tab='quiz';quiz();const q=currentQuestion();if(q.kind==='match'){selected=[null,null,q.answer[2]];saveDraft();quiz()}else choose(q.kind==='single'?q.answer:q.answer[0]);return selected},id);
  await p.locator('[data-action=exit]').click();await p.locator('[data-action=resume]').click();
  assert.deepEqual(await p.evaluate(()=>selected),expected,`Exit/resume draft Q${id}`);
  await p.reload();await p.locator('[data-action=resume]').click();
  assert.deepEqual(await p.evaluate(()=>selected),expected,`Reload draft Q${id}`);
  assert.equal(await p.evaluate(()=>state.attempts.length),0,'Unsubmitted drafts are not attempts');
  await p.evaluate(()=>{selected=Array.isArray(currentQuestion().answer)?[...currentQuestion().answer]:currentQuestion().answer;saveDraft();check()});
  assert.equal(await p.evaluate(()=>state.session.draft),undefined,'Submission clears draft');
  await p.evaluate(()=>{state=fresh();state.previewFullPack=true;save()});
 }
 // A corrupted draft is ignored, and a stale/missing active question cannot crash rendering.
 await p.evaluate(()=>{state.session={ids:[1],index:0,answers:[],assisted:[],title:'Bad draft',revisions:{1:revision(BANK.find(q=>q.id===1))},draft:{id:1,choice:900}};save()});
 await p.reload();await p.locator('[data-action=resume]').click();assert.equal(await p.evaluate(()=>selected),null);
 await p.evaluate(()=>{state.session={ids:[999],index:0,answers:[],assisted:[]};tab='quiz';quiz()});
 assert.equal(await p.evaluate(()=>tab),'home');assert.equal(await p.evaluate(()=>state.session),null);
 assert.deepEqual(errors,[]);console.log('PASS regressions: eight guided-clue items, draft persistence in four formats, unsubmitted scoring, corrupt-draft/stale-question recovery');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
