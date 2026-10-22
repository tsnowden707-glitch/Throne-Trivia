// Visibility changes never pause or rewrite server-authoritative match timestamps.
(() => {
 const music=document.getElementById('music');
 musicMuted=localStorage.getItem('throne_music_muted')==='true';
 music.muted=musicMuted;
 const volume=Number(localStorage.getItem('throne_music_volume')??'0.16');
 music.volume=Number.isFinite(volume)?Math.max(0,Math.min(1,volume)):0.16;
 const slider=document.querySelector('#settings input[type=range]');
 slider.value=music.volume*100;
 slider.addEventListener('input',()=>localStorage.setItem('throne_music_volume',String(music.volume)));
 document.getElementById('musicBtn').textContent=musicMuted?'♪̸':'♫';
 for(const id of ['narrate','effects']){
  const control=document.getElementById(id);
  control.checked=localStorage.getItem('throne_'+id)!=='false';
  control.addEventListener('change',()=>{
   localStorage.setItem('throne_'+id,String(control.checked));
   if(id==='narrate'&&!control.checked)window.speechSynthesis?.cancel();
  });
 }
 function silence(){
  music.pause();
  window.speechSynthesis?.cancel();
  if(typeof soundCtx!=='undefined'&&soundCtx?.state==='running')soundCtx.suspend().catch(()=>{});
 }
 function resume(){
  if(document.hidden)return;
  musicPlay();
  if(typeof soundCtx!=='undefined'&&soundCtx?.state==='suspended'&&document.getElementById('effects').checked)soundCtx.resume().catch(()=>{});
 }
 document.addEventListener('visibilitychange',()=>document.hidden?silence():resume());
 window.addEventListener('pagehide',silence);
 window.addEventListener('pageshow',resume);
 document.addEventListener('pointerdown',resume);
})();
