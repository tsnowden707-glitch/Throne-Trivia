// Pure journey rules: a saved decision is applied once, never on replay.
(() => {
 const fresh=()=>({version:1,decisions:[],alliances:{},promises:{},resources:{gold:0,supplies:0},trust:0,people:0,evidence:0,debt:0,authority:0,ending:null});
 const groups={
  people:['escort_messenger','shelter_messenger','meet_people','humane_custody','exchange_people_offer','release_mercy','announce_people','aid_vulnerable','ration_people','listen_people','appeal_service'],
  trust:['public_gratitude','service','loyalty_oath','disclose_rumor','report_allies','consult_allies','hear_partner','announce_duties','repair_trust','repair_alliances','public_council','public_assurance','renew_commitments','final_allies','listen_allies','final_supporters'],
  evidence:['investigate_rumor','seek_advisers','read_message','witness','review_promises','independent_counsel','charge_details','charge_counsel','verify_witness','record_witness','evidence_path','defense_evidence','preserve_defense','patron_motives','gather_information','count_stores','check_stores','send_scouts','publish_accounts','trace_leak','secure_records','require_evidence','find_witness','check_confession','share_evidence','listen_counsel'],
  debt:['fixed_debt','open_favor','loan_collateral','grant_concession'],
  authority:['independent','announce_claim','strict_custody','aid_defenses','ration_army','remove_adviser','final_stand_apart','claim_authority'],
 };
 const promiseNames={promise_people:'Protect the people',promise_agreements:'Honor agreements',promise_allies:'Defend allies'};
 function apply(previous,scene,choiceIndex){
  if(!Number.isInteger(choiceIndex)||!scene.choices[choiceIndex])throw Error('Invalid choice');
  if(previous.decisions.some(d=>d.scene===scene.id))return previous;
  const s=JSON.parse(JSON.stringify(previous)),choice=scene.choices[choiceIndex],k=choice.effect_key;
  if(s.ending)throw Error('Journey already complete');
  const expectedChapter=Math.floor(s.decisions.length/6)+1;
  if(scene.chapter!==expectedChapter||!scene.id.endsWith(String(s.decisions.length%6+1).padStart(2,'0')))throw Error('Scene out of sequence');
  const changes=[];
  const change=(field,value,label)=>{s[field]+=value;if(label)changes.push(label);};
  if(k.startsWith('audience_')){const house='House '+k.slice(9).replace(/^./,c=>c.toUpperCase());s.alliances[house]={support:1,history:['Granted your first audience']};changes.push('Audience granted: '+house);}
  if(promiseNames[k]){s.promises[k]={label:promiseNames[k],status:'Pledged'};changes.push('Promise made: '+promiseNames[k]);}
  for(const [field,keys] of Object.entries(groups))if(keys.includes(k))change(field,1);
  const gain=(resource,value)=>{s.resources[resource]+=value;changes.push('+'+value+' '+resource);};
  if(['release_ransom','aid_gold'].includes(k))gain('gold',2);
  if(['aid_supplies','build_reserves','emergency_reserve','improve_storage','secure_trade'].includes(k))gain('supplies',2);
  // Early personal aid is recorded as a sacrifice, never a negative inventory.
  if(k==='spend_supplies'){if(s.resources.supplies>0)s.resources.supplies--;change('people',1);changes.push('Personal provisions given to the messenger');}
  if(['keep_debt_terms','final_honor_debts','debt_service'].includes(k)){s.debt=Math.max(0,s.debt-1);change('trust',1);}
  if(k==='final_reject_demands'){change('trust',-2);change('authority',1);if(s.debt>0)changes.push('Unsettled debts weaken your claim');}
  if(['accept_limits','share_authority','final_compromise'].includes(k)){change('trust',1);change('authority',-1);}
  if(k==='marriage_accept'){
   s.alliances['Marriage alliance']={support:1,history:['Accepted a marriage alliance']};
   if(s.decisions.some(d=>d.effect==='loyalty_oath')&&!s.decisions.some(d=>d.effect==='consult_allies')){change('trust',-2);changes.push('Your first allies were not consulted');}
   changes.push('Marriage alliance formed');
  }
  if(k==='treaty_offer'){s.alliances['Treaty delegation']={support:1,history:['Offered a treaty']};changes.push('Treaty offered');}
  if(k==='defense_combat_request'){
   const supported=s.trust>=2;
   change('trust',supported?1:-1);changes.push(supported?'An ally supports your defense':'Your defense lacks a trusted champion; your claim loses support');
  }
  if(k==='conditional_forgiveness'){change('people',1);if(s.evidence<3)change('trust',-1);}
  if(['ration_people','ration_army','ration_equal'].includes(k)){
   if(s.resources.supplies>0){s.resources.supplies--;changes.push('Supplies distributed');}else{change('debt',1);changes.push('Emergency provisions create a debt');}
  }
  const keep=(id,condition)=>{if(s.promises[id]){s.promises[id].status=condition?'Kept':'Broken';change('trust',condition?1:-2);changes.push(s.promises[id].label+': '+s.promises[id].status.toLowerCase());}};
  if(k==='ration_people'||k==='ration_army')keep('promise_people',k==='ration_people');
  if(k==='final_honor_debts'||k==='final_reject_demands')keep('promise_agreements',k==='final_honor_debts');
  if(k==='final_allies'||k==='final_stand_apart')keep('promise_allies',k==='final_allies');
  // Each alliance remembers its own treatment. Global trust is not its loyalty.
  const houseNames=Object.keys(s.alliances).filter(name=>name.startsWith('House '));
  const react=(names,amount,reason)=>{
   for(const name of names){const ally=s.alliances[name];if(!ally)continue;
    ally.support=Math.max(0,Math.min(5,ally.support+amount));
    ally.history=ally.history||[];ally.history.push(reason);
    changes.push(name+': '+reason);
   }
  };
  if(['consult_allies','report_allies','loyalty_oath','final_allies','listen_allies','final_supporters'].includes(k))react(houseNames,1,'You stood by your allies');
  if(k==='marriage_accept'&&s.decisions.some(d=>d.effect==='loyalty_oath')&&!s.decisions.some(d=>d.effect==='consult_allies'))react(houseNames,-1,'Your marriage promise conflicted with your earlier oath');
  if(['hear_partner','announce_duties'].includes(k))react(['Marriage alliance'],1,'You honored the partnership');
  if(['repair_trust','repair_alliances','renew_commitments'].includes(k))react(Object.keys(s.alliances),1,'You took a step toward repairing trust');
  if(k==='final_stand_apart')react(houseNames,-1,'You chose to stand apart');
  const protection=s.cardEffects?.[scene.id];
  if(protection?.family==='Protection'){
   let remaining=protection.amount;
   const debtSaved=Math.min(remaining,Math.max(0,s.debt-previous.debt));s.debt-=debtSaved;remaining-=debtSaved;
   const trustSaved=Math.min(remaining,Math.max(0,previous.trust-s.trust));s.trust+=trustSaved;
   if(debtSaved||trustSaved)changes.push('Your protection card prevented '+debtSaved+' debt and '+trustSaved+' lost trust');
  }
  s.decisions.push({scene:scene.id,chapter:scene.chapter,title:scene.title,choice:choice.label,effect:k,response:choice.response,changes});
  if(s.decisions.length===48){
   const support=s.trust+s.people+Math.min(4,s.evidence)-s.debt;
   s.ending=support>=18?'throne':s.trust<0&&s.authority>=3?'execution':s.people>=4?'wall':'exile';
  }
  return s;
 }
 function recap(s){
  const lines=[];
  for(const [name,ally] of Object.entries(s.alliances))lines.push(name+(ally.support?' stood beside you':' withdrew support')+(ally.history?.length?' — '+ally.history.at(-1):''));
  for(const promise of Object.values(s.promises))lines.push(promise.label+': '+promise.status.toLowerCase());
  if(s.debt>0)lines.push('Unsettled obligations remained: '+s.debt);
  const turningPoints=s.decisions.filter(d=>d.changes?.length).slice(-3);
  for(const d of turningPoints)lines.push('Season '+d.chapter+' · '+d.title+': '+d.choice);
  return lines;
 }
 function favorAvailable(s,name){
  const chapter=Math.floor(s.decisions.length/6)+1;
  return !s.ending&&chapter<=8&&(s.alliances[name]?.support||0)>=3&&!(s.favors||[]).some(f=>f.chapter===chapter);
 }
 function callFavor(previous,name){
  if(!favorAvailable(previous,name))throw Error('No favor available');
  const s=JSON.parse(JSON.stringify(previous)),chapter=Math.floor(s.decisions.length/6)+1;
  s.favors=s.favors||[];s.favors.push({chapter,ally:name,reward:'supplies',amount:1});
  s.resources.supplies+=1;s.alliances[name].support-=1;
  s.alliances[name].history=s.alliances[name].history||[];
  s.alliances[name].history.push('Sent one supply when you called in a favor in season '+chapter);
  return s;
 }
 const api={fresh,apply,recap,favorAvailable,callFavor};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else window.JourneyState=api;
})();
