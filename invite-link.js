// A shared match link carries a room code, never an account credential.
(() => {
 const code=new URL(location.href).searchParams.get('room');
 if(!code||!/^[A-Za-z0-9]{6}$/.test(code))return;
 let opened=false;
 document.addEventListener('screenchange',event=>{
  if(opened||event.detail.page!=='menu')return;
  opened=true;playMode='friend';document.getElementById('ttCode').value=code.toUpperCase();
  queueMicrotask(()=>{go('invite');TT.joinRoom();});
 });
})();
