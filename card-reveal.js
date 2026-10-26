// Presentation only: the caller must save the earned card before showing it.
(() => {
 let tail=Promise.resolve();
 function show(card){
  const task=tail.then(async()=>{const ready=new Image();ready.src=card.image;try{await ready.decode();}catch{}await window.ThroneCardRhythm?.nextAccent();return new Promise(resolve=>{
   const previous=document.activeElement,dialog=document.createElement('dialog');
   dialog.className='card-reveal '+String(card.rarity||'COMMON').toLowerCase();
   dialog.setAttribute('aria-label','Journey card earned');
   const glow=document.createElement('div');glow.className='card-reveal-glow';glow.setAttribute('aria-hidden','true');
   const image=document.createElement('img');image.src=card.image;image.alt=card.name;image.className='card-reveal-art';
   const label=document.createElement('h2');label.textContent='Journey Card Earned';
   const collect=document.createElement('button');collect.textContent='Collect';
   let closing=false,stopRhythm=()=>{};
   const finish=()=>{if(closing)return;closing=true;stopRhythm();collect.disabled=true;dialog.classList.add('collecting');setTimeout(()=>{dialog.close();dialog.remove();if(previous?.isConnected)previous.focus();resolve();},matchMedia('(prefers-reduced-motion: reduce)').matches?0:360);};
   collect.onclick=finish;dialog.addEventListener('cancel',e=>{e.preventDefault();finish();});
   image.onerror=()=>{image.hidden=true;label.textContent=card.name+' earned';};
   dialog.append(glow,label,image,collect);document.body.append(dialog);dialog.showModal();collect.focus();stopRhythm=window.ThroneCardRhythm?.follow(glow)||(()=>{});
   window.ThroneEffects?.play(card.rarity==='LEGENDARY'?'chapter':'reward');
  });});
  tail=task.catch(()=>{});return task;
 }
 window.ThroneCardReveal=Object.freeze({show});
})();
