import { CERTIFICATIONS } from '../web/certifications.js';
const allowedIds = new Set(CERTIFICATIONS.map(cert => cert.id));
const tokenPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const securityHeaders = {
  'X-Content-Type-Options':'nosniff',
  'Referrer-Policy':'strict-origin-when-cross-origin',
  'Permissions-Policy':'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'self' https://*.chatgpt.com https://chatgpt.com"
};
function json(value,status=200) {
  return new Response(JSON.stringify(value),{status,headers:{...securityHeaders,'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
}
async function voterHash(token) {
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('zamify-next-pack-v1:'+token));
  return Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join('');
}
async function smallJson(request) {
  const reader=request.body?.getReader();
  if(!reader)throw new Error('empty');
  let total=0;
  const parts=[];
  while(true){
    const {done,value}=await reader.read();
    if(done)break;
    total+=value.byteLength;
    if(total>512){await reader.cancel();throw new Error('large');}
    parts.push(value);
  }
  const bytes=new Uint8Array(total);
  let offset=0;
  for(const part of parts){bytes.set(part,offset);offset+=part.length;}
  return JSON.parse(new TextDecoder().decode(bytes));
}
async function pollResults(db,token) {
  const counts=db.prepare('SELECT certification_id AS id, COUNT(*) AS votes FROM poll_votes GROUP BY certification_id');
  const statements=[counts];
  if(token)statements.push(db.prepare('SELECT certification_id AS id FROM poll_votes WHERE voter_id = ?').bind(await voterHash(token)));
  const result=await db.batch(statements);
  const rows=result[0].results || [];
  const options=CERTIFICATIONS.map(cert=>({id:cert.id,votes:Number(rows.find(row=>row.id===cert.id)?.votes || 0)}));
  return {options,total:options.reduce((sum,row)=>sum+row.votes,0),myChoice:result[1]?.results?.[0]?.id || null};
}
async function poll(request,env) {
  if(!env.DB)return json({error:'Voting is temporarily unavailable. Please try again shortly.'},503);
  const method=request.method;
  if(method==='GET'){
    const token=request.headers.get('X-Poll-Token');
    if(token && !tokenPattern.test(token))return json({error:'Invalid vote identifier.'},400);
    return json(await pollResults(env.DB,token));
  }
  if(!['POST','DELETE'].includes(method))return json({error:'Method not allowed.'},405);
  if(request.headers.get('Origin')!==new URL(request.url).origin)return json({error:'Please vote from the Zamify website.'},403);
  if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'Expected a JSON request.'},415);
  let body;
  try{body=await smallJson(request);}catch{return json({error:'Invalid vote request.'},400);}
  if(!body || !tokenPattern.test(body.token || ''))return json({error:'Invalid vote identifier.'},400);
  const hash=await voterHash(body.token);
  if(method==='DELETE'){
    await env.DB.prepare('DELETE FROM poll_votes WHERE voter_id = ?').bind(hash).run();
  }else{
    if(!allowedIds.has(body.certificationId))return json({error:'Choose one of the listed certifications.'},400);
    await env.DB.prepare('INSERT INTO poll_votes (voter_id, certification_id, updated_at) VALUES (?, ?, ?) ON CONFLICT(voter_id) DO UPDATE SET certification_id = excluded.certification_id, updated_at = excluded.updated_at').bind(hash,body.certificationId,Date.now()).run();
  }
  return json(await pollResults(env.DB,body.token));
}
export function createWorker(assets) {
  return {async fetch(request,env){
    const url=new URL(request.url);
    if(url.pathname==='/api/poll'){
      try{return await poll(request,env);}catch{return json({error:'Voting is temporarily unavailable. Please try again.'},503);}
    }
    if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:securityHeaders});
    const asset=assets[url.pathname];
    if(!asset){
      if(assets[url.pathname+'/'])return Response.redirect(url.origin+url.pathname+'/'+url.search,308);
      return new Response('Page not found. Return to https://zamify-study.syon04.chatgpt.site/',{status:404,headers:{...securityHeaders,'Content-Type':'text/plain; charset=utf-8'}});
    }
    return new Response(request.method==='HEAD'?null:asset.body,{headers:{...securityHeaders,'Content-Type':asset.type,'Cache-Control':'public, max-age=0, must-revalidate'}});
  }};
}
