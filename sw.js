const SHELL = 'fotobuch-shell-v2';
const CDN   = 'fotobuch-cdn-v2';
const CDN_HOSTS = ['unpkg.com', 'cdn.tailwindcss.com'];

const SHELL_FILES = ['./index.html', './manifest.json', './icon.svg', './icon-maskable.svg'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(SHELL)
      .then(c => c.addAll(SHELL_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== SHELL && k !== CDN).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  let url;
  try { url = new URL(e.request.url); } catch { return; }

  const isCDN = CDN_HOSTS.some(h => url.hostname.includes(h));

  if (isCDN) {
    // CDN: cache-first (resources rarely change)
    e.respondWith(
      caches.match(e.request).then(hit =>
        hit || fetch(e.request).then(res => {
          if (res.ok) caches.open(CDN).then(c => c.put(e.request, res.clone()));
          return res;
        })
      )
    );
    return;
  }

  // App shell: network-first, fallback to cache
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) caches.open(SHELL).then(c => c.put(e.request, res.clone()));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
