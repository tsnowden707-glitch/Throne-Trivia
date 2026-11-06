(() => {
 const loader=window.ThroneLoading;if(!loader)return;
 // Only user-requested online operations; background match polling never covers play.
 if(window.TT)for(const name of ['createRoom','joinRoom','rematch','signIn','signUp','cardCommand']){
  const previous=TT[name];if(typeof previous!=='function')continue;
  TT[name]=function(...args){return loader.wait(previous.apply(this,args));};
 }
 // Story preparation is asynchronous even before its panel becomes visible.
 if(window.ThroneJourney)for(const name of ['prepare','prepareEntry']){
  const previous=ThroneJourney[name];
  ThroneJourney[name]=function(...args){return loader.wait(previous.apply(this,args),{season:ThroneJourney.getScene()?.chapter||loader.season()});};
 }
 // Approved CSS backgrounds also need readiness tracking, not just <img> tags.
 const ready=new Set(),pending=new Set();
 function backgrounds(){
  const page=document.querySelector('.page.active');if(!page)return;
  const sources=[];
  for(const el of [page,...page.querySelectorAll('*')]){
   if(!el.getClientRects().length||el.closest('[hidden]'))continue;
   const value=getComputedStyle(el).backgroundImage;
   for(const match of value.matchAll(/url\(["']?([^"')]+)["']?\)/g)){
    const src=match[1];if(src.startsWith('data:')||ready.has(src)||pending.has(src))continue;
    sources.push(src);pending.add(src);
   }
  }
  if(sources.length)loader.images(sources).then(()=>sources.forEach(s=>ready.add(s))).catch(()=>{}).finally(()=>sources.forEach(s=>pending.delete(s)));
 }
 document.addEventListener('screenchange',()=>requestAnimationFrame(backgrounds));
 addEventListener('artworkchange',()=>requestAnimationFrame(backgrounds));
 backgrounds();
})();
