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
 for(const invalid of [null,{},[],Array(73).fill({id:1})]){
  await page.evaluate(items=>window.onZamifyPaidPackUnlocked(items),invalid);
  assert.equal(await page.evaluate(()=>pool().length),10);
 }
 const raw=fs.readFileSync(path.join(__dirname,'app/build/generated/freeReleaseAssets/paid_pack.enc'));
 const key=crypto.createHash('sha256').update('com.zamify.study:zamify_aif_c01_full_pack:v1').digest();
 const d=crypto.createDecipheriv('aes-256-gcm',key,raw.subarray(0,12));d.setAuthTag(raw.subarray(-16));
 const paid=JSON.parse(Buffer.concat([d.update(raw.subarray(12,-16)),d.final()]).toString('utf8'));
 await page.evaluate(items=>window.onZamifyPaidPackUnlocked(items),paid);
 assert.equal(await page.evaluate(()=>pool().length),83);
 await page.evaluate(items=>window.onZamifyPaidPackUnlocked(items),paid);
 assert.equal(await page.evaluate(()=>BANK.length),83,'Repeated callback must not duplicate IDs');
 await page.evaluate(()=>{state.guidedHighlights=false;state.session={ids:[83],index:0,answers:[],assisted:[],title:'Release callback QA'};tab='quiz';selected=0;quiz();check()});
 assert(await page.locator('.feedback').innerText().then(t=>t.includes('Correct —')));
 await page.evaluate(()=>saveTier(false));
 assert.equal(await page.evaluate(()=>pool().length),10,'Return to free must restrict practice');
 await page.reload();await page.locator('#zami-welcome').waitFor({state:'detached'});
 assert.equal(await page.evaluate(()=>pool().length),10,'Paid access must not persist via browser storage');
 assert.deepEqual(errors,[]);
 console.log('PASS release: free-only startup, stale demo rejection, checkout disabled, callback round-trip, repeat/malformed callback, paid scoring, reload closed');
 } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
