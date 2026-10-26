// Video is decorative; approved narration is the only spoken audio track.
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const opening=document.createElement('video');
 opening.className='opening-video';opening.src='video/opening.mp4';
 opening.muted=true;opening.playsInline=true;opening.preload='metadata';
 opening.poster='approved-splash.png';opening.setAttribute('aria-hidden','true');
 document.querySelector('.splashComposition').prepend(opening);
 // The entrance plays once; subsequent loops omit the unfinished title reveal.
 opening.addEventListener('ended',()=>{opening.currentTime=3;if(current==='splash'&&!reduced.matches)opening.play().catch(()=>{});});
 const portrait=document.createElement('video');
 portrait.className='edward-intro';portrait.src='video/edward-intro.mp4';
 portrait.muted=true;portrait.playsInline=true;portrait.loop=true;portrait.preload='metadata';
 portrait.setAttribute('aria-label','Sir Edward');
 document.getElementById('menu').append(portrait);
 function update(page){
  opening.hidden=activeKingdomTheme!=='royal-castle'||matchMedia('(orientation:landscape)').matches;
  if(page==='splash'&&!opening.hidden&&!document.hidden&&!reduced.matches)opening.play().catch(()=>{});else opening.pause();
  const show=page==='menu'||page==='countdown';
  portrait.hidden=!show;
  if(show){document.getElementById(page).append(portrait);if(!document.hidden&&!reduced.matches)portrait.play().catch(()=>{});}
  else portrait.pause();
 }
 document.addEventListener('screenchange',e=>update(e.detail.page));
 document.addEventListener('visibilitychange',()=>update(current));
 window.addEventListener('artworkchange',()=>update(current));
 reduced.addEventListener('change',()=>update(current));
 const enter=enterKingdoms;
 enterKingdoms=function(){enter();ThroneVoice.announce('welcome');};
 // Local results use only this player's outcome. Online results supply their
 // authenticated player identity and never use the practice scores.
 document.addEventListener('screenchange',e=>{
  if(e.detail.page==='countdown')(window.ThroneVault?.ready||Promise.resolve()).then(()=>{if(current==='countdown')ThroneVoice.announce('countdown');});
  if(e.detail.page==='victory'&&playMode==='practice')ThroneVoice.announce(score>foe?'victory':score<foe?'defeat':'tie');
 });
 const originalStart=start;let rematchPending=false;
 start=function(){
  if(current!=='victory'){originalStart();return;}
  if(rematchPending)return;
  rematchPending=true;
  ThroneVoice.announce('rematch',()=>{rematchPending=false;if(current==='victory')originalStart();});
 };
 document.addEventListener('screenchange',e=>{if(e.detail.page!=='victory')rematchPending=false;});
 const onlineVictory=showOnlineVictory;
 showOnlineVictory=function(state,details,myId){onlineVictory(state,details,myId);(window.ThroneVault?.ready||Promise.resolve()).then(()=>{if(current==='victory')ThroneVoice.announce(!state.winner?'tie':state.winner===myId?'victory':'defeat');});};
 update(current);
})();
