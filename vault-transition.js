// Decorative vault doors never change match clocks, scores or saved progress.
(() => {
 const app=document.getElementById('app')||document.querySelector('.app');
 if(!app)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const overlay=document.createElement('div');
 overlay.className='vault-transition';overlay.hidden=true;overlay.setAttribute('aria-hidden','true');
 overlay.style.pointerEvents='auto';
 const video=document.createElement('video');video.playsInline=true;video.muted=true;video.defaultMuted=true;video.preload='auto';
 const loaded=fetch('video/vault-browser-silent.mp4').then(r=>{if(!r.ok)throw Error('Vault video unavailable');return r.blob();}).then(blob=>{video.src=URL.createObjectURL(blob);video.load();return true;}).catch(()=>false);
 overlay.removeAttribute('aria-hidden');overlay.setAttribute('aria-label','Vault transition');
 // Keep the cinematic outside the app's portrait sizing and transformed screens.
 const dragon=document.createElement('video');dragon.playsInline=true;dragon.preload='auto';dragon.src='video/dragon-approved-preview.mp4';
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;background:#000';video.style.display='none';dragon.style.display='none';overlay.style.background='#000';overlay.append(video,dragon,canvas);document.body.appendChild(overlay);
 const dragonLoaded=new Promise(resolve=>{dragon.addEventListener('loadeddata',()=>resolve(true),{once:true});dragon.addEventListener('error',()=>resolve(false),{once:true});dragon.load();});
 let animation=0,headStarted=false,phaseStart=0;
 const clamp=x=>Math.max(0,Math.min(1,x));
 function fit(media,cover=false){const w=media.videoWidth,h=media.videoHeight;if(!w||!h)return;const scale=(cover?Math.max:Math.min)(canvas.width/w,canvas.height/h);ctx.drawImage(media,(canvas.width-w*scale)/2,(canvas.height-h*scale)/2,w*scale,h*scale);}
 function draw(){if(overlay.hidden)return;const w=innerWidth,h=innerHeight;if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}ctx.globalAlpha=1;ctx.fillStyle='#000';ctx.fillRect(0,0,w,h);
  if(!headStarted){fit(video,true);const scale=Math.max(w/960,h/542),ox=(w-960*scale)/2,oy=(h-542*scale)/2,p=clamp((video.currentTime-6.8)/3.2),half=112*p;
   if(p>0&&dragon.readyState>=2){ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);ctx.beginPath();ctx.rect(480-half,85,half*2,542-85);ctx.clip();ctx.fillStyle='#000';ctx.fillRect(0,0,960,542);ctx.globalAlpha=.12;ctx.drawImage(dragon,290,105,380,315);ctx.globalAlpha=1;ctx.drawImage(dragon,555,350,110,100,423,189,27,24);ctx.drawImage(dragon,915,350,110,100,510,189,27,24);ctx.restore();}
  }else{const dw=dragon.videoWidth,dh=dragon.videoHeight;if(dw&&dh){
   // Preserve the full head first, then smoothly fill every viewport edge with its fire.
   const contain=Math.min(w/dw,h/dh),cover=Math.max(w/dw,h/dh),p=clamp((dragon.currentTime-2.0)/1.2),ease=p*p*(3-2*p);
   const scale=contain+(cover*1.25-contain)*ease;
   ctx.drawImage(dragon,(w-dw*scale)/2,(h-dh*scale)/2,dw*scale,dh*scale);
  }if(dragon.currentTime>=4.65)finish();}
  animation=requestAnimationFrame(draw);
 }
 function startDragon(token){if(token!==run||headStarted)return;headStarted=true;dragon.currentTime=0;dragon.muted=!document.getElementById('effects')?.checked||new URL(location.href).searchParams.get('quiet')==='1';dragon.volume=.7;dragon.play().catch(()=>{if(token===run)finish();});}
 document.getElementById('effects')?.addEventListener('change',()=>{dragon.muted=!document.getElementById('effects').checked||new URL(location.href).searchParams.get('quiet')==='1';});
 const style=document.createElement('style');style.textContent='.vault-skip{position:absolute;right:20px;bottom:20px;z-index:2;min-height:44px;padding:10px 20px;background:#17120eee;border:2px ridge #d8b05b;color:#ffe8ad;font:600 16px Georgia;cursor:pointer}.vault-transition.departing{animation:vault-reveal-out .25s cubic-bezier(.4,0,.2,1) forwards}.vault-page-arrival{animation:vault-page-arrive .25s cubic-bezier(.2,.8,.2,1) both}@keyframes vault-reveal-out{to{opacity:0}}@keyframes vault-page-arrive{from{opacity:.7}to{opacity:1}}@media(prefers-reduced-motion:reduce){.vault-transition.departing,.vault-page-arrival{animation:none}}';document.head.append(style);
 let run=0,timers=[],resolvePending=null,arriving=null;
 function cancel(){run++;timers.forEach(clearTimeout);timers=[];video.pause();dragon.pause();cancelAnimationFrame(animation);document.dispatchEvent(new CustomEvent('vaultstate',{detail:{active:false}}));arriving?.classList.remove('vault-page-arrival');arriving=null;overlay.hidden=true;overlay.classList.remove('running','departing');resolvePending?.();resolvePending=null;}
 function finish(){if(overlay.hidden||overlay.classList.contains('departing'))return;video.pause();overlay.classList.add('departing');arriving=document.getElementById(current);arriving?.classList.add('vault-page-arrival');timers.push(setTimeout(cancel,250));}
 function play(){
  cancel();
  if(reduced.matches||document.hidden)return Promise.resolve();
  const token=run;headStarted=false;
  overlay.hidden=false;void overlay.offsetWidth;overlay.classList.add('running');
  video.muted=true;video.playbackRate=4;
  return new Promise(resolve=>{
   resolvePending=resolve;video.onended=()=>startDragon(token);video.onerror=()=>{if(token===run)finish();};dragon.onended=()=>{if(token===run)finish();};dragon.onerror=()=>{if(token===run)finish();};timers.push(setTimeout(()=>{if(token===run)cancel();},15000));
   Promise.all([loaded,dragonLoaded]).then(([ok,headOK])=>{if(token!==run)return;if(!ok||!headOK){cancel();return;}video.currentTime=0;if(Number.isFinite(video.duration))video.playbackRate=video.duration/2.25;else video.onloadedmetadata=()=>{video.playbackRate=video.duration/2.25;};document.dispatchEvent(new CustomEvent('vaultstate',{detail:{active:true}}));draw();video.play().catch(()=>{if(token===run)cancel();});});
  });
 }
 let ready=Promise.resolve();
 window.ThroneVault=Object.freeze({play:()=>ready=play(),get ready(){return ready;},cancel});
 let previousPage=current;
 document.addEventListener('screenchange',e=>{
  const fromMenu=previousPage==='menu';previousPage=e.detail.page;
  // Only the three main-menu game entries use the doors. Both Play modes enter seasons.
  if(fromMenu&&['seasons','journeyStory'].includes(e.detail.page))ready=play();
  else cancel();
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel();});
 reduced.addEventListener('change',()=>{if(reduced.matches)cancel();});
 window.addEventListener('pagehide',cancel);
})();
