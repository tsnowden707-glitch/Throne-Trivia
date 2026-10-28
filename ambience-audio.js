// Atmosphere uses the effects control; it also continues while the game is paused.
(() => {
 const audio=new Audio('audio/effects/high-altitude-ambience.wav');
 audio.loop=true;audio.preload='none';audio.volume=.07;
 let gesture=false,speaking=false;
 const allowed=()=>gesture&&!document.hidden&&(['splash','menu'].includes(current)||window.ThronePause?.active)&&document.getElementById('effects')?.checked;
 function update(){
  audio.volume=speaking?.025:.07;
  if(allowed()){if(audio.paused)audio.play().catch(()=>{});}else audio.pause();
 }
 document.addEventListener('pointerdown',()=>{gesture=true;update();});
 document.addEventListener('screenchange',update);
 document.addEventListener('pausechange',update);
 document.addEventListener('visibilitychange',update);
 document.addEventListener('narrationstate',e=>{speaking=!!e.detail.speaking;update();});
 document.getElementById('effects')?.addEventListener('change',update);
 window.addEventListener('pagehide',()=>audio.pause());
})();
