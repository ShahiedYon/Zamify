const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),crypto=require('crypto');
(async()=>{const b=await chromium.launch({args:['--no-sandbox']}),p=await b.newPage({viewport:{width:390,height:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.emulateMedia({reducedMotion:'reduce'});try{
const open=async(file='Preview.html')=>{await p.goto(require('url').pathToFileURL(path.join(__dirname,file)).href);await p.locator('#zami-welcome').waitFor({state:'detached'})};await open();
assert.equal(await p.locator('.hub-exam').count(),3);
for(const width of [320,390,600,1440]){await p.setViewportSize({width,height:900});for(const id of ['aif-c01','snowpro-core','mla-c02']){await p.evaluate(id=>hubOpen(id),id);assert.equal(await p.evaluate(()=>hubPool().length),10);assert(!await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth));}await p.evaluate(()=>hubCatalog());assert(!await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))}
await p.setViewportSize({width:390,height:844});await p.screenshot({path:'test-output/multi-exam-catalogue.png',fullPage:true});
for(const id of ['aif-c01','snowpro-core','mla-c02']){
 await p.evaluate(id=>{hubOpen(id);hubState().session=null;hubState().attempts=[];hubSave()},id);
 await p.locator('[data-hub=lessons]').click();assert(await p.getByRole('button',{name:'Purchases not available'}).isDisabled());
 await p.evaluate(()=>{hubState().session=null;hubStart('learn')});
 const q=await p.evaluate(()=>hubCurrent());assert(!await p.locator('.hub-explanation').count());
 await p.locator('[data-hub=hint]').click();assert(await p.locator('.hub-hint').isVisible());
 await p.evaluate(()=>{const q=hubCurrent();hubState().session.drafts[q.id]=q.answer;hubSave()});await p.locator('[data-hub=check]').click();assert(await p.locator('.hub-explanation').isVisible());assert.equal(await p.evaluate(()=>hubLatest().size),0,'Assisted response must not be unaided evidence');assert.equal(await p.evaluate(()=>hubMisses().length),1,'Assisted answer must stay in the review queue');
 const saved=await p.evaluate(()=>JSON.stringify(hubState().session));await p.reload();await p.locator('#zami-welcome').waitFor({state:'detached'});await p.evaluate(id=>hubOpen(id),id);assert.equal(await p.evaluate(()=>JSON.stringify(hubState().session)),saved);
 await p.evaluate(()=>{hubState().session=null;hubState().demo=true;hubSave();hubHome()});assert(await p.locator('.demo-banner').isVisible());
 await p.locator('[data-hub=lessons]').click();assert(await p.locator('textarea').isVisible());await p.locator('[data-hub=complete-lesson]').click();assert.equal(await p.evaluate(()=>hubState().done.length),1);
 await p.evaluate(()=>{hubCards()});assert(!await p.locator('[data-hub=rate-card]').count());await p.locator('[data-hub=flip]').click();await p.locator('[data-hub=rate-card][data-value=good]').click();assert(await p.evaluate(()=>Object.values(hubState().cards).some(c=>c.due>Date.now()+86400000)));
 await p.evaluate(()=>hubLabs());await p.locator('textarea').first().fill('My saved solution');await p.evaluate(()=>hubHome());await p.evaluate(()=>hubLabs());assert.equal(await p.locator('textarea').first().inputValue(),'My saved solution');
 await p.evaluate(()=>{hubState().session=null;hubNewSession('mock')});const n=await p.evaluate(()=>hubState().session.ids.length);assert.equal(n,30);assert.equal(await p.locator('[data-hub=hint]').count(),0);assert.equal(await p.locator('.hub-explanation').count(),0);
 await p.locator('[data-hub=flag]').click();assert.equal(await p.evaluate(()=>hubState().flags.length),1);
 // Save exact answers to exercise scoring, persistence, and all four input formats.
 await p.evaluate(()=>{const s=hubState().session;for(const id of s.ids){const q=hubPool().find(q=>q.id===id);s.drafts[id]=q.answer}hubSave()});
 await p.locator('[data-hub=confirm]').click();await p.locator('[data-hub=submit]').click();assert.equal(await p.evaluate(()=>hubState().results.at(-1).answers.filter(a=>a.correct).length),n);assert.equal(await p.evaluate(()=>hubState().session),null);
 await p.locator('[data-hub=review-result]').click();assert.equal(await p.locator('.hub-explanation').count(),n);
 // Deadline survives suspend, and every unanswered question counts as incorrect.
 await p.evaluate(()=>{hubNewSession('mock');hubState().session.deadline=Date.now()-1000;hubSave();hubQuiz()});assert.equal(await p.evaluate(()=>hubState().results.at(-1).answers.filter(a=>a.correct).length),0);assert.equal(await p.evaluate(()=>hubState().results.at(-1).expired),true);
 await p.evaluate(()=>{hubReferences()});assert(await p.locator('table').count()>0);await p.evaluate(()=>hubGlossary('RAG'));if(id==='mla-c02')assert(await p.locator('main').innerText().then(t=>t.includes('Retrieval-Augmented Generation')));await p.evaluate(()=>hubHome());await p.screenshot({path:`test-output/${id}-study-path.png`,fullPage:true});
}
// No selected exam can write progress or preview access into another pack.
assert.equal(await p.evaluate(()=>new Set(STUDY_PACKS.map(x=>hubMemory.exams[x.id])).size),3);
// Exercise every AWS format with actual controls. Order/match require a complete bijection.
await p.evaluate(()=>hubOpen('aif-c01'));
for(const kind of ['single','multi','order','match']){const q=await p.evaluate(kind=>{const q=hubPool().find(q=>q.kind===kind);hubState().session=null;hubNewSession('learn');const s=hubState().session;s.ids=[q.id];s.index=0;hubSave();hubQuiz();return q},kind);
 if(kind==='single')await p.locator(`[data-hub=choice][data-value="${q.answer}"]`).click();
 if(kind==='multi')for(const i of q.answer)await p.locator(`[data-hub=choice][data-value="${i}"]`).click();
 if(kind==='match'||kind==='order')for(let i=0;i<q.answer.length;i++)await p.locator(`[data-hub-select="${i}"]`).selectOption(String(q.answer[i]));
 await p.locator('[data-hub=check]').click();assert.equal(await p.evaluate(()=>hubState().session.answers[0].correct),true);
}
await p.evaluate(()=>hubCatalog());await p.screenshot({path:'test-output/multi-exam-catalogue.png',fullPage:true});
// Release strips paid cleartext and ignores tampered/stale developer flags.
await open('app/build/generated/freeReleaseAssets/index.html');await p.evaluate(()=>{for(const pack of STUDY_PACKS){hubMemory.exams[pack.id]={...hubFresh(),demo:true}}hubSave()});await p.reload();await p.locator('#zami-welcome').waitFor({state:'detached'});
for(const id of ['aif-c01','snowpro-core','mla-c02']){await p.evaluate(id=>hubOpen(id),id);assert.equal(await p.evaluate(()=>hubPool().length),10);assert.equal(await p.evaluate(()=>hubPaid()),false);await p.evaluate(()=>hubPackPage());assert.equal(await p.locator('[data-hub=demo]').count(),0);await p.evaluate(()=>hubRoute('demo'));assert.equal(await p.evaluate(()=>hubPaid()),false)}
const packs=JSON.parse(fs.readFileSync('study/packs.json','utf8')),release=fs.readFileSync('app/build/generated/freeReleaseAssets/index.html','utf8');
for(const pack of packs){for(const q of pack.questions.filter(q=>!pack.freeIds.includes(q.id)))assert(!release.includes(q.q),`Paid question leaked: ${pack.code}/${q.id}`);for(const l of pack.lessons)assert(!release.includes(l.body),'Paid lesson leaked')}
const raw=fs.readFileSync('app/build/generated/freeReleaseAssets/study_packs.enc'),key=crypto.createHash('sha256').update('com.zamify.study:multi-exam-study:v1').digest();const dec=buf=>{const d=crypto.createDecipheriv('aes-256-gcm',key,buf.subarray(0,12));d.setAuthTag(buf.subarray(-16));return Buffer.concat([d.update(buf.subarray(12,-16)),d.final()])};assert.deepEqual(JSON.parse(dec(raw)),packs);const bad=Buffer.from(raw);bad[20]^=1;assert.throws(()=>dec(bad));
assert.deepEqual(errors,[]);console.log('PASS study hub: 3 isolated exams, free10 each, learning assistance, lessons, spaced cards, saved exercises, mock concealment/submit/deadline, four formats, 320–1440px, release tamper/leak/cipher checks.');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
