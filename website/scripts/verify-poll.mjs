import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { createWorker } from '../worker/index.js';
const db = new DatabaseSync(':memory:');
for (const file of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort()) db.exec(fs.readFileSync('drizzle/'+file,'utf8'));
function prepare(sql){let values=[];return {bind(...v){values=v;return this;},async run(){return db.prepare(sql).run(...values);},async all(){return {results:db.prepare(sql).all(...values)};}};}
const env={DB:{prepare,async batch(statements){return Promise.all(statements.map(s=>s.all()));}}};
const app=createWorker({'/':{body:'hello',type:'text/html'},'/practice/':{body:'practice',type:'text/html'}});
const origin='https://zamify-study.syon04.chatgpt.site';
const first=crypto.randomUUID(), second=crypto.randomUUID();
async function call(method='GET',body,headers={}){
 const request=new Request(origin+'/api/poll',{method,headers:{Origin:origin,'Content-Type':'application/json',...headers},...(body!==undefined?{body:JSON.stringify(body)}:{})});
 const response=await app.fetch(request,env);return {status:response.status,data:await response.json()};
}
assert.equal((await call()).data.total,0);
let r=await call('POST',{token:first,certificationId:'claude-architect'});
assert.equal(r.status,200);assert.equal(r.data.total,1);assert.equal(r.data.myChoice,'claude-architect');
r=await call('POST',{token:first,certificationId:'claude-architect'});assert.equal(r.data.total,1);
r=await call('POST',{token:first,certificationId:'snowflake-genai'});assert.equal(r.data.total,1);assert.equal(r.data.myChoice,'snowflake-genai');assert.equal(r.data.options.find(o=>o.id==='claude-architect').votes,0);
await call('POST',{token:second,certificationId:'claude-architect'});
r=await call();assert.equal(r.data.total,2);assert.equal(r.data.myChoice,null);
r=await call('GET',undefined,{'X-Poll-Token':first});assert.equal(r.data.myChoice,'snowflake-genai');
assert.equal((await call('POST',{token:first,certificationId:'bogus'})).status,400);
assert.equal((await call('POST',{token:'invalid',certificationId:'claude-architect'})).status,400);
assert.equal((await call('POST',{token:first,certificationId:'claude-architect'},{Origin:'https://example.com'})).status,403);
assert.equal((await call('POST',{token:first,certificationId:'claude-architect'},{'Content-Type':'text/plain'})).status,415);
assert.equal((await call('POST',{token:first,padding:'a'.repeat(800)})).status,400);
assert.equal((await call('PUT',{})).status,405);
const persisted=await createWorker({}).fetch(new Request(origin+'/api/poll'),env);assert.equal((await persisted.json()).total,2);
r=await call('DELETE',{token:first});assert.equal(r.data.total,1);assert.equal(r.data.myChoice,null);
await call('DELETE',{token:first});await call('DELETE',{token:second});assert.equal((await call()).data.total,0);
assert.equal((await app.fetch(new Request(origin+'/practice'),env)).status,308);
assert.equal((await app.fetch(new Request(origin+'/missing'),env)).status,404);
const outage=await app.fetch(new Request(origin+'/api/poll'),{});assert.equal(outage.status,503);
assert.equal(db.prepare('SELECT COUNT(*) AS count FROM poll_votes').get().count,0);
console.log('PASS · real SQLite migration; shared counts; repeat/update/withdraw; input validation; origin check; unavailable database; routes');
