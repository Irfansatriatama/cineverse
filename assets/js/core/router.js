/**
 * CineVerse — router.js
 * Lightweight client-side router untuk navigasi & proteksi halaman
 * Digunakan oleh app.js sebagai entry point
 */

const CineRouter = (() => {
  'use strict';

  /* ─────────────────────────────────────────
     ROUTE DEFINITIONS
     Define which pages require auth & page roles
  ───────────────────────────────────────── */
  const ROUTES = {
    // Auth pages — redirect to dashboard if already logged in
    '/pages/auth/login.html':    { requireAuth: false, redirectIfAuth: '../dashboard.html' },
    '/pages/auth/register.html': { requireAuth: false, redirectIfAuth: '../dashboard.html' },

    // Protected pages — redirect to login if not logged in
    '/pages/dashboard.html':     { requireAuth: true },
    '/pages/profile.html':       { requireAuth: true },
    '/pages/settings.html':      { requireAuth: true },
    '/pages/stats.html':         { requireAuth: true },
    '/pages/movie-detail.html':  { requireAuth: false },
    '/pages/watch.html':         { requireAuth: true },
    '/pages/search.html':        { requireAuth: false },
    '/pages/genre.html':         { requireAuth: false },
    '/pages/news.html':          { requireAuth: false },
    '/pages/news-detail.html':   { requireAuth: false },

    // Landing page — public
    '/index.html':               { requireAuth: false },
    '/':                         { requireAuth: false },
  };

  /* ─────────────────────────────────────────
     GET CURRENT ROUTE CONFIG
  ───────────────────────────────────────── */
  function getCurrentRoute() {
    const path = window.location.pathname;

    // Try exact match first
    if (ROUTES[path]) return ROUTES[path];

    // Try matching by filename
    const filename = path.split('/').pop();
    const matchedKey = Object.keys(ROUTES).find(k => k.endsWith('/' + filename));
    return matchedKey ? ROUTES[matchedKey] : null;
  }

  /* ─────────────────────────────────────────
     GUARD — check auth state and redirect if needed
  ───────────────────────────────────────── */
  function guard() {
    const route = getCurrentRoute();
    if (!route) return true; // Unknown route, allow

    const isLoggedIn = window.CineStorage ? CineStorage.User.isLoggedIn() : false;

    // Auth page but already logged in → redirect to dashboard
    if (route.redirectIfAuth && isLoggedIn) {
      window.location.replace(route.redirectIfAuth);
      return false;
    }

    // Protected page but not logged in → redirect to login
    if (route.requireAuth && !isLoggedIn) {
      const basePath = getBasePath();
      window.location.replace(basePath + 'pages/auth/login.html');
      return false;
    }

    return true;
  }

  /* ─────────────────────────────────────────
     NAVIGATE — programmatic navigation
  ───────────────────────────────────────── */
  function navigate(path) {
    window.location.href = path;
  }

  function navigateReplace(path) {
    window.location.replace(path);
  }

  /* ─────────────────────────────────────────
     GET BASE PATH
     Computes relative path back to root based on current location
  ───────────────────────────────────────── */
  function getBasePath() {
    const path = window.location.pathname;
    if (path.includes('/pages/auth/')) return '../../';
    if (path.includes('/pages/'))     return '../';
    return './';
  }

  /* ─────────────────────────────────────────
     GET PATH TO ROOT
     Returns the path prefix to access root-level files
  ───────────────────────────────────────── */
  function getRootPath() {
    return getBasePath();
  }

  /* ─────────────────────────────────────────
     GET QUERY PARAM
  ───────────────────────────────────────── */
  function getParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  function getAllParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, val] of params.entries()) {
      result[key] = val;
    }
    return result;
  }

  /* ─────────────────────────────────────────
     BUILD URL
  ───────────────────────────────────────── */
  function buildUrl(page, params = {}) {
    const base = getRootPath();
    const url = new URL(base + page, window.location.origin);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    return url.pathname + url.search;
  }

  /* ─────────────────────────────────────────
     EXPORT
  ───────────────────────────────────────── */
  return {
    guard,
    navigate,
    navigateReplace,
    getParam,
    getAllParams,
    getBasePath,
    getRootPath,
    buildUrl,
    getCurrentRoute,
  };
})();

window.CineRouter = CineRouter;
