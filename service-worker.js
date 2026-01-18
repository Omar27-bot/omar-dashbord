/* ============================================================
   O.M.A.R — SERVICE WORKER V11 (STABILITÉ SOUVERAINE)
   Assure la disponibilité du miroir en toute circonstance.
   ============================================================ */

const CACHE_NAME = "omar-zenith-cache-v11";
const ASSETS = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json",
    "./omar-logo-512.jpeg"
];

// --- INSTALLATION : Mise en coffre des ressources ---
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("[SW] Archivage des actifs institutionnels...");
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

// --- ACTIVATION : Purge des anciens protocoles ---
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => {
                        console.log("[SW] Suppression de l'ancienne version :", key);
                        return caches.delete(key);
                    })
            );
        })
    );
    self.clients.claim();
});

// --- STRATÉGIE DE RÉCUPÉRATION (FETCH) ---
self.addEventListener("fetch", event => {
    // Pour les requêtes Firebase/API, on tente le réseau d'abord pour avoir le temps réel
    if (event.request.url.includes("firebase") || event.request.url.includes("firestore")) {
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request))
        );
        return;
    }

    // Pour les fichiers statiques (images, css), on utilise le cache d'abord (vitesse)
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
