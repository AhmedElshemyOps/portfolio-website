const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function setup(consent) {
 const listeners = {};
 const win = { AHMED_SITE_CONFIG:{gaMeasurementId:'G-TEST'}, localStorage:{getItem:()=>consent}, location:{pathname:'/',origin:'https://ahmedqualityops.com',href:'https://ahmedqualityops.com/'}, addEventListener(){} };
 const doc = { title:'Portfolio', referrer:'', querySelector:()=>null, head:{appendChild(){}}, addEventListener:(name,fn)=>(listeners[name] ||= []).push(fn), createElement:()=>({dataset:{},style:{},addEventListener(){}}) };
 vm.runInNewContext(fs.readFileSync('assets/js/analytics.js','utf8'),{window:win,document:doc,URL});
 return {win, click(href) { const a={getAttribute:k=>k==='href'?href:null,textContent:'Project',hasAttribute:()=>false};const event={target:{closest:selector=>selector==='a[href]'?a:null}};for(const fn of listeners.click||[])fn(event); } };
}
const allowed=setup('granted');
for(const slug of ['infraquote','infradispatch','infrasky','infracluster'])allowed.click('/projects/'+slug+'/index.html?private=test');
const projects=allowed.win.dataLayer.filter(x=>x[0]==='event'&&x[1]==='project_click');assert.equal(projects.length,4);assert(projects.every(x=>!x[2].link_url.includes('?')));
const denied=setup('denied');denied.click('/projects/infracluster/index.html');assert(!denied.win.dataLayer.some(x=>x[0]==='event'));
console.log('All four project links tracked with consent; query strings removed; no events when consent is denied.');
