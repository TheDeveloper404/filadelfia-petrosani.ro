/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html')));

self.addEventListener('push', (event: PushEvent) => {
  const data = event.data?.json() as { title?: string; body?: string } ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Filadelfia Live', {
      body: data.body ?? 'Transmisia în direct a început!',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'filadelfia-live',
      data: { url: '/live' },
    })
  );
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  const url = (event.notification.data as { url?: string })?.url ?? '/live';
  event.waitUntil(self.clients.openWindow(url));
});
