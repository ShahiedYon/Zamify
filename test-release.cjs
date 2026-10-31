// Exercise the generated release HTML, not the developer preview.
const {chromium}=require('playwright'),assert=require('assert'),fs=require('fs'),path=require('path'),crypto=require('crypto');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.EXAM_SPRINT_CHROME||undefined,args:['--no-sandbox','--single-process','--no-zygote','--disable-gpu']});
 try {
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});
 const url=require('url').pathToFileURL(path.join(__dirname,'app/build/generated/freeReleaseAssets/index.html')).href;
 await page.goto(url);await page.locator('#zami-welcome').waitFor({state:'detached'});
 await page.evaluate(()=>{localStorage.setItem('exam-sprint-aif-v1',JSON.stringify({...fresh(),previewFullPack:true}));});
 await page.reload();await page.locator('#zami-welcome').waitFor({state:'detached'});
 assert.equal(await page.evaluate(()=>pool().length),10,'Stored demo flag must not unlock release');
 await page.evaluate(()=>go('about'));
 assert.equal(await page.getByText('Developer preview tools',{exact:true}).count(),0);
 await page.evaluate(()=>go('packs'));assert(await page.getByRole('button',{name:'Purchases coming soon'}).isDisabled());
 assert(await page.locator('main').innerText().then(t=>t.includes('73 new paid questions')));
 for(const invalid of [null,{},[],Array(73).fill(null),Array(73).fill({id:1})]){
  await page.evaluate(items=>window.onZamifyPaidPackUnlocked(items),invalid);
  assert.equal(await page.evaluate(()=>pool().length),10);
 }
 const raw=fs.readFileSync(path.join(__dirname,'app/build/generated/freeReleaseAssets/paid_pack.enc'));
 const key=crypto.createHash('sha256').update('com.zamify.study:zamify_aif_c01_full_pack:v1').digest();
 const d=crypto.createDecipheriv('aes-256-gcm',key,raw.subarray(0,12));d.setAuthTag(raw.subarray(-16));
 const paid=JSON.parse(Buffer.concat([d.update(raw.subarray(12,-16)),d.final()]).toString('utf8'));
 for(const malformed of [paid.map((q,i)=>i? q:{id:q.id}),paid.map((q,i)=>i?q:{...q,q:q.q+' tampered'})]){
  assert.equal(await page.evaluate(items=>window.onZamifyPaidPackUnlocked(items),malformed),false,'Reject changed payload');
  assert.equal(await page.evaluate(()=>pool().length),10);
 }
 await page.evaluate(items=>Promise.all([window.onZamifyPaidPackUnlocked(items),window.onZamifyPaidPackUnlocked(items)]),paid);
 assert.equal(await page.evaluate(()=>pool().length),83);
 await page.evaluate(items=>window.onZamifyPaidPackUnlocked(items),paid);
 assert.equal(await page.evaluate(()=>BANK.length),83,'Repeated callback must not duplicate IDs');
 await page.evaluate(()=>{state.guidedHighlights=false;state.session={ids:[83],index:0,answers:[],assisted:[],title:'Release callback QA'};tab='quiz';selected=0;quiz();check()});
 assert(await page.locator('.feedback').innerText().then(t=>t.includes('Correct —')));
 await page.evaluate(()=>saveTier(false));
 assert.equal(await page.evaluate(()=>pool().length),10,'Return to free must restrict practice');
 await page.reload();await page.locator('#zami-welcome').waitFor({state:'detached'});
 assert.equal(await page.evaluate(()=>pool().length),10,'Paid access must not persist via browser storage');
 // Paid attempts, recall due dates and drafts must survive locked launches and free saves.
 await page.evaluate(items=>window.onZamifyPaidPackUnlocked(items),paid);
 const due=await page.evaluate(()=>{
  state=fresh();state.previewFullPack=true;state.guidedHighlights=false;
  reviewOne(83);selected=0;check();
  reviewOne(80);selected=1;check();
  const due=state.reviewDue[80];reviewOne(76);choose(1);save();return due;
 });
 await page.reload();await page.locator('#zami-welcome').waitFor({state:'detached'});
 assert.equal(await page.evaluate(()=>pool().length),10);
 assert.equal(await page.evaluate(()=>state.lockedProgress.attempts.length),2);
 await page.evaluate(()=>{state.guidedHighlights=false;save()});
 await page.reload();await page.locator('#zami-welcome').waitFor({state:'detached'});
 await page.evaluate(items=>window.onZamifyPaidPackUnlocked(items),paid);
 assert.equal(await page.evaluate(()=>state.attempts.length),2);
 assert.equal(await page.evaluate(()=>state.reviewDue[80]),due);
 assert.equal(await page.evaluate(()=>state.session.ids[0]),76);
 await page.evaluate(()=>{tab='quiz';quiz()});assert.equal(await page.evaluate(()=>selected),1);
 await page.evaluate(()=>{state=fresh();save()});await page.reload();
 assert.equal(await page.evaluate(()=>state.lockedProgress.attempts.length),0,'Reset must also clear archived paid progress');
 assert.deepEqual(errors,[]);
 console.log('PASS release: free-only startup, stale demo rejection, checkout disabled, callback round-trip, repeat/malformed callback, paid scoring, reload closed, payload integrity and locked-progress restoration');
 } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
