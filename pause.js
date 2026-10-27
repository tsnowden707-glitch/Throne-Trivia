(() => {
 let paused=false,pending=null;
 const overlay=document.createElement('div');overlay.className='pause-overlay';overlay.hidden=true;
 overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Game paused');
 overlay.innerHTML='<div class="pause-panel"><h2>Paused</h2><p>Your question and time are saved here.</p><button>Resume</button></div>';
 document.body.append(overlay);
 const controls=[];
 for(const page of ['quiz','countdown']){const b=document.createElement('button');b.className='pause-control';b.textContent='Ⅱ';b.setAttribute('aria-label','Pause game');b.onclick=()=>set(true);document.getElementById(page).append(b);controls.push(b);}
 function set(value){
  if(value&&!['quiz','countdown'].includes(current))return;
  paused=value;overlay.hidden=!value;
  if(value){ThroneVoice.pause();ThroneEffects.stop();document.getElementById('music').pause();overlay.querySelector('button').focus();}
  else{ThroneVoice.resume();musicPlay();const callback=pending;pending=null;callback?.();controls.find(b=>b.parentElement.id===current)?.focus();}
 }
 overlay.querySelector('button').onclick=()=>set(false);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&['quiz','countdown'].includes(current)){e.preventDefault();set(!paused);}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&['quiz','countdown'].includes(current))set(true);});
 document.addEventListener('screenchange',()=>{paused=false;pending=null;overlay.hidden=true;});
 window.ThronePause={get active(){return paused;},gate(callback){if(paused)pending=callback;else callback();}};
})();
