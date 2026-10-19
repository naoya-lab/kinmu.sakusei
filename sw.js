const CACHE='kinmu-share-v1';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
function openDb(){return new Promise((res,rej)=>{const r=indexedDB.open('kinmu-share',1);r.onupgradeneeded=()=>r.result.createObjectStore('files');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});}
function put(file){return openDb().then(db=>new Promise((res,rej)=>{const tx=db.transaction('files','readwrite');tx.objectStore('files').put(file,'incoming');tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error);}));}
self.addEventListener('fetch',e=>{const url=new URL(e.request.url);if(e.request.method==='POST'&&url.pathname.endsWith('/share-target')){e.respondWith((async()=>{try{const data=await e.request.formData();const file=data.get('file');if(!(file instanceof File)||(!file.name.toLowerCase().endsWith('.pdf')&&file.type!=='application/pdf'))throw Error('Not PDF');await put(file);return Response.redirect(new URL('./?shared=1',self.registration.scope),303);}catch(err){return Response.redirect(new URL('./?share_error=1',self.registration.scope),303);}})());}});
