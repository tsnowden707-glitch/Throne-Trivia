// Keep the current screen until its destination's approved art has decoded.
(()=>{
 const previous=go;let navigation=0;
 go=function(page){
  const token=++navigation,img=document.querySelector('#'+page+' .screen-art');
  if(!['characters','invite'].includes(page)||!img)return previous.apply(this,arguments);
  const source=kingdomArt(page);if(img.getAttribute('src')!==source)img.src=source;
  if(img.complete&&img.naturalWidth)return previous.apply(this,arguments);
  return img.decode().catch(()=>{}).then(()=>{if(token===navigation)return previous(page);});
 };
})();
