// Keep controls and artwork in one coordinate system in either orientation.
(() => {
 const app=document.querySelector('.app');
 const screens=['invite','characters','lobby','countdown','quiz','feedback','summary','victory','leaderboard','rewards','settings','seasons','levels','ttOnline'];
 const stages=[];
 const splash=document.querySelector('.splashComposition'),splashArt=splash.querySelector('.splashOriginal');
 splashArt.addEventListener('load',resize);
 for(const id of screens){
  const page=document.getElementById(id),art=page.querySelector('.screen-art'),content=page.querySelector('.content');
  if(!art||!content)continue;
  const stage=document.createElement('div');stage.className='approved-stage';
  page.classList.add('approved-page');page.prepend(stage);stage.append(art,content);stages.push({stage,art});
  art.addEventListener('load',resize);
 }
 function resize(){
  const ratio=splashArt.naturalWidth&&splashArt.naturalHeight?splashArt.naturalWidth/splashArt.naturalHeight:2/3;
  const sw=Math.min(app.clientWidth,app.clientHeight*ratio);
  splash.style.width=sw+'px';splash.style.height=(sw/ratio)+'px';
  splash.classList.toggle('approved-wide-splash',ratio>1);

  for(const {stage,art} of stages){
   const ratio=art.naturalWidth&&art.naturalHeight?art.naturalWidth/art.naturalHeight:4/7;
   const width=Math.min(app.clientWidth,app.clientHeight*ratio);
   stage.style.width=width+'px';stage.style.height=(width/ratio)+'px';
   stage.dataset.orientation=ratio>1?'landscape':'portrait';
  }
 }
 new ResizeObserver(resize).observe(app);
 document.addEventListener('screenchange',resize);
 window.addEventListener('artworkchange',resize);
 resize();
})();
