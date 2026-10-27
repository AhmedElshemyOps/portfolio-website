const assert=require('node:assert/strict'),fs=require('node:fs');
const kit=require('../assets/js/article-prompts.js');
const html=fs.readFileSync('articles/hotel-operations-manager-ai-toolkit/index.html','utf8');
const decode=t=>t.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#x27;/g,"'").replace(/&quot;/g,'"');
const prompts=[...html.matchAll(/<pre\b[^>]*>([\s\S]*?)<\/pre>/g)].map(m=>decode(m[1]));
(async()=>{
 assert.equal(prompts.length,10);
 for(const text of prompts){let copied;await kit.copyText(text.trim(),{navigator:{clipboard:{writeText:async t=>{copied=t}}},isSecureContext:true});assert.equal(copied,text.trim());}
 let field,copied,restored=false;
 const document={activeElement:{focus(){restored=true}},body:{appendChild(){}},createElement(){field={style:{},select(){},remove(){}};return field},execCommand(){copied=field.value;return true}};
 await kit.copyText(prompts[0],{navigator:{},document});assert.equal(copied,prompts[0]);assert(restored);
 document.execCommand=()=>false;
 await assert.rejects(kit.copyText(prompts[0],{navigator:{},document}),/blocked/);
 await assert.rejects(kit.copyText(prompts[0],{navigator:{clipboard:{writeText:async()=>{throw Error('denied')}}}}),/blocked/);
 await assert.rejects(kit.copyText(' \n ',{navigator:{}}),/unavailable/);
 console.log('Ten complete original prompts copy exactly; fallback, denied clipboard and empty source are covered.');
})().catch(e=>{console.error(e);process.exitCode=1});
