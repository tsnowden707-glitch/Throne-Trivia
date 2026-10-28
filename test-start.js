// A named test pass resets this device once, with a recoverable local backup.
(() => {
 const id=new URL(location.href).searchParams.get('test');
 if(!id||!/^flow-[a-z0-9-]{1,40}$/.test(id))return;
 const marker='tt_started_'+id;
 window.ThroneTestId=id;
 if(localStorage.getItem(marker))return;
 const previousQuestions=JSON.parse(localStorage.getItem('throne_seen_v1')||'[]');
 const history=JSON.parse(localStorage.getItem('tt_question_history_v1')||'[]');
 localStorage.setItem('tt_question_history_v1',JSON.stringify([...new Set([...history,...previousQuestions])]));
 const saved={};
 for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k?.startsWith('throne_'))saved[k]=localStorage.getItem(k);}
 localStorage.setItem('tt_backup_'+id,JSON.stringify(saved));
 for(const k of Object.keys(saved))if(!['throne_music_muted','throne_music_volume','throne_narrate','throne_effects'].includes(k))localStorage.removeItem(k);
 localStorage.setItem(marker,'1');
})();
