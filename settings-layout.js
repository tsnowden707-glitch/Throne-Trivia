(() => {
 const musicControl=document.getElementById('musicBtn');musicControl.hidden=true;
 const content=document.querySelector('#settings .content'),panels=[...content.querySelectorAll(':scope>.panel')];
 // Settings contains audio only; this removes presentation, never gameplay rules.
 panels.slice(1).forEach(panel=>panel.remove());
 content.querySelectorAll('.settings-tabs').forEach(tabs=>tabs.remove());
 const heading=panels[0]?.querySelector('h3');if(heading)heading.textContent='Audio';
 for(const [id,label] of [['narrate','Narration'],['effects','Sound effects']])document.getElementById(id).setAttribute('aria-label',label);
 content.querySelector('input[type=range]').setAttribute('aria-label','Music volume');
})();
(()=>{
 const original=window.kingdomArt;window.kingdomArt=function(screen,...args){return screen==='settings'?(matchMedia('(orientation:landscape)').matches?'settings-clean-landscape.png':'settings-clean-portrait.png'):original(screen,...args);};
 const page=document.getElementById('settings'),rows=[...page.querySelectorAll('.stat')];rows.forEach((row,i)=>row.dataset.audioRow=i);
 const music=rows[0].querySelector('button');music.setAttribute('aria-label','Music');music.setAttribute('role','switch');
 const sync=()=>{music.setAttribute('aria-checked',String(!musicMuted));music.classList.toggle('settings-off',musicMuted);};music.addEventListener('click',sync);document.addEventListener('screenchange',sync);sync();
 page.querySelectorAll('input[type=checkbox]').forEach(input=>{input.setAttribute('role','switch');});
 applyActiveKingdomArtwork();
})();
(()=>{const slider=document.querySelector('#settings input[type=range]');const paint=()=>slider.style.setProperty('--volume-fill',(Number(slider.value)*.84)+'%');slider.addEventListener('input',paint);paint();})();
