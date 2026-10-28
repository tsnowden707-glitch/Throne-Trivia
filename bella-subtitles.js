// Reveal timestamped words within the existing question frame, never over choices.
(() => {
 const page=document.getElementById('journeyStory');if(!page)return;
 const text=page.querySelector('.journey-question');let captions={},active='',words=[],saved='',epoch=0;
 const loaded=fetch('bella-captions.json').then(r=>{if(!r.ok)throw Error('Captions unavailable');return r.json();}).then(data=>captions=data).catch(()=>{});
 document.addEventListener('narrationstate',async e=>{
  const token=++epoch;
  if(!e.detail.speaking){if(active)text.textContent=saved;active='';return;}
  const match=/audio\/bella\/([^/]+)\.mp3/.exec(e.detail.src||'');if(!match||current!=='journeyStory')return;
  const id=match[1];await loaded;if(token!==epoch||current!=='journeyStory')return;
  words=captions[id]||[];if(!words.length)return;
  saved=text.textContent;active=id;text.textContent='';
 });
 document.addEventListener('narrationprogress',e=>{
  if(!active||!e.detail.src?.endsWith('/'+active+'.mp3'))return;
  const spoken=words.filter(w=>w.start<=e.detail.time);
  text.textContent=spoken.map(w=>w.word).join(' ');text.scrollTop=text.scrollHeight;
 });
 document.addEventListener('screenchange',()=>{epoch++;active='';});
})();
