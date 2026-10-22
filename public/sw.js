const CACHE_NAME = "waypoint-shell-v3";
const APP_SHELL = [
  "/", "/index.html", "/manifest.webmanifest", "/favicon.svg",
  "/maps/waypoint-floor-plan.png",
  "/qr/entrance.png",
  "/qr/class-1.png",
  "/qr/class-2.png",
  "/qr/class-3.png",
  "/qr/class-4.png",
  "/qr/class-5.png",
  "/qr/class-6.png",
  "/qr/class-7.png",
  "/qr/waiting-area.png",
  "/qr/staff-room.png",
  "/qr/cabin-1.png",
  "/qr/cabin-2.png",
  "/qr/cabin-3.png",
  "/qr/counter.png",
  "/qr/junction-west.png",
  "/qr/junction-midwest.png",
  "/qr/junction-center.png",
  "/qr/junction-east.png",
  "/qr/junction-right.png",
  "/qr/junction-class-1.png",
  "/qr/junction-class-3.png",
  "/qr/junction-class-4.png",
  "/qr/junction-waiting.png",
  "/qr/junction-staff.png",
  "/qr/junction-counter.png",
  "/qr/junction-cabin-1.png",
  "/qr/junction-cabin-2.png"
];
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  const url = new URL(request.url);
  if (request.mode === "navigate" || url.pathname === "/index.html") {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok) {
            try {
              const cache = await caches.open(CACHE_NAME);
              await cache.put("/index.html", response.clone());
            } catch (error) {
              console.warn("WayPoint could not cache the latest app shell:", error);
            }
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match("/index.html");
          if (cached) return cached;
          return new Response("WayPoint is unavailable offline. Connect to the internet and reload.", {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" }
          });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      }
      return response;
    }).catch(() => caches.match("/index.html")))
  );
});
