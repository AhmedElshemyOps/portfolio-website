const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('assets/js/site-config.js','utf8');
function setup(controlled){
 const events={},buttons={},notices=[]; let reloads=0;
 const window={addEventListener(){}},navigator={serviceWorker:{controller:controlled?{}:null,addEventListener:(name,fn)=>events[name]=fn}};
 const document={createElement:()=>({setAttribute(){},querySelector:s=>({addEventListener:(name,fn)=>buttons[s]=fn}),remove(){notices.pop();}}),body:{appendChild:n=>notices.push(n)}};
 const location={protocol:'https:',hostname:'example.org',reload:()=>reloads++};
 vm.runInNewContext(source,{window,navigator,document,location});
 return {events,buttons,notices,reloads:()=>reloads};
}
const returning=setup(true);returning.events.controllerchange();
assert.equal(returning.notices.length,1);assert.equal(returning.reloads(),0);
returning.events.controllerchange();assert.equal(returning.notices.length,1);
returning.buttons['[data-update-refresh]']();assert.equal(returning.reloads(),1);
returning.buttons['[data-update-dismiss]']();assert.equal(returning.notices.length,0);
const first=setup(false);first.events.controllerchange();assert.equal(first.notices.length,0);
assert(!source.includes('localStorage.clear'));assert(!source.includes('localStorage.removeItem'));
console.log('Update notice: no automatic reload, first activation silent, refresh and dismissal supported; drafts untouched.');
