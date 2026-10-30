// Decorative effects share a single animation loop across every game screen.
// Coordinates follow the artwork's rendered rectangle, including portrait letterboxing.
(() => {
  const app = document.querySelector('.app');
  const canvas = document.createElement('canvas');
  canvas.id = 'ambientFire';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:6;pointer-events:none';
  app.append(canvas);
  document.getElementById('embers').replaceChildren();
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let width = 1, height = 1, frame = 0, previous = 0, time = 0;
  let area, sources = [], active = '', sparks = [], artImage=null, artRegions=[];
  let fireTiles=[],fireTileKey='';
  function prepareFireTiles(){
    const key=active+(artImage?.currentSrc||'')+JSON.stringify(artRegions);
    if(key===fireTileKey)return;
    fireTiles=[];
    if(!artImage?.complete||!artImage.naturalWidth){fireTileKey='';return;}
    fireTileKey=key;
    for(const [x,y,w,h] of artRegions){
      const tile=document.createElement('canvas');
      tile.width=Math.max(1,Math.min(512,Math.round(w*artImage.naturalWidth)));
      tile.height=Math.max(1,Math.round(tile.width*h*artImage.naturalHeight/(w*artImage.naturalWidth)));
      const paint=tile.getContext('2d',{willReadFrequently:true});
      paint.drawImage(artImage,x*artImage.naturalWidth,y*artImage.naturalHeight,w*artImage.naturalWidth,h*artImage.naturalHeight,0,0,tile.width,tile.height);
      try{
        const pixels=paint.getImageData(0,0,tile.width,tile.height),data=pixels.data;
        for(let py=0;py<tile.height;py++)for(let px=0;px<tile.width;px++){
          const n=(py*tile.width+px)*4,r=data[n],g=data[n+1],b=data[n+2];
          const warm=r>180&&g>65&&r>b*1.3;
          const cool=b>175&&g>100&&b>r*1.2;
          const edge=Math.min(1,px/8,py/8,(tile.width-1-px)/8,(tile.height-1-py)/8);
          const flameOnly=active!=='lobby'||py<tile.height*.72;
          data[n+3]=(warm||cool)&&flameOnly?Math.round(255*Math.max(0,edge)):0;
        }
        paint.putImageData(pixels,0,0);fireTiles.push({tile,x,y,w,h});
      }catch(_){/* Leave unverified cross-origin pixels unmodified. */}
    }
  }
  const regions={
    invite:[[.42,.23,.18,.10]],characters:[[0,.66,.15,.09],[.85,.66,.15,.09],[.17,.10,.15,.12],[.72,.10,.20,.15]],
    lobby:[[0,.54,.16,.12],[.84,.54,.16,.12],[.30,.24,.07,.03],[.62,.24,.07,.03]],
    countdown:[[0,.55,.16,.12],[.84,.55,.16,.12]],quiz:[[0,.68,.16,.10],[.84,.68,.16,.10],[.19,.21,.06,.04],[.72,.21,.06,.04]],
    feedback:[[.02,.66,.16,.10],[.83,.66,.17,.10],[.18,.09,.19,.14],[.66,.09,.21,.16]],
    summary:[[0,.74,.13,.10],[.88,.74,.12,.10],[.18,.17,.13,.08],[.70,.17,.13,.08]],
    victory:[[0,.38,.17,.09],[.82,.38,.18,.09],[0,.64,.13,.05],[.88,.62,.12,.07]],
    leaderboard:[[0,.63,.12,.07],[.89,.63,.11,.07],[.11,.20,.06,.04],[.83,.20,.06,.04]],
    rewards:[[0,.57,.16,.09],[.84,.57,.16,.09],[.15,.39,.05,.035],[.80,.39,.05,.035]],settings:[[0,.70,.14,.09],[.86,.70,.14,.09]],
    seasons:[[0,.72,.17,.10],[.83,.72,.17,.10]],levels:[[0,.70,.14,.08],[.86,.70,.14,.08]],
    menu:[[.04,.55,.12,.06],[.84,.55,.12,.06],[.20,.09,.18,.10],[.67,.08,.20,.12]]
  };
  const random = (a, b) => a + Math.random() * (b - a);
  const splashArt=new Image();splashArt.src='approved-splash.png';
  const journeyFireArt={};
  for(const orientation of ['portrait','landscape']){const image=new Image();image.onload=()=>{if(active==='journeyStory')layout();};image.src='journey-'+orientation+'.png';journeyFireArt[orientation]=image;}
  function layout() {
    const bounds = app.getBoundingClientRect();
    width = app.clientWidth; height = app.clientHeight;
    const scale = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * scale); canvas.height = Math.round(height * scale);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    active = document.querySelector('.page.active')?.id || '';
    area = { x: 0, y: 0, w: width, h: height };
    sources = [];
    artImage=document.querySelector('.page.active .screen-art')||(active==='menu'?document.getElementById('kingdomMenuArt'):active==='splash'&&(app.dataset.kingdom!=='royal-castle'||width>height)?document.querySelector('.splashOriginal'):null);
    artRegions=[];
    if(active==='journeyStory'){
      const stage=document.querySelector('.journey-stage'),r=stage.getBoundingClientRect();
      area={x:r.left-bounds.left,y:r.top-bounds.top,w:r.width,h:r.height};
      const portrait=r.height>r.width,record=stage.classList.contains('journey-record-view');
      sources=record?[[.08,.16,.02,.06,0],[.95,.16,.02,.06,0]]:[];
      if(!record){
        // Animate only flame-colored pixels from the actual bowls, not floating synthetic fire.
        artImage=journeyFireArt[portrait?'portrait':'landscape'];
        artRegions=portrait?[[0,.29,.12,.065],[.86,.28,.14,.075],[0,.73,.12,.075],[.86,.73,.14,.075]]:[[0,.49,.125,.16],[.875,.47,.125,.18]];
      }
    }else if(artImage&&artImage.naturalWidth){
      const r=artImage.getBoundingClientRect(),style=getComputedStyle(artImage);
      if(style.objectFit==='cover'){
        const scale=Math.max(r.width/artImage.naturalWidth,r.height/artImage.naturalHeight),w=artImage.naturalWidth*scale,h=artImage.naturalHeight*scale;
        const y=active==='menu'?.17:.42;
        area={x:r.left-bounds.left+(r.width-w)/2,y:r.top-bounds.top+(r.height-h)*(width>height?y:.5),w,h};
      }else area={x:r.left-bounds.left,y:r.top-bounds.top,w:r.width,h:r.height};
      artRegions=regions[active==='ttOnline'?'quiz':active]||[];
      if(active==='menu'&&artImage.dataset.artScreen==='characters')artRegions=regions.characters;
      if(active==='menu'&&artImage.dataset.artScreen!=='characters'&&document.querySelector('.app').dataset.kingdom!=='royal-castle'){
        const theme=document.querySelector('.app').dataset.kingdom;
        const ys={'the-wall':[.51,.075],'kings-landing':[.53,.09],dragonstone:[.48,.075],'casterly-rock':[.60,.07],highgarden:[.52,.07],'iron-islands':[.46,.085]};
        const [y,h]=ys[theme]||[.57,.11];artRegions=[[.02,y,.15,h],[.83,y,.15,h]];
      }
      const artScreen=artImage.dataset.artScreen||active;
      const wideEntry=window.THRONE_LANDSCAPE_SETS?.[app.dataset.kingdom]?.[artScreen];
      const themedEntry=wideEntry&&artImage.getAttribute('src')===wideEntry.src?wideEntry:window.THRONE_THEME_SETS?.[app.dataset.kingdom]?.[artScreen];
      if(themedEntry?.fireRegions)artRegions=themedEntry.fireRegions;
      if(active==='menu'&&app.dataset.kingdom==='royal-castle'&&document.querySelector('.approved-landscape'))artRegions=[[.09,.65,.055,.075],[.85,.65,.055,.075]];
      sources=artRegions.map(([x,y,w,h])=>[x+w/2,y+h,w*.4,h,0]);
    }else
    if (active === 'splash') {
      const r = document.querySelector('.splashComposition').getBoundingClientRect();
      area = { x: r.left - bounds.left, y: r.top - bounds.top, w: r.width, h: r.height };
      sources = [[.16,.624,.061,.065,0],[.833,.624,.061,.065,0]];
    } else if (active === 'menu') {
      sources = width > height
        ? [[.025,.78,.028,.08,0],[.97,.78,.028,.08,0],[.33,.48,.018,.06,0],[.668,.48,.018,.06,0],
           [.215,.269,.02,.065,0],[.789,.269,.02,.065,0],[.278,.77,.02,.06,0],[.713,.77,.02,.06,0]]
        : [[.25,.415,.038,.065,0],[.742,.415,.038,.065,0],[.028,.658,.04,.078,0],[.96,.658,.04,.078,0],
           [.35,.344,.017,.035,0],[.645,.344,.017,.035,0]];
    } else {
      // Match background-size:cover for the existing 940x1400 scene.
      const scale = Math.max(width/940,height/1400);
      area = {x:(width-940*scale)/2,y:(height-1400*scale)/2,w:940*scale,h:1400*scale};
      sources = [[.259,.764,.045,.14,0],[.728,.764,.045,.14,0],
        [.353,.44,.014,.075,0],[.643,.44,.014,.075,0],[.885,.94,.045,.13,0]];
    }
    prepareFireTiles();
    canvas.dataset.scene = active;
    canvas.dataset.sources = String(sources.length);
  }
const emberSprites=[['#ffe6a0','#ffb33c','#ff671a88','#ffe7a0'],['#ffbd68','#ff761e','#e63b0b88','#ffad44'],['#fff5c7','#ffd56b','#ff8b2988','#fff1af']].map(colors=>{const tile=document.createElement('canvas');tile.width=64;tile.height=64;const ec=tile.getContext('2d'),eg=ec.createRadialGradient(32,32,1,32,32,28);eg.addColorStop(0,colors[0]);eg.addColorStop(.15,colors[1]);eg.addColorStop(.4,colors[2]);eg.addColorStop(1,'#ff440000');ec.fillStyle=eg;ec.fillRect(0,0,64,64);ec.fillStyle=colors[3];ec.beginPath();ec.moveTo(24,32);ec.lineTo(30,20);ec.lineTo(38,29);ec.lineTo(35,41);ec.closePath();ec.fill();return tile;});

  function spark(initial = false, lane = 0) {
    const source = sources.length && Math.random() < .65 ? sources[Math.floor(Math.random()*sources.length)] : null;
    const sizeRoll = Math.random();
    const size = sizeRoll < .25 ? random(4,7) : sizeRoll < .65 ? random(2,3.8) : random(.7,1.6);
    return { lane, x: (lane + random(.04,.96))*width/3,
      y: initial ? random(0,height) : random(height*.2,height),
      vx: random(-28,28), vy: random(-38,10), phase: random(0,Math.PI*2),
      size, age: initial ? random(0,5) : 0, life: random(5,12), blue: source?.[4] === 1 };
  }
  function flame(s, i) {
    const [x,y,w,h,blue,angle=0] = s;
    ctx.save();ctx.translate(area.x+x*area.w,area.y+y*area.h);ctx.rotate(angle);
    const dragon = angle !== 0;
    const fw=w*area.w, fh=h*area.h*(dragon?1:1.25);
    const surge=.82+.13*Math.sin(time*3.1+i*2)+.08*Math.sin(time*8.3+i);
    const glow=ctx.createRadialGradient(0,-fh*.3,0,0,-fh*.3,fh*1.1);
    glow.addColorStop(0,blue?`rgba(90,190,255,${.27*surge})`:`rgba(255,100,15,${.3*surge})`);
    glow.addColorStop(1,'transparent');
    ctx.fillStyle=glow;ctx.fillRect(-fh*1.2,-fh*1.5,fh*2.4,fh*2.4);
    // Separate tongues stretch, curl and break up on different rhythms.
    for(let layer=0;layer<3;layer++)for(let j=0;j<7;j++){
      const phase=time*(4.5+j*.27)+i*2+j*1.7;
      const base=(j-3)*fw*.17;
      const tip=base+Math.sin(phase)*fw*.45+Math.sin(phase*1.9)*fw*.14;
      const high=fh*(.62+.13*Math.sin(j*2)+.23*Math.sin(phase*1.4))*surge*(1-layer*.2);
      const half=fw*(.25-layer*.055);
      const g=ctx.createLinearGradient(0,0,0,-high);
      const alpha=[.48,.43,.65][layer];
      g.addColorStop(0,blue?`rgba(195,245,255,${alpha})`:`rgba(255,239,150,${alpha})`);
      g.addColorStop(.25,blue?`rgba(90,200,255,${alpha})`:`rgba(255,174,36,${alpha})`);
      g.addColorStop(.65,blue?'rgba(35,125,255,.28)':'rgba(255,64,8,.32)');
      g.addColorStop(1,'transparent');
      ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(base-half,0);
      ctx.bezierCurveTo(base-half*1.7,-high*.34,tip+half*Math.cos(phase),-high*.7,tip,-high);
      ctx.bezierCurveTo(tip-half,-high*.52,base+half*1.6,-high*.18,base+half,0);ctx.fill();
    }
    // Short-lived wisps peel away from the flame rather than forming a solid glow.
    for(let j=0;j<8;j++){
      const age=(time*(.65+j*.035)+j*.137+i*.19)%1;
      const x=Math.sin(age*7+j)*fw*.45;
      const y=-fh*(.3+age*.9);
      ctx.globalAlpha=Math.sin(age*Math.PI)*.5;
      const radius=fw*(.12*(1-age)+.015);
      ctx.fillStyle=blue?'#83dfff':'#ffac35';
      ctx.beginPath();ctx.ellipse(x,y,radius,radius*2.8,Math.sin(time*4+j)*.6,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;
    ctx.restore();
  }
  function draw(stamp) {
    frame=0;
    if(document.hidden || reduced.matches) return;
    const dt=previous ? Math.min((stamp-previous)/1000,.05) : 0;
    previous=stamp;time+=dt;ctx.clearRect(0,0,width,height);
    ctx.globalCompositeOperation='screen';
    ctx.save();
    if(artImage&&artImage.complete&&artImage.naturalWidth){
      // Flicker the painted fire itself. Subtle strip displacement adds motion
      // without placing unrelated flame cones over the artwork.
      fireTiles.forEach(({tile,x,y,w,h},i)=>{
        ctx.save();
        ctx.globalAlpha=.12+.12*(1+Math.sin(time*8.7+i*2))+.04*Math.sin(time*17+i)**2;
        for(let k=0;k<12;k++){
          const sy=k*tile.height/12,sh=tile.height/12;
          const dx=active==='lobby'?0:Math.sin(time*6+k*.7+i)*Math.min(2,area.w*.003)*(1-k/12);
          if(active==='lobby')ctx.globalAlpha=.10+.10*(1+Math.sin(time*5+k*.9+i*2))+.035*Math.sin(time*13+i+k)**2;
          ctx.drawImage(tile,0,sy,tile.width,sh,area.x+x*area.w+dx,area.y+(y+h*k/12)*area.h,w*area.w,h*area.h/12+.5);
        }ctx.restore();
      });
    }else sources.forEach(flame);ctx.restore();
    if(active==='splash'&&width<=height&&app.dataset.kingdom==='royal-castle'&&document.querySelector('.opening-video')?.hidden&&splashArt.complete&&splashArt.naturalWidth){
      // Animate the approved pixels themselves, never a differently shaped flame cone.
      for(const [i,points] of [
        [[.252,.124],[.288,.144],[.355,.221],[.30,.225],[.237,.157]],
        [[.735,.124],[.75,.151],[.683,.234],[.622,.223],[.703,.156]]
      ].entries()){
        ctx.save();ctx.beginPath();points.forEach(([x,y],n)=>{const px=area.x+x*area.w,py=area.y+y*area.h;n?ctx.lineTo(px,py):ctx.moveTo(px,py);});ctx.closePath();ctx.clip();
        ctx.globalAlpha=.07+.06*(1+Math.sin(time*9+i*2))+.035*Math.sin(time*17+i)**2;
        ctx.drawImage(splashArt,area.x,area.y,area.w,area.h);ctx.restore();
      }
    }
    if(active!=='splash'&&active!=='menu'){
      // Clearing each rectangle creates a union; overlapping buttons/images stay protected.
      const origin=app.getBoundingClientRect();
      for(const el of document.querySelectorAll('.page.active .approved-result-card,.page.active .panel,.page.active button,.page.active input,.page.active .title,.page.active .question,.page.active img:not(.screen-art):not(#kingdomMenuArt)')){
        const r=el.getBoundingClientRect();if(r.width&&r.height)ctx.clearRect(r.left-origin.left-2,r.top-origin.top-2,r.width+4,r.height+4);
      }
    }
    const target=active==='victory'?180:active==='splash'||active==='menu'?180:135;
    while(sparks.length<target)sparks.push(spark(true,sparks.length%3));
    if(sparks.length>target)sparks.length=target;
    for(let i=0;i<sparks.length;i++){
      let p=sparks[i];p.age+=dt;
      if(p.age>p.life||p.y < -20||p.x < -30||p.x>width+30){p=sparks[i]=spark(false,p.lane);}
      const oldX=p.x,oldY=p.y;
      p.x+=(p.vx+Math.sin(time*1.2+p.phase+p.y*.012)*24)*dt;
      p.y+=(p.vy+Math.cos(time*1.7+p.phase+p.x*.009)*19)*dt;
      const laneLeft=p.lane*width/3,laneRight=(p.lane+1)*width/3;if(p.x<laneLeft||p.x>laneRight){p.vx=-p.vx;p.x=Math.max(laneLeft,Math.min(laneRight,p.x));}
      const fade=Math.min(1,p.age*2,(p.life-p.age)*.6);
      ctx.globalAlpha=Math.max(0,fade)*(.45+.5*Math.abs(Math.sin(p.phase*3)))*(.65+.3*Math.sin(time*5+p.phase)**2);
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.phase+time*(.8+p.size*.2));
      ctx.scale(.45+.55*Math.abs(Math.sin(time*1.9+p.phase)),1);
      const d=p.size*5;ctx.drawImage(emberSprites[Math.floor(p.phase*10)%3],-d/2,-d/2,d,d);ctx.restore();
    }
    // Embers stay around the controls, never over names, questions or faces.
    const origin=app.getBoundingClientRect();
    for(const el of document.querySelectorAll('.page.active button,.page.active input,.page.active .approved-result-card,.page.active .panel,.page.active .title,.page.active .question,.page.active .journey-question,.page.active .journey-reminder,.page.active .bella-guide,.page.active .journey-panels,.page.active .journey-heading,.page.active img:not(.screen-art):not(#kingdomMenuArt):not(.splashOriginal)')){
      const r=el.getBoundingClientRect();if(r.width&&r.height)ctx.clearRect(r.left-origin.left-1,r.top-origin.top-1,r.width+2,r.height+2);
    }
    canvas.dataset.emberLanes=JSON.stringify([0,1,2].map(lane=>sparks.filter(p=>p.lane===lane).length));
    ctx.shadowBlur=0;ctx.globalAlpha=1;canvas.dataset.frames=String(Number(canvas.dataset.frames||0)+1);
    frame=requestAnimationFrame(draw);
  }
  function resume(){
    cancelAnimationFrame(frame);frame=0;previous=0;
    if(!document.hidden&&!reduced.matches)frame=requestAnimationFrame(draw);
    else ctx.clearRect(0,0,width,height);
  }
  new ResizeObserver(layout).observe(app);
  app.addEventListener('load',layout,true);
  window.addEventListener('artworkchange',layout);
  new MutationObserver(layout).observe(app,{subtree:true,attributes:true,attributeFilter:['class']});
  document.addEventListener('visibilitychange',resume);
  window.addEventListener('pageshow',()=>{layout();resume();});
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);frame=0;previous=0;});
  reduced.addEventListener('change',resume);
  layout();resume();
})();
