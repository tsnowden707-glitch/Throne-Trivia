/* Only a new first-clear crossing of the next unplayed story gate can queue this route. */
(()=>{
 const KEY='throne_pending_story_route_v1';let pending=null,token=0,timer=null,speaking=false,rewardBusy=false;
 try{pending=JSON.parse(localStorage.getItem(KEY)||'null');}catch{}
 const clear=()=>{token++;clearTimeout(timer);timer=null;pending=null;localStorage.removeItem(KEY);};
 const busy=()=>document.hidden||speaking||rewardBusy||!!document.querySelector('dialog[open]');
 function schedule(){if(!pending||current!=='victory')return;const own=++token;let readableSince=performance.now();
  const poll=()=>{if(own!==token||current!=='victory'||!pending)return;if(busy()){readableSince=performance.now();timer=setTimeout(poll,250);return;}if(performance.now()-readableSince<5000){timer=setTimeout(poll,250);return;}
   const gate=window.ThroneJourney?.getGateStatus();if(!gate?.available||gate.id!==pending.scene){clear();return;}
   const title=document.getElementById('victoryTitle');if(title)title.textContent='Your journey continues';
   timer=setTimeout(()=>{if(own!==token||current!=='victory'||busy()){if(own===token)schedule();return;}clear();go('journeyStory');window.ThroneVault?.play({revealReady:window.ThroneJourney?.prepare?.()});},900);
  };timer=setTimeout(poll,250);
 }
 window.ThroneJourneyRoute={continue(){if(!pending)return false;const gate=window.ThroneJourney?.getGateStatus();if(!gate?.available||gate.id!==pending.scene){clear();return false;}clear();go('journeyStory');window.ThroneVault?.play({revealReady:window.ThroneJourney?.prepare?.()});return true;},crossed(before,after,reward){if(!reward?.total||!before||before.available||!after?.available||before.id!==after.id)return false;pending={scene:after.id,season:after.chapter,required:after.required};localStorage.setItem(KEY,JSON.stringify(pending));window.ThroneJourney?.prepare?.();return true;},cancel:clear};
 document.addEventListener('narrationstate',e=>{speaking=!!e.detail.speaking;});document.addEventListener('coinrewardstate',e=>{rewardBusy=!!e.detail.active;});
 document.addEventListener('screenchange',e=>{if(e.detail.page==='victory')schedule();else if(e.detail.page!=='summary')clear();});
 window.addEventListener('pagehide',()=>{token++;clearTimeout(timer);});
})();
