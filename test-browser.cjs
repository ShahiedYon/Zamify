const {chromium}=require('playwright');require('fs').mkdirSync(require('path').join(__dirname,'test-output'),{recursive:true});const assert=require('assert');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.EXAM_SPRINT_CHROME||undefined,args:['--no-sandbox','--single-process','--no-zygote','--disable-gpu']});const page=await browser.newPage({viewport:{width:390,height:844}});let errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(require('url').pathToFileURL(require('path').join(__dirname,'Preview.html')).href);await page.locator('#zami-welcome').waitFor({state:'detached'});
assert.equal(await page.evaluate(()=>pool().length),10);
assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
await page.screenshot({path:require('path').join(__dirname,'test-output','mobile-home.png'),fullPage:true,animations:"disabled"});
await page.locator('.nav [data-tab=about]').click();await page.getByText('Developer preview tools',{exact:true}).click();await page.locator('[data-action=demo]').click();
assert.equal(await page.evaluate(()=>pool().length),65);
const bank=await page.evaluate(()=>BANK);
for(const q of bank){await page.evaluate(id=>{state.session={ids:[id],index:0,answers:[],assisted:[],title:'QA'};tab='quiz';selected=null;save();quiz()},q.id);
 if(q.kind==='single')await page.locator(`[data-choice="${q.answer}"]`).click();
 if(q.kind==='multi')for(const i of q.answer)await page.locator(`[data-choice="${i}"]`).click();
 if(q.kind==='order')for(const i of q.answer)await page.locator(`[data-choice="${i}"]`).click();
 if(q.kind==='match')for(let i=0;i<q.answer.length;i++)await page.locator(`[data-pair="${i}"]`).selectOption(String(q.answer[i]));
 assert(!await page.locator('[data-action=check]').isDisabled(),'Submit not ready '+q.id);await page.locator('[data-action=check]').click();assert(await page.locator('.feedback').innerText().then(t=>t.includes('Correct —')),'Incorrect grade '+q.id);assert.equal(await page.locator('.rationale').count(),q.options.length);
 if(q.id===11)await page.screenshot({path:require('path').join(__dirname,'test-output','mobile-feedback.png'),fullPage:true,animations:"disabled"});
 assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),'Overflow '+q.id);
 await page.reload();await page.locator('#zami-welcome').waitFor({state:'detached'});if(!await page.locator('[data-action=resume]').count()){console.log('RESUME FAILURE',q.id,await page.evaluate(()=>({session:state.session,tab,full:state.previewFullPack,storageOK})),errors);throw Error('Missing resume');}await page.locator('[data-action=resume]').click();assert(await page.locator('.feedback').count()===1,'Resume '+q.id);await page.locator('[data-action=next]').click();
}
// Wrong permutations and extra selections earn no partial credit.
for(const id of [5,10,29]){await page.evaluate(id=>{const q=BANK.find(q=>q.id===id);state.session={ids:[id],index:0,answers:[],assisted:[],title:'Wrong answer QA'};tab='quiz';selected=q.answer.slice();[selected[0],selected[1]]=[selected[1],selected[0]];if(q.kind==='multi')selected=[0,1];quiz()},id);await page.locator('[data-action=check]').click();assert(await page.locator('.feedback.bad').count()===1,'Wrong-answer grade '+id);}
// Hint assistance must survive resume and remain in review after a correct answer.
await page.evaluate(()=>{state.session={ids:[11],index:0,answers:[],assisted:[],title:'Hint QA'};tab='quiz';selected=null;quiz()});await page.locator('[data-action=hint]').click();assert(await page.locator('mark').count());await page.locator('[data-choice="0"]').click();await page.locator('[data-action=check]').click();assert(await page.evaluate(()=>state.missed.includes(11)));
await page.locator('[data-action=exit]').click();await page.locator('[data-action=free]').click();assert.equal(await page.evaluate(()=>pool().length),10);await page.evaluate(()=>start('all'));assert(await page.evaluate(()=>state.session.ids.every(id=>FREE_IDS.includes(id))));
await page.locator('[data-action=exit]').click();await page.locator('.nav [data-tab=learn]').click();await page.locator('#search').fill('MCP');assert.equal(await page.locator('.gloss').count(),1);
await page.locator('[data-tab=about]').click();await page.locator('[data-action=reset]').click();await page.locator('[data-action=reset]').click();assert.equal(await page.evaluate(()=>state.attempts.length),0);
await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:require('path').join(__dirname,'test-output','desktop-home.png'),fullPage:true,animations:"disabled"});assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
// New layout: narrow screens, weak-topic recommendation, disclosure and review queue.
for(const width of [320,390,600]){
 await page.setViewportSize({width,height:844});
 await page.evaluate(()=>{state=fresh();state.attempts=[{id:1,choice:0,correct:false,assisted:false,at:Date.now()}];state.missed=[1];save();go('home')});
 assert.equal(await page.locator('.review-panel').count(),1);
 assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),'Home overflow '+width);
 await page.locator('.quick-card[data-action=review]').click();
 assert.equal(await page.evaluate(()=>state.session.ids[0]),1);
 await page.locator('[data-choice="1"]').click();await page.locator('[data-action=check]').click();
 assert.equal(await page.locator('.clue-card').count(),1);
 await page.getByText('How to analyse this question',{exact:true}).click();
 assert(await page.locator('.coach details').first().getAttribute('open')!==null);
 await page.getByText('Why the other answers don’t fit',{exact:true}).click();
 assert(await page.locator('.rationale').first().isVisible());
 assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),'Feedback overflow '+width);
 if(width===390)await page.screenshot({path:require('path').join(__dirname,'test-output','mobile-feedback-expanded.png'),fullPage:true,animations:"disabled"});
}
await page.evaluate(()=>{state=fresh();save();go('home')});await page.setViewportSize({width:390,height:844});
await page.screenshot({path:require('path').join(__dirname,'test-output','mobile-home.png'),fullPage:true,animations:"disabled"});
assert.deepEqual(errors,[]);await browser.close();console.log('PASS real Chrome: all 65 questions, all four formats, correct and wrong grading, option feedback, reload/resume, hints, free/full boundaries, search/reset, 390px and 1440px overflow checks. No JS errors.');})().catch(e=>{console.error(e);process.exit(1)});
