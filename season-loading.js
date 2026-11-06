// Shared readiness display. Progress counts completed work, never elapsed time.
(() => {
 'use strict';
 const names=['Winterfell','King’s Landing','The Riverlands','The Vale','The Wall','Winterfell Reclaimed','Dragonstone','Final Winter'];
 const tasks=new Set();let showTimer=0,hideFrame=0;
 const root=document.createElement('div');root.id='season-loading';root.hidden=true;
 root.innerHTML='<img class="sl-art" alt=""><div class="sl-track" role="progressbar" aria-label="Loading" aria-valuemin="0" aria-valuemax="100"><div class="sl-fill"></div></div><p class="sl-label" role="status"></p>';
 document.body.append(root);
 const art=root.querySelector('img'),track=root.querySelector('.sl-track'),fill=root.querySelector('.sl-fill'),label=root.querySelector('.sl-label');
 function season(){try{return Math.max(1,Math.min(8,Number(document.querySelector('#journeyStory.active')?window.ThroneJourney?.getScene()?.chapter:(typeof currentSeason!=='undefined'?currentSeason:localStorage.getItem('throne_loading_season')))||1));}catch{return 1;}}
 function picture(s){const orientation=matchMedia('(orientation:portrait)').matches?'portrait':'landscape';const src=`loading-assets/season-${s}-${orientation}.png`;if(art.getAttribute('src')!==src){root.classList.remove('sl-art-ready');art.src=src;}root.dataset.season=s;root.dataset.orientation=orientation;}
 art.onload=()=>root.classList.add('sl-art-ready');
 function draw(){
  cancelAnimationFrame(hideFrame);
  if(!tasks.size){clearTimeout(showTimer);showTimer=0;root.hidden=true;return;}
  const list=[...tasks],latest=list.at(-1);picture(latest.season);
  const total=list.reduce((n,t)=>n+t.total,0),done=list.reduce((n,t)=>n+t.done,0),percent=Math.floor(done/total*100);
  fill.style.width=percent+'%';track.setAttribute('aria-valuenow',percent);label.textContent=`Loading \u00b7 ${percent}%`;
  root.setAttribute('aria-label',`Season ${latest.season}: ${names[latest.season-1]}`);
  if(root.hidden&&!showTimer)showTimer=setTimeout(()=>{showTimer=0;if(tasks.size)root.hidden=false;},120);
 }
 function begin({season:s=season(),total=1}={}){
  const t={season:Math.max(1,Math.min(8,Number(s)||1)),total:Math.max(1,total),done:0};tasks.add(t);draw();
  let ended=false;const watchdog=setTimeout(()=>end(false),30000);
  function end(success){if(ended)return;ended=true;clearTimeout(watchdog);if(success){t.done=t.total;draw();}tasks.delete(t);if(tasks.size||!success)draw();else{clearTimeout(showTimer);showTimer=0;hideFrame=requestAnimationFrame(()=>{if(!tasks.size)root.hidden=true;});}}
  return {step(){if(!ended){t.done=Math.min(t.total,t.done+1);draw();}},finish:()=>end(true),cancel:()=>end(false),fail:()=>end(false)};
 }
 async function wait(promise,options){const task=begin(options);try{const value=await promise;task.finish();return value;}catch(error){task.fail();throw error;}}
 async function images(sources,options={}){const paths=[...new Set(sources.filter(Boolean))];if(!paths.length)return;const task=begin({...options,total:paths.length});try{await Promise.all(paths.map(src=>new Promise((resolve,reject)=>{const im=new Image();const timer=setTimeout(()=>reject(Error('Artwork load timed out')),15000);im.onload=()=>im.decode().then(()=>{clearTimeout(timer);task.step();resolve();},reject);im.onerror=()=>{clearTimeout(timer);reject(Error('Artwork unavailable'));};im.src=src;})));task.finish();}catch(e){task.fail();throw e;}}
 window.ThroneLoading={begin,wait,images,season};
 // Observe only visible media, including dynamically opened reward/story panels.
 const watched=new Map();
 function visible(el){return !!el.getClientRects().length&&!el.closest('[hidden]')&&getComputedStyle(el).visibility!=='hidden';}
 function watch(el){
  if(el.closest('#season-loading')||!visible(el)||watched.has(el))return;
  const video=el.tagName==='VIDEO';if(video?(el.readyState>=2||!el.currentSrc&&!el.src):(el.complete||!el.src))return;
  const task=begin(),events=video?['loadeddata','canplay','playing','error','abort','emptied']:['load','error','abort'];
  const finish=e=>{events.forEach(n=>el.removeEventListener(n,finish));clearTimeout(timer);watched.delete(el);if(e&&['load','loadeddata','canplay','playing'].includes(e.type))task.finish();else task.cancel();};
  const timer=setTimeout(finish,15000);watched.set(el,finish);events.forEach(n=>el.addEventListener(n,finish));
 }
 let frame=0;
 function scan(){cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{for(const [el,finish] of watched)if(!el.isConnected||!visible(el))finish();document.querySelectorAll('img,video').forEach(el=>{if(!visible(el)){watched.get(el)?.();return;}watch(el);});});}
 new MutationObserver(records=>{if(records.some(r=>!root.contains(r.target)&&(r.type==='childList'||['src','hidden','class'].includes(r.attributeName))))scan();}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['src','hidden','class']});
 document.addEventListener('screenchange',()=>{try{localStorage.setItem('throne_loading_season',season());}catch{}scan();});
 document.addEventListener('waiting',e=>{if(e.target.tagName==='VIDEO'&&visible(e.target))watch(e.target);},true);
 addEventListener('resize',()=>{if(tasks.size)draw();scan();});
 addEventListener('pagehide',()=>{tasks.clear();draw();});
 picture(season());
 scan();
})();
