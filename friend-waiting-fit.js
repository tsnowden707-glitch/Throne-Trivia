// Keep the waiting flow inside the panel painted in the currently displayed artwork.
(()=>{
 const page=document.getElementById('invite');
 function setup(){
  if(current!=='invite'||TT.getRoomCode())return;
  window.dispatchEvent(new CustomEvent('throne-online-presentation',{detail:{state:{owner:'preview',guest:null},details:{owner_character:CHARACTER_ROSTER[selected].id},myId:'preview'}}));
 }
 function fit(){
  if(!page?.classList.contains('approved-online-waiting'))return;
  const stage=page.querySelector('.approved-stage'),img=stage?.querySelector('.screen-art'),content=stage?.querySelector('.content');
  if(!img?.naturalWidth||!content)return;
  const b=stage.getBoundingClientRect(),r=img.getBoundingClientRect(),style=getComputedStyle(img);
  let w=r.width,h=r.height;
  if(style.objectFit==='cover'||style.objectFit==='contain'){const scale=Math[style.objectFit==='cover'?'max':'min'](r.width/img.naturalWidth,r.height/img.naturalHeight);w=img.naturalWidth*scale;h=img.naturalHeight*scale;}
  const pos=style.objectPosition.split(' ').map(v=>parseFloat(v)/100),ox=r.left-b.left+(r.width-w)*(Number.isFinite(pos[0])?pos[0]:.5),oy=r.top-b.top+(r.height-h)*(Number.isFinite(pos[1])?pos[1]:.5);
  const portrait=img.naturalHeight>img.naturalWidth,box=portrait?[.08,.445,.92,.95]:[.245,.455,.755,.845];
  const left=Math.max(14,ox+box[0]*w),right=Math.min(b.width-14,ox+box[2]*w),top=Math.max(0,oy+box[1]*h),bottom=Math.min(b.height-12,oy+box[3]*h),cw=right-left,ch=bottom-top;
  const title=Math.min(30,Math.max(22,ch*.09)),actions=b.height<500?64:ch<300?72:92,gap=b.height<500?4:6,name=b.height<500?22:36;
  const size=Math.max(36,Math.min((cw-44)/2,ch-title-actions-gap*2-name));
  for(const[k,v]of Object.entries({left,top,width:cw,height:ch}))content.style.setProperty(k,v+'px','important');
  content.style.setProperty('--waiting-title-height',title+'px');content.style.setProperty('--waiting-actions-height',actions+'px');content.style.setProperty('--waiting-gap',gap+'px');content.style.setProperty('--waiting-image-size',size+'px');content.style.setProperty('--waiting-name-height',name+'px');
  content.style.setProperty('--waiting-label-size',Math.max(11,Math.min(17,size*.12))+'px');
  page.dataset.waitingPanel=JSON.stringify({left,top,right,bottom});
 }
 window.addEventListener('throne-online-presentation',()=>queueMicrotask(fit));window.addEventListener('resize',fit);document.addEventListener('screenchange',()=>queueMicrotask(()=>{setup();fit();}));document.addEventListener('load',fit,true);new ResizeObserver(fit).observe(page);fit();
})();

