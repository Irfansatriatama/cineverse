/**
 * CineVerse — notifications.js
 * Phase 5.2: Notifikasi Lokal (Browser Notification API)
 *
 * Features:
 * - Request browser notification permission
 * - Send local notifications: film baru, reminder watchlist, berita
 * - Scheduled reminders (via localStorage-based scheduling)
 * - Notification history & badge counter
 * - In-app notification bell with dropdown panel
 * - Respects user settings (notifNewMovie, notifWatchlist, notifNews)
 */

const CineNotif = (() => {
  'use strict';

  /* ─────────────────────────────────────────
     CONSTANTS
  ───────────────────────────────────────── */
  const KEYS = {
    HISTORY:    'cineverse_notif_history',
    LAST_CHECK: 'cineverse_notif_last_check',
    UNREAD:     'cineverse_notif_unread',
  };

  const MAX_HISTORY = 50;
  const APP_ICON    = '/assets/images/icon-192.png';

  /* ─────────────────────────────────────────
     PERMISSION MANAGEMENT
  ───────────────────────────────────────── */
  function getPermission() {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission; // 'default' | 'granted' | 'denied'
  }

  async function requestPermission() {
    if (!('Notification' in window)) return 'unsupported';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied')  return 'denied';

    const result = await Notification.requestPermission();
    return result;
  }

  function isGranted() {
    return getPermission() === 'granted';
  }

  /* ─────────────────────────────────────────
     GET USER SETTINGS
  ───────────────────────────────────────── */
  function getUserSettings() {
    if (!window.CineStorage) return {};
    const user = CineStorage.User.getCurrent();
    if (!user) return {};
    const s = CineStorage.Settings.get(user.id);
    return {
      notifNewMovie:  s.notifNewMovie !== false,  // default true
      notifWatchlist: s.notifWatchlist === true,   // default false
      notifNews:      s.notifNews      === true,   // default false
      language:       s.language || 'id',
    };
  }

  /* ─────────────────────────────────────────
     SEND BROWSER NOTIFICATION
  ───────────────────────────────────────── */
  function send(title, body, options = {}) {
    if (!isGranted()) return null;

    const notif = new Notification(title, {
      body,
      icon:  options.icon  || APP_ICON,
      badge: options.badge || APP_ICON,
      tag:   options.tag   || `cineverse-${Date.now()}`,
      data:  options.data  || {},
      ...options,
    });

    // Handle click → focus window & navigate
    notif.addEventListener('click', () => {
      window.focus();
      if (options.url) window.location.href = options.url;
      notif.close();
    });

    // Save to in-app history
    saveToHistory({
      id:        options.tag || `notif-${Date.now()}`,
      title,
      body,
      icon:      options.icon || '🔔',
      url:       options.url || null,
      type:      options.type || 'info',
      timestamp: Date.now(),
      read:      false,
    });

    return notif;
  }

  /* ─────────────────────────────────────────
     NOTIFICATION TYPES
  ───────────────────────────────────────── */

  /** Notify about a new movie */
  function notifyNewMovie(movie) {
    const settings = getUserSettings();
    if (!settings.notifNewMovie) return;

    const isEn = settings.language === 'en';
    const title = isEn ? '🎬 New Movie Available!' : '🎬 Film Baru Tersedia!';
    const body  = isEn
      ? `${movie.title} is now available on CineVerse`
      : `${movie.title} kini tersedia di CineVerse`;

    send(title, body, {
      tag:  `new-movie-${movie.id}`,
      type: 'movie',
      url:  `pages/movie-detail.html?id=${movie.id}`,
      data: { movieId: movie.id },
    });
  }

  /** Remind user about movies in their watchlist */
  function notifyWatchlistReminder(movies = []) {
    const settings = getUserSettings();
    if (!settings.notifWatchlist) return;

    const isEn  = settings.language === 'en';
    const count = movies.length;
    if (!count) return;

    const title = isEn ? '🎥 Don\'t Forget to Watch!' : '🎥 Jangan Lupa Nonton!';
    const body  = isEn
      ? `You have ${count} movie${count > 1 ? 's' : ''} waiting in your watchlist`
      : `Kamu punya ${count} film yang menunggu di watchlist`;

    send(title, body, {
      tag:  'watchlist-reminder',
      type: 'watchlist',
      url:  'pages/watchlist.html',
    });
  }

  /** Notify about new news article */
  function notifyNews(article) {
    const settings = getUserSettings();
    if (!settings.notifNews) return;

    const isEn  = settings.language === 'en';
    const title = isEn ? '📰 Latest Movie News' : '📰 Berita Film Terbaru';
    const body  = article.title;

    send(title, body, {
      tag:  `news-${article.id}`,
      type: 'news',
      url:  `pages/news-detail.html?id=${article.id}`,
      data: { articleId: article.id },
    });
  }

  /** Send a generic / custom notification */
  function notify(title, body, options = {}) {
    return send(title, body, options);
  }

  /* ─────────────────────────────────────────
     IN-APP NOTIFICATION HISTORY
  ───────────────────────────────────────── */
  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.HISTORY) || '[]');
    } catch (_) { return []; }
  }

  function saveToHistory(notifObj) {
    const history = getHistory();
    // Deduplicate by id
    const existing = history.findIndex(n => n.id === notifObj.id);
    if (existing !== -1) {
      history[existing] = notifObj;
    } else {
      history.unshift(notifObj);
    }
    if (history.length > MAX_HISTORY) history.splice(MAX_HISTORY);
    try { localStorage.setItem(KEYS.HISTORY, JSON.stringify(history)); } catch (_) {}
    incrementUnread();
    updateBell();
  }

  function markAllRead() {
    const history = getHistory().map(n => ({ ...n, read: true }));
    try { localStorage.setItem(KEYS.HISTORY, JSON.stringify(history)); } catch (_) {}
    setUnreadCount(0);
    updateBell();
  }

  function markRead(id) {
    const history = getHistory().map(n => n.id === id ? { ...n, read: true } : n);
    try { localStorage.setItem(KEYS.HISTORY, JSON.stringify(history)); } catch (_) {}
    const unread = history.filter(n => !n.read).length;
    setUnreadCount(unread);
    updateBell();
  }

  function clearHistory() {
    try { localStorage.removeItem(KEYS.HISTORY); } catch (_) {}
    setUnreadCount(0);
    updateBell();
  }

  /* ─────────────────────────────────────────
     UNREAD COUNT
  ───────────────────────────────────────── */
  function getUnreadCount() {
    try { return parseInt(localStorage.getItem(KEYS.UNREAD) || '0', 10); } catch (_) { return 0; }
  }

  function setUnreadCount(n) {
    try { localStorage.setItem(KEYS.UNREAD, String(Math.max(0, n))); } catch (_) {}
  }

  function incrementUnread() {
    setUnreadCount(getUnreadCount() + 1);
  }

  /* ─────────────────────────────────────────
     IN-APP BELL BUTTON (Injected into Navbar)
  ───────────────────────────────────────── */
  let bellEl    = null;
  let panelEl   = null;
  let panelOpen = false;

  function injectBell() {
    if (bellEl) return; // already injected

    // Only inject if user is logged in
    if (!window.CineStorage || !CineStorage.User.isLoggedIn()) return;

    // Find the actions area in navbar
    const actionsEl = document.querySelector('.navbar__actions');
    if (!actionsEl) return;

    // Create bell button
    bellEl = document.createElement('div');
    bellEl.className  = 'notif-bell';
    bellEl.id         = 'notif-bell';
    bellEl.style.cssText = 'position:relative;display:inline-flex;align-items:center;';
    bellEl.innerHTML = `
      <button class="navbar__icon-btn" id="notif-bell-btn" aria-label="Notifikasi" title="Notifikasi" style="position:relative;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span id="notif-badge" style="
          position:absolute;top:-4px;right:-4px;
          min-width:17px;height:17px;
          background:#E50914;
          border-radius:9999px;
          border:2px solid var(--color-bg-primary);
          font-size:0.6rem;font-weight:700;color:#fff;
          display:none;align-items:center;justify-content:center;
          padding:0 3px;line-height:1;
        ">0</span>
      </button>
    `;

    // Insert before the first child (search icon) or append
    const searchBtn = actionsEl.querySelector('a[href*="search"]');
    if (searchBtn) {
      actionsEl.insertBefore(bellEl, searchBtn);
    } else {
      actionsEl.appendChild(bellEl);
    }

    // Bind bell click
    bellEl.querySelector('#notif-bell-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      togglePanel();
    });

    // Inject styles
    injectStyles();

    // Create panel
    createPanel();

    // Update badge
    updateBell();
  }

  function updateBell() {
    const badge = document.getElementById('notif-badge');
    if (!badge) return;

    const count = getUnreadCount();
    badge.textContent   = count > 99 ? '99+' : String(count);
    badge.style.display = count > 0 ? 'flex' : 'none';
  }

  /* ─────────────────────────────────────────
     NOTIFICATION PANEL
  ───────────────────────────────────────── */
  function createPanel() {
    if (panelEl) return;

    panelEl = document.createElement('div');
    panelEl.id        = 'notif-panel';
    panelEl.className = 'notif-panel';
    panelEl.setAttribute('aria-hidden', 'true');
    panelEl.innerHTML = `
      <div class="notif-panel__header">
        <span class="notif-panel__title">Notifikasi</span>
        <button class="notif-panel__mark-all" id="notif-mark-all">Tandai semua dibaca</button>
      </div>
      <div class="notif-panel__body" id="notif-panel-body">
        <div class="notif-panel__empty">
          <span style="font-size:2rem;">🔔</span>
          <p>Belum ada notifikasi</p>
        </div>
      </div>
      <div class="notif-panel__footer">
        <button class="notif-panel__clear" id="notif-clear-all">Hapus semua</button>
        ${!isGranted() ? `<button class="notif-panel__enable" id="notif-enable-btn">Aktifkan Notifikasi</button>` : ''}
      </div>
    `;

    document.body.appendChild(panelEl);

    panelEl.querySelector('#notif-mark-all')?.addEventListener('click', () => {
      markAllRead();
      renderPanel();
    });

    panelEl.querySelector('#notif-clear-all')?.addEventListener('click', () => {
      clearHistory();
      renderPanel();
    });

    panelEl.querySelector('#notif-enable-btn')?.addEventListener('click', async () => {
      const result = await requestPermission();
      if (result === 'granted') {
        const enableBtn = panelEl.querySelector('#notif-enable-btn');
        if (enableBtn) enableBtn.remove();
        if (window.CineToast) {
          CineToast.show('Notifikasi berhasil diaktifkan! 🔔', 'success');
        }
      }
    });

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
      if (panelOpen && !panelEl.contains(e.target) && !bellEl?.contains(e.target)) {
        closePanel();
      }
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panelOpen) closePanel();
    });
  }

  function renderPanel() {
    const body = document.getElementById('notif-panel-body');
    if (!body) return;

    const history = getHistory();
    if (!history.length) {
      body.innerHTML = `
        <div class="notif-panel__empty">
          <span style="font-size:2rem;">🔔</span>
          <p>Belum ada notifikasi</p>
        </div>
      `;
      return;
    }

    body.innerHTML = history.map(n => `
      <div class="notif-item ${n.read ? 'notif-item--read' : ''}" data-id="${escSafe(n.id)}" ${n.url ? `data-url="${escSafe(n.url)}"` : ''}>
        <div class="notif-item__icon">${getNotifIcon(n.type)}</div>
        <div class="notif-item__content">
          <div class="notif-item__title">${escSafe(n.title)}</div>
          <div class="notif-item__body">${escSafe(n.body)}</div>
          <div class="notif-item__time">${formatTimeAgo(n.timestamp)}</div>
        </div>
        ${!n.read ? '<div class="notif-item__dot"></div>' : ''}
      </div>
    `).join('');

    // Bind item clicks
    body.querySelectorAll('.notif-item').forEach(item => {
      item.addEventListener('click', () => {
        const id  = item.dataset.id;
        const url = item.dataset.url;
        markRead(id);
        item.classList.add('notif-item--read');
        item.querySelector('.notif-item__dot')?.remove();
        if (url) {
          closePanel();
          setTimeout(() => { window.location.href = url; }, 150);
        }
      });
    });
  }

  function togglePanel() {
    if (panelOpen) {
      closePanel();
    } else {
      openPanel();
    }
  }

  function openPanel() {
    if (!panelEl) createPanel();
    renderPanel();

    const bellRect = bellEl?.getBoundingClientRect();
    if (bellRect && panelEl) {
      const rightOffset = window.innerWidth - bellRect.right;
      panelEl.style.right = Math.max(8, rightOffset - 8) + 'px';
    }

    panelEl.classList.add('notif-panel--open');
    panelEl.setAttribute('aria-hidden', 'false');
    panelOpen = true;
  }

  function closePanel() {
    if (!panelEl) return;
    panelEl.classList.remove('notif-panel--open');
    panelEl.setAttribute('aria-hidden', 'true');
    panelOpen = false;
  }

  /* ─────────────────────────────────────────
     SCHEDULED CHECKS
     Poll every 30 min for watchlist reminders & new movies
  ───────────────────────────────────────── */
  const CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes

  function scheduleChecks() {
    // Initial check after 10 seconds (let page settle)
    setTimeout(runChecks, 10_000);
    // Repeat every 30 minutes
    setInterval(runChecks, CHECK_INTERVAL);
  }

  async function runChecks() {
    if (!isGranted()) return;
    if (!window.CineStorage || !CineStorage.User.isLoggedIn()) return;

    const settings  = getUserSettings();
    const lastCheck = parseInt(localStorage.getItem(KEYS.LAST_CHECK) || '0', 10);
    const now       = Date.now();

    // Only check once per 30 min
    if (now - lastCheck < CHECK_INTERVAL) return;
    localStorage.setItem(KEYS.LAST_CHECK, String(now));

    // Watchlist reminder
    if (settings.notifWatchlist) {
      const user    = CineStorage.User.getCurrent();
      const wlIds   = CineStorage.Watchlist.getAll(user.id);
      if (wlIds.length > 0) {
        notifyWatchlistReminder(wlIds);
      }
    }

    // New movie notification (simulate: pick a random unmatched movie)
    if (settings.notifNewMovie) {
      try {
        const base = window.CineRouter ? CineRouter.getRootPath() : '../';
        const resp = await fetch(base + 'data/movies.json');
        const movies = await resp.json();

        const user    = CineStorage.User.getCurrent();
        const history = CineStorage.History.getAll(user.id).map(h => h.movieId);
        const unseen  = movies.filter(m => !history.includes(m.id));

        if (unseen.length > 0) {
          const pick = unseen[Math.floor(Math.random() * Math.min(5, unseen.length))];
          notifyNewMovie(pick);
        }
      } catch (_) { /* noop — no network */ }
    }
  }

  /* ─────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────── */
  function getNotifIcon(type) {
    const icons = {
      movie:     '🎬',
      watchlist: '🎥',
      news:      '📰',
      info:      '💡',
      success:   '✅',
      warning:   '⚠️',
    };
    return icons[type] || '🔔';
  }

  function formatTimeAgo(timestamp) {
    const diff = Date.now() - timestamp;
    const s = Math.floor(diff / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);

    const lang = window.CineI18n ? CineI18n.getLanguage() : 'id';
    if (lang === 'en') {
      if (d > 0) return `${d}d ago`;
      if (h > 0) return `${h}h ago`;
      if (m > 0) return `${m}m ago`;
      return 'Just now';
    } else {
      if (d > 0) return `${d} hari lalu`;
      if (h > 0) return `${h} jam lalu`;
      if (m > 0) return `${m} menit lalu`;
      return 'Baru saja';
    }
  }

  function escSafe(str = '') {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ─────────────────────────────────────────
     INJECT CSS
  ───────────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById('notif-styles')) return;
    const style = document.createElement('style');
    style.id = 'notif-styles';
    style.textContent = `
      /* ── Notification Panel ── */
      .notif-panel {
        position: fixed;
        top: 70px;
        right: 20px;
        z-index: 9990;
        width: 360px;
        max-width: calc(100vw - 24px);
        background: #111827;
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.6);
        opacity: 0;
        transform: translateY(-8px) scale(0.97);
        pointer-events: none;
        transition: opacity 0.2s ease, transform 0.2s ease;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      .notif-panel--open {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: all;
      }
      .notif-panel__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px 10px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
        flex-shrink: 0;
      }
      .notif-panel__title {
        font-family: Inter, sans-serif;
        font-size: 0.9rem;
        font-weight: 700;
        color: #F9FAFB;
      }
      .notif-panel__mark-all {
        background: none;
        border: none;
        color: #3B82F6;
        font-size: 0.72rem;
        font-family: Inter, sans-serif;
        cursor: pointer;
        padding: 0;
        transition: opacity 0.2s;
      }
      .notif-panel__mark-all:hover { opacity: 0.7; }
      .notif-panel__body {
        flex: 1;
        max-height: 360px;
        overflow-y: auto;
        overscroll-behavior: contain;
      }
      .notif-panel__empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        color: #6B7280;
        font-family: Inter, sans-serif;
        font-size: 0.85rem;
        gap: 8px;
      }
      .notif-panel__footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        padding: 10px 16px;
        border-top: 1px solid rgba(255,255,255,0.06);
        flex-shrink: 0;
      }
      .notif-panel__clear {
        background: none;
        border: none;
        color: #9CA3AF;
        font-size: 0.72rem;
        font-family: Inter, sans-serif;
        cursor: pointer;
        padding: 0;
        transition: color 0.2s;
      }
      .notif-panel__clear:hover { color: #E50914; }
      .notif-panel__enable {
        background: #E50914;
        border: none;
        color: #fff;
        font-size: 0.72rem;
        font-family: Inter, sans-serif;
        font-weight: 600;
        cursor: pointer;
        padding: 5px 12px;
        border-radius: 6px;
        transition: background 0.2s;
      }
      .notif-panel__enable:hover { background: #b5070f; }

      /* ── Notification Item ── */
      .notif-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 12px 16px;
        border-bottom: 1px solid rgba(255,255,255,0.04);
        cursor: pointer;
        transition: background 0.15s;
        position: relative;
      }
      .notif-item:hover { background: rgba(255,255,255,0.04); }
      .notif-item--read { opacity: 0.6; }
      .notif-item__icon {
        font-size: 1.4rem;
        flex-shrink: 0;
        margin-top: 2px;
      }
      .notif-item__content { flex: 1; min-width: 0; }
      .notif-item__title {
        font-family: Inter, sans-serif;
        font-size: 0.8rem;
        font-weight: 600;
        color: #F9FAFB;
        margin-bottom: 3px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .notif-item__body {
        font-family: Inter, sans-serif;
        font-size: 0.75rem;
        color: #9CA3AF;
        margin-bottom: 4px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .notif-item__time {
        font-family: Inter, sans-serif;
        font-size: 0.68rem;
        color: #6B7280;
      }
      .notif-item__dot {
        width: 8px;
        height: 8px;
        background: #E50914;
        border-radius: 50%;
        flex-shrink: 0;
        margin-top: 6px;
      }

      @media (max-width: 480px) {
        .notif-panel { right: 8px; width: calc(100vw - 16px); top: 62px; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ─────────────────────────────────────────
     INIT
  ───────────────────────────────────────── */
  function init() {
    // Inject bell after navbar is ready
    setTimeout(() => {
      injectBell();
      scheduleChecks();
    }, 200);

    // Re-inject if language changes
    window.addEventListener('cineverse:langchange', () => {
      // Update panel title & labels
      const titleEl = document.querySelector('.notif-panel__title');
      if (titleEl && window.CineI18n) {
        titleEl.textContent = CineI18n.getLanguage() === 'en' ? 'Notifications' : 'Notifikasi';
      }
      const markAllEl = document.querySelector('.notif-panel__mark-all');
      if (markAllEl && window.CineI18n) {
        markAllEl.textContent = CineI18n.getLanguage() === 'en' ? 'Mark all read' : 'Tandai semua dibaca';
      }
    });
  }

  /* ─────────────────────────────────────────
     EXPORT
  ───────────────────────────────────────── */
  return {
    init,
    send,
    notify,
    notifyNewMovie,
    notifyWatchlistReminder,
    notifyNews,
    requestPermission,
    getPermission,
    isGranted,
    getHistory,
    markAllRead,
    markRead,
    clearHistory,
    getUnreadCount,
    updateBell,
    injectBell,
    openPanel,
    closePanel,
  };
})();

window.CineNotif = CineNotif;

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => CineNotif.init());
} else {
  CineNotif.init();
}
