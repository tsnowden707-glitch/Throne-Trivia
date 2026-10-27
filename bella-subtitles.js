// Word timestamps come from the actual recordings, never a typing-speed timer.
(() => {
 const page=document.getElementById('journeyStory');if(!page)return;
 const panel=document.createElement('div');panel.className='bella-subtitles';panel.hidden=true;panel.setAttribute('aria-label','Lady Bella narration');
 const text=document.createElement('div');text.className='bella-subtitle-words';panel.append(text);page.querySelector('.journey-stage').append(panel);
 let captions={},active='',words=[],pages=[],shown=-1,frame=-1;
 const loaded=fetch('bella-captions.json').then(r=>{if(!r.ok)throw Error('Captions unavailable');return r.json();}).then(data=>captions=data).catch(()=>{});
 function paginate(){
  pages=[];let start=0,line=0,width=0;
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d'),style=getComputedStyle(text);ctx.font=style.font;
  const limit=Math.max(100,text.clientWidth),space=ctx.measureText(' ').width;
  for(let i=0;i<words.length;i++){
   const w=ctx.measureText(words[i].word).width;
   if(width&&width+w+space>limit){line++;width=0;}
   if(line===3){pages.push({start,end:i});start=i;line=0;}
   width+=w+(width?space:0);
  }
  if(words.length)pages.push({start,end:words.length});shown=-1;frame=-1;
 }
 document.addEventListener('narrationstate',async e=>{
  if(!e.detail.speaking){active='';panel.hidden=true;return;}
  const match=/audio\/bella\/([^/]+)\.mp3/.exec(e.detail.src||'');if(!match||current!=='journeyStory')return;
  active=match[1];const own=active;await loaded;if(active!==own||current!=='journeyStory')return;
  words=captions[own]||[];if(!words.length)return;
  panel.hidden=false;text.textContent='';paginate();
 });
 document.addEventListener('narrationprogress',e=>{
  if(panel.hidden||!e.detail.src?.endsWith('/'+active+'.mp3'))return;
  let index=-1;for(let i=0;i<words.length&&words[i].start<=e.detail.time;i++)index=i;
  if(index===shown)return;shown=index;
  const next=pages.findIndex(p=>index>=p.start&&index<p.end);if(next<0){text.textContent='';return;}
  frame=next;text.textContent=words.slice(pages[frame].start,index+1).map(w=>w.word).join(' ');
 });
 window.addEventListener('resize',()=>{if(!panel.hidden)paginate();});
 document.addEventListener('screenchange',()=>{active='';panel.hidden=true;});
})();
