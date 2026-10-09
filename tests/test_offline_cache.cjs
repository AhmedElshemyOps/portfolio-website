const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const handlers={},stores=new Map();let fail=false;
const key=r=>typeof r==='string'?new URL(r,'https://example.com').href:r.url;
const caches={async open(name){if(!stores.has(name))stores.set(name,new Map());const map=stores.get(name);return {async match(r){return map.get(key(r))?.clone()},async put(r,v){map.set(key(r),v.clone())},async delete(r){return map.delete(key(r))},async keys(){return [...map.keys()].map(x=>new Request(x))},async add(r){map.set(key(r),new Response('offline'))}}},async keys(){return [...stores.keys()]},async delete(n){return stores.delete(n)},async match(r){for(const map of stores.values())if(map.has(key(r)))return map.get(key(r)).clone()}};
const context=vm.createContext({self:{location:{origin:'https://example.com'},addEventListener:(n,f)=>handlers[n]=f,clients:{claim:async()=>{}},skipWaiting:async()=>{}},caches,Request,Response,Headers,URL,Date,Map,Promise,setTimeout,clearTimeout,fetch:async r=>{if(fail)throw Error('offline');return new Response('network:'+r.url)}});
vm.runInContext(fs.readFileSync('sw.js','utf8'),context);
async function request(path,destination='image') {const waits=[];let result;const req=new Request('https://example.com'+path);Object.defineProperty(req,'mode',{value:destination==='page'?'navigate':'cors'});handlers.fetch({request:req,waitUntil:p=>waits.push(p),respondWith:p=>result=p});if(!result)return;const response=await result;await Promise.all(waits);return response;}
(async()=>{
 stores.set('ahmed-portfolio-v1-old',new Map());stores.set('other-app',new Map());let activation;handlers.activate({waitUntil:p=>activation=p});await activation;assert(!stores.has('ahmed-portfolio-v1-old'));assert(stores.has('other-app'));
 await caches.open('ahmed-portfolio-v37-shared-frame-shell').then(c=>c.put('/offline/index.html',new Response('offline')));
 for(let i=0;i<55;i++)await request('/image'+i+'.webp');
 assert.equal(stores.get('ahmed-portfolio-v37-shared-frame-images').size,48);
 for(let i=0;i<44;i++)await request('/articles/'+i,'page');
 assert.equal(stores.get('ahmed-portfolio-v37-shared-frame-pages').size,40);
 fail=true;assert.match(await (await request('/articles/43','page')).text(),/network:/);assert.equal(await(await request('/missing','page')).text(),'offline');
 assert.equal(await request('/api/data.json'),undefined);assert.equal(await request('/private/draft.html','page'),undefined);
 const cache=await caches.open('ahmed-portfolio-v37-shared-frame-images');await cache.put('/stale.webp',new Response('stale',{headers:{'x-offline-stored-at':'1'}}));assert.equal((await request('/stale.webp')).type,'error');
 console.log('PASS: bounded caches, version cleanup, offline fallback, expiry, private/API exclusions; writes awaited.');
})().catch(e=>{console.error(e);process.exitCode=1});
