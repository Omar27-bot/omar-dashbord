/* ============================================================
   O.M.A.R — SERVICE WORKER V12 (FORCE UPDATE)
   Protocole de rafraîchissement souverain.
   ============================================================ */

// Monsieur, en passant en V12, le navigateur invalidera l'ancien cache.
const CACHE_NAME = "omar-zenith-cache-v12"; 

const ASSETS = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json",
    "./omar-logo-512.jpeg"
];

// --- INSTALLATION : Chargement du nouveau décor ---
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("[SW] Archivage de la Version 12...");
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
    if (event.request.url.includes("firebase") || event.request.url.includes("firestore")) {
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request))
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
