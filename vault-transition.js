// One approved continuous cinematic; navigation owns the destination beneath it.
(()=>{
 if(!document.querySelector('.app'))return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),overlay=document.createElement('div'),video=document.createElement('video');
 overlay.className='vault-transition';overlay.hidden=true;overlay.setAttribute('aria-label','Vault transition');overlay.style.pointerEvents='auto';
 video.playsInline=true;video.preload='auto';video.src='video/vault-dragon-continuous-approved.mp4';video.volume=.7;video.style.cssText='display:block;width:100%;height:100%;object-fit:cover';
 overlay.append(video);document.body.appendChild(overlay);
 const style=document.createElement('style');style.textContent='.vault-transition.departing{transition:opacity .25s ease-out;opacity:0}.vault-transition{opacity:1;background:#000 url("video/vault-dragon-start.jpg") center/cover no-repeat}.vault-transition.running{opacity:1}.vault-transition.running.departing{opacity:0}';document.head.append(style);
 let run=0,resolvePending=null,fadeTimer=null,watchdog=null,ready=Promise.resolve(),revealReady=Promise.resolve(),finishing=false;
 function audioSetting(){video.muted=!document.getElementById('effects')?.checked||new URL(location.href).searchParams.get('quiet')==='1';}
 function state(active){document.dispatchEvent(new CustomEvent('vaultstate',{detail:{active,embeddedAudio:true}}));}
 function cancel(){run++;finishing=false;clearTimeout(fadeTimer);clearTimeout(watchdog);fadeTimer=watchdog=null;video.pause();overlay.hidden=true;overlay.classList.remove('running','departing');state(false);const resolve=resolvePending;resolvePending=null;resolve?.();}
 function finish(token){if(token!==run||overlay.hidden||finishing)return;finishing=true;Promise.resolve(revealReady).catch(()=>{}).then(()=>{if(token!==run||overlay.hidden)return;overlay.classList.add('departing');fadeTimer=setTimeout(()=>{if(token===run)cancel();},250);});}
 function play(options={}){cancel();revealReady=options.revealReady||Promise.resolve();if(reduced.matches||document.hidden)return Promise.resolve();const token=run;audioSetting();video.playbackRate=1;video.style.visibility='hidden';video.currentTime=0;overlay.hidden=false;overlay.classList.add('running');state(true);
  return new Promise(resolve=>{resolvePending=resolve;video.onended=()=>finish(token);video.onerror=()=>{if(token===run)cancel();};video.ontimeupdate=()=>{if(Number.isFinite(video.duration)&&video.currentTime>=video.duration-.25)finish(token);};watchdog=setTimeout(()=>{if(token===run)cancel();},15000);
   const showFirstFrame=()=>{if(token===run&&!overlay.hidden)video.style.visibility='visible';};if(video.requestVideoFrameCallback)video.requestVideoFrameCallback(showFirstFrame);else video.onplaying=showFirstFrame;
   video.play().catch(()=>{if(token!==run)return;video.muted=true;video.play().catch(()=>{if(token===run)cancel();});});
  });
 }
 document.getElementById('effects')?.addEventListener('change',audioSetting);
 window.ThroneVault=Object.freeze({play:options=>ready=play(options),get ready(){return ready;},cancel});
 let previousPage=current;
 document.addEventListener('screenchange',e=>{const fromMenu=previousPage==='menu';previousPage=e.detail.page;if(fromMenu&&['seasons','journeyStory'].includes(e.detail.page))ready=play({revealReady:e.detail.page==='journeyStory'?Promise.resolve().then(()=>window.ThroneJourney?.prepareEntry?.()):Promise.resolve()});else cancel();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel();});reduced.addEventListener('change',()=>{if(reduced.matches)cancel();});window.addEventListener('pagehide',cancel);
})();
