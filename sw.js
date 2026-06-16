/* Service worker: offline app shell with a VERSIONED cache (spec M4). Bump
   CACHE_VERSION on every deploy; old caches are deleted on activate and the new
   worker claims clients, so a redeploy reaches installed users on next load. */

const CACHE_VERSION = "casino-edge-v2";

const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/themes.css",
  "./css/base.css",
  "./js/hub.js",
  "./js/theme.js",
  "./js/storage.js",
  "./js/cards.js",
  "./js/disclaimer.js",
  "./js/lib/deck.js",
  "./js/lib/validate.js",
  "./js/lib/stats.js",
  "./js/lib/craps.js",
  "./js/lib/roulette.js",
  "./js/lib/baccarat.js",
  "./js/lib/houseedge.js",
  "./js/lib/videopoker.js",
  "./js/lib/blackjack-strategy.js",
  "./js/lib/howto-content.js",
  "./js/ui/blackjack.js",
  "./js/ui/howto.js",
  "./js/ui/videopoker.js",
  "./js/ui/videopoker-worker.js",
  "./js/ui/craps.js",
  "./js/ui/roulette.js",
  "./js/ui/baccarat.js",
  "./js/ui/cheatsheet.js",
  "./blackjack/index.html",
  "./videopoker/index.html",
  "./craps/index.html",
  "./roulette/index.html",
  "./baccarat/index.html",
  "./cheatsheet/index.html",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon-180.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

/* Cache-first for same-origin GETs, with a network fallback that also fills the
   cache for anything not precached. */
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req)
          .then((res) => {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
            return res;
          })
          .catch(() => caches.match("./index.html")),
    ),
  );
});
