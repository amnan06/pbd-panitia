// Service Worker minimum — tujuan utama cuma untuk installability (Add to Home Screen).
// Sengaja guna strategi "network-first": data sentiasa diambil terus dari rangkaian bila online,
// cache cuma sebagai fallback bila offline sepenuhnya. Ini elak app tersangkut papar data lapuk.
const CACHE_NAME = 'pbd-shell-v1';
const SHELL_FILES = ['./', './index.html'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Jangan campur tangan panggilan ke Google Apps Script (data mesti sentiasa terkini)
  if (e.request.method !== 'GET' || e.request.url.includes('script.google.com')) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone)).catch(()=>{});
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
