// Approved artwork with one live card layer. No inventory writes in this view.
(() => {
 function create({cards,getInventory,onCard,onBack,onFriends,onTutorial,isUsable=()=>false}){
  const root=document.createElement('section');root.className='journey-card-collection';root.setAttribute('aria-label','Journey Cards');
  const stage=document.createElement('div');stage.className='journey-card-stage';root.append(stage);
  const art=document.createElement('picture');art.innerHTML='<source media="(orientation: portrait)" srcset="cards/collection-portrait.webp"><img class="journey-card-background" src="cards/collection-landscape.webp" alt="" aria-hidden="true">';stage.append(art);
  const count=document.createElement('output');count.className='card-discovery-count';stage.append(count);
  const grid=document.createElement('div');grid.className='journey-card-grid';grid.tabIndex=0;grid.setAttribute('aria-label','Your card collection');stage.append(grid);
  let family=null,ready=false,page=0;const filters=[];
  function control(label,cls,action){const b=document.createElement('button');b.className='card-art-hotspot '+cls;b.setAttribute('aria-label',label);b.title=label;b.onclick=action;stage.append(b);return b;}
  const all=control('All cards','card-filter-all',()=>{family=null;ready=false;page=0;render();});
  const available=control('Ready to Use','card-filter-ready',()=>{ready=true;page=0;render();});
  for(const name of ['Supplies','Information','Diplomacy','Protection']){const b=control(name,'card-family-'+name.toLowerCase(),()=>{family=family===name?null:name;page=0;render();});filters.push([name,b]);}
  control('Back','card-action-back',onBack);control('Friends & Trading','card-action-friends',onFriends);control('How Cards Work','card-action-tutorial',onTutorial);
  for(const cls of ['card-light-left','card-light-right']){const light=document.createElement('i');light.className='card-candle-light '+cls;light.setAttribute('aria-hidden','true');stage.append(light);}
  function selected(button,value){button.classList.toggle('selected',value);button.setAttribute('aria-pressed',String(value));}
  function render(){
   const inventory=getInventory();count.textContent=inventory.discovered.length+' / 48 discovered';
   selected(all,!ready&&!family);selected(available,ready);for(const [name,b] of filters)selected(b,family===name);
   grid.replaceChildren();
   const shown=cards.filter(c=>(!family||c.family===family)&&(!ready||((inventory.copies[c.id]||0)>0&&isUsable(c))));
   const pageSize=4,total=Math.max(1,Math.ceil(shown.length/pageSize));page=Math.min(page,total-1);
   for(const card of shown.slice(page*pageSize,(page+1)*pageSize)){
    const known=inventory.discovered.includes(card.id),b=document.createElement('button');b.className='journey-collection-card';
    b.setAttribute('aria-label',known?card.name+', '+(inventory.copies[card.id]||0)+' copies':'Undiscovered '+card.family+' card');
    if(known){const img=document.createElement('img');img.src=card.image;img.alt=card.name;img.loading='lazy';b.append(img);const copies=document.createElement('span');copies.className='card-copy-count';copies.textContent='×'+(inventory.copies[card.id]||0);b.append(copies);b.onclick=()=>onCard(card);}
    else {b.classList.add('undiscovered');const seal=document.createElement('span');seal.textContent='♜';seal.setAttribute('aria-hidden','true');b.append(seal);b.disabled=true;}
    grid.append(b);
   }
   let pager=stage.querySelector('.collection-pager');if(!pager){pager=document.createElement('div');pager.className='collection-pager';stage.append(pager);}pager.replaceChildren();pager.hidden=total<=1;const previous=document.createElement('button'),next=document.createElement('button'),label=document.createElement('span');previous.textContent='‹';previous.setAttribute('aria-label','Previous card page');next.textContent='›';next.setAttribute('aria-label','Next card page');previous.disabled=page===0;next.disabled=page===total-1;previous.onclick=()=>{page--;render();};next.onclick=()=>{page++;render();};label.textContent=(page+1)+' / '+total;pager.append(previous,label,next);
   if(!shown.length){const empty=document.createElement('p');empty.className='card-empty';empty.textContent='No cards are ready for this scene.';grid.append(empty);}
  }
  window.addEventListener('resize',()=>{if(root.isConnected)render();});render();return {element:root,render};
 }
 window.ThroneCardCollection=Object.freeze({create});
})();
