// Reusable UI effects. Narration and music remain separately controlled.
(() => {
 const cues = {
  tap:['01-button-tap',.22], enter:['02-ember-transition',.28],
  choice:['03-choice-locked',.24], reward:['04-reward-shimmer',.32],
  chapter:['05-chapter-complete',.35], back:['06-back-exit',.25],
  countdown:['07-countdown-build',.38], roundEnd:['round-ending',.3]
 };
 const players = new Map();
 let active=null, lastAt=0, lastCue='', gesture=false, narrating=false, cueVersion=0;
 const enabled=()=>!document.hidden && document.getElementById('effects')?.checked;
 function stop(){if(active){active.pause();active.currentTime=0;active=null;}}
 function play(name){
  if(!enabled()||!gesture||!cues[name])return;
  const now=performance.now();
  if(name===lastCue&&now-lastAt<150)return;
  stop();lastCue=name;lastAt=now;cueVersion++;
  const [file,volume]=cues[name];
  let audio=players.get(name);
  if(!audio){audio=new Audio('audio/effects/'+file+(name==='roundEnd'?'.wav':'.mp3'));audio.preload='auto';players.set(name,audio);}
  audio.volume=volume*(narrating? .3:1);
  active=audio;audio.play().catch(()=>{if(active===audio)active=null;});
 }
 // Defer the tap until the action has run, so navigation receives one cue only.
 document.addEventListener('click',event=>{
  const button=event.target.closest('button');
  if(!button||button.disabled)return;
  gesture=true;
  if(button.id==='musicBtn'||button.closest('#answers'))return;
  const before=document.querySelector('.page.active')?.id, beforeCue=cueVersion;
  queueMicrotask(()=>{
   if(cueVersion!==beforeCue)return;
   const after=document.querySelector('.page.active')?.id;
   if(after==='countdown'&&before!==after)play('countdown');
   else if(before!==after)play(button.classList.contains('back')?'back':'enter');
   else play('tap');
  });
 },true);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 document.addEventListener('narrationstate',event=>{
  narrating=!!event.detail.speaking;
  if(active&&cues[lastCue])active.volume=cues[lastCue][1]*(narrating ? .3 : 1);
 });
 window.addEventListener('pagehide',stop);
 document.getElementById('effects')?.addEventListener('change',()=>{if(!enabled())stop();});
 // Explicit hooks for story rewards and chapter completion; never infer rewards
 // from opening a shop or seeing a result screen.
 window.ThroneEffects=Object.freeze({play,stop});
 let previousPage='';
 document.addEventListener('screenchange',event=>{
  const page=event.detail.page;
  if(page==='summary'||(page==='victory'&&previousPage!=='summary'))play('roundEnd');
  previousPage=page;
 });
})();
