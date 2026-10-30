/* Approved Bella map audio: progress/standing remain derived from the game save. */
(()=>{
 const page=document.getElementById('journeyStory'),record=page?.querySelector('.journey-record');if(!record)return;
 const HEARD='throne_journey_map_narration_heard_v1',LAST='throne_journey_map_narration_context_v1';
 let manifest=null,opened=false,token=0,ownVoice=false,openContext=null;
 const enabled=()=>document.getElementById('narrate')?.checked===true;
 const visible=()=>page.classList.contains('active')&&!record.hidden&&!document.hidden;
 const read=key=>{try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}};
 const usable=c=>c?.verified===true&&!!c.text&&/^audio\/bella-journey-map\/[a-z0-9-]+\.mp3$/.test(c.src);
 function context(){const state=ThroneJourney.getState(),standing=JourneyStanding.standing(state),progress=JourneyStanding.progress(typeof campaignProgress==='function'?campaignProgress():{});return {standing,season:Math.min(8,Math.max(1,progress.season)),signature:JSON.stringify([progress.seasons,state.decisions?.map(d=>[d.scene,d.effect,d.choice]),standing.pressure])};}
 function stop(){token++;const owned=ownVoice;ownVoice=false;if(owned)ThroneVoice.stop();}
 function select(replay=false){
  const ctx=openContext||context(),clips=manifest?.clips||[],heard=read(HEARD),last=read(LAST);
  const status=clips.find(c=>c.group==='current-standing'&&c.trigger.color===ctx.standing.color);
  const originals=clips.filter(c=>c.group==='map-explanation'||c.group==='season-introduction'&&c.trigger.season===ctx.season).filter(c=>replay||!heard[c.id]);
  let updateIds=[];const changed=!!last.signature&&last.signature!==ctx.signature;
  if(changed){if(ctx.standing.pressure<last.pressure)updateIds=['07','08'];else if(ctx.standing.pressure>last.pressure)updateIds=['09','10'];}
  if(!updateIds.length&&(changed||replay))updateIds=ctx.standing.color==='green'?['01','02']:ctx.standing.color==='yellow'?['03','04']:['05','06'];
  let update=updateIds.map(n=>clips.find(c=>c.id==='map-update-'+n)).find(c=>c&&(replay||!heard[c.id]));
  if(!update&&changed){const colorIds=ctx.standing.color==='green'?['01','02']:ctx.standing.color==='yellow'?['03','04']:['05','06'];update=colorIds.map(n=>clips.find(c=>c.id==='map-update-'+n)).find(c=>c&&(replay||!heard[c.id]));}
  if(replay&&last.signature===ctx.signature&&last.updateId)update=clips.find(c=>c.id===last.updateId)||update;
  return {ctx,queue:[status,...originals,update].filter(usable),update};
 }
 function speak(replay=false){
  if(!visible()||!enabled()||manifest?.enabled!==true)return;stop();const mine=token,{ctx,queue,update}=select(replay);
  function next(){if(mine!==token||!visible()||!enabled())return;const clip=queue.shift();if(!clip){ownVoice=false;if(!replay)localStorage.setItem(LAST,JSON.stringify({signature:ctx.signature,pressure:ctx.standing.pressure,updateId:update?.id||null}));return;}
   ownVoice=true;ThroneVoice.play(clip.src,result=>{if(mine!==token||!visible()||!enabled())return;if(!result?.completed){ownVoice=false;return;}if(clip.playOnce){const heard=read(HEARD);heard[clip.id]=true;localStorage.setItem(HEARD,JSON.stringify(heard));}next();});
  }next();
 }
 const replay=document.createElement('button');replay.type='button';replay.className='journey-map-hear-bella';replay.textContent='Hear Bella';replay.hidden=true;replay.onclick=()=>speak(true);record.append(replay);
 function sync(){const active=visible();replay.hidden=!(active&&enabled()&&manifest?.enabled===true);if(active&&!opened&&manifest){opened=true;openContext=context();speak();}else if(!active&&opened){opened=false;openContext=null;stop();}}
 new MutationObserver(sync).observe(record,{attributes:true,attributeFilter:['hidden']});document.addEventListener('screenchange',sync);document.addEventListener('visibilitychange',sync);document.getElementById('narrate')?.addEventListener('change',()=>{if(!enabled())stop();sync();});
 window.ThroneJourneyMapNarration={replay:()=>speak(true),status:()=>({enabled:manifest?.enabled===true,verified:(manifest?.clips||[]).filter(usable).map(c=>c.id),missing:(manifest?.clips||[]).filter(c=>!usable(c)).map(c=>c.id)})};
 fetch('journey-map-narration-manifest.json?v=20261030-bella-map16').then(r=>{if(!r.ok)throw Error('Map audio unavailable');return r.json()}).then(m=>{manifest=m;sync()}).catch(()=>{replay.hidden=true});
})();

