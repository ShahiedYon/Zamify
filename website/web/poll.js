import { CERTIFICATIONS } from './certifications.js';
import { escapeHtml as esc } from './site.js';
const TOKEN_KEY='zamify-poll-v1-token';
const tokenPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const form=document.querySelector('#poll-form');
const status=document.querySelector('#poll-status');
const panel=document.querySelector('#poll-results');
const submit=document.querySelector('#submit-vote');
const remove=document.querySelector('#remove-vote');
const view=document.querySelector('#view-results');
let token=null;
let myChoice=null;
let busy=false;
let serial=0;
try{const saved=localStorage.getItem(TOKEN_KEY);if(tokenPattern.test(saved || ''))token=saved;}catch{}
function selection(){return form.querySelector('input:checked')?.value || null;}
function updateControls(){
  submit.disabled=busy || !selection() || selection()===myChoice;
  submit.textContent=busy?'Saving…':myChoice?'Update my vote':'Cast my vote ↗';
  remove.hidden=!myChoice;
  remove.disabled=busy;
  form.querySelectorAll('input').forEach(input=>input.disabled=busy);
}
function drawResults(data){
  const previousChoice=myChoice;
  const selected=selection();
  myChoice=data.myChoice;
  remove.hidden=!myChoice;
  document.querySelector('#poll-total').textContent=`${data.total} ${data.total===1?'vote':'votes'} from the community`;
  const ranked=CERTIFICATIONS.map(cert=>({...cert,votes:data.options.find(row=>row.id===cert.id)?.votes || 0})).sort((a,b)=>b.votes-a.votes);
  document.querySelector('#results-chart').innerHTML=(data.total===0?'<p class="poll-empty">A fresh page. Be the first to help choose our next pack.</p>':'')+ranked.map(cert=>{
    const percent=data.total?Math.round(cert.votes/data.total*100):0;
    return `<div class="poll-result-row${cert.id===myChoice?' my-vote':''}"><div class="poll-result-label"><span>${esc(cert.vendor)} · ${esc(cert.name)}${cert.id===myChoice?'<b>Your vote</b>':''}</span><strong>${cert.votes} <small>${percent}%</small></strong></div><div class="vote-bar" aria-hidden="true"><span style="width:${percent}%"></span></div></div>`;
  }).join('');
  // A background refresh must not replace a choice the visitor is still making.
  if(myChoice && (!selected || selected===previousChoice)){const input=form.querySelector(`input[value="${myChoice}"]`);if(input)input.checked=true;}
  updateControls();
}
async function requestPoll(method='GET',certificationId){
  const current=++serial;
  const headers={};
  const options={method,headers,cache:'no-store'};
  if(method==='GET'){if(token)headers['X-Poll-Token']=token;}
  else{headers['Content-Type']='application/json';options.body=JSON.stringify({token,certificationId});}
  const response=await fetch('/api/poll',options);
  const data=await response.json();
  if(!response.ok)throw new Error(data.error || 'Unable to load the poll. Please try again.');
  if(current===serial)drawResults(data);
  return data;
}
function showResults(){
  panel.hidden=false;
  view.setAttribute('aria-expanded','true');
  view.textContent='Hide results';
}
async function refresh(){
  if(busy)return;
  try{await requestPoll();status.textContent=myChoice?'Your vote is saved. Choose another option any time to change it.':'';}
  catch{status.textContent='The poll could not connect. Try Refresh results again shortly.';document.querySelector('#poll-total').textContent='Results temporarily unavailable';}
}
form.addEventListener('change',()=>updateControls());
form.addEventListener('submit',async event=>{
  event.preventDefault();
  const choice=selection();
  if(busy || !choice)return;
  try{
    if(!token){token=crypto.randomUUID();localStorage.setItem(TOKEN_KEY,token);}
    else localStorage.setItem(TOKEN_KEY,token);
  }catch{token=null;status.textContent='Your browser is blocking the storage needed to save your vote identifier. Enable site storage, then try again.';return;}
  busy=true;updateControls();status.textContent='Saving your vote…';
  try{
    await requestPoll('POST',choice);
    status.textContent='Your vote is counted. Thanks for helping shape Zamify’s next chapter.';
    showResults();
  }catch(error){status.textContent=error.message || 'Your vote could not be confirmed. Please try again.';}
  finally{busy=false;updateControls();}
});
remove.addEventListener('click',async()=>{
  if(busy || !token)return;
  busy=true;updateControls();
  try{await requestPoll('DELETE');form.reset();status.textContent='Your vote has been removed.';}
  catch{status.textContent='Your vote could not be removed. Please try again.';}
  finally{busy=false;updateControls();}
});
view.addEventListener('click',()=>{
  const opening=panel.hidden;
  panel.hidden=!opening;
  view.setAttribute('aria-expanded',String(opening));
  view.textContent=opening?'Hide results':'View results';
  if(opening)refresh();
});
document.querySelector('#refresh-results').addEventListener('click',refresh);
window.addEventListener('hashchange',()=>{if(location.hash==='#poll-results'){showResults();refresh();}});
if(location.hash==='#poll-results')showResults();
refresh();
setInterval(()=>{if(!document.hidden && !panel.hidden)refresh();},30000);
