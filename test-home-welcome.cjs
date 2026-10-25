const {chromium}=require('playwright');
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
fs.mkdirSync(path.join(__dirname,'test-output'),{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.EXAM_SPRINT_CHROME||undefined});
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const url=require('node:url').pathToFileURL(path.join(__dirname,'Preview.html')).href;
 await page.goto(url);
 await page.locator('#zami-welcome').waitFor({state:'visible'});
 assert(await page.locator('.shell').evaluate(el=>el.inert));
 await page.screenshot({path:'test-output/welcome.png'});
 await page.locator('#zami-welcome').waitFor({state:'detached'});
 assert(!await page.locator('.shell').evaluate(el=>el.inert));
 // Page reloads get a new welcome, but internal navigation does not.
 await page.reload();await page.getByRole('button',{name:'Let’s go →',exact:true}).click();
 await page.locator('#zami-welcome').waitFor({state:'detached'});
 await page.getByRole('button',{name:'Start my free practice'}).click();
 assert(await page.evaluate(()=>state.session.ids.every(id=>FREE_IDS.includes(id))));
 await page.locator('[data-action=exit]').click();await page.locator('.nav [data-tab=catalog]').click();
 assert.equal(await page.locator('#zami-welcome').count(),0);
 assert(await page.getByRole('button',{name:'Continue practising'}).isVisible());
 for(const width of [320,390,600,1440]){
  await page.setViewportSize({width,height:900});
  assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),'Home overflow '+width);
  assert.equal(await page.locator('.topic-card').count(),5);
  assert.equal(await page.locator('.course-card').count(),1);
  if(width===390||width===1440)await page.screenshot({path:`test-output/home-${width}.png`,fullPage:true,animations:'disabled'});
 }
 // A fixed footer used to cross the course button at phone height. The content
 // pane now ends above the nav, and its last action can scroll fully into view.
 for(const [width,height] of [[320,568],[360,640],[390,844],[412,915],[844,390]]){
  await page.setViewportSize({width,height});
  await page.locator('.nav [data-tab=catalog]').click();
  const layout=await page.evaluate(()=>{
   const shell=document.querySelector('.shell'),nav=document.querySelector('.nav');
   shell.scrollTop=shell.scrollHeight;
   const s=shell.getBoundingClientRect(),n=nav.getBoundingClientRect();
   const last=document.querySelector('.home-footer').getBoundingClientRect();
   return {shellBottom:s.bottom,navTop:n.top,navBottom:n.bottom,viewport:innerHeight,lastBottom:last.bottom,overflow:document.documentElement.scrollWidth>innerWidth};
  });
  assert(!layout.overflow,`Horizontal overflow ${width}x${height}`);
  assert(layout.shellBottom<=layout.navTop+1,`Navigation covers content ${width}x${height}`);
  assert(layout.lastBottom<=layout.shellBottom+1,`Last home item hidden ${width}x${height}`);
  assert(layout.navBottom<=layout.viewport+1,`Navigation below viewport ${width}x${height}`);
  await page.locator('.course-bottom .btn').scrollIntoViewIfNeeded();
  assert(await page.locator('.course-bottom .btn').isVisible());
 }
 await page.setViewportSize({width:390,height:844});
 await page.locator('.nav [data-tab=learn]').click();
 await page.locator('#search').focus();
 assert(await page.locator('.nav').isHidden(),'The keyboard editing state should make space for the search field');
 await page.locator('#search').blur();
 assert(await page.locator('.nav').isVisible());
 await page.locator('.nav [data-tab=catalog]').click();
 for(let d=1;d<=5;d++){
  await page.locator(`.topic-card[data-domain="${d}"]`).click();
  assert((await page.locator('.module-cue').innerText()).includes('Module '+d+' of 5'));
  await page.locator('[data-action=exit]').click();await page.locator('.nav [data-tab=catalog]').click();
 }
 await page.locator('.nav [data-tab=about]').click();await page.locator('[data-action=welcome]').click();
 await page.keyboard.press('Escape');await page.locator('#zami-welcome').waitFor({state:'detached'});
 // Simulate the native visibility handshake without an Android device.
 await page.goto(url+'#android');await page.reload();
 assert.equal(await page.locator('#zami-welcome').count(),0);
 await page.evaluate(()=>{window.zamifyNativeVisible=true;window.startZamifyWelcome()});
 assert(await page.locator('#zami-welcome').isVisible());
 assert.equal(await page.evaluate(()=>window.appBack()),true);
 await page.locator('#zami-welcome').waitFor({state:'detached'});
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(url);await page.reload();
 assert.equal(await page.locator('#zami-welcome').count(),0);
 assert.equal(await page.locator('.zami-hero').evaluate(el=>getComputedStyle(el).animationName),'none');
 assert.deepEqual(errors,[]);
 await browser.close();console.log('PASS home and welcome: responsive layout, practice/resume, five topics, reload, replay, Escape, native readiness, Back and reduced motion.');
})().catch(e=>{console.error(e);process.exit(1)});
