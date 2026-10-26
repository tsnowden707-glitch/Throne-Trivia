// Align presentation to measured musical attacks, never stretch spoken words.
(() => {
 let timing=null;fetch('card-music-timing.json').then(r=>r.json()).then(x=>timing=x).catch(()=>{});
 async function nextAccent(maxWait=.55){
  const music=document.getElementById('music');
  if(!timing||!music||music.paused||music.muted||music.volume===0||document.hidden)return;
  const t=music.currentTime,mark=timing.accentSeconds.find(x=>x>=t+.025);
  const delay=mark===undefined?timing.duration-t+timing.accentSeconds[0]:mark-t;
  if(delay>0&&delay<=maxWait)await new Promise(resolve=>setTimeout(resolve,delay*1000));
 }
 function follow(element){let frame=0,last=-1,stopped=false;const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const tick=()=>{if(stopped||!element.isConnected)return;const music=document.getElementById('music');if(timing&&music&&!music.paused&&!music.muted&&!document.hidden&&!reduced.matches){const t=music.currentTime;const i=timing.accentSeconds.findIndex(x=>x>=t-.045&&x<=t+.025);if(i>=0&&i!==last){last=i;element.animate([{filter:'brightness(1.45)'},{filter:'brightness(1)'}],{duration:280,easing:'ease-out'});}}frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);return()=>{stopped=true;cancelAnimationFrame(frame);};
 }
 window.ThroneCardRhythm={nextAccent,follow};
})();
