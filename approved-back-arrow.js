/* Presentation only: keep every original navigation callback and accessible name. */
(()=>{
 const candidates='.back,.journey-back,.card-action-back,.details-back,.raven-back,.trade-back';
 const rules={background:"transparent url('approved-back-arrow-cutout-review.png') center/contain no-repeat",border:'0',borderRadius:'0',boxShadow:'none',color:'transparent',textShadow:'none',fontSize:'0',padding:'0',minWidth:'0',minHeight:'44px',width:'76px',height:'48px'};
 function apply(){
  document.querySelectorAll(candidates).forEach(button=>{
   if(button.tagName!=='BUTTON'||button.classList.contains('approved-back-arrow'))return;
   button.classList.add('approved-back-arrow');if(!button.getAttribute('aria-label'))button.setAttribute('aria-label','Back');
   for(const [key,value]of Object.entries(rules)){if(button.classList.contains('journey-back')&&['background','width','height','minHeight'].includes(key))continue;button.style.setProperty(key.replace(/[A-Z]/g,m=>'-'+m.toLowerCase()),value,'important');}
  });
 }
 apply();new MutationObserver(apply).observe(document.body,{childList:true,subtree:true});
})();
