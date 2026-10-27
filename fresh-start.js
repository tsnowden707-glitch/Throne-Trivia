// Reset only this game's local save. Accounts and other sites are untouched.
(() => {
 function startFresh(){
  if(!window.confirm('Start fresh on this device? This clears your levels, coins, question history, Road to the Throne choices and game settings. You will return to the opening screen.'))return;
  window.ThroneVoice?.stop();window.ThroneEffects?.stop();
  const keys=[];
  for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key&&key.startsWith('throne_'))keys.push(key);}
  keys.forEach(key=>localStorage.removeItem(key));
  const url=new URL(location.href);url.searchParams.delete('fresh');url.searchParams.delete('room');
  location.replace(url.href);
 }
 const button=document.createElement('button');button.className='btn';button.textContent='START FRESH';button.onclick=startFresh;
 document.querySelector('#settings .content').append(button);
 if(new URL(location.href).searchParams.get('fresh')==='1')setTimeout(startFresh,0);
})();
