(() => {
 const illustratedChoices={};
 const KEY='throne_journey_v1';let scenes=[],state,transitioning=false,view='story',generation=0,reading=false;
 try{state=JSON.parse(localStorage.getItem(KEY));}catch{}
 if(!state||state.version!==1||!Array.isArray(state.decisions))state=JourneyState.fresh();
 const page=document.createElement('section');page.id='journeyStory';page.className='page';
 page.innerHTML=`<div class="journey-stage"><button class="journey-back" aria-label="Back to menu">‹</button><button class="journey-toggle">Your Journey</button><header class="journey-heading"><h1>Road to the Throne</h1><p></p></header><div class="bella-guide"><video muted playsinline loop></video><span>Lady Bella</span><button class="bella-replay" aria-label="Replay Lady Bella's narration">↻</button></div><div class="journey-story"><p class="journey-question"></p><div class="journey-choices"></div><p class="journey-outcome" role="status" aria-live="polite"></p></div><div class="journey-record" hidden><h2>Your Story So Far</h2><ol class="journey-seasons"></ol><div class="journey-panels"></div><button class="journey-return">Return to Story</button></div></div>`;
 document.querySelector('.page').parentElement.append(page);
 const $j=s=>page.querySelector(s),video=$j('video');let videoMode='',poseToken=0,activeVideo=video;
 const lipVideo=document.createElement('video');lipVideo.playsInline=true;lipVideo.preload='metadata';lipVideo.className='bella-lipsynced';lipVideo.hidden=true;$j('.bella-guide').append(lipVideo);
 const welcome=document.createElement('div');welcome.className='bella-welcome-screen';welcome.hidden=true;const welcomeVideo=document.createElement('video');welcomeVideo.playsInline=true;welcomeVideo.preload='auto';welcomeVideo.poster='video/bella/welcome-smooth-poster.jpg';const welcomeSkip=document.createElement('button');welcomeSkip.textContent='Continue';welcomeSkip.setAttribute('aria-label','Skip Bella welcome');const welcomeStage=document.createElement('div');welcomeStage.className='bella-welcome-stage';welcomeStage.append(welcomeVideo);welcome.append(welcomeStage,welcomeSkip);page.append(welcome);const welcomeMute=()=>{welcomeVideo.muted=new URL(location.href).searchParams.get('quiet')==='1'||(welcomeVideo.currentTime<5&&!document.getElementById('effects')?.checked);};welcomeVideo.addEventListener('playing',welcomeMute);welcomeVideo.addEventListener('timeupdate',welcomeMute);document.getElementById('effects')?.addEventListener('change',welcomeMute);
 const spare=video.cloneNode();video.after(spare);spare.className='bella-video-hidden';
 video.setAttribute('aria-hidden','true');spare.setAttribute('aria-hidden','true');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function pose(mode){
  if(videoMode===mode)return;videoMode=mode;const own=++poseToken;
  const incoming=activeVideo===video?spare:video,outgoing=activeVideo;
  incoming.onloadeddata=()=>{if(own!==poseToken)return;incoming.classList.remove('bella-video-hidden');outgoing.classList.add('bella-video-hidden');activeVideo=incoming;if(!reduced.matches&&!document.hidden&&current==='journeyStory'&&view==='story')incoming.play().catch(()=>{});setTimeout(()=>{if(activeVideo!==outgoing)outgoing.pause();},220);};
  incoming.src=mode==='idle'?'video/bella-idle-continuous.mp4':'video/bella-'+mode+'.mp4';incoming.muted=true;incoming.loop=mode!=='reward';incoming.load();
 }
 for(const clip of [video,spare])clip.addEventListener('ended',()=>pose('idle'));
 function save(){localStorage.setItem(KEY,JSON.stringify(state));}
 function available(chapter){return Number.isInteger(chapter)&&chapter>=1&&chapter<=8&&(chapter===1||completedLevels(chapter-1)>=50);}
 function currentScene(){return scenes[state.decisions.length];}
 const storyMilestones=[0,1,10,20,35,50];
 function requiredLevel(scene){return storyMilestones[scenes.filter(s=>s.chapter===scene.chapter).findIndex(s=>s.id===scene.id)]||0;}
 function sceneAvailable(scene){return !!scene&&available(scene.chapter)&&completedLevels(scene.chapter)>=requiredLevel(scene);}
 let speechFinishToken=0;
 function speak(id,done=()=>{}){
  const speechToken=++speechFinishToken;lipVideo.style.opacity='1';lipVideo.style.transition='none';
  const opening=/^chapter-(0[1-8])-opening-short$/.exec(id);
  const file=id==='journey-progress-gate'?'journey-progress-gate':id==='journey-intro-short'?'journey-intro':opening?'season-'+opening[1]:null;
  const finish=()=>{welcome.hidden=true;welcomeVideo.pause();page.classList.remove('bella-welcome-playing');pose('idle');if(activeVideo.readyState>=2&&!reduced.matches&&current==='journeyStory')activeVideo.play().catch(()=>{});if(!lipVideo.hidden&&!reduced.matches&&activeVideo.readyState>=2){lipVideo.style.transition='opacity .24s ease';lipVideo.style.opacity='0';setTimeout(()=>{if(speechToken===speechFinishToken){lipVideo.hidden=true;lipVideo.style.opacity='1';}},250);}else lipVideo.hidden=true;done();};
  if(id==='journey-intro-short'&&document.getElementById('narrate').checked){poseToken++;video.pause();spare.pause();lipVideo.hidden=true;welcome.hidden=false;page.classList.add('bella-welcome-playing');welcomeSkip.onclick=()=>{ThroneVoice.stop();finish();};ThroneVoice.video(welcomeVideo,'video/bella/welcome-smooth-approved.mp4','audio/bella/'+id+'.mp3',finish);return;}
  if(file&&document.getElementById('narrate').checked){
   poseToken++;video.pause();spare.pause();lipVideo.hidden=false;lipVideo.muted=false;
   ThroneVoice.video(lipVideo,'video/bella/'+file+'-lipsynced.mp4','audio/bella/'+id+'.mp3',finish);
  }else{lipVideo.hidden=true;pose('idle');ThroneVoice.bella(id,finish);}
 }
 function narrateGate(){
  if(reading||transitioning||current!=='journeyStory'||view!=='story')return;
  const own=++generation;reading=true;$j('.bella-replay').disabled=true;
  speak('journey-progress-gate',()=>{if(own!==generation||current!=='journeyStory')return;reading=false;render();});
 }
 function narrateScene(){
  const scene=currentScene();if(!scene||state.ending||reading||transitioning||view!=='story'||current!=='journeyStory')return;if(!sceneAvailable(scene)){narrateGate();return;}
  const own=++generation,queue=[];reading=true;page.classList.add('bella-reading');$j('.journey-choices').hidden=false;$j('.journey-choices').querySelectorAll('button').forEach(b=>{b.disabled=true;b.classList.add('choice-awaiting-reveal');});
  const heardKey='throne_journey_openings_v1';let heard={};
  try{heard=JSON.parse(localStorage.getItem(heardKey))||{};}catch{}
  if(!heard.intro)queue.push(['journey-intro-short','intro']);
  if(!heard[scene.chapter])queue.push(['chapter-'+String(scene.chapter).padStart(2,'0')+'-opening-short',scene.chapter]);
  queue.push([scene.id,null]);
  function next(){
   if(own!==generation||view!=='story'||current!=='journeyStory'||currentScene()?.id!==scene.id)return;
   const item=queue.shift();if(!item){reading=false;page.classList.remove('bella-reading');render();revealChoices(own);return;}
   speak(item[0],()=>{if(own!==generation)return;if(item[1]&&document.getElementById('narrate').checked){heard[item[1]]=true;try{localStorage.setItem(heardKey,JSON.stringify(heard));}catch{}}next();});
  }
  next();
 }
 function revealChoices(own=generation){const buttons=[...$j('.journey-choices').querySelectorAll('button')];buttons.forEach((b,i)=>setTimeout(()=>{if(own!==generation||reading||transitioning||current!=='journeyStory'||view!=='story'||!b.isConnected)return;b.classList.remove('choice-awaiting-reveal');b.disabled=false;if(!reduced.matches)window.ThroneEffects?.play('tap');},reduced.matches?0:i*260));}
 function button(label,action){const b=document.createElement('button');b.textContent=label;b.onclick=action;return b;}
 function nextLevelButton(scene){const b=button('Play Next Level',()=>{ThroneVoice.stop();playMode='practice';currentSeason=available(scene.chapter)?scene.chapter:scene.chapter-1;chosenLevel=Math.min(50,completedLevels(currentSeason)+1);levelPage=Math.floor((chosenLevel-1)/10);go('characters');});b.className='journey-next-level';return b;}
 function render(){
  const scene=currentScene();page.classList.toggle('journey-house-selection',!!illustratedChoices[scene?.id]&&!state.ending);const choices=$j('.journey-choices');choices.hidden=false;choices.replaceChildren();$j('.journey-outcome').textContent='';page.classList.toggle('journey-progress-gated',!!scene&&!state.ending&&!sceneAvailable(scene));
  $j('.journey-heading p').textContent=state.ending?'Your final fate':scene?'Season '+scene.chapter+' · '+scene.title:'Loading your journey';
  $j('.bella-replay').disabled=!scene||!!state.ending||transitioning||reading;
  if(state.ending){$j('.journey-question').textContent={throne:'The throne is yours.',wall:'Your journey ends at the Wall.',exile:'Your claim ends in exile.',execution:'The court sentences you to execution.'}[state.ending];choices.append(button('Hear your ending',()=>speak('ending-'+state.ending)),button('See what shaped your journey',()=>changeView('record')));return;}
  if(!scene){$j('.journey-question').textContent='Preparing your story…';return;}
  if(!available(scene.chapter)){$j('.journey-question').textContent='Complete Level 50 in Season '+(scene.chapter-1)+' to continue.\nYou have completed '+completedLevels(scene.chapter-1)+' of 50 levels.';choices.append(nextLevelButton(scene));return;}
  if(!sceneAvailable(scene)){$j('.journey-question').textContent='Complete Level '+requiredLevel(scene)+' in Season '+scene.chapter+' to continue.\nYou have completed '+completedLevels(scene.chapter)+' of '+requiredLevel(scene)+' required levels.';choices.append(nextLevelButton(scene));return;}
  $j('.journey-question').textContent=scene.narration;
  scene.choices.forEach((choice,i)=>{const b=button(choice.label,()=>choose(scene,i));b.classList.add('choice-awaiting-reveal');b.disabled=true;if(illustratedChoices[scene.id]){const art=illustratedChoices[scene.id][i];let img;if(typeof art==='string'){img=document.createElement('img');img.src=art;img.alt=choice.label;}else{img=document.createElementNS('http://www.w3.org/2000/svg','svg');img.setAttribute('viewBox',art.viewBox);img.setAttribute('aria-hidden','true');const picture=document.createElementNS('http://www.w3.org/2000/svg','image');picture.setAttribute('href',art.src);picture.setAttribute('width',art.width);picture.setAttribute('height',art.height);img.append(picture);}b.setAttribute('aria-label',choice.label);b.replaceChildren(img);}choices.append(b);});
 }
 async function choose(scene,i){
  if(reading||transitioning||currentScene()?.id!==scene.id||!sceneAvailable(scene))return;
  transitioning=true;const own=++generation;
  $j('.journey-toggle').disabled=true;$j('.bella-replay').disabled=true;
  page.querySelectorAll('.journey-choices button').forEach(b=>b.disabled=true);
  const next=JourneyState.apply(state,scene,i);
  try{window.ThroneArmory?.apply(state,next,scene,i);}catch(error){console.warn('Equipment unavailable; normal story choice preserved.');}
  try{localStorage.setItem(KEY,JSON.stringify(next));}catch{transitioning=false;$j('.journey-toggle').disabled=false;render();$j('.journey-outcome').textContent='Your choice could not be saved. Free some storage and try again.';return;}
  const formed=Object.keys(next.alliances).length>Object.keys(state.alliances).length||next.decisions.at(-1).changes.includes('Marriage alliance formed');
  const betrayed=Object.entries(next.alliances).some(([name,a])=>a.support<(state.alliances[name]?.support||0));
  state=next;let gearAward;try{gearAward=window.ThroneArmory?.sync();}catch(error){console.warn('Equipment award will retry later.');}if(gearAward?.awarded.length)window.ThroneEffects?.play('unlock');$j('.journey-choices').hidden=true;if(!gearAward?.awarded.length)ThroneEffects.play('choice');
  if(formed||betrayed){await window.ThroneCinematics?.play(betrayed?'betrayal-revealed':'alliance-sealed');if(own!==generation||current!=='journeyStory')return;}
  $j('.journey-question').textContent=scene.choices[i].response;
  speak(scene.choices[i].response_audio_id,()=>{
   if(own!==generation||current!=='journeyStory')return;
   const changes=state.decisions.at(-1).changes;
   $j('.journey-outcome').textContent=changes.join(' · ');
   if(changes.some(x=>x.startsWith('+')||x==='Marriage alliance formed')){pose('reward');ThroneEffects.play('reward');}
   setTimeout(async()=>{
    if(own!==generation||current!=='journeyStory')return;
    await window.ThroneCards?.reward('story:'+scene.chapter+':'+Number(scene.id.slice(-2)));
    if(own!==generation||current!=='journeyStory')return;
    transitioning=false;$j('.journey-toggle').disabled=false;pose('idle');render();
    if(state.ending){if(state.ending==='throne')await window.ThroneCinematics?.play('throne-earned');if(own===generation&&current==='journeyStory')speak('ending-'+state.ending);}
    else if(state.decisions.length%6===0){ThroneEffects.play('chapter');speak('chapter-complete',narrateScene);}
    else narrateScene();
   },changes.length?1800:450);
  });
 }
 function record(){
  window.ThroneJourneyMeter?.refresh();
  $j('.journey-heading p').textContent=Math.floor(state.decisions.length/6)+' of 8 chapters complete';
  const steps=$j('.journey-seasons');steps.replaceChildren();
  for(let s=1;s<=8;s++){const n=state.decisions.filter(d=>d.chapter===s).length,li=document.createElement('li');li.textContent=s;li.title='Season '+s+' · '+n+' of 6 decisions';li.setAttribute('aria-label',li.title);li.className=n===6?'complete':'';steps.append(li);}
  const panels=$j('.journey-panels');panels.replaceChildren();
  const section=(title,items)=>{const wrap=document.createElement('section'),h=document.createElement('h3'),list=document.createElement('ul');h.textContent=title+' ('+items.length+')';for(const text of items){const li=document.createElement('li');li.textContent=text;list.append(li);}if(!items.length){const li=document.createElement('li');li.textContent='None yet';list.append(li);}list.tabIndex=0;list.setAttribute('aria-label',title);wrap.append(h,list);panels.append(wrap);};
  section('Alliances',Object.entries(state.alliances).map(([name,a])=>name+' · '+(a.support?'Supporting':'Support withdrawn')+(a.history?.length?' · '+a.history.at(-1):'')));
  const allyItems=panels.querySelectorAll('section:first-child li');
  Object.keys(state.alliances).forEach((name,i)=>{
   if(!JourneyState.favorAvailable(state,name))return;
   const request=button('Call favor: +1 supply',()=>{
    if(transitioning||!JourneyState.favorAvailable(state,name))return;
    request.disabled=true;
    try{const next=JourneyState.callFavor(state,name);localStorage.setItem(KEY,JSON.stringify(next));state=next;ThroneEffects.play('reward');record();}
    catch{request.disabled=false;request.textContent='Could not save — try again';}
   });
   request.className='journey-favor';request.title='Use one support. One favor total per story season.';
   const explanation=document.createElement('small');explanation.textContent=' Uses 1 support; one favor per season.';
   allyItems[i].append(document.createElement('br'),request,explanation);
  });
  section('Promises',Object.values(state.promises).map(p=>p.label+' · '+p.status));
  const resources=Object.entries(state.resources).filter(([,n])=>n>0).map(([name,n])=>n+' '+name);
  section(state.ending?'Your final record':'Resources',state.ending?[...resources,...JourneyState.recap(state)]:resources);
  for(const section of panels.children){const list=section.querySelector('ul'),items=[...list.children];if(items.length<2)continue;let cursor=0;const pager=document.createElement('div');pager.className='journey-record-pager';const prev=button('‹',()=>{cursor--;draw();}),next=button('›',()=>{cursor++;draw();}),label=document.createElement('span');prev.setAttribute('aria-label','Previous '+section.querySelector('h3').textContent);next.setAttribute('aria-label','Next '+section.querySelector('h3').textContent);function draw(){items.forEach((item,i)=>item.hidden=i!==cursor);prev.disabled=cursor===0;next.disabled=cursor===items.length-1;label.textContent=(cursor+1)+' / '+items.length;}pager.append(prev,label,next);section.append(pager);draw();}

 }
 function changeView(next){welcome.hidden=true;welcomeVideo.pause();page.classList.remove('bella-welcome-playing');lipVideo.hidden=true;lipVideo.pause();generation++;reading=false;page.classList.remove('bella-reading');view=next;$j('.journey-stage').classList.toggle('journey-record-view',next!=='story');$j('.journey-story').hidden=next!=='story';$j('.journey-record').hidden=next==='story';$j('.bella-guide').hidden=next!=='story';$j('.journey-toggle').hidden=next!=='story';if(next!=='story'){ThroneVoice.stop();pose('idle');video.pause();spare.pause();record();}else {render();revealChoices();if(!reduced.matches&&!document.hidden)activeVideo.play().catch(()=>{});}window.dispatchEvent(new Event('resize'));}
 $j('.journey-toggle').onclick=()=>changeView('record');$j('.journey-return').onclick=()=>changeView('story');$j('.journey-back').onclick=()=>go('menu');
 $j('.bella-replay').onclick=()=>{const s=currentScene();if(s&&!transitioning){narrateScene();}};
 const menuButton=button('Road to the Throne',()=>go('journeyStory'));menuButton.className='journey-menu-button';document.getElementById('menu').append(menuButton);
 document.addEventListener('screenchange',e=>{
  if(e.detail.page!=='journeyStory'){welcome.hidden=true;welcomeVideo.pause();page.classList.remove('bella-welcome-playing');lipVideo.hidden=true;lipVideo.pause();generation++;transitioning=false;reading=false;page.classList.remove('bella-reading');video.pause();spare.pause();return;}
  $j('.journey-toggle').disabled=false;changeView('story');render();videoMode='';pose('idle');Promise.resolve().then(()=>window.ThroneVault?.ready).then(()=>{if(current==='journeyStory')narrateScene();});
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden){video.pause();spare.pause();}else if(current==='journeyStory'&&view==='story'&&!reduced.matches)activeVideo.play().catch(()=>{});});
 Promise.all([fetch('journey-scenes.json').then(r=>{if(!r.ok)throw Error('Story unavailable');return r.json();}),fetch('road-choice-artwork.json?v=20261029-art-restoration7').then(r=>r.ok?r.json():{}).catch(()=>({}))]).then(([data,art])=>{for(const scene of data.scenes){const paths=art[scene.id];if(Array.isArray(paths)&&paths.length===scene.choices.length&&paths.every(p=>typeof p==='string'?/^road-[a-z0-9-]+[.](?:svg|png)$/.test(p):p&&/^road-[a-z0-9-]+[.]png$/.test(p.src)&&Number.isFinite(p.width)&&Number.isFinite(p.height)&&/^\d+ \d+ \d+ \d+$/.test(p.viewBox)))illustratedChoices[scene.id]=paths;}scenes=data.scenes;if(current==='journeyStory'){render();Promise.resolve(window.ThroneVault?.ready).then(narrateScene);}}).catch(()=>{$j('.journey-question').textContent='The story could not load. Check your connection and reopen the game.';});
 function welcomeNeeded(){let heard={};try{heard=JSON.parse(localStorage.getItem('throne_journey_openings_v1'))||{};}catch{}return document.getElementById('narrate').checked&&!heard.intro;}
 function prepareEntry(){
  if(!welcomeNeeded())return prepareScene();
  const own=generation;
  if(welcomeVideo.getAttribute('src')!=='video/bella/welcome-smooth-approved.mp4'){welcomeVideo.src='video/bella/welcome-smooth-approved.mp4';welcomeVideo.load();}
  const ready=welcomeVideo.readyState>=2?Promise.resolve():new Promise(resolve=>{let timer;const finish=()=>{clearTimeout(timer);welcomeVideo.removeEventListener('loadeddata',finish);welcomeVideo.removeEventListener('error',finish);resolve();};welcomeVideo.addEventListener('loadeddata',finish,{once:true});welcomeVideo.addEventListener('error',finish,{once:true});timer=setTimeout(finish,10000);});
  return ready.then(()=>{if(current==='journeyStory'&&view==='story'&&welcomeNeeded()){welcome.hidden=false;page.classList.add('bella-welcome-playing');welcomeVideo.pause();}});
 }
 function prepareScene(){const assets=[matchMedia('(orientation:portrait)').matches?'road-approved-clean-portrait.png':'road-approved-clean-landscape.png',...(illustratedChoices[currentScene()?.id]||[]).map(a=>typeof a==='string'?a:a.src)];const images=[...new Set(assets)].map(src=>{const im=new Image();im.src=src;return im.decode().catch(()=>{});});const clip=activeVideo;const ready=clip.readyState>=2?Promise.resolve():new Promise(resolve=>{const finish=()=>{clip.removeEventListener('loadeddata',finish);clip.removeEventListener('error',finish);resolve();};clip.addEventListener('loadeddata',finish,{once:true});clip.addEventListener('error',finish,{once:true});setTimeout(finish,4000);});return Promise.all([...images,ready]);}
 window.ThroneJourney={prepare:prepareScene,prepareEntry,open:()=>go('journeyStory'),getState:()=>JSON.parse(JSON.stringify(state)),getScene:()=>currentScene(),getGateStatus:()=>{const scene=currentScene();return scene&&!state.ending?{id:scene.id,chapter:scene.chapter,required:requiredLevel(scene),available:sceneAvailable(scene)}:null;},canUseCard:c=>!reading&&!transitioning&&sceneAvailable(currentScene())&&JourneyCardEffects.eligible(c,state,currentScene()),applyCard:(c,id)=>{const next=JourneyCardEffects.apply(state,c,id);localStorage.setItem(KEY,JSON.stringify(next));state=next;render();return next.cardEffects[id].message;}};
})();
