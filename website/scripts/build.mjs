import fs from 'node:fs';
import path from 'node:path';
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml; charset=utf-8'};
const assets={};
for(const filename of fs.readdirSync('web',{recursive:true})){
  const file=path.join('web',filename);
  if(!fs.statSync(file).isFile())continue;
  const type=types[path.extname(file)];
  if(!type)throw new Error('Unsupported web asset '+file);
  let route='/'+filename.split(path.sep).join('/');
  if(route.endsWith('index.html'))route=route.slice(0,-10);
  assets[route]={type,body:fs.readFileSync(file,'utf8')};
}
const certs=fs.readFileSync('web/certifications.js','utf8').replace('export const','const');
const worker=fs.readFileSync('worker/index.js','utf8').replace("import { CERTIFICATIONS } from '../web/certifications.js';",certs);
fs.mkdirSync('dist/server',{recursive:true});
fs.mkdirSync('dist/.openai',{recursive:true});
fs.writeFileSync('dist/server/index.js',`const ASSETS=${JSON.stringify(assets)};\n${worker}\nexport default createWorker(ASSETS);\n`);
fs.copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');
console.log('Built worker with',Object.keys(assets).length,'embedded assets and persistent poll API.');
