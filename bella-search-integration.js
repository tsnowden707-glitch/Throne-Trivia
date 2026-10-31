/* Optional seasonal search, offered after first-clear milestone rewards. */
(()=>{
 if(!window.ThroneBellaSearch)return;
 const KEY='throne_bella_search_pending_v1',priorClaim=ThroneEconomy.claim,priorStart=start;
 let opening=false;
 ThroneBellaSearch.configure({storageKey:'throne_bella_search_v1',walletKey:'throne_coins_v1',reward:5});
 ThroneEconomy.claim=function(season,level,correct){const reward=priorClaim.apply(this,arguments);if(playMode!=='friend'&&reward.total&&ThroneBellaSearch.eligible(season,level))localStorage.setItem(KEY,JSON.stringify({season,level}));return reward;};
 start=function(){
  if(playMode==='friend')return priorStart.apply(this,arguments);
  if(opening)return;
  let pending;try{pending=JSON.parse(localStorage.getItem(KEY)||'null')}catch{}
  if(!pending)return priorStart.apply(this,arguments);
  if(!ThroneBellaSearch.availableSeasons().includes(pending.season)||![5,15,25,30,40,45].includes(pending.level)||completedLevels(pending.season)<pending.level){localStorage.removeItem(KEY);return priorStart.apply(this,arguments);}
  // Newly available main story content retains priority over the optional search.
  if(window.ThroneJourney?.getGateStatus()?.available){go('journeyStory');return;}
  window.ThroneVoice?.stop();const originalArgs=arguments,origin=current;
  opening=true;
  const resume=()=>{opening=false;localStorage.removeItem(KEY);if(current===origin&&playMode!=='friend')priorStart.apply(this,originalArgs);};
  ThroneBellaSearch.open({...pending,onComplete:resume,shouldOpen:()=>current===origin&&playMode!=='friend'}).then(opened=>{if(!opened){if(current===origin&&playMode!=='friend')resume();else opening=false;}}).catch(error=>{opening=false;console.warn('Search remains saved for the next visit.',error);if(current===origin&&playMode!=='friend')priorStart.apply(this,originalArgs);});
 };
})();
