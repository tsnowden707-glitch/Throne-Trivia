// Video is decorative; approved narration is the only spoken audio track.
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const opening=document.createElement('video');
 opening.className='opening-video';
 opening.muted=true;opening.playsInline=true;opening.preload='metadata';
 opening.poster='entrance-fallback.png';opening.setAttribute('aria-hidden','true');opening.loop=true;
 document.querySelector('.splashComposition').prepend(opening);
 // Preserve the approved complete chair animation and baked-in soft loop.
 // A fully loaded Blob avoids the range-seeking stalls seen in the preview.
 const openingSources=new Map();let requestedSource='';
 async function setOpeningSource(page){
  const tall=matchMedia('(orientation:portrait)').matches;
  const file=page==='menu'?(tall?'menu-fire-portrait.mp4':'menu-fire-landscape.mp4'):(tall?'menu-fire-portrait.mp4':'entrance-soft-loop.mp4');
  const poster=page==='menu'?(tall?'menu-fire-portrait.jpg':'menu-fire-landscape.jpg'):(tall?'menu-fire-portrait.jpg':'entrance-fallback.png');
  opening.dataset.portrait=String(tall);opening.parentElement?.classList.toggle('portrait-cinematic',tall);
  if(file===requestedSource)return;
  requestedSource=file;opening.poster=poster;
  try{if(!openingSources.has(file))openingSources.set(file,fetch(file).then(r=>{if(!r.ok)throw Error('Video unavailable');return r.blob();}).then(blob=>URL.createObjectURL(blob)));
   const url=await openingSources.get(file);if(file!==requestedSource)return;opening.src=url;
   if(['splash','menu'].includes(current)&&!document.hidden&&!reduced.matches)opening.play().catch(()=>{});
  }catch{openingSources.delete(file);requestedSource='';}
 }
 window.addEventListener('resize',()=>update(current));
 const portrait=document.createElement('video');
 portrait.className='edward-intro';portrait.src='video/edward-intro.mp4';
 portrait.muted=true;portrait.playsInline=true;portrait.loop=true;portrait.preload='metadata';
 portrait.setAttribute('aria-label','Sir Edward');
 portrait.hidden=true;
 document.getElementById('countdown').append(portrait);
 function update(page){
  const surface=page==='menu'?document.querySelector('#menu .menu-composition'):document.querySelector('.splashComposition');
  if(opening.parentElement!==surface)surface.prepend(opening);
  if(['splash','menu'].includes(page))setOpeningSource(page);
  opening.hidden=activeKingdomTheme!=='royal-castle';document.querySelector('#menu .menu-composition').classList.toggle('animated-menu',!opening.hidden);
  if(['splash','menu'].includes(page)&&!opening.hidden&&!document.hidden&&!reduced.matches)opening.play().catch(()=>{});else opening.pause();
  const show=page==='countdown';
  portrait.hidden=!show;
  if(show){document.getElementById(page).append(portrait);if(!document.hidden&&!reduced.matches)portrait.play().catch(()=>{});}
  else portrait.pause();
 }
 document.addEventListener('screenchange',e=>update(e.detail.page));
 document.addEventListener('visibilitychange',()=>update(current));
 window.addEventListener('artworkchange',()=>update(current));
 reduced.addEventListener('change',()=>update(current));
 let entering=false;
 function welcome(){
  return new Promise(resolve=>{
   window.ThroneVoice?.stop();
   const panel=document.createElement('div'),clip=document.createElement('video'),skip=document.createElement('button');
   panel.className='edward-welcome-screen';panel.setAttribute('role','dialog');panel.setAttribute('aria-label',"Sir Edward's welcome");panel.setAttribute('aria-modal','true');
   clip.src='video/edward-welcome-lipsynced.mp4';clip.playsInline=true;clip.preload='auto';clip.muted=new URL(location.href).searchParams.get('quiet')==='1'||document.getElementById('narrate')?.checked===false;
   const stage=document.createElement('div');stage.className='edward-welcome-stage';stage.append(clip);clip.poster='video/edward-welcome-poster.jpg';
   for(const [x,y,size] of [[2.5,33,7],[7,37,5],[74,47,5],[97,50,18]]){const light=document.createElement('i');light.className='edward-firelight';light.style.cssText=`left:${x}%;top:${y}%;width:${size}%;height:${size}%;animation-delay:-${x/10}s`;stage.append(light);}
   skip.textContent='Skip';skip.className='edward-welcome-skip';panel.append(stage,skip);document.body.append(panel);let done=false;
   const speaking=value=>document.dispatchEvent(new CustomEvent('narrationstate',{detail:{speaking:value,src:clip.src}}));
   const finish=()=>{if(done)return;done=true;clip.pause();speaking(false);panel.remove();document.removeEventListener('visibilitychange',visibility);resolve();};
   const visibility=()=>{if(document.hidden)clip.pause();else clip.play().catch(()=>{});};
   document.addEventListener('visibilitychange',visibility);skip.onclick=finish;clip.onended=finish;clip.onerror=finish;clip.onplaying=()=>speaking(!clip.muted);skip.focus();clip.play().catch(()=>{skip.textContent='Continue';});
  });
 }
 window.ThroneWelcome={play:welcome};
 enterKingdoms=async function(){if(entering)return;entering=true;opening.pause();try{await welcome();enteredKingdoms=true;go('menu');await window.ThroneVault?.play();}finally{entering=false;}};
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
