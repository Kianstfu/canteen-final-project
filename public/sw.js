// Palitan ang numero na ito kapag gusto mong i-force na mag-refresh ang lahat ng cache.
const CACHE_NAME = "online-canteen-v4";

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

// Install: pre-cache ang app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activate: burahin ang lumang cache
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Huwag galawin ang POST/PUT/DELETE
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Huwag galawin ang galing sa ibang domain (Firebase, Google Fonts, atbp.).
  // Ang browser na ang bahala sa mga iyon.
  if (url.origin !== self.location.origin) return;

  // API: laging network, JSON error kapag offline
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response(
            JSON.stringify({ error: "Offline - walang internet connection" }),
            { headers: { "Content-Type": "application/json" } }
          )
      )
    );
    return;
  }

  // Mga larawan at Bootstrap: bihirang magbago, kaya cache-first
  const isStaticAsset =
    url.pathname.startsWith("/images/") ||
    url.pathname.startsWith("/uploads/") ||
    url.pathname.startsWith("/bootstrap-5.3.8-dist/");

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return response;
          })
      )
    );
    return;
  }

  // Lahat ng iba (HTML, JS, CSS, JSON): NETWORK-FIRST.
  // Laging bago ang lumalabas; cache lang ang gagamitin kapag offline.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => cached || caches.match("/0-landing.html"))
      )
  );
});