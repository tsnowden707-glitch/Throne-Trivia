// Approved first-clear campaign coins. Existing balances and cleared levels migrate unchanged.
(()=>{
 const KEY='throne_coin_claims_v1',COINS='throne_coins_v1',PROGRESS='throne_campaign_v2';
 const read=(k,f)=>{const raw=localStorage.getItem(k);return raw===null?f:JSON.parse(raw);};
 const balance=()=>{const n=Number(localStorage.getItem(COINS)||0);if(!Number.isSafeInteger(n)||n<0)throw Error('Invalid saved coin balance');return n;};
 const done=(p,s)=>Math.max(0,Math.min(50,Number(p[s])||0));
 function load(){
  let ledger=read(KEY,null);
  if(!ledger){const p=read(PROGRESS,{});ledger={version:1,levels:{},seasons:{}};for(let s=1;s<=8;s++){for(let l=1;l<=done(p,s);l++)ledger.levels[s+':'+l]={migrated:true};if(done(p,s)===50)ledger.seasons[s]={migrated:true};}localStorage.setItem(KEY,JSON.stringify(ledger));}
  if(ledger.version!==1||!ledger.levels||!ledger.seasons)throw Error('Unsupported coin ledger');
  if(ledger.pending){localStorage.setItem(COINS,String(ledger.pending.balance));localStorage.setItem(PROGRESS,JSON.stringify(ledger.pending.progress));delete ledger.pending;localStorage.setItem(KEY,JSON.stringify(ledger));}
  return ledger;
 }
 function claim(season,level,correct){
  if(!Number.isInteger(season)||season<1||season>8||!Number.isInteger(level)||level<1||level>50||!Number.isInteger(correct)||correct<0||correct>10)throw Error('Invalid completed round');
  const ledger=load(),p=read(PROGRESS,{}),key=season+':'+level;
  if(ledger.levels[key]||level<=done(p,season))return {level:0,season:0,total:0,balance:balance()};
  if(level!==done(p,season)+1||(season>1&&done(p,season-1)!==50))throw Error('Complete the next unlocked level first');
  const reward=40+5*(season-1)+5*correct,bonus=level===50&&!ledger.seasons[season]?250+100*(season-1):0,total=reward+bonus,next=balance()+total;
  if(!Number.isSafeInteger(next))throw Error('Coin balance exceeds safe limit');
  ledger.levels[key]={correct,coins:reward};if(bonus)ledger.seasons[season]={coins:bonus};p[season]=level;
  // Write-ahead record makes a reload after interruption finish the same claim once.
  ledger.pending={balance:next,progress:p};localStorage.setItem(KEY,JSON.stringify(ledger));
  localStorage.setItem(COINS,String(next));localStorage.setItem(PROGRESS,JSON.stringify(p));delete ledger.pending;localStorage.setItem(KEY,JSON.stringify(ledger));
  return {level:reward,season:bonus,total,balance:next};
 }
 window.ThroneEconomy={claim,pricing:Object.freeze({starterGearUpgrades:Object.freeze([500,750]),themeStartingPrice:750}),initialize:load};
 try{load();}catch(error){console.warn('Coin ledger unavailable; rewards will wait for storage recovery.');}
})();
