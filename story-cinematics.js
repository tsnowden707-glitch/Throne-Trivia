// Short, skippable presentation only. Saved choices are committed before playback.
(() => {
 let cancelCurrent=null;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function play(name){
  cancelCurrent?.();if(reduced.matches||document.hidden)return Promise.resolve();
  return new Promise(resolve=>{
   const raven=name==='raven',overlay=document.createElement('div'),video=document.createElement('video'),skip=document.createElement('button');
   overlay.className='story-cinematic'+(raven?' raven-flight':'');overlay.setAttribute('role','dialog');overlay.setAttribute('aria-label',raven?'Send a Raven':'Story moment');
   video.src=raven?'video/cinematics/raven-original.mp4':'video/cinematics/'+name+'-'+(matchMedia('(orientation:portrait)').matches?'portrait':'landscape')+'.mp4';video.muted=true;video.playsInline=true;video.preload='auto';video.playbackRate=raven?.75:1;
   skip.textContent='Skip';overlay.append(video,skip);document.body.append(overlay);let finished=false,lastCue=-1;
   const end=()=>{if(finished)return;finished=true;clearTimeout(timeout);video.pause();overlay.remove();document.removeEventListener('visibilitychange',hidden);document.removeEventListener('screenchange',end);if(cancelCurrent===end)cancelCurrent=null;resolve();};
   const hidden=()=>{if(document.hidden)end();};cancelCurrent=end;let timeout=setTimeout(end,30000);skip.onclick=end;
   video.onloadedmetadata=()=>{if(raven)video.currentTime=7.3;video.play().catch(end);};video.onplaying=()=>{clearTimeout(timeout);};video.onwaiting=()=>{clearTimeout(timeout);timeout=setTimeout(end,30000);};video.onended=end;video.onerror=end;
   video.ontimeupdate=()=>{const t=raven?(video.currentTime-7.3)/.75:video.currentTime;const beat=raven?(t<1.3?0:1):0;if(beat!==lastCue){lastCue=beat;window.ThroneEffects?.play(raven?'enter':name==='betrayal-revealed'?'choice':name==='throne-earned'?'chapter':'reward');}if(raven&&video.currentTime>9.45)overlay.classList.add('wing-cover');};
   document.addEventListener('visibilitychange',hidden);document.addEventListener('screenchange',end);skip.focus();
  });
 }
 window.ThroneCinematics={play,cancel:()=>cancelCurrent?.()};
})();
