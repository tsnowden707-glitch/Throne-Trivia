(() => {
 const musicControl=document.getElementById('musicBtn');musicControl.hidden=true;
 const content=document.querySelector('#settings .content'),panels=[...content.querySelectorAll(':scope>.panel')],extras=[...content.children].filter(x=>x.tagName==='BUTTON');
 const tabs=document.createElement('div');tabs.className='settings-tabs';tabs.setAttribute('role','tablist');
 function show(i){panels.forEach((p,j)=>p.hidden=i!==j);extras.forEach(x=>x.hidden=i!==1);[...tabs.children].forEach((b,j)=>b.setAttribute('aria-selected',String(i===j)));}
 ['Audio','Game'].forEach((name,i)=>{const b=document.createElement('button');b.textContent=name;b.setAttribute('role','tab');b.onclick=()=>show(i);tabs.append(b);});content.querySelector('h1').after(tabs);show(0);
 for(const [id,label] of [['narrate','Narration'],['effects','Sound effects']])document.getElementById(id).setAttribute('aria-label',label);
 content.querySelector('input[type=range]').setAttribute('aria-label','Music volume');
})();
