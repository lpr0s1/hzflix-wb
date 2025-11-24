/* ntf/sw.js */
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', event => {
  // payload parsing robuste
  let payload = { title: 'Live', body: 'Je suis en live sur Kick!', data: {} };
  try {
    if (event.data) payload = event.data.json();
  } catch (e) {
    try { payload.body = event.data.text(); } catch (e2) { /* ignore */ }
  }

  const options = {
    body: payload.body,
    icon: payload.icon || '/ntf/icons/icon-192.png',
    badge: payload.badge || '/ntf/icons/icon-192.png',
    data: payload.data || {},
    vibrate: [100, 50, 100]
  };

  event.waitUntil(self.registration.showNotification(payload.title || 'Live', options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = (event.notification && event.notification.data && event.notification.data.url) || '/ntf/';
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const client of list) {
      try {
        if (client.url === url && 'focus' in client) return client.focus();
      } catch (e) {}
    }
    if (clients.openWindow) return clients.openWindow(url);
  }));
});

self.addEventListener('message', e => {
  if (!e.data) return;
  if (e.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = e.data;
    self.registration.showNotification(title, options || {});
  }
});
