// MoniUsed service worker
// Change the version number whenever you want phones to refresh their saved copy.
const CACHE = 'moniused-v4';

const FILES = [
  '/', '/auth', '/dashboard', '/admin', '/terms', '/privacy',
  '/style.css', '/config.js', '/install.js', '/manifest.json', '/logo-mark.png', '/favicon.png',
  '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png'
];

// Save the app files when first installed
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)));
  self.skipWaiting();
});

// Delete old saved copies when a new version arrives
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// Try the internet first; if there's no network, use the saved copy.
// Supabase data (other websites) is never saved here.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        // Only save normal, successful pages (not redirects)
        if (res.ok && res.type === 'basic' && !res.redirected) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('/')))
  );
});
