// One narration channel prevents overlapping speakers and stale callbacks.
(() => {
 const player=new Audio();player.preload='none';let token=0,finish=null,hiddenPaused=false;
 const enabled=()=>document.getElementById('narrate')?.checked;
 function stop(){token++;hiddenPaused=false;player.onloadedmetadata=null;player.pause();player.removeAttribute('src');player.load();finish=null;document.dispatchEvent(new CustomEvent('narrationstate',{detail:{speaking:false}}));}
 function play(src,callback=()=>{},offset=0){
  stop();const own=token;
  let ended=false;
  const done=()=>{if(ended||own!==token)return;ended=true;finish=null;document.dispatchEvent(new CustomEvent('narrationstate',{detail:{speaking:false}}));callback();};
  finish=done;
  if(!enabled()||document.hidden){queueMicrotask(done);return;}
  player.onloadedmetadata=null;player.src=src;player.playbackRate=1;player.onended=done;player.onerror=done;
  document.dispatchEvent(new CustomEvent('narrationstate',{detail:{speaking:true,src}}));
  const start=()=>{if(own!==token)return;if(offset>0){if(offset>=player.duration){done();return;}player.currentTime=offset;}player.play().catch(done);};
  if(offset>0&&player.readyState<1)player.onloadedmetadata=start;else start();
 }
 const announcements={welcome:'01-welcome',arrival:'02-opponent-arrived',countdown:'03-countdown',victory:'04-victory',defeat:'05-defeat',tie:'06-tie',rematch:'07-rematch'};
 const normalized=s=>s.replace(/[’]/g,"'").replace(/\s+/g,' ').trim();
 const byText=new Map(BANK.map(q=>[normalized(q.q),q.id]));
 window.ThroneVoice={play,stop,pause:()=>player.pause(),resume:()=>{if(player.src&&enabled())player.play().catch(()=>finish?.());},questionByText:(text,done=()=>{},offset=0)=>{const id=byText.get(normalized(text));if(id)play('audio/edward/questions/'+id+'.mp3',done,offset);else queueMicrotask(done);},question:(id,done)=>play('audio/edward/questions/'+id+'.mp3',done),announce:(name,done)=>play('audio/edward/announcements/'+announcements[name]+'.mp3',done),bella:(id,done)=>play('audio/bella/'+id+'.mp3',done)};
 narrate=function(text,callback){const ready=()=>window.ThronePause?ThronePause.gate(callback):callback();const id=match?.[index]?.id||byText.get(normalized(text));if(id)ThroneVoice.question(id,ready);else queueMicrotask(ready);};
 const priorGo=go;
 go=function(page){stop();priorGo(page);document.dispatchEvent(new CustomEvent('screenchange',{detail:{page}}));};
 document.getElementById('narrate').addEventListener('change',()=>{if(!enabled()){player.pause();finish?.();}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){hiddenPaused=!player.paused;player.pause();}else if(hiddenPaused){hiddenPaused=false;if(typeof current!=='undefined'&&current==='ttOnline')return;if(!window.ThronePause?.active)player.play().catch(()=>finish?.());}});
 window.addEventListener('pagehide',stop);
 const music=document.getElementById('music');let normalVolume=null;
 document.addEventListener('narrationstate',e=>{if(e.detail.speaking){if(normalVolume===null)normalVolume=music.volume;music.volume=normalVolume*.3;}else if(normalVolume!==null){music.volume=normalVolume;normalVolume=null;}});
})();
