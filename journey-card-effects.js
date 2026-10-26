(() => {
 const amount=c=>({COMMON:1,RARE:2,LEGENDARY:3})[c.rarity]||1;
 const risk=['marriage_accept','defense_combat_request','conditional_forgiveness','ration_people','ration_army','ration_equal','final_reject_demands'];
 function eligible(card,state,scene){
  if(!scene||state.ending||state.cardEffects?.[scene.id])return false;
  if(card.family==='Supplies')return state.resources.supplies<8;
  if(card.family==='Information')return scene.choices.some(c=>/investigate|evidence|witness|scout|information|accounts|rumor|message|counsel|leak|confession/.test(c.effect_key));
  if(card.family==='Diplomacy')return Object.values(state.alliances).some(a=>a.support<5)&&scene.choices.some(c=>/allies|treaty|marriage|partner|repair|council|audience|gratitude|loyalty/.test(c.effect_key));
  return scene.choices.some(c=>risk.includes(c.effect_key));
 }
 function description(card){const n=amount(card);return {Supplies:'Restore '+n+' '+(n===1?'supply':'supplies')+' (maximum 8).',Information:'Gain '+n+' evidence and a reminder about the current investigation.',Diplomacy:'Restore up to '+n+' support with your least-supported existing ally. Past promises remain recorded.',Protection:'Protect against up to '+n+' new debt or lost trust from your next decision in this scene.'}[card.family];}
 function timing(card){return {Supplies:'Before a decision, while supplies are below 8.',Information:'During a scene with an investigation, evidence, witnesses, or advice.',Diplomacy:'During an alliance or negotiation scene when an existing ally has less than full support.',Protection:'Before a decision with a possible debt or trust penalty. A safe decision may not need the protection.'}[card.family];}
 function apply(previous,card,sceneId){
  if(previous.cardEffects?.[sceneId])return previous;
  const s=JSON.parse(JSON.stringify(previous));s.cardEffects=s.cardEffects||{};
  const n=amount(card);let message='';
  if(card.family==='Supplies'){const gain=Math.min(n,Math.max(0,8-s.resources.supplies));s.resources.supplies+=gain;message='Provisions restored: +'+gain+' supplies.';}
  if(card.family==='Information'){s.evidence+=n;message='Evidence gathered: +'+n+'. Consider investigating before making an accusation or committing to a promise.';}
  if(card.family==='Diplomacy'){const ally=Object.entries(s.alliances).sort((a,b)=>a[1].support-b[1].support)[0];if(ally){ally[1].support=Math.min(5,ally[1].support+n);ally[1].history.push('A Journey Card helped restore support');message=ally[0]+' received your diplomatic support.';}}
  if(card.family==='Protection')message='Protection prepared for this decision.';
  s.cardEffects[sceneId]={card:card.id,family:card.family,amount:n,message};return s;
 }
 const api={eligible,description,timing,apply};if(typeof module!=='undefined'&&module.exports)module.exports=api;else window.JourneyCardEffects=api;
})();
