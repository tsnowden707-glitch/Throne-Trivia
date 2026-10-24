// Opening/menu atmosphere uses the effects control and never follows players into a round.
(() => {
 const audio=new Audio('audio/effects/high-altitude-ambience.wav');
 audio.loop=true;audio.preload='none';audio.volume=.07;
 let gesture=false,speaking=false;
 const allowed=()=>gesture&&!document.hidden&&['splash','menu'].includes(current)&&document.getElementById('effects')?.checked&&!window.ThronePause?.active;
 function update(){
  audio.volume=speaking?.025:.07;
  if(allowed()){if(audio.paused)audio.play().catch(()=>{});}else audio.pause();
 }
 document.addEventListener('pointerdown',()=>{gesture=true;update();});
 document.addEventListener('screenchange',update);
 document.addEventListener('visibilitychange',update);
 document.addEventListener('narrationstate',e=>{speaking=!!e.detail.speaking;update();});
 document.getElementById('effects')?.addEventListener('change',update);
 window.addEventListener('pagehide',()=>audio.pause());
})();
