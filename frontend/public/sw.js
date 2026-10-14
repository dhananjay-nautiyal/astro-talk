/* AstroTalk service worker: offline-capable app shell.
 * - Same-origin static assets (JS/CSS/images): cache-first.
 * - API (/api) and cross-origin: network-only, never cached.
 * - Navigations: network-first, falling back to cached '/' offline.
 * Bump CACHE_VERSION to invalidate old shells.
 */
const CACHE_VERSION = 'astrotalk-v1'
const SHELL_URLS = ['/', '/manifest.webmanifest']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)

  if (url.pathname.startsWith('/api') || url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE_VERSION).then((cache) => cache.put('/', copy))
          return res
        })
        .catch(() => caches.match('/'))
    )
    return
  }

  event.respondWith(
    caches.match(request).then(
      (hit) =>
        hit ||
        fetch(request).then((res) => {
          const copy = res.clone()
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy))
          return res
        })
    )
  )
})
