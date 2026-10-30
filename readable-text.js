// Keep live text inside the approved ornament at every viewport size.
(() => {
 const selector='#quiz .question,#quiz .answer,#ttOnline #onlinePrompt,#ttOnline #onlineLiveOptions button,.journey-question,.journey-choices button';
 let pending=false;
 function fit(){pending=false;for(const el of document.querySelectorAll(selector)){
  if(!el.getClientRects().length)continue;
  const copy=el.querySelector('.approved-answer-copy'),letter=el.querySelector('.approved-answer-letter');
  if(copy&&letter){
   copy.style.removeProperty('font-size');const box=el.getBoundingClientRect(),style=getComputedStyle(el),height=el.clientHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom);
   let size=Math.min(20,parseFloat(getComputedStyle(el).fontSize));copy.style.setProperty('font-size',size+'px','important');const text=document.createRange();text.selectNodeContents(copy);
   while(size>11&&(text.getBoundingClientRect().height>height||text.getBoundingClientRect().width>copy.clientWidth+1)){size-=.5;copy.style.setProperty('font-size',size+'px','important');}
   letter.style.setProperty('height',Math.min(28,height)+'px','important');let letterSize=Math.min(20,height*.75);letter.style.setProperty('font-size',letterSize+'px','important');const glyph=document.createRange();glyph.selectNodeContents(letter);
   while(letterSize>10&&(glyph.getBoundingClientRect().height>letter.clientHeight-1||glyph.getBoundingClientRect().width>letter.clientWidth-1)){letterSize-=.5;letter.style.setProperty('font-size',letterSize+'px','important');}continue;
  }
  el.style.removeProperty('font-size');
  const cs=getComputedStyle(el),max=parseFloat(cs.fontSize),space=el.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom);
  const range=document.createRange();range.selectNodeContents(el);
  let size=max;
  const innerWidth=el.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
  while(size>14&&(range.getBoundingClientRect().height>space-8||range.getBoundingClientRect().width>innerWidth+1||el.scrollWidth>el.clientWidth+1)){
   size-=.5;el.style.setProperty('font-size',size+'px','important');
  }
 }}
 function schedule(){if(!pending){pending=true;requestAnimationFrame(fit);}}
 new MutationObserver(schedule).observe(document.querySelector('.app'),{subtree:true,childList:true,characterData:true});
 addEventListener('resize',schedule);document.addEventListener('screenchange',schedule);schedule();
})();
