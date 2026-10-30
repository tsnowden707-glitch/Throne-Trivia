// One narration channel prevents overlapping speakers and stale callbacks.
(() => {
 const audioPlayer=new Audio();audioPlayer.preload='none';let player=audioPlayer,token=0,finish=null,hiddenPaused=false,captionSrc='';
 let captionFrame=0;const observed=new WeakSet();
 function progress(){document.dispatchEvent(new CustomEvent('narrationprogress',{detail:{src:captionSrc,time:player.currentTime,duration:player.duration}}));}
 function captionTick(){cancelAnimationFrame(captionFrame);if(player.paused||player.ended)return;progress();captionFrame=requestAnimationFrame(captionTick);}
 function observe(media){if(observed.has(media))return;observed.add(media);media.addEventListener('timeupdate',()=>{if(media===player)progress();});media.addEventListener('playing',()=>{if(media===player){document.dispatchEvent(new CustomEvent('narrationplaying',{detail:{src:captionSrc,time:player.currentTime}}));captionTick();}});media.addEventListener('pause',()=>{if(media===player)cancelAnimationFrame(captionFrame);});}
 observe(audioPlayer);
 const enabled=()=>document.getElementById('narrate')?.checked;
 function stop(){token++;hiddenPaused=false;player.onloadedmetadata=null;player.pause();player.removeAttribute('src');player.load();finish=null;document.dispatchEvent(new CustomEvent('narrationstate',{detail:{speaking:false}}));}
 function play(src,callback=()=>{},offset=0,media=null,spokenSource=src){
  stop();player=media||audioPlayer;observe(player);captionSrc=spokenSource;const own=token;
  let ended=false;
  const done=()=>{if(ended||own!==token)return;ended=true;finish=null;document.dispatchEvent(new CustomEvent('narrationstate',{detail:{speaking:false}}));callback();};
  finish=done;
  if(!enabled()||document.hidden){queueMicrotask(done);return;}
  player.onloadedmetadata=null;player.muted=new URL(location.href).searchParams.get("quiet")==="1";player.src=src;player.playbackRate=1;player.onended=done;player.onerror=()=>{if(media&&own===token)play(spokenSource,callback,offset);else done();};
  document.dispatchEvent(new CustomEvent('narrationstate',{detail:{speaking:true,src:spokenSource}}));
  const start=()=>{if(own!==token)return;if(offset>0){if(offset>=player.duration){done();return;}player.currentTime=offset;}player.play().catch(done);};
  if(offset>0&&player.readyState<1)player.onloadedmetadata=start;else start();
 }
 // Only verified authentic unlock recordings belong here; missing recordings remain silent.
 const unlockRecordings=Object.freeze({});
 function unlockCharacter(id){
  let cancelled=false,started=false;const key='throne_character_voice_'+id;
  const sources=unlockRecordings[id];
  if(!sources||localStorage.getItem(key)||!enabled())return ()=>{};
  const wait=()=>{if(cancelled)return;if(finish){setTimeout(wait,100);return;}started=true;localStorage.setItem(key,'1');let i=0;const next=()=>{if(!cancelled&&i<sources.length)play(sources[i++],next);};next();};wait();
  const cancel=()=>{cancelled=true;document.removeEventListener('screenchange',cancel);if(started)stop();};document.addEventListener('screenchange',cancel,{once:true});return cancel;
 }
 const announcements={welcome:'01-welcome',arrival:'02-opponent-arrived',countdown:'03-countdown',victory:'04-victory',defeat:'05-defeat',tie:'06-tie',rematch:'07-rematch'};
 const normalized=s=>s.replace(/[’]/g,"'").replace(/\s+/g,' ').trim();
 const byText=new Map(BANK.map(q=>[normalized(q.q),q.id]));
 window.ThroneVoice={play,stop,unlockCharacter,unlockRecordings,video:(media,src,spokenSource,done)=>play(src,done,0,media,spokenSource),pause:()=>player.pause(),resume:()=>{if(player.src&&enabled())player.play().catch(()=>finish?.());},questionByText:(text,done=()=>{},offset=0)=>{const id=byText.get(normalized(text));if(id)play('audio/edward/questions/'+id+'.mp3',done,offset);else queueMicrotask(done);},question:(id,done)=>play('audio/edward/questions/'+id+'.mp3',done),announce:(name,done)=>play('audio/edward/announcements/'+announcements[name]+'.mp3',done),bella:(id,done)=>play('audio/bella/'+id+'.mp3',done)};
 narrate=function(text,callback){const ready=()=>window.ThronePause?ThronePause.gate(callback):callback();const id=match?.[index]?.id||byText.get(normalized(text));if(id)ThroneVoice.question(id,ready);else queueMicrotask(ready);};
 const priorGo=go;
 go=function(page){stop();priorGo(page);document.dispatchEvent(new CustomEvent('screenchange',{detail:{page}}));};
 document.getElementById('narrate').addEventListener('change',()=>{if(!enabled()){player.pause();finish?.();}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){hiddenPaused=!player.paused;player.pause();}else if(hiddenPaused){hiddenPaused=false;if(typeof current!=='undefined'&&current==='ttOnline')return;if(!window.ThronePause?.active)player.play().catch(()=>finish?.());}});
 window.addEventListener('pagehide',stop);
 const music=document.getElementById('music');let normalVolume=null,speaking=false,vault=false,coinReward=false,fade=0;
 function duck(){
  cancelAnimationFrame(fade);const active=speaking||vault||coinReward;
  if(active&&normalVolume===null)normalVolume=music.volume;
  if(normalVolume===null)return;
  const target=normalVolume*(vault?.22:speaking?.3:coinReward?.55:1),from=music.volume,start=performance.now();
  function step(now){const t=Math.min(1,(now-start)/180);music.volume=from+(target-from)*t;if(t<1)fade=requestAnimationFrame(step);else if(!speaking&&!vault&&!coinReward)normalVolume=null;}
  fade=requestAnimationFrame(step);
 }
 document.addEventListener('narrationstate',e=>{speaking=!!e.detail.speaking;duck();});
 document.addEventListener('vaultstate',e=>{vault=!!e.detail.active&&!!document.getElementById('effects')?.checked;duck();});
 document.addEventListener('coinrewardstate',e=>{coinReward=!!e.detail.active&&!!document.getElementById('effects')?.checked;duck();});
 document.getElementById('effects')?.addEventListener('change',()=>{if(!document.getElementById('effects').checked){vault=false;duck();}});
})();
