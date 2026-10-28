// Campaign progress is earned only by finishing a ten-question practice match.
function campaignProgress(){
 try {const p=JSON.parse(localStorage.getItem('throne_campaign_v2')||'{}');return p&&typeof p==='object'?p:{};}catch{return {};}
}
function completedLevels(s){return Math.max(0,Math.min(50,Number(campaignProgress()[s])||0));}
function seasonAvailable(s){return s===1||completedLevels(s-1)===50;}
// Seeing a question does not prove a completed level. Preserve earned campaign
// records, but never unlock seasons from abandoned or merely reserved questions.
if(!localStorage.getItem('throne_campaign_v2')){
 localStorage.setItem('throne_campaign_v2','{}');
}
function savePendingRound(answered=false){localStorage.setItem('throne_pending_'+currentSeason,JSON.stringify({season:currentSeason,level:chosenLevel,match,index,score,foe,right,answered}));}
const nextQuestionBeforeProgress=nextQuestion;
nextQuestion=function(){savePendingRound();nextQuestionBeforeProgress();};
const answerBeforeProgress=answer;
answer=function(choice){const wasLocked=locked;answerBeforeProgress(choice);if(!wasLocked)savePendingRound(true);};
let seasonPage=0;
drawSeasons=function(){
 const c=$('seasongrid');c.replaceChildren();
 const available=seasons.map((name,i)=>({name,s:i+1})).filter(x=>seasonAvailable(x.s));
 const count=Math.ceil(available.length/4);seasonPage=Math.max(0,Math.min(seasonPage,count-1));
 available.slice(seasonPage*4,seasonPage*4+4).forEach(({name,s})=>{const open=true,b=document.createElement('button');b.className='tile';b.setAttribute('aria-label',`Season ${s}`);
 b.innerHTML=`${s===1?'<img class="season-place-art" src="theme-winterfell.webp" alt="Winterfell">':''}<strong>Season ${s} · ${name}</strong><small>${open?completedLevels(s)+' / 50 complete':'🔒 Complete Season '+(s-1)}</small>`;
 b.onclick=()=>{if(!seasonAvailable(s))return;currentSeason=s;if(playMode==='friend'){validateCharacter();go('characters');return;}chosenLevel=Math.min(50,completedLevels(s)+1);levelPage=Math.floor((chosenLevel-1)/10);go('levels');};c.append(b);});
 let pager=$('seasonPager');if(!pager){pager=document.createElement('div');pager.id='seasonPager';c.after(pager);}pager.replaceChildren();pager.hidden=count<=1;
 if(count>1){const prev=document.createElement('button'),next=document.createElement('button'),label=document.createElement('span');prev.textContent='‹';prev.setAttribute('aria-label','Previous available seasons');prev.disabled=seasonPage===0;next.textContent='›';next.setAttribute('aria-label','Next available seasons');next.disabled=seasonPage===count-1;prev.onclick=()=>{seasonPage--;drawSeasons();};next.onclick=()=>{seasonPage++;drawSeasons();};label.textContent=(seasonPage+1)+' / '+count;pager.append(prev,label,next);}
};
const drawLevelsBeforeProgress=drawLevels;
drawLevels=function(){
 if(!seasonAvailable(currentSeason)){currentSeason=1;levelPage=0;}
 drawLevelsBeforeProgress();const done=completedLevels(currentSeason);
 document.querySelector('#levels .small').textContent=`${done} / 50 levels complete · Finish all 50 to unlock the next season`;
 [...$('levelgrid').children].forEach((b,i)=>{const level=levelPage*10+i+1;b.disabled=level!==done+1;b.setAttribute('aria-label',`Level ${level}${level<=done?' complete':level>done+1?' locked':''}`);if(level<=done)b.textContent=level+' ✓';else if(level>done+1)b.textContent=level+' 🔒';else {const hint=document.createElement('small');hint.className='level-play-hint';hint.textContent='Tap to Play';b.append(hint);}});
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
endRound=function(){if(creditedCampaignMatch===match)return;if(match.length===10&&index>=10){creditedCampaignMatch=match;const p=campaignProgress();p[currentSeason]=Math.min(50,completedLevels(currentSeason)+1);localStorage.setItem('throne_campaign_v2',JSON.stringify(p));localStorage.removeItem('throne_pending_'+currentSeason);}endRoundBeforeProgress();};
document.querySelectorAll('.back').forEach(b=>b.setAttribute('aria-label','Back'));
