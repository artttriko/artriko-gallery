// Dream offline support: always try the network first (so updates arrive), fall back to the saved copy.
const C="dream-v1";
const CORE=["/dream/","/dream/manifest.webmanifest","/dream/icon-192.png","/dream/icon-512.png","/dream/apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  const u=new URL(r.url);if(u.origin!==location.origin||!u.pathname.startsWith("/dream/"))return;
  e.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(r.mode==="navigate"?"/dream/":r,cp));}return res;})
    .catch(()=>caches.match(r.mode==="navigate"?"/dream/":r).then(m=>m||caches.match("/dream/"))));
});
