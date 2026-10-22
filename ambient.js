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
  let area, sources = [], active = '', sparks = [];
  const random = (a, b) => a + Math.random() * (b - a);
  function layout() {
    const bounds = app.getBoundingClientRect();
    width = app.clientWidth; height = app.clientHeight;
    const scale = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * scale); canvas.height = Math.round(height * scale);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    active = document.querySelector('.page.active')?.id || '';
    area = { x: 0, y: 0, w: width, h: height };
    sources = [];
    if (active === 'splash') {
      const r = document.querySelector('.splashComposition').getBoundingClientRect();
      area = { x: r.left - bounds.left, y: r.top - bounds.top, w: r.width, h: r.height };
      sources = [[.16,.624,.061,.065,0],[.833,.624,.061,.065,0],
        [.255,.137,.036,.115,1,2.55],[.733,.132,.042,.14,0,-2.55]];
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
    canvas.dataset.scene = active;
    canvas.dataset.sources = String(sources.length);
  }
  function spark(initial = false) {
    const source = sources.length && Math.random() < .65 ? sources[Math.floor(Math.random()*sources.length)] : null;
    return { x: source ? area.x + source[0]*area.w + random(-12,12) : random(0,width),
      y: initial ? random(0,height) : source ? area.y+source[1]*area.h : random(height*.2,height),
      vx: random(-28,28), vy: random(-38,10), phase: random(0,Math.PI*2),
      size: random(.45,1.65), age: initial ? random(0,5) : 0, life: random(5,12), blue: source?.[4] === 1 };
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
    // Fire remains behind live controls and text, even with the decorative canvas above panels.
    if(active!=='splash'&&active!=='menu'){
      const origin=app.getBoundingClientRect();
      ctx.beginPath();ctx.rect(0,0,width,height);
      for(const el of document.querySelectorAll('.page.active .panel,.page.active button,.page.active input,.page.active .title,.page.active .question,.page.active img')){
        const r=el.getBoundingClientRect();if(r.width&&r.height)ctx.rect(r.left-origin.left-2,r.top-origin.top-2,r.width+4,r.height+4);
      }
      ctx.clip('evenodd');
    }
    sources.forEach(flame);ctx.restore();
    const target=active==='victory'?140:active==='splash'||active==='menu'?95:70;
    while(sparks.length<target)sparks.push(spark(true));
    if(sparks.length>target)sparks.length=target;
    for(let i=0;i<sparks.length;i++){
      let p=sparks[i];p.age+=dt;
      if(p.age>p.life||p.y < -20||p.x < -30||p.x>width+30){p=sparks[i]=spark();}
      const oldX=p.x,oldY=p.y;
      p.x+=(p.vx+Math.sin(time*1.2+p.phase+p.y*.012)*24)*dt;
      p.y+=(p.vy+Math.cos(time*1.7+p.phase+p.x*.009)*19)*dt;
      const fade=Math.min(1,p.age*2,(p.life-p.age)*.6);
      ctx.globalAlpha=Math.max(0,fade)*(.38+.25*Math.sin(time*5+p.phase)**2);
      ctx.strokeStyle=p.blue?'#94e8ff':'#ffc37b';ctx.lineWidth=p.size;ctx.lineCap='round';
      ctx.shadowColor=p.blue?'#52aaff':'#ff6925';ctx.shadowBlur=4;
      ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+(oldX-p.x)*2+.4,p.y+(oldY-p.y)*2+1);ctx.stroke();
    }
    ctx.shadowBlur=0;ctx.globalAlpha=1;canvas.dataset.frames=String(Number(canvas.dataset.frames||0)+1);
    frame=requestAnimationFrame(draw);
  }
  function resume(){
    cancelAnimationFrame(frame);frame=0;previous=0;
    if(!document.hidden&&!reduced.matches)frame=requestAnimationFrame(draw);
    else ctx.clearRect(0,0,width,height);
  }
  new ResizeObserver(layout).observe(app);
  new MutationObserver(layout).observe(app,{subtree:true,attributes:true,attributeFilter:['class']});
  document.addEventListener('visibilitychange',resume);
  window.addEventListener('pageshow',()=>{layout();resume();});
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);frame=0;previous=0;});
  reduced.addEventListener('change',resume);
  layout();resume();
})();
