const CACHE_NAME = "radarpro-v1";
const STATIC_ASSETS = ["/", "/manifest.json"];

self.addEventListener("install", (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event: any) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event: any) => {
  const { request } = event;
  if (request.method !== "GET") return;

  // Network first for API calls
  if (request.url.includes("/api/")) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request) as Promise<Response>)
    );
    return;
  }

  // Cache first for static assets
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});

// Push notification handler
self.addEventListener("push", (event: any) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "RadarPro Portugal";
  const options = {
    body: data.body || "Nova oportunidade disponível!",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: data.url || "/",
    vibrate: [200, 100, 200],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event: any) => {
  event.notification.close();
  event.waitUntil(
    (self as any).clients.openWindow(event.notification.data || "/")
  );
});
