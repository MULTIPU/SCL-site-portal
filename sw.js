/* SCL PWA service worker: network-first pages, push delivery, and safe notification taps. */
const SCL_CACHE='scl-static-v1';
self.addEventListener('install',event=>{self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('scl-static-')&&k!==SCL_CACHE).map(k=>caches.delete(k)));await self.clients.claim()})())});
self.addEventListener('fetch',event=>{const req=event.request;const url=new URL(req.url);if(req.method!=='GET'||url.origin!==self.location.origin||req.mode==='navigate')return;if(/\.(?:js|css|woff2?|png|jpe?g|webp|svg|ico)$/.test(url.pathname)){event.respondWith((async()=>{try{const response=await fetch(req);if(response.ok){const cache=await caches.open(SCL_CACHE);cache.put(req,response.clone())}return response}catch(e){const cached=await caches.match(req);if(cached)return cached;throw e}})())}});
self.addEventListener('push',event=>{let data={title:'Shining Child Leaders School',body:'You have a new school update.',url:'./',tag:'scl-update'};try{const incoming=event.data&&event.data.json();if(incoming&&typeof incoming==='object')data={...data,...incoming}}catch(e){try{if(event.data)data.body=event.data.text()}catch(_){}}event.waitUntil(self.registration.showNotification(String(data.title||'SCL School Update'),{body:String(data.body||'You have a new school update.'),icon:data.icon||'./favicon.ico',badge:data.badge||'./favicon.ico',tag:String(data.tag||'scl-update'),data:{url:data.url||'./'},renotify:false}))});
self.addEventListener('notificationclick',event=>{event.notification.close();const target=new URL((event.notification.data&&event.notification.data.url)||'./',self.registration.scope).href;event.waitUntil((async()=>{const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const client of windows){if('focus'in client){await client.focus();if('navigate'in client&&client.url!==target)try{await client.navigate(target)}catch(e){}return}}if(self.clients.openWindow)await self.clients.openWindow /* SCL School Portal service worker: push notifications only. Deliberately does not cache index.html, preventing stale portal code. */
self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(self.clients.claim()); });
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; }
  catch (_) { data = { body: event.data ? event.data.text() : 'You have a new school update.' }; }
  const title = String(data.title || 'SCL School Alert').slice(0, 120);
  const body = String(data.body || 'You have a new school update.').slice(0, 800);
  const url = String(data.url || './');
  const tag = String(data.tag || 'scl-school-alert').slice(0, 160);
  const options = {
    body,
    tag,
    data: { url, eventType: data.eventType || 'school-update' },
    renotify: true,
    requireInteraction: data.eventType === 'assignment-update' || data.eventType === 'teacher_result_submitted',
    vibrate: [180, 90, 180],
    timestamp: Date.now()
  };
  event.waitUntil(Promise.all([
    self.registration.showNotification(title, options),
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(wins => {
      wins.forEach(client => { try { client.postMessage({ type: 'scl-ring', title, body, tag, eventType: data.eventType || 'school-update' }); } catch (_) {} });
    })
  ]));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const raw = event.notification && event.notification.data && event.notification.data.url || './';
  let target;
  try { target = new URL(raw, self.location.origin); if (target.origin !== self.location.origin) target = new URL('./', self.location.origin); }
  catch (_) { target = new URL('./', self.location.origin); }
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(wins => {
    for (const client of wins) {
      if (new URL(client.url).origin === target.origin) {
        return client.navigate(target.href).then(() => client.focus());
      }
    }
    return self.clients.openWindow(target.href);
  }));
});
/* SCL service worker: always loads the newest page, clears old caches, keeps notification taps working. */
self.addEventListener('install',function(){self.skipWaiting()});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener('notificationclick',function(e){e.notification.close();e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(cs){for(var i=0;i<cs.length;i++){if('focus' in cs[i])return cs[i].focus()}if(self.clients.openWindow)return self.clients.openWindow('./')}))});
