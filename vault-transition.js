// Decorative vault doors never change match clocks, scores or saved progress.
(() => {
 const app=document.getElementById('app')||document.querySelector('.app');
 if(!app)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const overlay=document.createElement('div');
 overlay.className='vault-transition';overlay.hidden=true;overlay.setAttribute('aria-hidden','true');
 const door=side=>`<div class="vault-door vault-${side}"><div class="vault-rivets"></div><div class="vault-inset"><div class="vault-crest">♛</div><div class="vault-wheel"><i></i><i></i><i></i><b></b></div><div class="vault-bolts"><i></i><i></i><i></i></div></div></div>`;
 overlay.innerHTML=door('left')+door('right');app.appendChild(overlay);
 let run=0,timers=[],resolvePending=null;
 function cancel(){run++;timers.forEach(clearTimeout);timers=[];overlay.hidden=true;overlay.classList.remove('running');resolvePending?.();resolvePending=null;}
 function play(){
  cancel();
  if(reduced.matches||document.hidden)return Promise.resolve();
  const token=run;
  overlay.hidden=false;void overlay.offsetWidth;overlay.classList.add('running');
  const cue=(at,name)=>timers.push(setTimeout(()=>{if(token===run)window.ThroneEffects?.play(name);},at));
  cue(280,'choice');cue(760,'enter');
  return new Promise(resolve=>{resolvePending=resolve;timers.push(setTimeout(()=>{if(token===run)cancel();},1450));});
 }
 let ready=Promise.resolve();
 window.ThroneVault=Object.freeze({play:()=>ready=play(),get ready(){return ready;},cancel});
 document.addEventListener('screenchange',e=>{
  if(e.detail.page==='countdown'||e.detail.page==='summary'||(e.detail.page==='victory'&&playMode!=='practice'))ready=play();
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
