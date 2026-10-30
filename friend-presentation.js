let playMode='practice';
function chooseGameMode(mode){playMode=mode;go('seasons');}
let readyCharacterBusy=false,preparedPracticeRival=null;
async function readyCharacter(){
 if(readyCharacterBusy)return;validateCharacter();
 if(playMode==='friend'){await go('invite');TT.resumeWaiting();return;}
 const button=document.querySelector('#characters button[onclick="readyCharacter()"]'),player=selected,season=currentSeason;
 choosePracticeRival();const rival=practiceRival;
 readyCharacterBusy=true;if(button){button.disabled=true;button.setAttribute('aria-busy','true');}
 try{
  const sources=[P[player],P[rival.index],typeof kingdomArt==='function'?kingdomArt('lobby'):null].filter(Boolean);
  await Promise.all(sources.map(src=>{const image=new Image();image.src=src;return image.decode().catch(()=>{});}));
  if(current!=='characters'||selected!==player||currentSeason!==season)return;
  preparedPracticeRival=rival;go('lobby');
 }finally{readyCharacterBusy=false;if(button){button.disabled=false;button.removeAttribute('aria-busy');}}
}
function updateFriendLabel(){const label=$('ttSeasonLabel');if(label)label.textContent=`Season ${currentSeason} · ${names[selected]}`;}
let practiceRival=null;
function practiceRivalPool(){const pool=CHARACTER_ROSTER.map((c,index)=>({...c,index})).filter(c=>c.season===currentSeason);const others=pool.filter(c=>c.index!==selected);return others.length?others:pool;}
function choosePracticeRival(){const pool=practiceRivalPool();if(!pool.length)throw Error('No characters available for this season');practiceRival={season:currentSeason,player:selected,index:pool[Math.floor(Math.random()*pool.length)].index};return practiceRival.index;}
function practiceRivalIndex(){if(!practiceRival||practiceRival.season!==currentSeason||practiceRival.player!==selected)choosePracticeRival();return practiceRival.index;}
const goBeforeFriendPresentation=go;
go=function(page){if(page==='lobby'){validateCharacter();if(preparedPracticeRival&&preparedPracticeRival.player===selected&&preparedPracticeRival.season===currentSeason)practiceRival=preparedPracticeRival;else choosePracticeRival();preparedPracticeRival=null;}goBeforeFriendPresentation(page);if(page==='lobby'){const heading=document.querySelector('#lobby .title');if(heading)heading.textContent='Your Challenger Awaits';}if(page==='invite')updateFriendLabel();if(page==='victory'){const rematch=document.querySelector('#victory button');rematch.disabled=false;rematch.textContent=completedLevels(currentSeason)>=50?(currentSeason<8?'NEXT SEASON':'YOUR JOURNEY'):'NEXT LEVEL';rematch.onclick=()=>{if(window.ThroneJourneyRoute?.continue())return;if(completedLevels(currentSeason)>=50){if(currentSeason>=8){go('journeyStory');return;}currentSeason++;validateCharacter();}chosenLevel=completedLevels(currentSeason)+1;start();};const home=document.querySelector('#victory .content>.btn:not(.gold)');if(home)home.onclick=()=>go('menu');}};
function showOnlineVictory(state,details,myId){
 const ownerWins=state.winner===state.owner;
 const winnerId=state.winner?(ownerWins?details.owner_character:details.guest_character):CHARACTER_ROSTER[selected].id;
 const champion=CHARACTER_ROSTER.find(c=>c.id===winnerId)||CHARACTER_ROSTER[0];
 go('victory');
 $('victoryTitle').textContent=!state.winner?'DRAW!':state.winner===myId?'VICTORY!':'RIVAL WINS';
 $('victoryHero').src='portrait-'+champion.id+'.webp';$('victoryHero').alt=champion.name;
 const mine=state.owner===myId?'owner':'guest',other=mine==='owner'?'guest':'owner';
 $('victoryStats').textContent=`${state.winner?champion.name+' wins':'Honors shared'} · YOU ${state.scores[mine]} · RIVAL ${state.scores[other]}`;
 const rematch=document.querySelector('#victory .btn.gold');rematch.disabled=false;rematch.textContent='REMATCH';rematch.onclick=()=>TT.rematch();const menu=document.querySelector('#victory .content>.btn:not(.gold)');if(menu)menu.onclick=()=>TT.leave();
}
const rewardBeforeThemeStatus=reward;
reward=function(type){
 rewardBeforeThemeStatus(type);
 if(type==='Themes'){
  const note=document.createElement('p');note.className='small';note.textContent='Theme switching is not available yet. Full-size original theme artwork is still needed.';
  $('rewardBox').prepend(note);
  document.querySelectorAll('#rewardBox .tile small').forEach((label,i)=>{label.textContent=i===0?'Current look':'Artwork pending';});
 }
};

const startBeforeRivalRefresh=start;start=function(){if(current==='victory'&&playMode==='practice')choosePracticeRival();return startBeforeRivalRefresh.apply(this,arguments);};
