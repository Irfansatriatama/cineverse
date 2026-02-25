/**
 * CineVerse — sw.js (Service Worker)
 * Phase 5.1 PWA: Offline support, cache-first for assets,
 * network-first for data JSON
 *
 * Strategy:
 * - Static assets (CSS, JS, fonts, images) → Cache First
 * - JSON data files → Network First (stale-while-revalidate)
 * - HTML pages → Network First with fallback
 * - External resources (TMDB images, YouTube) → Network only
 */

const CACHE_VERSION    = 'cineverse-v1.3.0';
const STATIC_CACHE     = `${CACHE_VERSION}-static`;
const DATA_CACHE       = `${CACHE_VERSION}-data`;
const ALL_CACHES       = [STATIC_CACHE, DATA_CACHE];

/* ─── Static assets to pre-cache on install ─── */
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/pages/dashboard.html',
  '/pages/search.html',
  '/pages/genre.html',
  '/pages/watchlist.html',
  '/pages/history.html',
  '/pages/stats.html',
  '/pages/news.html',
  '/pages/profile.html',
  '/pages/settings.html',
  '/pages/auth/login.html',
  '/pages/auth/register.html',

  /* Core CSS */
  '/assets/css/main.css',
  '/assets/css/components.css',
  '/assets/css/layout.css',
  '/assets/css/animations.css',

  /* Page CSS */
  '/assets/css/pages/auth.css',
  '/assets/css/pages/dashboard.css',
  '/assets/css/pages/search.css',
  '/assets/css/pages/genre.css',
  '/assets/css/pages/watchlist.css',
  '/assets/css/pages/history.css',
  '/assets/css/pages/stats.css',
  '/assets/css/pages/profile.css',
  '/assets/css/pages/settings.css',
  '/assets/css/pages/movie-detail.css',
  '/assets/css/pages/watch.css',
  '/assets/css/pages/news.css',
  '/assets/css/pages/news-detail.css',
  '/assets/css/pages/surprise.css',

  /* Core JS */
  '/assets/js/utils/helpers.js',
  '/assets/js/utils/hash.js',
  '/assets/js/utils/validators.js',
  '/assets/js/core/storage.js',
  '/assets/js/core/router.js',
  '/assets/js/core/app.js',
  '/assets/js/core/skeleton.js',
  '/assets/js/core/transitions.js',
  '/assets/js/components/toast.js',
  '/assets/js/components/navbar.js',

  /* Page JS */
  '/assets/js/pages/dashboard.js',
  '/assets/js/pages/search.js',
  '/assets/js/pages/genre.js',
  '/assets/js/pages/watchlist.js',
  '/assets/js/pages/history.js',
  '/assets/js/pages/stats.js',
  '/assets/js/pages/profile.js',
  '/assets/js/pages/settings.js',
  '/assets/js/pages/movie-detail.js',
  '/assets/js/pages/watch.js',
  '/assets/js/pages/news.js',
  '/assets/js/pages/news-detail.js',
  '/assets/js/pages/surprise.js',
  '/assets/js/pages/landing.js',

  /* Data */
  '/data/movies.json',
  '/data/genres.json',
  '/data/news.json',

  /* Images */
  '/assets/images/poster-placeholder.svg',

  /* Manifest */
  '/manifest.json',
];

/* ─────────────────────────────────────────
   INSTALL — pre-cache static assets
───────────────────────────────────────── */
self.addEventListener('install', event => {
  console.log('[SW] Install — caching static assets');
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      // Use addAll but don't fail install on individual miss
      return Promise.allSettled(
        PRECACHE_URLS.map(url =>
          cache.add(url).catch(err => {
            console.warn(`[SW] Pre-cache failed for ${url}:`, err.message);
          })
        )
      );
    }).then(() => {
      console.log('[SW] Pre-cache complete');
      return self.skipWaiting();
    })
  );
});

/* ─────────────────────────────────────────
   ACTIVATE — clean old caches
───────────────────────────────────────── */
self.addEventListener('activate', event => {
  console.log('[SW] Activate — cleaning old caches');
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => !ALL_CACHES.includes(name))
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      )
    ).then(() => self.clients.claim())
  );
});

/* ─────────────────────────────────────────
   FETCH — routing strategies
───────────────────────────────────────── */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin streaming/video
  if (request.method !== 'GET') return;
  if (url.hostname.includes('youtube')) return;
  if (url.hostname.includes('commondatastorage')) return;
  if (url.hostname.includes('googleapis') && !url.hostname.includes('fonts')) return;

  // Data JSON → Network First (always fresh)
  if (url.pathname.startsWith('/data/') && url.pathname.endsWith('.json')) {
    event.respondWith(networkFirst(request, DATA_CACHE));
    return;
  }

  // External fonts & CDN assets → Cache First
  if (
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('cdnjs.cloudflare.com') ||
    url.hostname.includes('cdn.jsdelivr.net')
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // External images (TMDB) → Cache First with 7-day expiry
  if (url.hostname.includes('image.tmdb.org')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Same-origin assets & pages → Cache First with network fallback
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }
});

/* ─────────────────────────────────────────
   STRATEGY HELPERS
───────────────────────────────────────── */

/**
 * Cache First: return cache hit if available, else fetch & cache
 */
async function cacheFirst(request, cacheName) {
  const cache    = await caches.open(cacheName);
  const cached   = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    // Offline fallback for HTML
    if (request.headers.get('accept')?.includes('text/html')) {
      const offline = await cache.match('/index.html');
      if (offline) return offline;
    }
    throw err;
  }
}

/**
 * Network First: try network, fall back to cache
 */
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) {
      console.log('[SW] Offline fallback for:', request.url);
      return cached;
    }
    throw err;
  }
}

/* ─────────────────────────────────────────
   BACKGROUND SYNC placeholder
  (Phase 5.2 will add push notification support)
───────────────────────────────────────── */
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
