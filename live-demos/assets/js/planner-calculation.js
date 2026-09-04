
window.InfraDispatchCalc = {
  estimateDarbCrossings(points){
    if(!Array.isArray(points) || points.length < 2) return 0;
    const tollActive = new Set(['Z1','Z3','Z4']);
    let crossings = 0;
    for(let i=1;i<points.length;i++){
      const prev = (points[i-1].selected && points[i-1].selected.zoneCode) || 'CUSTOM';
      const next = (points[i].selected && points[i].selected.zoneCode) || 'CUSTOM';
      if(prev !== next && (tollActive.has(prev) || tollActive.has(next))) crossings += 1;
    }
    return Math.min(8, Math.max(0, crossings));
  },
  vehicleFor(pax, selected){
    const map={sedan:'Sedan / private car',van:'Van / minibus',coach:'Coach / multiple vehicles'};
    if(selected && selected!=='auto') return map[selected] || selected;
    if(pax<=3) return 'Sedan / private car';
    if(pax<=13) return 'Van / minibus';
    if(pax<=30) return 'Small coach';
    return 'Coach / multiple vehicles';
  },
  scorePlan({points,maxWindow,totalPax,childSeats,customCount,validation}){
    let score=100;
    if(points.length>6) score-=12;
    if(points.length>4) score-=7;
    const zones = new Set(points.map(p=>p.zoneCode||'CUSTOM')).size;
    if(zones>2) score-=10;
    if(totalPax>30) score-=6;
    if(childSeats>0) score-=3;
    if(customCount>0) score-=8;
    if(maxWindow<45 && points.length>4) score-=10;
    if(validation.traffic) score+=3;
    if(validation.hotelAccess) score+=3;
    if(validation.openingHours) score+=2;
    if(validation.supervisor) score+=2;
    score=Math.max(45,Math.min(100,score));
    return score;
  },
  recommendSplit({points,totalPax,maxWindow,manualDecision}){
    const zones=new Set(points.map(p=>p.zoneCode||'CUSTOM')).size;
    const autoSplit = points.length>5 || zones>2 || totalPax>30 || (maxWindow<45 && points.length>3);
    let decision=autoSplit?'Split route recommended':'Single route acceptable';
    let type=autoSplit?'split':'single';
    if(manualDecision==='single'){type='single';decision='Coordinator override: force single route';}
    if(manualDecision==='split'){type='split';decision='Coordinator override: force split route';}
    if(manualDecision==='review'){type='review';decision='Supervisor review required before dispatch';}
    const why = autoSplit
      ? 'Route split helps reduce pickup window pressure, hotel waiting time and driver/guide coordination risk when stops, zones or pax load are high.'
      : 'Single route is acceptable when stop count, zone spread, guest load and pickup window remain manageable.';
    return {type, decision, why, autoSplit};
  },
  expenseSummary(state){
    if(!state.includeExpenses) return null;
    const darb = state.includeDarb ? (state.darbGateCount * state.tollFee) : 0;
    const total = darb + state.fuelEstimate + state.parkingEstimate + state.otherEstimate + (state.includePettyCash ? state.pettyCashAmount : 0);
    return {darb,total};
  }
};
