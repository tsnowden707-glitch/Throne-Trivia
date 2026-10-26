// Pure inventory rules. Network gifts/trades must be committed by the server.
(() => {
 const fresh=()=>({version:1,copies:{},discovered:[],rewards:{},duplicates:0,uses:[],tutorials:{}});
 const clone=s=>JSON.parse(JSON.stringify(s));
 function grant(previous,card,eventId){
  if(!eventId||!card?.id)throw Error('Missing reward identity');
  if(previous.rewards[eventId])return previous;
  const s=clone(previous),known=s.discovered.includes(card.id);
  s.copies[card.id]=(s.copies[card.id]||0)+1;
  if(!known)s.discovered.push(card.id);
  s.duplicates=known?s.duplicates+1:0;s.rewards[eventId]=card.id;return s;
 }
 function reward(previous,catalog,eventId,season,random=Math.random){
  if(previous.rewards[eventId])return {state:previous,card:catalog.find(c=>c.id===previous.rewards[eventId]),repeated:true};
  const pool=catalog.filter(c=>c.unlockSeason<=Math.max(1,Math.min(8,season)));
  if(!pool.length)throw Error('No available cards');
  const missing=pool.filter(c=>!previous.discovered.includes(c.id));
  // After seven consecutive duplicates, the next reward is an eligible missing card.
  let eligible;
  if(previous.duplicates>=7&&missing.length)eligible=missing;
  else {const roll=random(),rarity=roll<.72?'COMMON':roll<.96?'RARE':'LEGENDARY';eligible=pool.filter(c=>c.rarity===rarity);if(!eligible.length)eligible=pool.filter(c=>c.rarity==='COMMON');}
  const card=eligible[Math.min(eligible.length-1,Math.floor(random()*eligible.length))];
  return {state:grant(previous,card,eventId),card,repeated:false};
 }
 function consume(previous,id,sceneId){
  if(!sceneId||!(previous.copies[id]>0))throw Error('No available copy');
  if(previous.uses.some(u=>u.scene===sceneId))throw Error('One card per scene');
  const s=clone(previous);s.copies[id]--;s.uses.push({id,scene:sceneId});return s;
 }
 const api=Object.freeze({fresh,grant,reward,consume});
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else window.JourneyCardRules=api;
})();
