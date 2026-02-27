/* ============================================================
   O.M.A.R — SERVICE WORKER V13 (MOBILE HUD)
   ============================================================ */

const CACHE_NAME = "omar-zenith-cache-v15";

const ASSETS = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json",
    "./omar-logo-512.svg"
];

// --- INSTALLATION : Chargement du nouveau décor ---
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("[SW] Archivage de la Version 15...");
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

// --- ACTIVATION : Suppression de la V11 et des précédentes ---
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => {
                        console.log("[SW] Élimination des anciens protocoles :", key);
                        return caches.delete(key);
                    })
            );
        })
    );
    // Force la prise de contrôle immédiate
    self.clients.claim();
});

// --- FETCH : Priorité au temps réel pour Firebase ---
self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") {
        return;
    }

    if (event.request.url.includes("firebase") || event.request.url.includes("firestore")) {
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request))
        );
        return;
    }

    if (event.request.mode === "navigate") {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put("./index.html", copy));
                    return response;
                })
                .catch(() => caches.match("./index.html"))
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).then((networkResponse) => {
                const copy = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
                return networkResponse;
            });
        })
    );
});
