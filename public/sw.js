const CACHE_NAME = "online-canteen-v3";

const PRECACHE_URLS = [
  "/0-landing.html",
  "/images/campus.jpg",
  "/1-menu.html",
  "/cart.html",
  "/3-checkout.html",
  "/4-order-confirmation.html",
  "/my-orders.html",
  "/customer-login.html",
  "/customer-register.html",
  "/manifest.json",
  "/images/icon-192.png",
  "/images/icon-512.png",
  "/bootstrap-5.3.8-dist/css/bootstrap.min.css"
];

// Install: pre-cache the app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API calls, cache-first for everything else
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Don't try to cache non-GET requests (POST/PUT/DELETE to /api/*)
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // API calls: always try network first, fall back to a JSON error if offline
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(
          JSON.stringify({ error: "Offline - walang internet connection" }),
          { headers: { "Content-Type": "application/json" } }
        )
      )
    );
    return;
  }

  // HTML pages: network-first, para laging bago ang lumalabas
  // (customer-login.html kasama dito) — hindi na kailangan mag-hard-refresh.
  // Fallback sa cache lang kung walang internet.
  const isHTMLPage =
    request.mode === "navigate" ||
    request.destination === "document" ||
    url.pathname.endsWith(".html");

  if (isHTMLPage) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match("/0-landing.html"))
        )
    );
    return;
  }

  // Ibang static assets (css/js/images/fonts): cache-first pa rin,
  // dahil bihira namang magbago ang mga ito at mas mabilis ang cache.
  event.respondWith(
    caches.match(request).then((cached) => {
      return (
        cached ||
        fetch(request)
          .then((response) => {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
            return response;
          })
          .catch(() => caches.match("/0-landing.html"))
      );
    })
  );
});