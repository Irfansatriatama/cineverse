/**
 * CineVerse — pages/watchlist.js
 * Watchlist page: display, filter by genre, sort, grid/list view, remove
 * Depends on: storage.js, router.js, app.js, toast.js
 */

(function () {
  'use strict';

  /* ─── State ─── */
  let movies       = [];
  let user         = null;
  let watchlistIds = [];
  let watchlistMovies = [];
  let activeGenre  = 'all';
  let sortBy       = 'added';
  let viewMode     = 'grid'; // 'grid' | 'list'
  let page         = 1;
  const PER_PAGE   = 24;

  /* ─────────────────────────────────────────
     INIT
  ───────────────────────────────────────── */
  async function init() {
    user = window.CineStorage ? CineStorage.User.getCurrent() : null;
    if (!user) {
      // Auth guard — redirect to login
      const base = window.CineRouter ? CineRouter.getRootPath() : '../';
      window.location.replace(base + 'pages/auth/login.html');
      return;
    }

    const loader = document.getElementById('page-loader');
    if (loader) setTimeout(() => loader.classList.add('loaded'), 200);

    await loadMovies();
    buildWatchlistMovies();
    renderGenreFilter();
    renderGrid();
    bindEvents();

    if (window.CineTransitions) {
      CineTransitions.initSectionReveal?.();
    }
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
      console.warn('[Watchlist] Could not load movies:', e);
      movies = [];
    }
  }

  function buildWatchlistMovies() {
    watchlistIds   = CineStorage.Watchlist.getAll(user.id);
    // Preserve added order (newest = highest index in array, so reverse)
    watchlistMovies = watchlistIds
      .map(id => movies.find(m => m.id === id))
      .filter(Boolean);
  }

  /* ─────────────────────────────────────────
     GENRE FILTER
  ───────────────────────────────────────── */
  function renderGenreFilter() {
    const container = document.getElementById('wl-genre-filter');
    if (!container) return;

    const genreSet = new Set();
    watchlistMovies.forEach(m => (m.genres || []).forEach(g => genreSet.add(g)));
    const genres = Array.from(genreSet).sort();

    // Keep the "Semua" chip, add genre chips
    const allChip = container.querySelector('[data-genre="all"]');
    container.innerHTML = '';
    if (allChip) container.appendChild(allChip);

    genres.forEach(g => {
      const chip = document.createElement('button');
      chip.className = 'wl-genre-chip';
      chip.dataset.genre = g;
      chip.textContent  = g;
      container.appendChild(chip);
    });

    container.addEventListener('click', e => {
      const chip = e.target.closest('.wl-genre-chip');
      if (!chip) return;
      activeGenre = chip.dataset.genre;
      container.querySelectorAll('.wl-genre-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      page = 1;
      renderGrid();
    });
  }

  /* ─────────────────────────────────────────
     SORT & FILTER
  ───────────────────────────────────────── */
  function getSortedFiltered() {
    let list = [...watchlistMovies];

    // Genre filter
    if (activeGenre !== 'all') {
      list = list.filter(m => (m.genres || []).includes(activeGenre));
    }

    // Sort
    switch (sortBy) {
      case 'title':
        list.sort((a, b) => a.title.localeCompare(b.title, 'id'));
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'year':
        list.sort((a, b) => b.year - a.year);
        break;
      case 'added':
      default:
        // Preserve insertion order (latest added = end of watchlistIds)
        list.sort((a, b) => watchlistIds.indexOf(b.id) - watchlistIds.indexOf(a.id));
        break;
    }

    return list;
  }

  /* ─────────────────────────────────────────
     RENDER GRID
  ───────────────────────────────────────── */
  function renderGrid() {
    const grid    = document.getElementById('wl-grid');
    const empty   = document.getElementById('wl-empty');
    const label   = document.getElementById('wl-count-label');
    const emptyTitle = document.getElementById('wl-empty-title');
    const emptyText  = document.getElementById('wl-empty-text');
    if (!grid) return;

    const list = getSortedFiltered();

    // Update subtitle
    if (label) {
      const total = watchlistMovies.length;
      label.textContent = total > 0
        ? `${total} film tersimpan`
        : 'Belum ada film tersimpan';
    }

    if (!list.length) {
      grid.innerHTML = '';
      if (empty) {
        if (activeGenre !== 'all') {
          if (emptyTitle) emptyTitle.textContent = `Tidak ada film genre "${activeGenre}"`;
          if (emptyText)  emptyText.textContent  = 'Coba pilih genre lain atau tambahkan film genre ini ke watchlist.';
        } else {
          if (emptyTitle) emptyTitle.textContent = 'Watchlist Kosong';
          if (emptyText)  emptyText.textContent  = 'Belum ada film yang kamu simpan. Mulai tambahkan film favorit dari halaman detail film!';
        }
        empty.style.display = 'block';
      }
      return;
    }

    if (empty) empty.style.display = 'none';

    const slice = list.slice(0, page * PER_PAGE);
    grid.innerHTML = slice.map(m => buildCard(m)).join('');
    bindCardEvents(grid);
  }

  /* ─────────────────────────────────────────
     CARD BUILDERS
  ───────────────────────────────────────── */
  function buildCard(movie) {
    const progress  = CineStorage.Progress.get(user.id, movie.id);
    const pct       = progress
      ? Math.min(Math.round((progress.seconds / (movie.duration * 60)) * 100), 99)
      : 0;
    const genres    = (movie.genres || []).slice(0, 3);
    const genreBadges = genres.map(g => `<span class="wl-card__genre-badge">${esc(g)}</span>`).join('');

    return `
      <div class="wl-card" data-id="${esc(movie.id)}">
        <!-- Remove (X) button top right for grid -->
        <button class="wl-card__remove-top wl-remove-btn"
                data-id="${esc(movie.id)}"
                title="Hapus dari Watchlist"
                aria-label="Hapus ${esc(movie.title)} dari watchlist">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <a href="movie-detail.html?id=${esc(movie.id)}" style="text-decoration:none;">
          <div class="wl-card__poster">
            <img src="${esc(movie.posterUrl || '')}"
                 alt="${esc(movie.title)}"
                 loading="lazy"
                 onerror="this.src='../assets/images/poster-placeholder.svg'" />
            <div class="wl-card__overlay">
              <div class="wl-card__actions">
                <a href="watch.html?id=${esc(movie.id)}" class="wl-card__action-btn wl-card__action-btn--watch"
                   onclick="event.stopPropagation()">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Tonton
                </a>
              </div>
            </div>
            <div class="wl-card__rating">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              ${movie.rating}
            </div>
            ${pct > 0 ? `
            <div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:rgba(255,255,255,0.12);">
              <div style="height:100%;width:${pct}%;background:var(--color-crimson);"></div>
            </div>` : ''}
          </div>
        </a>

        <div class="wl-card__info">
          <div class="wl-card__title" title="${esc(movie.title)}">${esc(movie.title)}</div>
          <div class="wl-card__meta">
            <span>${movie.year}</span>
            <span>·</span>
            <span>${formatDuration(movie.duration)}</span>
          </div>
          <!-- List view extras -->
          <div class="wl-card__genres">${genreBadges}</div>
          <div class="wl-card__list-actions">
            <a href="watch.html?id=${esc(movie.id)}" class="wl-card__action-btn wl-card__action-btn--watch">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Tonton
            </a>
            <button class="wl-card__action-btn wl-card__action-btn--remove wl-remove-btn"
                    data-id="${esc(movie.id)}">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
              Hapus
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /* ─────────────────────────────────────────
     EVENT BINDING
  ───────────────────────────────────────── */
  function bindCardEvents(container) {
    container.querySelectorAll('.wl-remove-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        const movieId = btn.dataset.id;
        const movie   = movies.find(m => m.id === movieId);
        showConfirm(
          `Hapus "${movie?.title || movieId}" dari watchlist?`,
          () => removeFromWatchlist(movieId)
        );
      });
    });
  }

  function bindEvents() {
    // Sort
    document.getElementById('wl-sort')?.addEventListener('change', e => {
      sortBy = e.target.value;
      page   = 1;
      renderGrid();
    });

    // View toggle
    document.getElementById('view-grid')?.addEventListener('click', () => {
      viewMode = 'grid';
      document.getElementById('wl-grid')?.classList.remove('list-view');
      document.getElementById('view-grid')?.classList.add('active');
      document.getElementById('view-list')?.classList.remove('active');
      renderGrid();
    });

    document.getElementById('view-list')?.addEventListener('click', () => {
      viewMode = 'list';
      document.getElementById('wl-grid')?.classList.add('list-view');
      document.getElementById('view-list')?.classList.add('active');
      document.getElementById('view-grid')?.classList.remove('active');
      renderGrid();
    });

    // Clear all
    document.getElementById('wl-clear-all')?.addEventListener('click', () => {
      if (!watchlistMovies.length) return;
      showConfirm(
        `Hapus semua ${watchlistMovies.length} film dari watchlist?`,
        () => {
          CineStorage.Watchlist.clear(user.id);
          buildWatchlistMovies();
          renderGenreFilter();
          renderGrid();
          updateNavbarBadge();
          if (window.Toast) Toast.info('Semua film dihapus dari watchlist.');
        }
      );
    });
  }

  function removeFromWatchlist(movieId) {
    CineStorage.Watchlist.remove(user.id, movieId);
    buildWatchlistMovies();

    const card = document.querySelector(`.wl-card[data-id="${movieId}"]`);
    if (card) {
      card.style.transition = 'opacity 0.25s, transform 0.25s';
      card.style.opacity  = '0';
      card.style.transform = 'scale(0.9)';
      setTimeout(() => {
        renderGrid();
        renderGenreFilter();
        updateNavbarBadge();
      }, 280);
    } else {
      renderGrid();
      renderGenreFilter();
      updateNavbarBadge();
    }

    if (window.Toast) Toast.info('Film dihapus dari Watchlist.');
  }

  function updateNavbarBadge() {
    const badge = document.getElementById('watchlist-badge');
    if (badge) {
      const count = CineStorage.Watchlist.getAll(user.id).length;
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  /* ─────────────────────────────────────────
     CONFIRM MODAL
  ───────────────────────────────────────── */
  let confirmCallback = null;

  function showConfirm(text, callback) {
    const modal = document.getElementById('confirm-modal');
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
     HELPERS
  ───────────────────────────────────────── */
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
