/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals, no-undef */
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { NetworkFirst, CacheFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { PRODUCTS_SOURCE_URL } from './config/catalog'

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: any }

precacheAndRoute(self.__WB_MANIFEST)

const navigationRoute = new NavigationRoute(new NetworkFirst())
registerRoute(navigationRoute)

registerRoute(
  ({ url }) => url.href === PRODUCTS_SOURCE_URL,
  new NetworkFirst({ cacheName: 'products-cache' }),
)

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  }),
)

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}
  const title = data.title || 'Notification'
  const options: NotificationOptions = {
    body: data.body,
    icon: data.icon,
    data: data.url,
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if ('focus' in client) return client.focus()
        }
        if (self.clients.openWindow && url) {
          return self.clients.openWindow(url)
        }
      }),
  )
})
