// Cues measured from the existing 03-countdown recording; no independent spoken timer.
(() => {
 const cues=[[0,'3'],[.44,'2'],[.82,'1'],[1.14,'Begin']],duration=1.907;
 const label=document.getElementById('count');let token=0,frame=0,phase='',position=0,lastProgress=0;
 function display(t){const cue=cues.filter(c=>c[0]<=t).at(-1)||cues[0];label.textContent=cue[1];label.classList.toggle('count-begin',cue[1]==='Begin');}
 function cancel(){token++;cancelAnimationFrame(frame);phase='';}
 function finish(own){if(own!==token||current!=='countdown')return;cancelAnimationFrame(frame);phase='done';display(duration);ThronePause.gate(()=>{if(own===token&&current==='countdown')nextQuestion();});}
 function fallback(own){if(own!==token||phase==='fallback'||phase==='done')return;phase='fallback';let previous=performance.now();function tick(now){if(own!==token||current!=='countdown')return;const delta=(now-previous)/1000;previous=now;if(!document.hidden&&!window.ThronePause?.active){position+=delta;display(position);}if(position>=duration){finish(own);return;}frame=requestAnimationFrame(tick);}frame=requestAnimationFrame(tick);}
 document.addEventListener('narrationprogress',e=>{if(phase!=='audio'||!e.detail.src?.endsWith('/03-countdown.mp3'))return;position=e.detail.time;lastProgress=performance.now();display(position);});
 document.addEventListener('screenchange',e=>{if(e.detail.page!=='countdown')cancel();});
 window.ThroneCountdown={start:async()=>{
  cancel();const own=token;position=0;display(0);await(window.ThroneVault?.ready||Promise.resolve());if(own!==token||current!=='countdown')return;
  if(!document.getElementById('narrate').checked){fallback(own);return;}
  phase='audio';lastProgress=performance.now();
  function monitor(now){if(own!==token||phase!=='audio')return;if(document.hidden||window.ThronePause?.active)lastProgress=now;else if(now-lastProgress>10000){phase='';ThroneVoice.stop();fallback(own);return;}frame=requestAnimationFrame(monitor);}
  frame=requestAnimationFrame(monitor);
  ThroneVoice.announce('countdown',()=>{if(own!==token||phase!=='audio')return;cancelAnimationFrame(frame);if(position>=1.14)finish(own);else fallback(own);});
 }};
})();
