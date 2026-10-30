// Reveal timestamped words within the existing question frame, never over choices.
(() => {
 const page=document.getElementById('journeyStory');if(!page)return;
 const text=page.querySelector('.journey-question');let captions={},active='',words=[],saved='',epoch=0;
 const loaded=fetch('bella-captions.json?v=20261029-gate-1').then(r=>{if(!r.ok)throw Error('Captions unavailable');return r.json();}).then(data=>captions=data).catch(()=>{});
 document.addEventListener('narrationstate',async e=>{
  const token=++epoch;
  if(!e.detail.speaking){if(active)text.textContent=saved;active='';return;}
  const match=/audio\/bella\/([^/]+)\.mp3/.exec(e.detail.src||'');if(!match||current!=='journeyStory')return;
  const id=match[1];await loaded;if(token!==epoch||current!=='journeyStory')return;
  words=captions[id]||[];if(!words.length)return;
  saved=text.textContent;active=id;if(id!=='journey-progress-gate')text.textContent='';
 });
 document.addEventListener('narrationprogress',e=>{
  if(!active||!e.detail.src?.endsWith('/'+active+'.mp3'))return;
  // Keep the exact unlock requirement visible during the generic gate voice line.
  if(active==='journey-progress-gate')return;
  const offset=active==='journey-intro-short'&&page.classList.contains('bella-welcome-playing')?5:0;
  const spoken=words.filter(w=>w.start<=e.detail.time-offset);
  text.textContent=spoken.map(w=>w.word).join(' ');text.scrollTop=text.scrollHeight;
 });
 document.addEventListener('screenchange',()=>{epoch++;active='';});
})();
