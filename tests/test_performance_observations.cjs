const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('assets/js/analytics.js', 'utf8');
function setup(consent) {
  const callbacks = {}, listeners = {};
  const win = {AHMED_SITE_CONFIG:{gaMeasurementId:'G-TEST'},localStorage:{getItem:()=>consent},location:{pathname:'/profile/index.html',origin:'https://ahmedqualityops.com',href:'https://ahmedqualityops.com/profile/index.html'},addEventListener(){}};
  const doc = {referrer:'',visibilityState:'hidden',querySelector:()=>null,head:{appendChild(){}},addEventListener:(name,fn)=>{listeners[name]=fn},createElement:()=>({dataset:{},style:{},addEventListener(){}})};
  class Observer { constructor(callback){this.callback=callback} observe(options){callbacks[options.type]=this.callback} }
  win.PerformanceObserver = Observer;
  vm.runInNewContext(source,{window:win,document:doc,PerformanceObserver:Observer,URL});
  return {win,callbacks,listeners};
}
const state=setup('granted');
state.listeners.visibilitychange();
assert(!state.win.dataLayer.some(x=>x[1]==='performance_observations'),'Absent signals must stay unmeasured');
state.callbacks.event({getEntries:()=>[{duration:48}]});
state.callbacks['largest-contentful-paint']({getEntries:()=>[{startTime:2500}]});
state.callbacks['layout-shift']({getEntries:()=>[{value:.5,hadRecentInput:true},{value:.015,hadRecentInput:false}]});
state.listeners.visibilitychange();
const event=state.win.dataLayer.find(x=>x[1]==='performance_observations');
assert.equal(event[2].longest_observed_event_ms,48);
assert.equal(event[2].layout_shift_sum,.015);
assert.equal(event[2].lcp_observed_ms,2500);
assert.equal(event[2].measurement_method,'raw_observers_not_core_web_vitals');
assert(!('inp_ms' in event[2])&&!('cls' in event[2]));
const denied=setup('denied');denied.callbacks.event({getEntries:()=>[{duration:48}]});denied.listeners.visibilitychange();
assert(!denied.win.dataLayer.some(x=>x[0]==='event'),'Denied consent must suppress analytics events');
console.log('Raw diagnostics do not claim INP/CLS; missing signals stay unmeasured; consent is respected.');
