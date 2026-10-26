// A named test pass resets this device once, with a recoverable local backup.
(() => {
 const id=new URL(location.href).searchParams.get('test');
 if(!id||!/^flow-[a-z0-9-]{1,40}$/.test(id))return;
 const marker='tt_started_'+id;
 window.ThroneTestId=id;
 if(localStorage.getItem(marker))return;
 const saved={};
 for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k?.startsWith('throne_'))saved[k]=localStorage.getItem(k);}
 localStorage.setItem('tt_backup_'+id,JSON.stringify(saved));
 for(const k of Object.keys(saved))if(!['throne_music_muted','throne_music_volume'].includes(k))localStorage.removeItem(k);
 localStorage.setItem(marker,'1');
})();
