(() => {
 const ns='http://www.w3.org/2000/svg';
 const shapes={
  play:'<path d="M24 75L67 18 79 12 76 28 34 83Z" fill="url(#steel)"/><path d="M20 65L43 85M22 82L15 91" stroke="url(#gold)" stroke-width="9"/><path d="M76 75L33 18 21 12 24 28 66 83Z" fill="url(#steel)"/><path d="M80 65L57 85M78 82L85 91" stroke="url(#gold)" stroke-width="9"/>',
  friends:'<path d="M13 22L40 14 64 25 60 62Q52 78 38 88Q18 76 14 58Z" fill="url(#blue)" stroke="url(#gold)" stroke-width="5"/><path d="M43 29L68 20 89 30 86 65Q80 80 66 90Q49 79 45 62Z" fill="url(#red)" stroke="url(#gold)" stroke-width="5"/><path d="M38 27V65M25 43H51M66 34V70M55 48H78" stroke="#ffe4a4" stroke-width="4"/>',
  trophy:'<path d="M29 21H12Q10 56 37 57M71 21H88Q90 56 63 57" fill="none" stroke="url(#gold)" stroke-width="8"/><path d="M26 12H74L70 44Q68 61 54 65V80H70V89H30V80H46V65Q32 61 30 44Z" fill="url(#gold)" stroke="#6e4311" stroke-width="3"/><path d="M50 23L55 33 67 35 58 43 60 55 50 49 40 55 42 43 33 35 45 33Z" fill="url(#red)" stroke="#fff2bb" stroke-width="2"/>',
  chest:'<path d="M15 47V32Q15 15 32 15H68Q85 15 85 32V47Z" fill="url(#red)" stroke="url(#gold)" stroke-width="6"/><path d="M13 45H87V84H13Z" fill="url(#red)" stroke="url(#gold)" stroke-width="6"/><path d="M29 17V84M71 17V84M13 52H87" stroke="url(#gold)" stroke-width="6"/><rect x="43" y="43" width="14" height="23" rx="3" fill="url(#gold)"/><circle cx="50" cy="53" r="3" fill="#402600"/>',
  gear:'<path d="M42 8H58L61 20 70 25 82 21 91 35 82 44V55L91 65 82 79 70 75 61 80 58 92H42L39 80 30 75 18 79 9 65 18 55V44L9 35 18 21 30 25 39 20Z" fill="url(#gold)" stroke="#5b3109" stroke-width="3"/><circle cx="50" cy="50" r="24" fill="url(#blue)" stroke="#fff0b3" stroke-width="3"/><circle cx="50" cy="50" r="12" fill="url(#red)" stroke="url(#gold)" stroke-width="4"/>',
  music:'<path d="M38 24L77 13V65" fill="none" stroke="url(#gold)" stroke-width="8"/><path d="M38 24V77M39 35L77 24" stroke="url(#gold)" stroke-width="8"/><ellipse cx="26" cy="78" rx="15" ry="11" transform="rotate(-25 26 78)" fill="url(#blue)" stroke="url(#gold)" stroke-width="3"/><ellipse cx="65" cy="67" rx="15" ry="11" transform="rotate(-25 65 67)" fill="url(#red)" stroke="url(#gold)" stroke-width="3"/>',
  crown:'<path d="M16 30L33 48 50 19 67 48 84 30 76 78H24Z" fill="url(#gold)" stroke="#73450a" stroke-width="3"/><path d="M25 65H75V81H25Z" fill="url(#red)" stroke="url(#gold)" stroke-width="4"/><path d="M50 40L56 51 50 62 44 51Z" fill="url(#blue)" stroke="#fff4ba" stroke-width="2"/>',
  back:'<path d="M48 18L15 50 48 82V62H85V38H48Z" fill="url(#gold)" stroke="#73450a" stroke-width="4"/>'
 };
 let serial=0;
 function icon(type){const id='ornate-'+(++serial);let svg=`<svg viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="gold" x2=".8" y2="1"><stop stop-color="#fff6bf"/><stop offset=".27" stop-color="#e4ad38"/><stop offset=".48" stop-color="#fff1a1"/><stop offset=".7" stop-color="#9d5a13"/><stop offset="1" stop-color="#f9cf64"/></linearGradient><linearGradient id="steel" x2="1" y2=".5"><stop stop-color="#c7eaff"/><stop offset=".48" stop-color="#fff"/><stop offset=".52" stop-color="#69859e"/><stop offset="1" stop-color="#c8e7ef"/></linearGradient><linearGradient id="red" x2=".5" y2="1"><stop stop-color="#ff8a38"/><stop offset=".45" stop-color="#bf171b"/><stop offset="1" stop-color="#410d1a"/></linearGradient><linearGradient id="blue" x2=".5" y2="1"><stop stop-color="#9befff"/><stop offset=".45" stop-color="#1976c5"/><stop offset="1" stop-color="#091d4e"/></linearGradient></defs><circle cx="50" cy="50" r="47" fill="#0a121b" stroke="url(#gold)" stroke-width="4"/>${shapes[type]||shapes.crown}</svg>`;return svg.replace(/id="(gold|steel|red|blue)"/g,(_,n)=>`id="${id}-${n}"`).replace(/url\(#(gold|steel|red|blue)\)/g,(_,n)=>`url(#${id}-${n})`);}
 const menu=document.getElementById('menu'),composition=menu.querySelector('.menu-composition');
 const kinds=['play','friends','trophy','chest','gear'];
 composition.querySelectorAll('.hit').forEach((button,i)=>{button.classList.add('ornate-action','action-'+kinds[i]);button.querySelector('.menu-icon').innerHTML=icon(kinds[i]);});
 const road=menu.querySelector('.journey-menu-button');if(road){road.classList.add('ornate-action','action-road');road.innerHTML=icon('crown')+'<span>ROAD TO THE THRONE</span>';composition.append(road);}
 const music=document.getElementById('musicBtn');
 function musicIcon(){const muted=music.textContent.includes('̸');music.dataset.muted=String(muted);music.setAttribute('aria-label',muted?'Unmute music':'Mute music');music.innerHTML=icon('music');}
 musicIcon();new MutationObserver(()=>{if(!music.querySelector('svg'))musicIcon();}).observe(music,{childList:true});
 window.ThroneIcons={icon};
 const question=document.getElementById('qtext'),counter=document.getElementById('qnumber');question.after(counter);
 const onlineCounter=document.createElement('p');onlineCounter.id='onlineQuestionNumber';onlineCounter.className='question-counter';document.getElementById('onlinePrompt').after(onlineCounter);
 document.getElementById('clock').textContent='15';document.getElementById('onlineCountdown').textContent='15';
 const onlineRow=document.createElement('div');onlineRow.className='online-score-row';const onlinePrompt=document.getElementById('onlinePrompt');onlinePrompt.before(onlineRow);onlineRow.append(document.getElementById('onlineScore'),document.getElementById('onlineCountdown'));
 function decorateNavigation(){
  document.querySelectorAll('.throne-home,.back,.journey-back').forEach(button=>{
   if(button.dataset.ornate)return;button.dataset.ornate='true';const home=button.classList.contains('throne-home');button.textContent=home?'Home':'Back';
  });
 }
 decorateNavigation();new MutationObserver(decorateNavigation).observe(document.body,{subtree:true,childList:true});
})();
