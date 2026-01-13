// ---------------------------------------------------------
// O.M.A.R — HUD Zenith Mobile
// Service Worker institutionnel
// ---------------------------------------------------------

const CACHE_NAME = "omar-hud-cache-v1";

// Fichiers critiques à précharger
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/manifest.json",
  "/omar-logo-512.jpeg"
];

// ---------------------------------------------------------
// INSTALLATION — Pré-chargement du HUD
// ---------------------------------------------------------
self.addEventListener("install", (event) => {
  console.log("[OMAR:SW] Installation…");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[OMAR:SW] Mise en cache des assets critiques");
      return cache.addAll(CORE_ASSETS);
    })
  );

  self.skipWaiting();
});

// ---------------------------------------------------------
// ACTIVATION — Nettoyage des anciens caches
// ---------------------------------------------------------
self.addEventListener("activate", (event) => {
  console.log("[OMAR:SW] Activation…");

  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log("[OMAR:SW] Suppression ancien cache :", key);
            return caches.delete(key);
          })
      )
    )
  );

  self.clients.claim();
});

// ---------------------------------------------------------
// FETCH — Stratégie : Network First + fallback cache
// ---------------------------------------------------------
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Firebase doit toujours être en live
  if (
    req.url.includes("firebaseio.com") ||
    req.url.includes("gstatic.com") ||
    req.url.includes("googleapis.com")
  ) {
    return;
  }

  event.respondWith(
    fetch(req)
      .then((res) => {
        // Mise en cache dynamique
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        return res;
      })
      .catch(() => {
        // Fallback hors-ligne
        return caches.match(req).then((cached) => {
          if (cached) return cached;

          // Fallback ultime : page institutionnelle hors-ligne
          return new Response(
            `
              <html>
                <body style="background:#0a0a0f;color:#d4af37;font-family:Arial;padding:20px;">
                  <h2>O.M.A.R — Mode Hors-Ligne</h2>
                  <p>Le HUD mobile ne peut pas joindre le serveur.</p>
                  <p>Les données institutionnelles seront synchronisées dès le retour du réseau.</p>
                </body>
              </html>
            `,
            { headers: { "Content-Type": "text/html" } }
          );
        });
      })
  );
});
