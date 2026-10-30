// Palitan ang numero na ito kapag gusto mong i-force na mag-refresh ang lahat ng cache.
const CACHE_NAME = "online-canteen-react-v1";

const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/images/campus.jpg",
  "/images/icon-192.png",
  "/images/icon-512.png"
];

// Install: pre-cache ang app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activate: burahin ang lumang cache (kasama ang galing sa dating HTML version)
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

  // Huwag galawin ang galing sa ibang domain (Firebase, Google Fonts, atbp.)
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

  // Pag-bukas ng kahit anong page (route): NETWORK-FIRST. Iisang app shell
  // (index.html) ang lahat ng route, kaya ito ang ginagamit kapag offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put("/index.html", copy));
          }
          return response;
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Hashed assets (/assets/...), larawan at uploads: bihirang magbago ang laman
  // ng parehong filename, kaya cache-first.
  const isStaticAsset =
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/images/") ||
    url.pathname.startsWith("/uploads/");

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

  // Lahat ng iba: NETWORK-FIRST, cache lang kapag offline
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
