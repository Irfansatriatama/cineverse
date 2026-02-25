/**
 * CineVerse — pages/history.js
 * History page: grouped by date, stats bar, sort, remove, resume progress
 * Depends on: storage.js, router.js, app.js, toast.js
 */

(function () {
  'use strict';

  /* ─── State ─── */
  let movies       = [];
  let user         = null;
  let historyData  = []; // [{movieId, watchedAt}]
  let historyItems = []; // [{movie, watchedAt, progress}]
  let sortBy       = 'newest';
  let page         = 1;
  const PER_PAGE   = 20;

  /* ─────────────────────────────────────────
     INIT
  ───────────────────────────────────────── */
  async function init() {
    user = window.CineStorage ? CineStorage.User.getCurrent() : null;
    if (!user) {
      const base = window.CineRouter ? CineRouter.getRootPath() : '../';
      window.location.replace(base + 'pages/auth/login.html');
      return;
    }

    const loader = document.getElementById('page-loader');
    if (loader) setTimeout(() => loader.classList.add('loaded'), 200);

    await loadMovies();
    buildHistoryItems();
    renderStats();
    renderList();
    bindEvents();
  }

  /* ─────────────────────────────────────────
     DATA
  ───────────────────────────────────────── */
  async function loadMovies() {
    try {
      const base = window.CineRouter ? CineRouter.getRootPath() : '../';
      const res  = await fetch(base + 'data/movies.json');
      const data = await res.json();
      movies = data.movies || [];
    } catch (e) {
      console.warn('[History] Could not load movies:', e);
      movies = [];
    }
  }

  function buildHistoryItems() {
    historyData  = CineStorage.History.getAll(user.id);
    historyItems = historyData
      .map(h => {
        const movie    = movies.find(m => m.id === h.movieId);
        const progress = movie ? CineStorage.Progress.get(user.id, h.movieId) : null;
        return movie ? { movie, watchedAt: h.watchedAt, progress } : null;
      })
      .filter(Boolean);
  }

  /* ─────────────────────────────────────────
     STATS BAR
  ───────────────────────────────────────── */
  function renderStats() {
    const statsEl = document.getElementById('hs-stats');
    if (!statsEl || !historyItems.length) return;

    statsEl.style.display = 'grid';

    // Total films
    const totalEl = document.getElementById('hs-stat-total');
    if (totalEl) totalEl.textContent = historyItems.length;

    // Total hours (sum of durations)
    const totalMinutes = historyItems.reduce((sum, h) => sum + (h.movie.duration || 0), 0);
    const hoursEl = document.getElementById('hs-stat-hours');
    if (hoursEl) {
      const h = Math.floor(totalMinutes / 60);
      hoursEl.textContent = h > 0 ? `${h}j` : `${totalMinutes}m`;
    }

    // Favorite genre
    const genreCount = {};
    historyItems.forEach(h => {
      (h.movie.genres || []).forEach(g => {
        genreCount[g] = (genreCount[g] || 0) + 1;
      });
    });
    const topGenre = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0];
    const genreEl = document.getElementById('hs-stat-genre');
    if (genreEl) genreEl.textContent = topGenre ? topGenre[0] : '—';

    // This week count
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const thisWeek = historyItems.filter(h => h.watchedAt > weekAgo).length;
    const weekEl = document.getElementById('hs-stat-this-week');
    if (weekEl) weekEl.textContent = thisWeek;
  }

  /* ─────────────────────────────────────────
     SORT
  ───────────────────────────────────────── */
  function getSorted() {
    let list = [...historyItems];
    switch (sortBy) {
      case 'oldest':
        list.sort((a, b) => a.watchedAt - b.watchedAt);
        break;
      case 'title':
        list.sort((a, b) => a.movie.title.localeCompare(b.movie.title, 'id'));
        break;
      case 'rating':
        list.sort((a, b) => b.movie.rating - a.movie.rating);
        break;
      case 'newest':
      default:
        list.sort((a, b) => b.watchedAt - a.watchedAt);
        break;
    }
    return list;
  }

  /* ─────────────────────────────────────────
     RENDER LIST
  ───────────────────────────────────────── */
  function renderList() {
    const listEl   = document.getElementById('hs-list');
    const emptyEl  = document.getElementById('hs-empty');
    const loadMore = document.getElementById('hs-load-more');
    const label    = document.getElementById('hs-count-label');
    if (!listEl) return;

    const sorted = getSorted();

    if (label) {
      label.textContent = sorted.length > 0
        ? `${sorted.length} film ditonton`
        : 'Belum ada riwayat';
    }

    if (!sorted.length) {
      listEl.innerHTML  = '';
      if (emptyEl) emptyEl.style.display = 'block';
      if (loadMore) loadMore.style.display = 'none';
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';

    const slice = sorted.slice(0, page * PER_PAGE);

    // Group by date if sorting by date
    const isDateSort = sortBy === 'newest' || sortBy === 'oldest';

    if (isDateSort) {
      listEl.innerHTML = buildGrouped(slice);
    } else {
      listEl.innerHTML = slice.map(h => buildItem(h)).join('');
    }

    bindItemEvents(listEl);

    // Load more button
    if (loadMore) {
      loadMore.style.display = sorted.length > page * PER_PAGE ? 'block' : 'none';
    }
  }

  /* ─── Build grouped by date ─── */
  function buildGrouped(items) {
    const groups = {};
    items.forEach(h => {
      const label = dateGroupLabel(h.watchedAt);
      if (!groups[label]) groups[label] = [];
      groups[label].push(h);
    });

    return Object.entries(groups).map(([label, list]) => `
      <div class="hs-date-group">
        <div class="hs-date-label">${esc(label)}</div>
        ${list.map(h => buildItem(h)).join('')}
      </div>
    `).join('');
  }

  /* ─── Build single history item ─── */
  function buildItem(h) {
    const { movie, watchedAt, progress } = h;
    const pct = progress
      ? Math.min(Math.round((progress.seconds / (movie.duration * 60)) * 100), 99)
      : 0;
    const isComplete = pct >= 90;
    const timeStr    = formatTime(watchedAt);
    const genre      = (movie.genres || [])[0] || '';

    return `
      <div class="hs-item" data-id="${esc(movie.id)}">
        <div class="hs-item__thumb">
          <img src="${esc(movie.backdropUrl || movie.posterUrl || '')}"
               alt="${esc(movie.title)}"
               loading="lazy"
               onerror="this.parentElement.style.background='var(--color-bg-tertiary)';this.style.display='none'" />
          <div class="hs-item__play-overlay">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
          ${pct > 0 ? `
          <div class="hs-item__progress">
            <div class="hs-item__progress-fill" style="width:${pct}%"></div>
          </div>` : ''}
        </div>

        <div class="hs-item__info">
          <div class="hs-item__title" title="${esc(movie.title)}">${esc(movie.title)}</div>
          <div class="hs-item__meta">
            ${genre ? `<span class="hs-item__genre">${esc(genre)}</span>` : ''}
            <span>${movie.year}</span>
            <span>·</span>
            <span>${formatDuration(movie.duration)}</span>
            <span>·</span>
            <span>⭐ ${movie.rating}</span>
          </div>
          <div class="hs-item__time">${esc(timeStr)}</div>
          ${pct > 0 ? `
          <div class="hs-item__watched-pct${isComplete ? ' hs-item__watched-pct--complete' : ''}">
            ${isComplete
              ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Selesai`
              : `${pct}% ditonton`}
          </div>` : ''}
        </div>

        <div class="hs-item__actions">
          <a href="watch.html?id=${esc(movie.id)}" class="hs-item__action-btn hs-item__action-btn--watch">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            <span>${pct > 0 && !isComplete ? 'Lanjutkan' : 'Tonton'}</span>
          </a>
          <button class="hs-item__action-btn hs-item__action-btn--remove hs-remove-btn"
                  data-id="${esc(movie.id)}"
                  title="Hapus dari riwayat">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
            <span>Hapus</span>
          </button>
        </div>
      </div>
    `;
  }

  /* ─────────────────────────────────────────
     EVENT BINDING
  ───────────────────────────────────────── */
  function bindItemEvents(container) {
    // Make whole item clickable (except action buttons)
    container.querySelectorAll('.hs-item').forEach(item => {
      item.addEventListener('click', e => {
        if (e.target.closest('.hs-item__actions')) return;
        const id = item.dataset.id;
        if (id) window.location.href = `watch.html?id=${id}`;
      });
      item.style.cursor = 'pointer';
    });

    // Remove buttons
    container.querySelectorAll('.hs-remove-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        const movieId = btn.dataset.id;
        const movie   = movies.find(m => m.id === movieId);
        showConfirm(
          `Hapus "${movie?.title || movieId}" dari riwayat?`,
          () => removeFromHistory(movieId)
        );
      });
    });
  }

  function bindEvents() {
    // Sort
    document.getElementById('hs-sort')?.addEventListener('change', e => {
      sortBy = e.target.value;
      page   = 1;
      renderList();
    });

    // Clear all
    document.getElementById('hs-clear-all')?.addEventListener('click', () => {
      if (!historyItems.length) return;
      showConfirm(
        `Hapus semua riwayat tontonan (${historyItems.length} film)?`,
        () => {
          CineStorage.History.clear(user.id);
          buildHistoryItems();
          renderStats();
          renderList();
          if (window.Toast) Toast.info('Semua riwayat tontonan dihapus.');
        }
      );
    });

    // Load more
    document.getElementById('hs-load-more-btn')?.addEventListener('click', () => {
      page++;
      renderList();
    });
  }

  function removeFromHistory(movieId) {
    CineStorage.History.remove(user.id, movieId);
    // Also clear saved progress for this movie
    CineStorage.Progress.clear(user.id, movieId);
    buildHistoryItems();
    renderStats();
    renderList();
    if (window.Toast) Toast.info('Dihapus dari riwayat tontonan.');
  }

  /* ─────────────────────────────────────────
     CONFIRM MODAL
  ───────────────────────────────────────── */
  let confirmCallback = null;

  function showConfirm(text, callback) {
    const modal  = document.getElementById('confirm-modal');
    const textEl = document.getElementById('confirm-modal-text');
    if (!modal) { if (confirm(text)) callback(); return; }

    confirmCallback = callback;
    if (textEl) textEl.textContent = text;
    modal.style.display = 'flex';
  }

  function hideConfirm() {
    const modal = document.getElementById('confirm-modal');
    if (modal) modal.style.display = 'none';
    confirmCallback = null;
  }

  document.getElementById('confirm-ok')?.addEventListener('click', () => {
    if (confirmCallback) confirmCallback();
    hideConfirm();
  });

  document.getElementById('confirm-cancel')?.addEventListener('click', hideConfirm);
  document.getElementById('confirm-modal')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) hideConfirm();
  });

  /* ─────────────────────────────────────────
     DATE HELPERS
  ───────────────────────────────────────── */
  function dateGroupLabel(timestamp) {
    const date  = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const sameDay = (a, b) =>
      a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear();

    if (sameDay(date, today)) return 'Hari Ini';
    if (sameDay(date, yesterday)) return 'Kemarin';

    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);
    if (date > weekAgo) {
      const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
      return days[date.getDay()];
    }

    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    if (date.getFullYear() === today.getFullYear()) {
      return `${date.getDate()} ${months[date.getMonth()]}`;
    }
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  function formatTime(timestamp) {
    const date  = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const sameDay = (a, b) =>
      a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear();

    const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    if (sameDay(date, today)) return `Hari ini, ${timeStr}`;
    if (sameDay(date, yesterday)) return `Kemarin, ${timeStr}`;

    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${timeStr}`;
  }

  function formatDuration(minutes) {
    if (!minutes) return '';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}j ${m}m` : `${m}m`;
  }

  function esc(str = '') {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ─── START ─── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
