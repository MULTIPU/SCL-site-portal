/* SCL School Portal service worker: push notifications only. Deliberately does not cache index.html, preventing stale portal code. */
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
