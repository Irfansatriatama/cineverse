/**
 * CineVerse — pages/surprise.js
 * Fitur "Surprise Me" — rekomendasi film acak berdasarkan preferensi genre user.
 *
 * Cara kerja:
 *  1. Ambil preferredGenres dari Settings. Jika kosong, derive dari History & Watchlist.
 *  2. Filter film berdasarkan genre chips yang dipilih user di modal.
 *  3. Dari pool filtered, pilih satu film secara acak (weighted oleh rating).
 *  4. User bisa re-spin untuk film lain, langsung nonton, atau lihat detail.
 *
 * Depends on: storage.js, router.js, toast.js
 * Exported as: window.CineSurprise
 */

const CineSurprise = (() => {
  'use strict';

  /* ─── State ─── */
  let movies          = [];
  let genres          = [];
  let currentMovie    = null;
  let activeGenres    = new Set(); // genre chips yang dipilih user di modal
  let isOpen          = false;
  let isLoading       = false;
  let spinHistory     = new Set(); // track film yang sudah di-spin agar tidak repeat
  let dataLoaded      = false;

  /* ─── DOM refs (ditetapkan saat mount) ─── */
  let modal, backdrop, card, heroEl, backdropImg, posterImg;
  let titleEl, yearEl, ratingEl, synopsisEl, genresEl, badgeEl, infoRowEl;
  let filtersSection, chipContainer;
  let btnWatch, btnDetail, btnSpin, btnClose;
  let loadingEl;

  /* ─────────────────────────────────────────
     PUBLIC: OPEN MODAL
  ───────────────────────────────────────── */
  async function open() {
    if (isOpen) return;
    isOpen = true;

    // Ensure modal is mounted
    if (!modal) mount();
    if (!modal) return;

    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('is-open'));

    // Show loading initially
    showLoading(true);

    // Load data if not yet
    if (!dataLoaded) {
      await loadData();
      dataLoaded = true;
    }

    // Set genre chips based on user preferences
    buildGenreChips();

    // Pick a random film
    await spin();
  }

  /* ─────────────────────────────────────────
     PUBLIC: CLOSE MODAL
  ───────────────────────────────────────── */
  function close() {
    if (!modal) return;
    modal.classList.remove('is-open');
    setTimeout(() => {
      modal.style.display = 'none';
      isOpen = false;
    }, 300);
  }

  /* ─────────────────────────────────────────
     MOUNT MODAL INTO DOM
  ───────────────────────────────────────── */
  function mount() {
    if (document.getElementById('surprise-modal')) {
      modal = document.getElementById('surprise-modal');
      _assignRefs();
      _bindEvents();
      return;
    }

    const el = document.createElement('div');
    el.id = 'surprise-modal';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Surprise Me — Rekomendasi Film Acak');
    el.innerHTML = _buildHTML();
    document.body.appendChild(el);

    modal = el;
    _assignRefs();
    _bindEvents();
  }

  function _buildHTML() {
    return `
      <div class="surprise-backdrop" id="surprise-backdrop"></div>
      <div class="surprise-modal__card">

        <!-- Loading overlay -->
        <div class="surprise-modal__loading" id="surprise-loading">
          <div class="surprise-dice-loader">🎲</div>
          <div class="surprise-modal__loading-text">Sedang memilihkan film untukmu…</div>
        </div>

        <!-- Close button -->
        <button class="surprise-modal__close" id="surprise-close" aria-label="Tutup">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <!-- Hero backdrop -->
        <div class="surprise-modal__hero" id="surprise-hero">
          <img class="surprise-modal__backdrop" id="surprise-backdrop-img" src="" alt="" />
          <div class="surprise-modal__hero-overlay"></div>
          <div class="surprise-modal__poster-wrap">
            <img class="surprise-modal__poster" id="surprise-poster" src="" alt="" />
          </div>
        </div>

        <!-- Body -->
        <div class="surprise-modal__body">

          <!-- Meta: badge, year, rating -->
          <div class="surprise-modal__meta">
            <span class="surprise-modal__badge" id="surprise-badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              Untukmu
            </span>
            <span class="surprise-modal__year" id="surprise-year">—</span>
            <span class="surprise-modal__rating" id="surprise-rating">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--color-gold)" stroke="none">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              —
            </span>
          </div>

          <!-- Title -->
          <h2 class="surprise-modal__title" id="surprise-title">—</h2>

          <!-- Genre tags -->
          <div class="surprise-modal__genres" id="surprise-genres"></div>

          <!-- Synopsis -->
          <p class="surprise-modal__synopsis" id="surprise-synopsis">—</p>

          <!-- Duration & language -->
          <div class="surprise-modal__info-row" id="surprise-info-row">
            <div class="surprise-modal__info-item" id="surprise-duration">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>—</span>
            </div>
            <div class="surprise-modal__info-item" id="surprise-lang">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <span>—</span>
            </div>
          </div>

          <!-- Genre filter chips -->
          <div class="surprise-modal__filters" id="surprise-filters">
            <div class="surprise-modal__filters-label">🎭 Filter Genre</div>
            <div class="surprise-modal__genre-chips" id="surprise-chip-container"></div>
          </div>

          <!-- Action buttons -->
          <div class="surprise-modal__actions">
            <button class="surprise-modal__btn-watch" id="surprise-btn-watch">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Tonton Sekarang
            </button>
            <a href="#" class="surprise-modal__btn-detail" id="surprise-btn-detail">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Detail
            </a>
            <button class="surprise-modal__btn-spin" id="surprise-btn-spin" title="Film lain">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
              </svg>
            </button>
          </div>

        </div><!-- /body -->
      </div><!-- /card -->
    `;
  }

  function _assignRefs() {
    backdrop      = document.getElementById('surprise-backdrop');
    heroEl        = document.getElementById('surprise-hero');
    backdropImg   = document.getElementById('surprise-backdrop-img');
    posterImg     = document.getElementById('surprise-poster');
    titleEl       = document.getElementById('surprise-title');
    yearEl        = document.getElementById('surprise-year');
    ratingEl      = document.getElementById('surprise-rating');
    synopsisEl    = document.getElementById('surprise-synopsis');
    genresEl      = document.getElementById('surprise-genres');
    badgeEl       = document.getElementById('surprise-badge');
    chipContainer = document.getElementById('surprise-chip-container');
    btnWatch      = document.getElementById('surprise-btn-watch');
    btnDetail     = document.getElementById('surprise-btn-detail');
    btnSpin       = document.getElementById('surprise-btn-spin');
    btnClose      = document.getElementById('surprise-close');
    loadingEl     = document.getElementById('surprise-loading');
  }

  function _bindEvents() {
    // Close on backdrop click
    backdrop?.addEventListener('click', close);
    btnClose?.addEventListener('click', close);

    // Spin button
    btnSpin?.addEventListener('click', () => spin());

    // Watch button (dynamic href, set on render)
    btnWatch?.addEventListener('click', () => {
      if (!currentMovie) return;
      const base = window.CineRouter ? CineRouter.getRootPath() : '../';
      close();
      window.location.href = `${base}pages/watch.html?id=${currentMovie.id}`;
    });

    // Keyboard: Escape to close, Space/Enter to spin
    document.addEventListener('keydown', (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') close();
      if (e.key === ' ' && document.activeElement === document.body) {
        e.preventDefault();
        spin();
      }
    });
  }

  /* ─────────────────────────────────────────
     DATA LOADING
  ───────────────────────────────────────── */
  async function loadData() {
    try {
      const base = window.CineRouter ? CineRouter.getRootPath() : '../';
      const [moviesRes, genresRes] = await Promise.all([
        fetch(base + 'data/movies.json'),
        fetch(base + 'data/genres.json'),
      ]);
      const moviesData = await moviesRes.json();
      const genresData = await genresRes.json();
      movies = moviesData.movies || [];
      genres = genresData.genres || [];
    } catch (e) {
      console.warn('[Surprise] Could not load data:', e);
      movies = [];
      genres = [];
    }
  }

  /* ─────────────────────────────────────────
     BUILD GENRE CHIPS
     Prefer user's saved preferred genres. Fall back to all genres.
  ───────────────────────────────────────── */
  function buildGenreChips() {
    if (!chipContainer) return;

    const user = window.CineStorage ? CineStorage.User.getCurrent() : null;
    let prefGenres = [];

    if (user && window.CineStorage) {
      const settings = CineStorage.Settings.get(user.id);
      prefGenres = settings.preferredGenres || [];

      // If no preferences saved, derive from history & watchlist
      if (!prefGenres.length) {
        const genreCount = {};
        const history = CineStorage.History.getAll(user.id);
        history.slice(0, 30).forEach(h => {
          const m = movies.find(mv => mv.id === h.movieId);
          (m?.genres || []).forEach(g => {
            genreCount[g] = (genreCount[g] || 0) + 1;
          });
        });
        const watchlistIds = CineStorage.Watchlist.getAll(user.id);
        watchlistIds.forEach(id => {
          const m = movies.find(mv => mv.id === id);
          (m?.genres || []).forEach(g => {
            genreCount[g] = (genreCount[g] || 0) + 0.5;
          });
        });
        prefGenres = Object.entries(genreCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([g]) => g);
      }
    }

    // Collect all unique genres from movies for chip list
    const allGenres = [...new Set(movies.flatMap(m => m.genres || []))].sort();
    const chipGenres = prefGenres.length ? prefGenres : allGenres.slice(0, 8);

    // Pre-select preferred genres
    activeGenres = new Set(prefGenres.length ? prefGenres : []);

    chipContainer.innerHTML = chipGenres.map(g => `
      <button
        class="surprise-modal__chip ${activeGenres.has(g) ? 'active' : ''}"
        data-genre="${g}"
        type="button"
      >${g}</button>
    `).join('');

    // Bind chip toggle
    chipContainer.querySelectorAll('.surprise-modal__chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const g = chip.dataset.genre;
        if (activeGenres.has(g)) {
          activeGenres.delete(g);
          chip.classList.remove('active');
        } else {
          activeGenres.add(g);
          chip.classList.add('active');
        }
        // Re-spin with new genre filter
        spinHistory.clear(); // reset spin history when filter changes
        spin();
      });
    });
  }

  /* ─────────────────────────────────────────
     SPIN — pick a random movie
  ───────────────────────────────────────── */
  async function spin() {
    if (isLoading) return;
    isLoading = true;

    // Animate spin button
    btnSpin?.classList.add('is-spinning');
    heroEl?.classList.add('is-spinning');

    // Short delay for animation feel
    await _delay(350);

    const pool = getMoviePool();

    if (!pool.length) {
      renderEmpty();
      isLoading = false;
      btnSpin?.classList.remove('is-spinning');
      heroEl?.classList.remove('is-spinning');
      showLoading(false);
      return;
    }

    // Weighted random (higher rating = slightly higher chance)
    const picked = weightedRandom(pool);
    currentMovie = picked;

    // Add to spin history (avoid immediate repeat)
    spinHistory.add(picked.id);
    if (spinHistory.size >= pool.length) spinHistory.clear(); // reset when all seen

    renderMovie(picked);

    isLoading = false;
    btnSpin?.classList.remove('is-spinning');
    setTimeout(() => heroEl?.classList.remove('is-spinning'), 600);
    showLoading(false);
  }

  /* ─────────────────────────────────────────
     GET MOVIE POOL
     Filter by activeGenres, exclude spin history
  ───────────────────────────────────────── */
  function getMoviePool() {
    let pool = movies.filter(m => {
      // Genre filter: if no genre selected, use all
      if (activeGenres.size > 0) {
        const match = (m.genres || []).some(g => activeGenres.has(g));
        if (!match) return false;
      }
      // Exclude already-seen this session
      if (spinHistory.has(m.id)) return false;
      return true;
    });

    // If pool is empty due to spinHistory exhaustion, reset and retry
    if (!pool.length && spinHistory.size > 0) {
      spinHistory.clear();
      pool = movies.filter(m => {
        if (activeGenres.size > 0) {
          return (m.genres || []).some(g => activeGenres.has(g));
        }
        return true;
      });
    }

    return pool;
  }

  /* ─────────────────────────────────────────
     WEIGHTED RANDOM PICK
  ───────────────────────────────────────── */
  function weightedRandom(pool) {
    const weights = pool.map(m => Math.pow(m.rating || 7, 2)); // rating² as weight
    const total = weights.reduce((s, w) => s + w, 0);
    let r = Math.random() * total;
    for (let i = 0; i < pool.length; i++) {
      r -= weights[i];
      if (r <= 0) return pool[i];
    }
    return pool[pool.length - 1];
  }

  /* ─────────────────────────────────────────
     RENDER MOVIE INTO MODAL
  ───────────────────────────────────────── */
  function renderMovie(m) {
    if (!m) return;

    const base = window.CineRouter ? CineRouter.getRootPath() : '../';
    const placeholder = base + 'assets/images/poster-placeholder.svg';
    const langMap = { en: 'English', id: 'Indonesia', jp: 'Japanese', ko: 'Korean', fr: 'French' };
    const duration = m.duration ? `${Math.floor(m.duration / 60)}j ${m.duration % 60}m` : '—';

    // Images
    if (backdropImg) {
      backdropImg.src = m.backdropUrl || m.posterUrl || placeholder;
      backdropImg.alt = m.title;
      backdropImg.onerror = () => { backdropImg.src = placeholder; };
    }
    if (posterImg) {
      posterImg.src = m.posterUrl || placeholder;
      posterImg.alt = m.title;
      posterImg.onerror = () => { posterImg.src = placeholder; };
    }

    // Text fields
    if (titleEl)    titleEl.textContent    = m.title || '—';
    if (yearEl)     yearEl.textContent     = m.year || '—';
    if (synopsisEl) synopsisEl.textContent = m.synopsis || 'Tidak ada sinopsis.';

    // Rating with star
    if (ratingEl) {
      ratingEl.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--color-gold)" stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        ${(m.rating || 0).toFixed(1)}
      `;
    }

    // Genres
    if (genresEl) {
      genresEl.innerHTML = (m.genres || []).map(g => `
        <span class="surprise-modal__genre-tag">${g}</span>
      `).join('');
    }

    // Duration & language
    const durEl  = document.querySelector('#surprise-duration span');
    const langEl = document.querySelector('#surprise-lang span');
    if (durEl)  durEl.textContent  = duration;
    if (langEl) langEl.textContent = langMap[m.language] || m.language || '—';

    // Age rating badge
    if (badgeEl) {
      badgeEl.innerHTML = `
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        ${m.age_rating || 'Semua Usia'}
      `;
    }

    // Detail link
    if (btnDetail) {
      btnDetail.href = `${base}pages/movie-detail.html?id=${m.id}`;
    }
  }

  /* ─────────────────────────────────────────
     RENDER EMPTY STATE
  ───────────────────────────────────────── */
  function renderEmpty() {
    const body = modal?.querySelector('.surprise-modal__body');
    if (!body) return;

    const actionsEl = body.querySelector('.surprise-modal__actions');
    if (actionsEl) actionsEl.style.display = 'none';

    // Inject empty state before actions
    const existing = body.querySelector('.surprise-modal__empty');
    if (existing) existing.remove();

    const emptyEl = document.createElement('div');
    emptyEl.className = 'surprise-modal__empty';
    emptyEl.innerHTML = `
      <div class="surprise-modal__empty-icon">🎭</div>
      <h3>Tidak ada film ditemukan</h3>
      <p>Coba pilih genre lain atau hapus semua filter.</p>
    `;
    body.insertBefore(emptyEl, actionsEl);

    if (titleEl) titleEl.textContent = 'Oops…';
    if (synopsisEl) synopsisEl.textContent = '';
    if (genresEl) genresEl.innerHTML = '';
  }

  /* ─────────────────────────────────────────
     SHOW / HIDE LOADING OVERLAY
  ───────────────────────────────────────── */
  function showLoading(show) {
    if (!loadingEl) return;
    if (show) {
      loadingEl.classList.remove('hidden');
    } else {
      loadingEl.classList.add('hidden');
    }
  }

  /* ─────────────────────────────────────────
     INJECT NAVBAR BUTTON
     Called from app.js after navbar is built.
  ───────────────────────────────────────── */
  function injectNavbarButton() {
    const actionsEl = document.querySelector('.navbar__actions');
    if (!actionsEl) return;

    // Check user is logged in (button only shows for logged-in users)
    const user = window.CineStorage ? CineStorage.User.getCurrent() : null;
    if (!user) return;

    // Don't add if already there
    if (document.getElementById('surprise-nav-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'surprise-nav-btn';
    btn.className = 'navbar__surprise-btn';
    btn.setAttribute('aria-label', 'Surprise Me — Film Acak');
    btn.setAttribute('title', 'Surprise Me 🎲');
    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="2" y="2" width="20" height="20" rx="3" ry="3"/>
        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
      </svg>
    `;
    btn.addEventListener('click', () => open());

    // Insert BEFORE the search icon (first child of actionsEl)
    const firstBtn = actionsEl.querySelector('.navbar__icon-btn');
    if (firstBtn) {
      actionsEl.insertBefore(btn, firstBtn);
    } else {
      actionsEl.prepend(btn);
    }
  }

  /* ─────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────── */
  function _delay(ms) {
    return new Promise(res => setTimeout(res, ms));
  }

  /* ─────────────────────────────────────────
     PUBLIC API
  ───────────────────────────────────────── */
  return {
    open,
    close,
    mount,
    injectNavbarButton,
  };

})();

window.CineSurprise = CineSurprise;
