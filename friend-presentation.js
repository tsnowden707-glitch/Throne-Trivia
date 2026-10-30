let playMode='practice';
function chooseGameMode(mode){playMode=mode;go('seasons');}
function readyCharacter(){validateCharacter();go(playMode==='friend'?'invite':'lobby');}
function updateFriendLabel(){const label=$('ttSeasonLabel');if(label)label.textContent=`Season ${currentSeason} · ${names[selected]}`;}
let practiceRival=null;
function practiceRivalPool(){const pool=CHARACTER_ROSTER.map((c,index)=>({...c,index})).filter(c=>c.season===currentSeason);const others=pool.filter(c=>c.index!==selected);return others.length?others:pool;}
function choosePracticeRival(){const pool=practiceRivalPool();if(!pool.length)throw Error('No characters available for this season');practiceRival={season:currentSeason,player:selected,index:pool[Math.floor(Math.random()*pool.length)].index};return practiceRival.index;}
function practiceRivalIndex(){if(!practiceRival||practiceRival.season!==currentSeason||practiceRival.player!==selected)choosePracticeRival();return practiceRival.index;}
const goBeforeFriendPresentation=go;
go=function(page){if(page==='lobby'){validateCharacter();choosePracticeRival();}goBeforeFriendPresentation(page);if(page==='lobby'){const heading=document.querySelector('#lobby .title');if(heading)heading.textContent='Your Challenger Awaits';}if(page==='invite')updateFriendLabel();if(page==='victory'){const rematch=document.querySelector('#victory button');rematch.textContent='REMATCH';rematch.onclick=start;}};
function showOnlineVictory(state,details,myId){
 const ownerWins=state.winner===state.owner;
 const winnerId=state.winner?(ownerWins?details.owner_character:details.guest_character):CHARACTER_ROSTER[selected].id;
 const champion=CHARACTER_ROSTER.find(c=>c.id===winnerId)||CHARACTER_ROSTER[0];
 go('victory');
 $('victoryTitle').textContent=!state.winner?'DRAW!':state.winner===myId?'VICTORY!':'RIVAL WINS';
 $('victoryHero').src='portrait-'+champion.id+'.webp';$('victoryHero').alt=champion.name;
 const mine=state.owner===myId?'owner':'guest',other=mine==='owner'?'guest':'owner';
 $('victoryStats').textContent=`${state.winner?champion.name+' wins':'Honors shared'} · YOU ${state.scores[mine]} · RIVAL ${state.scores[other]}`;
 const rematch=document.querySelector('#victory button');rematch.textContent='PLAY ANOTHER FRIEND MATCH';rematch.onclick=()=>{TT.leave();playMode='friend';go('invite');};
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
