// Persistent earned equipment, capped story benefits, and approved starter upgrades.
(()=>{
 const KEY='throne_armory_v1',slots=['sword','shield','armor'];
 const items=Object.freeze(slots.flatMap(slot=>[1,2,3].map(tier=>Object.freeze({id:slot+'-'+tier,slot,tier}))));
 const rules={
 'sword-1':{field:'authority',keys:['strict_custody','consult_guards','aid_defenses'],description:'Strengthens guard duty and defenses: +1 authority.'},
 'shield-1':{field:'people',keys:['humane_custody','protect_witness','aid_vulnerable'],description:'Supports choices protecting people: +1 people.'},
 'armor-1':{field:'trust',keys:['trusted_keeper','ask_champion','seek_escort'],description:'Supports trusted protection and escorts: +1 trust.'},
 'sword-2':{field:'trust',keys:['defense_combat_request'],description:'Prepared defense: +1 trust when a trusted champion already supports you.'},
 'shield-2':{field:'people',keys:['aid_shelter','secure_shelter','aid_vulnerable'],description:'Supports shelter and household protection: +1 people.'},
 'armor-2':{field:'authority',keys:['seek_escort','aid_defenses'],description:'Supports equipped guards on defense or escort: +1 authority.'},
 'sword-3':{field:'authority',keys:['remove_adviser'],description:'Supports enforcing the council decision: +1 authority.'},
 'shield-3':{field:'people',keys:['find_witness'],description:'Supports securing a witness: +1 people.'},
 'armor-3':{field:'authority',keys:['final_household'],description:'Supports securing the household: +1 authority.'}
 };
 const milestones={'sword-2':'chapter-04-scene-04','shield-2':'chapter-05-scene-01','armor-2':'chapter-06-scene-03','shield-3':'chapter-07-scene-01','sword-3':'chapter-07-scene-03','armor-3':'chapter-07-scene-05'};
 const byId=new Map(items.map(item=>[item.id,item]));
 function load(){
  const raw=localStorage.getItem(KEY);if(!raw)return {version:1,owned:{},equipped:{},claims:{}};
  const saved=JSON.parse(raw);if(saved.pendingCoins!==undefined){localStorage.setItem('throne_coins_v1',String(saved.pendingCoins));delete saved.pendingCoins;localStorage.setItem(KEY,JSON.stringify(saved));}if(saved.version!==1||!saved.owned||!saved.equipped||!saved.claims)throw Error('Unsupported Armory save');
  // Reject malformed saves rather than erase existing inventory or spend coins.
  for(const [id,entry]of Object.entries(saved.owned))if(!byId.has(id)||!entry||!Number.isInteger(entry.upgrade)||entry.upgrade<0||entry.upgrade>2)throw Error('Invalid Armory item');
  for(const [slot,id]of Object.entries(saved.equipped))if(!slots.includes(slot)||!saved.owned[id]||byId.get(id)?.slot!==slot)throw Error('Invalid equipped item');
  return saved;
 }
 function sync(){
  const state=load();let campaign;try{campaign=JSON.parse(localStorage.getItem('throne_campaign_v2')||'{}');}catch{return {state,awarded:[]};}
  const awarded=[];
  if(Number(campaign[1])>=50&&!state.claims['season-1-starter-set']){
   for(const slot of slots){const id=slot+'-1';if(!state.owned[id]){state.owned[id]={upgrade:0};awarded.push(id);if(!state.equipped[slot])state.equipped[slot]=id;}}
   state.claims['season-1-starter-set']=true;localStorage.setItem(KEY,JSON.stringify(state));
  }
  let journey;try{journey=JSON.parse(localStorage.getItem('throne_journey_v1')||'{}');}catch{journey={};}
  for(const [id,scene]of Object.entries(milestones)){if((journey.decisions||[]).some(d=>d.scene===scene)&&!state.owned[id]){state.owned[id]={upgrade:0};state.claims[id]=true;awarded.push(id);}}
  if(awarded.length)localStorage.setItem(KEY,JSON.stringify(state));
  return {state,awarded};
 }
 function equip(id){const item=byId.get(id),state=load();if(!item||!state.owned[id])throw Error('Earn this equipment first');state.equipped[item.slot]=id;localStorage.setItem(KEY,JSON.stringify(state));return state;}
 function unequip(slot){if(!slots.includes(slot))throw Error('Unknown equipment slot');const state=load();delete state.equipped[slot];localStorage.setItem(KEY,JSON.stringify(state));return state;}
 function upgradeQuote(id){const state=load(),item=byId.get(id);if(!item||!state.owned[id])return {available:false,reason:'Equipment not earned'};if(item.tier!==1)return {available:false,reason:'Later equipment has its complete benefit; no upgrade offered'};const level=state.owned[id].upgrade;if(level>=2)return {available:false,reason:'Fully upgraded'};
  const eligibleScenes={'sword-1':['chapter-02-scene-02','chapter-04-scene-04','chapter-05-scene-04'],'shield-1':['chapter-02-scene-02','chapter-04-scene-02','chapter-05-scene-04'],'armor-1':['chapter-02-scene-02','chapter-04-scene-04','chapter-06-scene-04']};
  let journey;try{journey=JSON.parse(localStorage.getItem('throne_journey_v1')||'{}');}catch{return {available:false,reason:'Story progress is unavailable'};}
  const decisions=journey.decisions||[],used=decisions.filter(d=>d.gear?.id===id).length;
  const remaining=journey.ending?0:eligibleScenes[id].filter(scene=>!decisions.some(d=>d.scene===scene)&&!journey.cardEffects?.[scene]).length;
  if(used+remaining<=1+level)return {available:false,reason:'No additional usable benefit remains in this story'};
  return {available:true,cost:window.ThroneEconomy.pricing.starterGearUpgrades[level],uses:level+2,reason:'Adds one eligible use this story; each use stays capped at +1.'};}
 function upgrade(id){const quote=upgradeQuote(id);if(!quote.available)throw Error(quote.reason);const state=load(),coins=Number(localStorage.getItem('throne_coins_v1')||0);if(!Number.isSafeInteger(coins)||coins<quote.cost)throw Error('Not enough coins');state.owned[id].upgrade++;state.pendingCoins=coins-quote.cost;localStorage.setItem(KEY,JSON.stringify(state));localStorage.setItem('throne_coins_v1',String(state.pendingCoins));delete state.pendingCoins;localStorage.setItem(KEY,JSON.stringify(state));return state;}
 function apply(previous,next,scene,choiceIndex){
  if(previous.decisions.some(d=>d.scene===scene.id)||next===previous||next.decisions.at(-1)?.gear)return next;
  const state=load(),key=scene.choices[choiceIndex].effect_key;
  // Protection cards resolve first. Never stack equipment onto an existing card effect.
  if(previous.cardEffects?.[scene.id])return next;
  for(const slot of slots){const id=state.equipped[slot],rule=rules[id];if(!rule||!rule.keys.includes(key))continue;
   if(id==='sword-2'&&previous.trust<2)continue;
   const used=previous.decisions.filter(d=>d.gear?.id===id).length,limit=1+(state.owned[id]?.upgrade||0);if(used>=limit)continue;
   next[rule.field]+=1;const decision=next.decisions.at(-1);decision.gear={id,field:rule.field,amount:1,upgrade:state.owned[id].upgrade};decision.changes.push('Equipped '+id.replace('-',' ')+' supports this choice: +1 '+rule.field);break;
  }
  return next;
 }

 window.ThroneArmory=Object.freeze({items,getState:()=>JSON.parse(JSON.stringify(load())),sync,equip,unequip,upgradeQuote,upgrade,apply,rules:Object.freeze(rules),effectsReady:true});
 try{sync();}catch(error){console.warn('Armory save unavailable; existing progress is unchanged.');}
})();
