(function(){
 'use strict';
 const record=document.querySelector('.journey-record');if(!record)return;
 const lights=document.createElement('div');lights.className='journey-map-candlelight';lights.setAttribute('aria-hidden','true');for(const [x,y,size] of [[3,10.7,7],[97,10.7,7],[16,14.5,4],[84,14.5,4],[37.5,4.8,3],[62.5,4.8,3],[3,49,6],[97,49,6]]){const glow=document.createElement('i');glow.style.cssText='--x:'+x+'%;--y:'+y+'%;--size:'+size+'cqw;--delay:'+(-x/20)+'s';lights.append(glow);}record.append(lights);
 const meter=document.createElement('section');meter.className='journey-live-meter';
 meter.setAttribute('aria-label','Journey progress and current standing');
 meter.innerHTML='<div class="journey-meter-track" role="progressbar" aria-label="Completed trivia levels" aria-valuemin="0" aria-valuemax="400"><div class="journey-meter-fill"></div><div class="journey-meter-rider" aria-hidden="true"><span class="journey-rider-glow"></span><span class="journey-rider-position"></span></div><div class="journey-meter-marks" aria-hidden="true"></div></div><p class="journey-meter-summary"></p><p class="journey-meter-reasons"></p>';
 record.append(meter);
 const track=meter.querySelector('.journey-meter-track'),rider=meter.querySelector('.journey-meter-rider');
 for(let i=1;i<=8;i++){const mark=document.createElement('span');mark.textContent=i;meter.querySelector('.journey-meter-marks').append(mark);}
 function syncPlayback(){const clip=rider.querySelector('video,img');if(!clip)return;const active=!record.hidden&&document.getElementById('journeyStory').classList.contains('active')&&!document.hidden&&!matchMedia('(prefers-reduced-motion: reduce)').matches;if(clip.tagName==='VIDEO'){if(active)clip.play().catch(()=>{});else clip.pause();}else if(clip.dataset.poster){const src=active?clip.dataset.animation:clip.dataset.poster;if(clip.getAttribute('src')!==src)clip.src=src;}}
 function refresh(){
  syncPlayback();
  let saved={};try{saved=JSON.parse(localStorage.getItem('throne_campaign_v2')||'{}');}catch{}
  const p=JourneyStanding.progress(saved||{}),s=JourneyStanding.standing(ThroneJourney.getState());
  meter.dataset.standing=s.color;meter.style.setProperty('--journey-progress',p.fraction*100+'%');
  track.setAttribute('aria-valuenow',p.completed);track.setAttribute('aria-valuetext',p.completed+' of 400 levels completed across eight seasons');
  meter.querySelector('.journey-meter-summary').textContent=p.completed+' / 400 levels · '+s.label;
  meter.querySelector('.journey-meter-reasons').textContent=s.reasons.join(' · ');
 }
 // Supplied media must be an isolated rider, never the baked-in bar animation.
 function setMedia({riderSrc,frameSrc,posterSrc}={}){
  rider.querySelector('img,video')?.remove();
  if(riderSrc){const clip=/\.(webm|mp4)(?:\?|$)/i.test(riderSrc)?document.createElement('video'):document.createElement('img');clip.src=riderSrc;clip.alt='';if(posterSrc){clip.dataset.animation=riderSrc;clip.dataset.poster=posterSrc;}if(clip.tagName==='VIDEO'){clip.muted=true;clip.loop=true;clip.playsInline=true;clip.preload='auto';}rider.append(clip);meter.classList.add('has-rider');}
  syncPlayback();
  if(frameSrc){meter.style.setProperty('--journey-meter-frame','url("'+encodeURI(frameSrc)+'")');meter.classList.add('has-frame');}
 }
 new MutationObserver(()=>{syncPlayback();if(!record.hidden)refresh();}).observe(record,{attributes:true,attributeFilter:['hidden']});
 document.addEventListener('screenchange',()=>{syncPlayback();if(!record.hidden)refresh();});
 document.addEventListener('visibilitychange',syncPlayback);
 matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',syncPlayback);
 window.addEventListener('storage',()=>{if(!record.hidden)refresh();});
 function setBackgrounds({portrait,landscape}={}){const stage=record.closest('.journey-stage');if(portrait){stage.style.setProperty('--journey-map-portrait','url('+encodeURI(portrait)+')');stage.classList.add('journey-clean-portrait');}if(landscape){stage.style.setProperty('--journey-map-landscape','url('+encodeURI(landscape)+')');stage.classList.add('journey-clean-landscape');}}
 window.ThroneJourneyMeter={refresh,setMedia,setBackgrounds};setBackgrounds({portrait:'journey-map-clean-portrait.png',landscape:'journey-map-clean-landscape.png'});setMedia({riderSrc:'journey-rider-isolated.webp',posterSrc:'journey-rider-poster.png'});refresh();
})();
