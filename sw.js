const CACHE = 'mein-deutsch-v2';
const FILES = ['./', './index.html', './app.js', './style.css', './dict.js',
               './manifest.json', './icons/icon.svg', './icons/icon-maskable.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (!e.request.url.startsWith(self.location.origin)) return;
  // Network first dla sw.js żeby zawsze sprawdzać aktualizacje
  if (e.request.url.includes('sw.js')) return;
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)));
});
