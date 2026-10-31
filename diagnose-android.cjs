// Read-only diagnostics for this app's debuggable WebView. No UI actions, bridge,
// external browser session or production WebView debugging is used here.
const fs=require('node:fs'),{execFileSync}=require('node:child_process');
(async()=>{
 const [adb,serial,output]=process.argv.slice(2),prefix=serial?['-s',serial]:[];
 const run=args=>execFileSync(adb,[...prefix,...args],{encoding:'utf8',timeout:10000}).trim();
 const pid=run(['shell','pidof','-s','com.zamify.study']);if(!pid)throw Error('App process not running');
 run(['forward','tcp:9222',`localabstract:webview_devtools_remote_${pid}`]);
 const pages=await fetch('http://127.0.0.1:9222/json').then(r=>r.json());
 const page=pages.find(p=>p.type==='page');if(!page)throw Error('No debug WebView page: '+JSON.stringify(pages));
 const ws=new WebSocket(page.webSocketDebuggerUrl);let timer;
 const result=await new Promise((resolve,reject)=>{
  timer=setTimeout(()=>reject(Error('Diagnostic timeout')),8000);
  ws.addEventListener('error',()=>reject(Error('CDP connection failed')));
  ws.addEventListener('open',()=>ws.send(JSON.stringify({id:1,method:'Runtime.evaluate',params:{returnByValue:true,expression:`JSON.stringify({url:location.href,ready:document.readyState,viewport:[innerWidth,innerHeight],body:document.body?.getBoundingClientRect().toJSON(),html:document.documentElement?.getBoundingClientRect().toJSON(),main:document.querySelector('#main')?.innerText?.slice(0,800),bodyHTML:document.body?.outerHTML.slice(0,800),state:typeof state==='undefined'?null:{session:state.session,storageOK},errors:typeof render})`}})));
  ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id===1)resolve(m)});
 });clearTimeout(timer);ws.close();fs.writeFileSync(output,JSON.stringify({page,result},null,2));
})().catch(e=>{console.error('WebView diagnostic:',e.message);process.exitCode=1});
