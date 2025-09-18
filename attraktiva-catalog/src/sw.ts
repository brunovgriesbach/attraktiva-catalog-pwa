/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals, no-undef */
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { NetworkFirst, CacheFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: any }

precacheAndRoute(self.__WB_MANIFEST)

const navigationRoute = new NavigationRoute(new NetworkFirst())
registerRoute(navigationRoute)

function normalizeGoogleSheetsUrl(url: string): string {
  try {
    const parsedUrl = new URL(url)

    const spreadsheetMatch = parsedUrl.pathname.match(
      /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
    )

    if (!spreadsheetMatch) {
      return url
    }

    if (/\/export$/.test(parsedUrl.pathname)) {
      return url
    }

    const spreadsheetId = spreadsheetMatch[1]
    const gidFromSearch = parsedUrl.searchParams.get('gid')
    const gidFromHashMatch = parsedUrl.hash.match(/gid=(\d+)/)
    const gid = gidFromSearch ?? gidFromHashMatch?.[1] ?? undefined

    const normalizedUrl = new URL(`/spreadsheets/d/${spreadsheetId}/export`, parsedUrl.origin)
    normalizedUrl.searchParams.set('format', 'csv')
    if (gid) {
      normalizedUrl.searchParams.set('gid', gid)
    }

    return normalizedUrl.toString()
  } catch (error) {
    console.warn('[sw] Failed to normalize Google Sheets URL:', error)
    return url
  }
}

function resolveGoogleSheetsRouteUrl(): URL | null {
  const rawEnvValue = (import.meta.env.VITE_GOOGLE_SHEETS_URL as string | undefined)?.trim()
  if (!rawEnvValue) {
    return null
  }

  const normalizedValue = normalizeGoogleSheetsUrl(rawEnvValue)

  try {
    return new URL(normalizedValue, self.location.origin)
  } catch (error) {
    console.warn('[sw] Failed to parse Google Sheets URL:', error)
    return null
  }
}

const googleSheetsCsvUrl = resolveGoogleSheetsRouteUrl()

registerRoute(
  ({ url }) =>
    url.pathname.endsWith('/products.csv') ||
    (googleSheetsCsvUrl !== null && url.href === googleSheetsCsvUrl.href),
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
