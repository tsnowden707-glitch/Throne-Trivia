// Campaign progress is earned only by finishing a ten-question practice match.
function campaignProgress(){
 try {const p=JSON.parse(localStorage.getItem('throne_campaign_v2')||'{}');return p&&typeof p==='object'?p:{};}catch{return {};}
}
function completedLevels(s){return Math.max(0,Math.min(50,Number(campaignProgress()[s])||0));}
function seasonAvailable(s){return s===1||completedLevels(s-1)===50;}
// Carry the existing reserved-question history into the new campaign tracker once.
if(!localStorage.getItem('throne_campaign_v2')){
 const history=new Set(seen),progress={};for(let s=1;s<=8;s++)progress[s]=Math.min(50,Math.floor(BANK.filter(q=>q.s===s&&history.has(q.id)).length/10));
 localStorage.setItem('throne_campaign_v2',JSON.stringify(progress));
}
function savePendingRound(answered=false){localStorage.setItem('throne_pending_'+currentSeason,JSON.stringify({season:currentSeason,level:chosenLevel,match,index,score,foe,right,answered}));}
const nextQuestionBeforeProgress=nextQuestion;
nextQuestion=function(){savePendingRound();nextQuestionBeforeProgress();};
const answerBeforeProgress=answer;
answer=function(choice){const wasLocked=locked;answerBeforeProgress(choice);if(!wasLocked)savePendingRound(true);};
drawSeasons=function(){
 const c=$('seasongrid');c.replaceChildren();
 seasons.forEach((name,i)=>{const s=i+1,open=seasonAvailable(s),b=document.createElement('button');b.className='tile';b.disabled=!open;b.setAttribute('aria-label',`Season ${s}${open?'':' locked'}`);
 b.innerHTML=`Season ${s}<br>${name}<br><small>${open?completedLevels(s)+' / 50 complete':'🔒 Complete Season '+(s-1)}</small>`;
 b.onclick=()=>{if(!seasonAvailable(s))return;currentSeason=s;chosenLevel=Math.min(50,completedLevels(s)+1);levelPage=Math.floor((chosenLevel-1)/10);go('levels');};c.append(b);});
};
const drawLevelsBeforeProgress=drawLevels;
drawLevels=function(){
 if(!seasonAvailable(currentSeason)){currentSeason=1;levelPage=0;}
 drawLevelsBeforeProgress();const done=completedLevels(currentSeason);
 document.querySelector('#levels .small').textContent=`${done} / 50 levels complete · Finish all 50 to unlock the next season`;
 [...$('levelgrid').children].forEach((b,i)=>{const level=levelPage*10+i+1;b.disabled=level!==done+1;b.setAttribute('aria-label',`Level ${level}${level<=done?' complete':level>done+1?' locked':''}`);if(level<=done)b.textContent=level+' ✓';else if(level>done+1)b.textContent=level+' 🔒';});
};
const startBeforeProgress=start;
start=function(){
 if(!seasonAvailable(currentSeason)||completedLevels(currentSeason)>=50){go('seasons');return;}
 let pending;try{pending=JSON.parse(localStorage.getItem('throne_pending_'+currentSeason)||'null');}catch{}
 if(pending&&pending.season===currentSeason&&pending.match?.length===10&&pending.match.every(q=>BANK.some(b=>b.id===q.id))){
  ({match,score,foe,right}=pending);chosenLevel=pending.level;index=pending.index+(pending.answered?1:0);musicPlay();if(index>=10)endRound();else nextQuestion();return;
 }
 chosenLevel=completedLevels(currentSeason)+1;startBeforeProgress();if(current==='countdown')savePendingRound();
};
const endRoundBeforeProgress=endRound;
let creditedCampaignMatch=null;
endRound=function(){if(match.length===10&&index>=10&&creditedCampaignMatch!==match){creditedCampaignMatch=match;const p=campaignProgress();p[currentSeason]=Math.min(50,completedLevels(currentSeason)+1);localStorage.setItem('throne_campaign_v2',JSON.stringify(p));localStorage.removeItem('throne_pending_'+currentSeason);}endRoundBeforeProgress();};
document.querySelectorAll('.back').forEach(b=>b.setAttribute('aria-label','Back'));
