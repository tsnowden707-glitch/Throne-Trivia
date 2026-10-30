(() => {
 let cards=[],inventory=null,root=null,collection=null,busy=false,poll=null,selectedFriend=null,mailView=false,priorFocus=null,friendPage=0;
 const catalog=fetch('journey-card-catalog.json').then(r=>{if(!r.ok)throw Error('Card artwork could not load');return r.json();}).then(x=>cards=x.cards);
 const pendingKey='throne_card_rewards_pending_v1';
 const byId=id=>cards.find(c=>c.id===id);
 function pending(){try{return JSON.parse(localStorage.getItem(pendingKey)||'[]');}catch{return [];}}
 let presentingMail=false;
 async function receivedCards(){
  if(!root||!inventory||presentingMail||busy||document.hidden||document.querySelector('dialog[open]'))return;
  const key='throne_card_mail_seen_'+inventory.id;let seen=[];try{seen=JSON.parse(localStorage.getItem(key)||'[]');}catch{}
  const arrivals=inventory.mail.filter(m=>m.status==='complete'&&!seen.includes(m.id)&&(m.kind==='trade'||m.kind==='gift'&&m.recipient===inventory.id));
  presentingMail=true;
  try{for(const m of arrivals){const card=byId(m.kind==='trade'&&m.sender===inventory.id?m.want_card:m.give_card);if(!card)continue;seen.push(m.id);try{localStorage.setItem(key,JSON.stringify(seen));}catch{}await ThroneCardReveal.show(card);await tutorial('first-card',true);}}finally{presentingMail=false;}
 }
 async function command(action,args={}){return TT.cardCommand(action,args);}
 async function refresh(){inventory=await command('state');for(const use of inventory.uses||[]){const c=byId(use.card);if(c&&window.ThroneJourney?.getScene()?.id===use.scene&&!ThroneJourney.getState().cardEffects?.[use.scene])ThroneJourney.applyCard(c,use.scene);}return inventory;}
 function close(){clearInterval(poll);poll=null;root?.remove();root=null;collection=null;document.querySelectorAll('.page[data-cards-inert]').forEach(p=>{p.inert=false;delete p.dataset.cardsInert;});if(priorFocus?.isConnected)priorFocus.focus();}
 function mount(el){const origin=priorFocus||document.activeElement;close();priorFocus=origin;root=el;root.classList.add('cards-feature');root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','Journey Cards');document.querySelectorAll('.page').forEach(p=>{if(!p.inert){p.inert=true;p.dataset.cardsInert='true';}});document.body.append(root);window.ThroneVoice?.stop();queueMicrotask(()=>root?.querySelector('button:not(:disabled)')?.focus());}
 function button(text,fn){const b=document.createElement('button');b.textContent=text;b.onclick=fn;return b;}
 function message(text){const d=document.createElement('dialog');d.className='cards-dialog';const p=document.createElement('p');p.textContent=text;d.append(p,button('Close',()=>{d.close();d.remove();}));document.body.append(d);d.showModal();}
 async function run(fn){if(busy)return;busy=true;try{await fn();}catch(e){message(e.message||'Could not connect. Please try again.');}finally{busy=false;}}
 function form(title,fields,submit,label='Continue'){
  const d=document.createElement('dialog');d.className='cards-dialog';const h=document.createElement('h2');h.textContent=title;const f=document.createElement('form');const inputs={};
  for(const field of fields){const l=document.createElement('label');l.textContent=field.label;const input=document.createElement(field.options?'select':'input');input.name=field.name;input.required=true;if(field.options){for(const [value,text] of field.options){const o=document.createElement('option');o.value=value;o.textContent=text;input.append(o);}}else{input.maxLength=field.maxLength||32;input.value=field.value||'';}inputs[field.name]=input;l.append(input);f.append(l);}
  const status=document.createElement('p');status.setAttribute('role','status');const send=button(label,()=>{});send.type='submit';const cancel=button('Cancel',()=>{d.close();d.remove();});cancel.type='button';f.append(status,send,cancel);
  f.onsubmit=async e=>{e.preventDefault();send.disabled=true;try{await submit(Object.fromEntries(Object.entries(inputs).map(([k,v])=>[k,v.value])));d.close();d.remove();}catch(err){status.textContent=err.message;send.disabled=false;}};
  d.append(h,f);document.body.append(d);d.showModal();
 }
 function tutorial(part,once=false){
  if(!part){const d=document.createElement('dialog');d.className='cards-dialog';d.setAttribute('aria-label','How Cards Work');for(const [id,label] of [['first-card','Earning cards'],['friends','Friends & Trading'],['use-card','Using a card']])d.append(button(label,()=>{d.close();d.remove();tutorial(id);}));d.append(button('Close',()=>{d.close();d.remove();}));document.body.append(d);d.showModal();return Promise.resolve();}
  const key='throne_cards_heard_'+part;if(once&&localStorage.getItem(key))return Promise.resolve();if(once&&document.getElementById('narrate')?.checked===false)return Promise.resolve();
  return new Promise(resolve=>{window.ThroneVoice?.stop();const synced=['first-card','friends'].includes(part),portrait=document.createElement('video');const audio=synced?portrait:new Audio('audio/cards/'+part+'.mp3');audio.muted=new URL(location.href).searchParams.get('quiet')==='1';const d=document.createElement('dialog');d.className='cards-dialog';d.setAttribute('aria-label','Sir Edward explains '+part);let stopped=false;
   portrait.src=synced?'video/edward/'+part+'-lipsynced.mp4':'video/edward-intro.mp4';portrait.muted=synced?audio.muted:true;portrait.playsInline=true;portrait.loop=!synced;portrait.className='cards-tutorial-edward';portrait.setAttribute('aria-label','Sir Edward');d.classList.add('edward-tutorial-dialog');const portraitFrame=document.createElement('div');portraitFrame.className='edward-tutorial-frame';portraitFrame.append(portrait);d.append(portraitFrame);
   const speaking=value=>document.dispatchEvent(new CustomEvent('narrationstate',{detail:{speaking:value,src:audio.src}}));
   const stop=()=>{if(stopped)return;stopped=true;audio.pause();portrait.pause();speaking(false);document.removeEventListener('visibilitychange',hide);d.close();d.remove();try{localStorage.setItem(key,'1');}catch{}resolve();};
   const play=async()=>{await window.ThroneCardRhythm?.nextAccent(.4);if(stopped||document.hidden)return;audio.playbackRate=1;audio.play().catch(()=>{});};
   audio.onplaying=()=>{speaking(true);if(!synced&&!matchMedia('(prefers-reduced-motion: reduce)').matches)portrait.play().catch(()=>{});};audio.onpause=()=>{if(!synced)portrait.pause();speaking(false);};audio.onerror=()=>{stop();message('The introduction could not load. You can replay it from How Cards Work.');};
   const hide=()=>{if(document.hidden){audio.pause();portrait.pause();}};document.addEventListener('visibilitychange',hide);
   d.append(button('Play / Replay',()=>{audio.currentTime=0;play();}),button('Skip',stop));d.addEventListener('cancel',e=>{e.preventDefault();stop();});document.body.append(d);d.showModal();audio.onended=stop;play();
  });
 }
 async function open(){await run(async()=>{await catalog;await refresh();collection=ThroneCardCollection.create({cards,getInventory:()=>inventory,onBack:close,onCard:details,onFriends:friends,onTutorial:()=>tutorial(),isUsable:c=>window.ThroneJourney?.canUseCard(c)});const v=collection;mount(v.element);collection=v;});}
 function artPage(kind){const page=document.createElement('section');page.className='cards-art-page '+kind+'-page';const stage=document.createElement('div');stage.className='cards-art-stage';stage.innerHTML='<picture><source media="(orientation: portrait)" srcset="cards/'+kind+'-portrait.webp"><img class="cards-art-background" src="cards/'+kind+'-landscape.webp" alt="" aria-hidden="true"></picture>';for(const cls of ['card-light-left','card-light-right']){const light=document.createElement('i');light.className='card-candle-light '+cls;stage.append(light);}page.append(stage);mount(page);return stage;}
 function hotspot(stage,label,cls,fn){const b=button('',fn);b.setAttribute('aria-label',label);b.title=label;b.className='card-art-hotspot '+cls;stage.append(b);return b;}
 function text(stage,cls,value){const p=document.createElement('div');p.className=cls;p.textContent=value;stage.append(p);return p;}
 function details(card){
  const stage=artPage('details');const img=document.createElement('img');img.src=card.image;img.alt=card.name;img.className='details-card';stage.append(img);
  text(stage,'details-effect',JourneyCardEffects.description(card));text(stage,'details-timing',JourneyCardEffects.timing(card));text(stage,'details-copies',String(inventory.copies[card.id]||0));
  const use=hotspot(stage,'Use in Journey','details-use',()=>run(async()=>{
   if(!ThroneJourney.canUseCard(card)){close();ThroneJourney.open();return;}
   await tutorial('use-card',true);
   form('Use '+card.name+'?',[],async()=>{const scene=ThroneJourney.getScene();if(!ThroneJourney.canUseCard(card))throw Error('This scene has changed');await command('use',{card:card.id,scene:scene.id});const result=ThroneJourney.applyCard(card,scene.id);await refresh();close();ThroneJourney.open();ThroneEffects.play('reward');message(result);},'Use one copy');
  }));use.disabled=!(inventory.copies[card.id]>0);
  hotspot(stage,'Send a Gift','details-gift',()=>send('gift',card));hotspot(stage,'Trade Card','details-trade',()=>send('trade_offer',card));hotspot(stage,'Back to Collection','details-back',open);
 }
 async function friends(){await run(async()=>{await catalog;await refresh();await window.ThroneCinematics?.play('raven');renderFriends();await tutorial('friends',true);});}
 function renderFriends(){
  const stage=artPage('raven');
  hotspot(stage,'Add Friend','raven-add',()=>form('Add a Friend',[{name:'code',label:'Friend code',maxLength:12}],async x=>{inventory=await command('add_friend',x);renderFriends();},'Send invitation'));
  hotspot(stage,'Ask for a Card','raven-request',()=>send('request'));hotspot(stage,'Send a Gift','raven-gift',()=>send('gift'));hotspot(stage,'Trade Cards','raven-trade',()=>send('trade_offer'));
  hotspot(stage,'Friends','raven-friends',()=>{mailView=false;renderFriends();});hotspot(stage,'Inbox','raven-inbox',()=>{mailView=true;renderFriends();});hotspot(stage,'Back','raven-back',open);
  text(stage,'raven-gift-count','Gifts: '+inventory.gifts+' / 5');text(stage,'raven-trade-count','Trades: '+inventory.trades+' / 10');
  const list=document.createElement('div');list.className='raven-live-list';stage.append(list);
  const profile=document.createElement('div');profile.className='raven-row';const code=document.createElement('p');code.textContent='Your friend code: '+inventory.code+' · Daily limits reset at midnight UTC';profile.append(code,button(inventory.name+' · Edit name',()=>form('Your player name',[{name:'name',label:'Name',value:inventory.name}],async x=>{inventory=await command('profile',x);renderFriends();},'Save')));list.append(profile);
  if(!mailView){for(const friend of inventory.friends){const row=document.createElement('div');row.className='raven-row';const label=document.createElement('p');label.textContent=(friend.online?'● Online · ':'○ Offline · ')+friend.name;label.className=friend.online?'friend-online':'';row.append(label);if(friend.accepted)row.append(button('Select friend',()=>{selectedFriend=friend.id;message(friend.name+' selected. Choose Ask for a Card, Send a Gift, or Trade Cards.');}));else if(friend.incoming)row.append(button('Accept invitation',()=>run(async()=>{inventory=await command('accept_friend',{friend:friend.id});renderFriends();})));else row.append(document.createTextNode('Invitation sent'));list.append(row);}}
  else for(const mail of inventory.mail){const row=document.createElement('div');row.className='raven-row';const who=inventory.friends.find(f=>f.id===(mail.sender===inventory.id?mail.recipient:mail.sender))?.name||'Friend';const label=document.createElement('p');label.textContent=who+' · '+mail.kind+' · '+mail.status;row.append(label);if(mail.kind==='trade')row.append(button('Review trade',()=>tradeReview(mail)));else if(mail.kind==='request'){const p=document.createElement('p');p.textContent=byId(mail.want_card)?.name||'';row.append(p);if(mail.recipient===inventory.id&&mail.status==='pending')row.append(button('Send requested card',()=>form('Gift one '+byId(mail.want_card)?.name+'?',[],async()=>{inventory=await command('fulfill',{id:mail.id});ThroneEffects.play('choice');renderFriends();},'Send gift')));}else{const p=document.createElement('p');p.textContent=byId(mail.give_card)?.name||'';row.append(p);}list.append(row);}
   const rows=[...list.children].slice(1),pageSize=2,pages=Math.max(1,Math.ceil(rows.length/pageSize));friendPage=Math.min(friendPage,pages-1);
   rows.forEach((row,i)=>row.hidden=i<friendPage*pageSize||i>=(friendPage+1)*pageSize);
   if(pages>1){const pager=document.createElement('div');pager.className='raven-pager';const prev=button('‹',()=>{friendPage--;renderFriends();}),next=button('›',()=>{friendPage++;renderFriends();}),label=document.createElement('span');prev.setAttribute('aria-label','Previous entries');next.setAttribute('aria-label','Next entries');prev.disabled=friendPage===0;next.disabled=friendPage===pages-1;label.textContent=(friendPage+1)+' / '+pages;pager.append(prev,label,next);stage.append(pager);}
   stage.querySelector(mailView?'.raven-inbox':'.raven-friends').classList.add('selected');
  poll=setInterval(async()=>{if(document.hidden||busy||document.querySelector('dialog[open]'))return;try{const position=list.scrollTop;inventory=await command('state');renderFriends();root.querySelector('.raven-live-list').scrollTop=position;}catch{}},15000);
 }
 function send(kind,card){
  const options=inventory.friends.filter(f=>f.accepted).map(f=>[f.id,f.name]);if(!options.length){message('Add a friend and have them accept your invitation first.');return;}
  if(selectedFriend)options.sort((a,b)=>a[0]===selectedFriend?-1:b[0]===selectedFriend?1:0);
  const owned=cards.filter(c=>(inventory.copies[c.id]||0)>0);if(card)owned.sort((a,b)=>a.id===card.id?-1:b.id===card.id?1:0);
  if(kind!=='request'&&!owned.length){message('Earn a card before sending a gift or trade.');return;}
  const fields=[{name:'friend',label:'Friend',options}];
  if(kind==='trade_offer'){fields.push({name:'give',label:'You give one copy',options:owned.map(c=>[c.id,c.name])},{name:'want',label:'You request one copy',options:cards.map(c=>[c.id,c.name])});}
  else fields.push({name:'card',label:kind==='gift'?'Give one copy':'Request this card',options:(kind==='gift'?owned:cards).map(c=>[c.id,c.name])});
  const operation=crypto.randomUUID();form(kind==='gift'?'Send a Gift':kind==='request'?'Ask for a Card':'Offer a Trade',fields,async x=>{await command(kind,{...x,operation});await refresh();ThroneEffects.play('choice');mailView=true;renderFriends();},kind==='gift'?'Confirm gift':kind==='request'?'Send request':'Send offer');
 }
 function tradeReview(mail){
  const stage=artPage('trade'),sender=mail.sender===inventory.id,give=byId(sender?mail.give_card:mail.want_card),receive=byId(sender?mail.want_card:mail.give_card);
  for(const [c,cls] of [[give,'trade-give-card'],[receive,'trade-receive-card']]){const im=document.createElement('img');im.src=c.image;im.alt=c.name;im.className=cls;stage.append(im);}
  text(stage,'trade-give-name',give.name);text(stage,'trade-receive-name',receive.name);
  text(stage,'trade-my-check'+((sender?mail.sender_ok:mail.recipient_ok)?' confirmed':''),(sender?mail.sender_ok:mail.recipient_ok)?'✓':'');text(stage,'trade-friend-check'+((sender?mail.recipient_ok:mail.sender_ok)?' confirmed':''),(sender?mail.recipient_ok:mail.sender_ok)?'✓':'');
  text(stage,'trade-daily-count','Trades: '+inventory.trades+' / 10');
  const confirm=hotspot(stage,'Confirm Trade','trade-confirm',()=>run(async()=>{inventory=await command('confirm',{id:mail.id,version:mail.version});const updated=inventory.mail?.find(m=>m.id===mail.id);if(updated?.status==='complete'){ThroneEffects.play('reward');message('Trade complete');renderFriends();}else if(updated)tradeReview(updated);else {await refresh();renderFriends();}}));confirm.disabled=mail.status!=='pending';
  hotspot(stage,'Cancel trade','trade-cancel',()=>run(async()=>{inventory=await command('cancel',{id:mail.id});renderFriends();}));hotspot(stage,'Back','trade-back',()=>{mailView=true;renderFriends();});
  const change=button('Change offer',()=>{form('Change trade — both confirmations will reset',[{name:'give',label:'Original sender gives',options:cards.map(c=>[c.id,c.name])},{name:'want',label:'Original recipient gives',options:cards.map(c=>[c.id,c.name])}],async x=>{inventory=await command('change_offer',{id:mail.id,...x});tradeReview(inventory.mail.find(m=>m.id===mail.id));},'Change offer');});change.className='trade-change';change.disabled=mail.status!=='pending';stage.append(change);
  poll=setInterval(async()=>{if(document.hidden||busy)return;try{await refresh();const updated=inventory.mail.find(m=>m.id===mail.id);if(updated&&(updated.version!==mail.version||updated.status!==mail.status||updated.sender_ok!==mail.sender_ok||updated.recipient_ok!==mail.recipient_ok))tradeReview(updated);}catch{}},5000);
 }
 async function reward(event){
  try{const queue=pending();if(!queue.includes(event)){queue.push(event);localStorage.setItem(pendingKey,JSON.stringify(queue));}
   await catalog;const r=await command('reward',{event});localStorage.setItem(pendingKey,JSON.stringify(pending().filter(x=>x!==event)));await refresh();if(!r.repeated){await ThroneCardReveal.show(byId(r.card));const firstRoadTutorial=event==='story:1:1'&&current==='journeyStory'&&!localStorage.getItem('throne_cards_heard_first-card')&&document.getElementById('narrate')?.checked!==false;await tutorial('first-card',true);if(firstRoadTutorial&&current==='journeyStory'){go('menu');await window.ThroneVault?.play();}}
  }catch(e){console.warn('Card reward queued:',e.message);}
 }
 window.addEventListener('online',()=>{for(const event of pending())reward(event);});
 catalog.then(async()=>{for(const event of pending())await reward(event);});
 document.addEventListener('keydown',e=>{if(!root||document.querySelector('dialog[open]'))return;if(e.key==='Escape'){e.preventDefault();close();}else if(e.key==='Tab'){const items=[...root.querySelectorAll('button:not(:disabled),[tabindex="0"]')].filter(x=>x.getClientRects().length);const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}});
 window.ThroneCards={open,friends,reward,close};
 const settings=document.querySelector('#settings .content');if(settings){const replay=button("Replay Sir Edward's welcome",()=>window.ThroneWelcome?.play());replay.className='btn';settings.append(replay);}
 for(const target of ['#rewards .content']){const parent=document.querySelector(target);if(parent){const b=button('Journey Cards',open);b.className='journey-cards-entry';parent.append(b);}}
 setInterval(()=>{if(inventory&&!document.hidden)command('state').then(x=>{inventory=x;receivedCards();}).catch(()=>{});},15000);
 const originalEndRound=endRound;endRound=function(){const event=match.length===10&&index>=10?'trivia:'+currentSeason+':'+Math.min(50,chosenLevel):null;originalEndRound();Promise.resolve(window.ThroneVault?.ready).then(async()=>{if(current!=='summary')return;if(event)await reward(event);if(current!=='summary')return;await window.ThroneCharacterUnlock?.();window.finishRoundPresentation?.();});};
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&root)refresh().catch(()=>{});});
})();
