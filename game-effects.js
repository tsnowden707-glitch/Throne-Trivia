// Reusable UI effects. Narration and music remain separately controlled.
(() => {
 const cues = {
  tap:['menu-switch',.38], enter:['menu-switch',.38], character:['character-selection',.48], correct:['correct-answer',.48], unlock:['unlock-reward',.48],
  choice:['03-choice-locked',.24], reward:['04-reward-shimmer',.32], coin:['coin-award',.48],
  chapter:['05-chapter-complete',.35], back:['menu-switch',.38],
  countdown:['07-countdown-build',.38], roundEnd:['round-ending',.3]
 };
 // Rejected buzzer removed. Wrong answers retain inline red feedback until a replacement is reviewed.
 const players = new Map();
 let active=null, lastAt=0, lastCue='', gesture=false, narrating=false, cueVersion=0,vaultActive=false;
 const vaultAudio=new Audio('audio/effects/02-ember-transition.mp3');vaultAudio.preload='auto';vaultAudio.volume=.7;
 const enabled=()=>!document.hidden && document.getElementById('effects')?.checked;
 const rewardQueue=[];
 const coinDuck=active=>document.dispatchEvent?.(new CustomEvent('coinrewardstate',{detail:{active}}));
 function stop(){rewardQueue.length=0;coinDuck(false);if(active){active.onended=null;active.onerror=null;active.pause();active.currentTime=0;active=null;}}
 function play(name){
  if(!enabled()||!gesture||!cues[name]||vaultActive)return;
  const now=performance.now();
  if(name===lastCue&&now-lastAt<150)return;
  if((name==='coin'||name==='unlock')&&active&&['roundEnd','coin','unlock'].includes(lastCue)){
   if(name!==lastCue&&!rewardQueue.includes(name))rewardQueue.push(name);
   return;
  }
  const queued=(name==='coin'||name==='unlock')?rewardQueue.splice(0):[];stop();rewardQueue.push(...queued);lastCue=name;lastAt=now;cueVersion++;
  const [file,volume]=cues[name];
  let audio=players.get(name);
  if(!audio){audio=new Audio('audio/effects/'+file+(name==='roundEnd'?'.wav':'.mp3'));audio.preload='auto';players.set(name,audio);}
  audio.volume=volume*(narrating? .3:1);
  const finish=()=>{if(active!==audio)return;active=null;if(name==='coin')coinDuck(false);const next=rewardQueue.shift();if(next)play(next);};
  audio.onended=finish;audio.onerror=finish;
  active=audio;if(name==='coin')coinDuck(true);audio.play().catch(finish);
 }
 // Defer the tap until the action has run, so navigation receives one cue only.
 document.addEventListener('click',event=>{
  const button=event.target.closest('button');
  if(!button||button.disabled)return;
  gesture=true;
  if(button.id==='musicBtn'||button.closest('#answers')||button.closest('#onlineLiveOptions'))return;
  const before=document.querySelector('.page.active')?.id, beforeCue=cueVersion;
  queueMicrotask(()=>{
   if(cueVersion!==beforeCue)return;
   const after=document.querySelector('.page.active')?.id;
   if(after==='countdown'&&before!==after)play('countdown');
   else if(before!==after)play(button.classList.contains('back')?'back':'enter');
   else if(button.classList.contains('portrait'))play('character');
   else play('tap');
  });
 },true);
 function stopVault(){vaultAudio.pause();vaultAudio.currentTime=0;}
 document.addEventListener('vaultstate',e=>{vaultActive=!!e.detail.active;if(!vaultActive){stopVault();return;}stop();if(enabled()&&gesture&&!e.detail.embeddedAudio){vaultAudio.currentTime=0;vaultAudio.play().catch(()=>{});}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();stopVault();}});
 document.addEventListener('narrationstate',event=>{
  narrating=!!event.detail.speaking;
  if(active&&cues[lastCue])active.volume=cues[lastCue][1]*(narrating ? .3 : 1);
 });
 window.addEventListener('pagehide',()=>{stop();stopVault();});
 document.getElementById('effects')?.addEventListener('change',()=>{if(!enabled()){stop();stopVault();}});
 // Explicit hooks for story rewards and chapter completion; never infer rewards
 // from opening a shop or seeing a result screen.
 window.ThroneEffects=Object.freeze({play,stop});
 const priorSound=sound;sound=function(kind){if(kind==='right'||kind==='wrong'){play(kind==='right'?'correct':'wrong');return;}return priorSound.apply(this,arguments);};
 let previousPage='';
 document.addEventListener('screenchange',event=>{
  const page=event.detail.page;
  if(page==='summary'||(page==='victory'&&previousPage!=='summary'))play('roundEnd');
  previousPage=page;
 });
})();
