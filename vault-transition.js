// Decorative vault doors never change match clocks, scores or saved progress.
(() => {
 const app=document.getElementById('app')||document.querySelector('.app');
 if(!app)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const overlay=document.createElement('div');
 overlay.className='vault-transition';overlay.hidden=true;overlay.setAttribute('aria-hidden','true');
 overlay.style.pointerEvents='auto';
 const video=document.createElement('video');video.playsInline=true;video.muted=true;video.defaultMuted=true;video.preload='auto';video.style.cssText='width:100%;height:100%;object-fit:cover;display:block';
 const loaded=fetch('video/vault-browser-silent.mp4').then(r=>{if(!r.ok)throw Error('Vault video unavailable');return r.blob();}).then(blob=>{video.src=URL.createObjectURL(blob);video.load();return true;}).catch(()=>false);
 overlay.removeAttribute('aria-hidden');overlay.setAttribute('aria-label','Vault transition');
 overlay.append(video);app.appendChild(overlay);
 const style=document.createElement('style');style.textContent='.vault-skip{position:absolute;right:20px;bottom:20px;z-index:2;min-height:44px;padding:10px 20px;background:#17120eee;border:2px ridge #d8b05b;color:#ffe8ad;font:600 16px Georgia;cursor:pointer}.vault-transition.departing{animation:vault-reveal-out .65s ease-in forwards}.vault-page-arrival{animation:vault-page-arrive .65s ease-out both}@keyframes vault-reveal-out{to{transform:scale(1.35);opacity:0}}@keyframes vault-page-arrive{from{transform:scale(1.08);filter:brightness(.7)}to{transform:scale(1);filter:brightness(1)}}@media(prefers-reduced-motion:reduce){.vault-transition.departing,.vault-page-arrival{animation:none}}';document.head.append(style);
 let run=0,timers=[],resolvePending=null;
 function cancel(){run++;timers.forEach(clearTimeout);timers=[];video.pause();overlay.hidden=true;overlay.classList.remove('running','departing');resolvePending?.();resolvePending=null;}
 function finish(){if(overlay.hidden||overlay.classList.contains('departing'))return;video.pause();overlay.classList.add('departing');const destination=document.getElementById(current);destination?.classList.add('vault-page-arrival');timers.push(setTimeout(()=>{destination?.classList.remove('vault-page-arrival');cancel();},650));}
 function play(){
  cancel();
  if(reduced.matches||document.hidden)return Promise.resolve();
  const token=run;
  overlay.hidden=false;void overlay.offsetWidth;overlay.classList.add('running');
  video.muted=true;
  return new Promise(resolve=>{
   resolvePending=resolve;video.onended=()=>{if(token===run)finish();};video.onerror=()=>{if(token===run)finish();};
   loaded.then(ok=>{if(token!==run)return;if(!ok){cancel();return;}video.currentTime=0;window.ThroneEffects?.play('enter');video.play().catch(()=>{if(token===run)cancel();});});
  });
 }
 let ready=Promise.resolve();
 window.ThroneVault=Object.freeze({play:()=>ready=play(),get ready(){return ready;},cancel});
 let previousPage=current;
 document.addEventListener('screenchange',e=>{
  const fromMenu=previousPage==='menu';previousPage=e.detail.page;
  if(fromMenu||e.detail.page==='countdown'||e.detail.page==='summary'||(e.detail.page==='victory'&&playMode!=='practice'))ready=play();
  else cancel();
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel();});
 reduced.addEventListener('change',()=>{if(reduced.matches)cancel();});
 window.addEventListener('pagehide',cancel);
 // Animate before sending READY, never over an active server-timed question.
 if(window.TT?.ready){
  const readyForMatch=TT.ready;let preparing=false;
  TT.ready=async function(){
   if(preparing)return;preparing=true;
   const page=current;
   try{ready=play();await ready;if(current===page)await readyForMatch();}
   finally{preparing=false;}
  };
 }
})();
