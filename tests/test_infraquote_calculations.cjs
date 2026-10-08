const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const context={window:{},localStorage:{getItem(){throw new Error('blocked')},setItem(){throw new Error('blocked')}},Date};vm.createContext(context);vm.runInContext(fs.readFileSync('live-demos/assets/js/infraquote-calculations.js','utf8'),context);const c=context.window.INFRAQUOTE_CALC;
const base={netCost:100,method:'margin',targetMarginPct:20,vatRate:.05,totalGuests:2,adults:2,children:0,rounding:.01};
for(const vatMode of ['exclusive','inclusive']){const p=c.pricing({...base,vatMode});assert.equal(p.beforeVat,125);assert.equal(p.vatAmount,6.25);assert.equal(p.finalPrice,131.25);assert.equal(p.profit,25);assert.equal(p.actualMargin,20);}
const noVat=c.pricing({...base,vatMode:'none'});assert.equal(noVat.finalPrice,125);assert.equal(noVat.profit,25);
assert.ok(Number.isFinite(c.pricing({...base,rounding:0,vatMode:'exclusive'}).finalPrice));
assert.match(c.quoteReference(),/^IQ-AD-\d{4}-\d+$/);
const totals=c.classifyCosts([{include:true,type:'Fixed',quantity:1,unitCost:100,verification:'Pending verification'},{include:false,type:'Conditional',quantity:1,unitCost:50,verification:'Pending verification'}]);assert.equal(totals.netCost,100);assert.equal(totals.pending,1);
const be=c.breakEven({fixedCost:100,variableCost:20,payingGuests:2,sellingPerGuest:60,minimumTarget:2});assert.equal(be.breakEvenGuests,2);assert.equal(be.profit,0);
const quote={adults:0,children:0,infants:0,rounding:0,pricingMethod:'margin',targetMargin:100,clientCompany:' ',serviceDate:'2026-01-01',quoteDate:'2026-02-01',validityDate:'2026-01-01',pickupLocation:'Hotel',dropoffLocation:'Hotel',itinerary:[],terms:{cancellation:'Terms'}};const ready=c.readiness(quote,totals,noVat,null);assert.ok(ready.blocking.some(x=>x.includes('At least one guest')));assert.ok(ready.blocking.some(x=>x.includes('Target margin')));assert.ok(ready.blocking.some(x=>x.includes('Validity date')));
console.log('InfraQuote pricing, verification counts, break-even and draft checks passed.');
