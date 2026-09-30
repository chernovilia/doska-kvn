// Service worker Доски/КВН: пуши и счётчик на иконке приложения.
// Страницы и API не кэшируем — сайт всегда свежий, «застрять» на старой версии нельзя.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : '' };
  }
  const tasks = [
    self.registration.showNotification(data.title || 'Доска/КВН', {
      body: data.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-96.png',
      // tag — одно уведомление на диалог: новое сообщение заменяет прошлое, а не копится стопкой
      tag: data.tag || undefined,
      renotify: !!data.tag,
      data: { url: data.url || '/' }
    })
  ];
  // Счётчик непрочитанных на иконке установленного приложения
  if (typeof data.unread === 'number' && self.navigator.setAppBadge) {
    tasks.push(data.unread > 0 ? self.navigator.setAppBadge(data.unread) : self.navigator.clearAppBadge());
  }
  event.waitUntil(Promise.all(tasks).catch(() => {}));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || '/', self.location.origin).href;
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const same = windows.find((w) => new URL(w.url).origin === self.location.origin);
      if (same) {
        await same.focus();
        if ('navigate' in same) return same.navigate(url);
        return;
      }
      return self.clients.openWindow(url);
    })()
  );
});
