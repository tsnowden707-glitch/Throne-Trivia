// Home exits navigation directly; existing Back actions remain untouched.
(() => {
 function home(){
  window.ThroneCards?.close();
  window.ThroneCinematics?.cancel();
  window.ThroneVault?.cancel();
  window.ThroneVoice?.stop();
  window.ThroneEffects?.stop();
  if(window.TT?.getRoomCode?.())TT.leave();else go('menu');
 }
 function attach(parent){
  if(parent.querySelector(':scope > .throne-home'))return;
  const b=document.createElement('button');b.className='throne-home';b.type='button';
  b.setAttribute('aria-label','Home');b.innerHTML='<span aria-hidden="true">♛</span> Home';b.onclick=home;parent.append(b);
 }
 function scan(){
  document.querySelectorAll('.page:not(#splash):not(#menu),.journey-card-stage,.cards-art-stage').forEach(attach);
 }
 const style=document.createElement('style');style.textContent='.throne-home{position:absolute;top:max(8px,env(safe-area-inset-top));right:max(12px,env(safe-area-inset-right));z-index:30;display:flex;gap:6px;align-items:center;justify-content:center;min-height:40px;padding:6px 14px;border:1px solid #c6a45a;border-radius:24px;background:linear-gradient(#413223,#19120c);color:#f5dfaa;font:600 14px Georgia,serif;box-shadow:0 2px 8px #0009;cursor:pointer;-webkit-tap-highlight-color:transparent}.throne-home span{color:#e9bb54;font-size:20px}.throne-home:active{filter:brightness(1.3);transform:scale(.97)}.throne-home:focus-visible{outline:2px solid #f4d482;outline-offset:3px}';document.head.append(style);
 scan();new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});
})();
