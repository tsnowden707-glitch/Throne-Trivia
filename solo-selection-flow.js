/* Solo chooses once; friend selection and its save remain independent. */
(()=>{
 const key='throne_character_v2',baseGo=go,baseReady=readyCharacter;
 let manualPicker=false,entering=false;
 const page=document.getElementById('seasons'),next=page.querySelector('.content>.btn');
 const choose=document.createElement('button');choose.type='button';choose.className=next.className+' solo-change-character';choose.textContent='CHOOSE A CHARACTER';
 choose.onclick=()=>{manualPicker=true;baseGo('characters');};const actions=document.createElement('div');actions.className='solo-season-actions';page.querySelector('.approved-stage').append(actions);actions.append(choose,next);
 const notice=document.createElement('p');notice.className='solo-character-notice';notice.hidden=true;choose.before(notice);
 function preferred(){return CHARACTER_ROSTER.findIndex(c=>c.id===localStorage.getItem(key));}
 function available(index){return eligibleCharacters().some(c=>c.index===index);}
 function update(){choose.hidden=playMode==='friend';actions.classList.toggle('friend-mode',playMode==='friend');if(playMode==='friend')notice.hidden=true;}
 async function enter(){
  if(entering)return;const wanted=preferred();validateCharacter();
  if(!available(wanted)){
   manualPicker=true;await baseGo('characters');const label=document.getElementById('selected');
   label.textContent=CHARACTER_ROSTER[wanted].name+' is not available in this season. Choose an available character to replace your solo selection.';label.classList.add('solo-selection-warning');return;
  }
  selected=wanted;entering=true;const origin=current,season=currentSeason;
  try{choosePracticeRival();const rival=practiceRival;
   await Promise.all([P[selected],P[rival.index],kingdomArt('lobby')].map(src=>{const image=new Image();image.src=src;return image.decode().catch(()=>{});}));
   if(current!==origin||currentSeason!==season||playMode==='friend')return;
   preparedPracticeRival=rival;await baseGo('lobby');
  }finally{entering=false;}
 }
 go=function(destination){
  if(playMode!=='friend'&&destination==='characters'&&current==='levels'&&!manualPicker&&preferred()>=0)return enter();
  if(playMode!=='friend'&&destination==='characters'&&current==='lobby'&&!manualPicker)return baseGo('levels');
  if(destination!=='characters')manualPicker=false;
  return baseGo.apply(this,arguments);
 };
 readyCharacter=async function(){
  if(playMode!=='friend'){validateCharacter();rememberCharacter();if(manualPicker){manualPicker=false;document.getElementById('selected').classList.remove('solo-selection-warning');return baseGo('seasons');}}
  return baseReady.apply(this,arguments);
 };
 const back=document.querySelector('#characters>.back,#characters .back');if(back){const old=back.onclick;back.onclick=function(){if(playMode!=='friend'&&manualPicker){manualPicker=false;return baseGo('seasons');}return old?.call(this);};}
 document.addEventListener('screenchange',update);update();
})();

