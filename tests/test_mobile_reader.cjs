const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const full = fs.readFileSync('assets/js/article-reader.js','utf8');
// Execute the production initialization and handlers before the unrelated progress UI.
const script = full.slice(0,full.indexOf('  // Use the table of contents'))+'})();';
function run(width, saved, blocked=false) {
 const events={}, values={}, classes=new Set(), stored=[];
 const button=()=>({attrs:{},handlers:{},setAttribute(k,v){this.attrs[k]=v},addEventListener(k,v){this.handlers[k]=v}});
 const font=['decrease','reset','increase'].map(action=>({...button(),dataset:{readerFont:action}}));
 const contrast=button(), theme=button(), toc={open:true,parentElement:null};
 const group={open:false,parentElement:{closest:()=>toc}};
 const link={getAttribute:()=> '#prompt',closest:()=>group,addEventListener(){}};
 const document={body:{classList:{toggle(k,v){v?classes.add(k):classes.delete(k)}}},documentElement:{style:{setProperty(k,v){values[k]=v}}},getElementById:()=>({}),querySelector(s){return {'[data-reader-toc]':toc,'[data-reader-contrast]':contrast,'[data-reader-theme]':theme}[s]||null},querySelectorAll(s){return s==='[data-reader-font]'?font:s==='[data-toc-link]'?[link]:[]}};
 const window={location:{pathname:'/article',hash:'#prompt'},matchMedia(q){return {matches:q.includes('900px')?width<=900:false,addEventListener(){}}},localStorage:{getItem(){if(blocked)throw Error('blocked');return saved},setItem(k,v){if(blocked)throw Error('blocked');stored.push(JSON.parse(v))}},addEventListener(k,v){events[k]=v}};
 vm.runInNewContext(script,{document,window});
 assert.equal(toc.open,width>900);assert.equal(group.open,true);
 font[2].handlers.click();assert(values['--reader-scale']<=1.25);
 font[1].handlers.click();assert.equal(values['--reader-scale'],1);
 font[0].handlers.click();assert.equal(values['--reader-scale'],.9);
 theme.handlers.click();assert.equal(theme.attrs['aria-pressed'],String(classes.has('reader-dark')));
 contrast.handlers.click();assert.equal(contrast.attrs['aria-pressed'],String(classes.has('reader-high-contrast')));
 assert.equal(stored.length,blocked?0:5);
 events.hashchange();assert.equal(toc.open,width>900);
}
for(const width of [320,375,390,600,768,820,900,901,1024]) run(width,JSON.stringify({scale:1.2,dark:true,contrast:true}));
for(const saved of ['null','[]','false','"invalid"','not json']) run(375,saved);
run(768,null,true);
console.log('Phone/tablet breakpoint logic, nested contents, saved preferences and blocked storage passed (DOM simulation).');
