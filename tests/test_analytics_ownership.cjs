/* Exercise bubbling alongside the dedicated control's event owner. */
const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm');
function setup(consent='granted', host='ahmedqualityops.com', reader=true) {
  const listeners={};
  const win={AHMED_SITE_CONFIG:{gaMeasurementId:'G-TEST'},location:new URL('https://'+host+'/articles/example/index.html'),localStorage:{getItem:()=>consent},addEventListener(){}};
  const doc={title:'Article',referrer:'',querySelector:s=>s.startsWith('script[src^=')&&reader?{}:null,head:{appendChild(){}},createElement:()=>({dataset:{},style:{},addEventListener(){}}),addEventListener(n,f){(listeners[n] ||= []).push(f);}};
  vm.runInNewContext(fs.readFileSync('assets/js/analytics.js','utf8'),{window:win,document:doc,URL});
  return {win,click(kind,managed=true,success=true){
    // Dedicated control emits once on a completed action, then the click bubbles.
    if(managed && success)win.AhmedAnalytics.event(kind==='copy'?'ai_prompt_copy':'article_back_to_top');
    const event={target:{closest:s=>s==='[data-copy-target]'&&kind==='copy'?{}:s==='[data-ai-toolkit]'&&managed&&kind==='copy'?{}:s==='[data-back-to-top]'&&kind==='top'?{}:null}};
    for(const fn of listeners.click||[])fn(event);
  },count(name){return win.dataLayer.filter(x=>x[0]==='event'&&x[1]===name).length;}};
}
for(const kind of ['copy','top']){
 const page=setup();page.click(kind);assert.equal(page.count(kind==='copy'?'ai_prompt_copy':'article_back_to_top'),1,'one owner per action');
 const denied=setup('denied');denied.click(kind);assert.equal(denied.count(kind==='copy'?'ai_prompt_copy':'article_back_to_top'),0);
 const preview=setup('granted','127.0.0.1');preview.click(kind);assert.equal(preview.count(kind==='copy'?'ai_prompt_copy':'article_back_to_top'),0);
}
const failed=setup();failed.click('copy',true,false);assert.equal(failed.count('ai_prompt_copy'),0,'failed managed copy is not a success');
const legacy=setup('granted','ahmedqualityops.com',false);legacy.click('copy',false);legacy.click('top',false);assert.equal(legacy.count('ai_prompt_copy'),1);assert.equal(legacy.count('article_back_to_top'),1);
console.log('Dedicated copy/back-to-top ownership, failed-copy suppression, legacy fallback and consent/preview guards passed.');
