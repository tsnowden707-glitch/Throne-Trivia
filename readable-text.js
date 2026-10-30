// Keep live text inside the approved ornament at every viewport size.
(() => {
 const selector='#quiz .question,#quiz .answer,#ttOnline #onlinePrompt,#ttOnline #onlineLiveOptions button,.journey-question,.journey-choices button';
 let pending=false;
 function fit(){pending=false;for(const el of document.querySelectorAll(selector)){
  if(!el.getClientRects().length)continue;
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
