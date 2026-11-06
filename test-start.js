// Old review links must never reset an existing game. Fresh tests use the
// separate namespace in fresh-test-storage.js instead.
(() => {
 const id=new URL(location.href).searchParams.get('test');
 if(!id||!/^flow-[a-z0-9-]{1,40}$/.test(id))return;
 // Preserve the online identity of an already-started legacy review save.
 // An unfamiliar test link must not switch this player's identity either.
 if(localStorage.getItem('tt_started_'+id))window.ThroneTestId=id;
})();
