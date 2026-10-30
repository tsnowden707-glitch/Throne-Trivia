/* Read-only presentation of earned progress and current, already-recorded risks.
 * This never predicts an ending, grades a choice, or changes the save. */
(function(root){
 'use strict';
 function progress(campaign={}){
  const seasons=Array.from({length:8},(_,i)=>Math.max(0,Math.min(50,Math.floor(Number(campaign[i+1])||0))));
  const completed=seasons.reduce((a,b)=>a+b,0);
  return {seasons,completed,total:400,fraction:completed/400,season:Math.min(8,Math.floor(completed/50)+1)};
 }
 function standing(state={}){
  const reasons=[];let pressure=0;
  const trust=Number(state.trust)||0,debt=Math.max(0,Number(state.debt)||0);
  const broken=Object.values(state.promises||{}).filter(p=>p.status==='Broken').length;
  const withdrawn=Object.values(state.alliances||{}).filter(a=>Number(a.support)===0).length;
  if(trust<0){pressure+=Math.min(2,-trust);reasons.push('Trust is strained');}
  if(debt){pressure+=debt>=3?2:1;reasons.push('Outstanding obligations: '+debt);}
  if(broken){pressure+=1;reasons.push('Unfulfilled promises: '+broken);}
  if(withdrawn){pressure+=1;reasons.push('Alliances without support: '+withdrawn);}
  const color=pressure>=3?'red':pressure?'yellow':'green';
  return {color,label:color==='red'?'In danger':color==='yellow'?'Vulnerable':'Steady',reasons:reasons.length?reasons:['No recorded strain'],pressure};
 }
 const api={progress,standing};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.JourneyStanding=api;
})(typeof window==='undefined'?globalThis:window);
