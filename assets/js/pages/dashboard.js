/**
 * CineVerse — pages/dashboard.js
 * Main dashboard after login: hero slider, trending, top10, genres, etc.
 * Depends on: app.js, storage.js, router.js, toast.js
 */

(function () {
  'use strict';

  /* ─── State ─── */
  let movies     = [];
  let genres     = [];
  let user       = null;
  let heroSlides = [];
  let heroIndex  = 0;
  let heroTimer  = null;
  let allMoviesPage = 1;
  const PER_PAGE = 12;

  /* ─────────────────────────────────────────
     INIT
  ───────────────────────────────────────── */
  async function init() {
    // Auth check (app.js handles guard, but also grab user for welcome)
    user = window.CineStorage ? CineStorage.User.getCurrent() : null;
    if (!user) return; // router will redirect

    // Show skeletons immediately before data loads
    if (window.CineSkeleton) {
      CineSkeleton.initDashboard();
    }

    // Hide page loader early — skeleton takes over
    const loader = document.getElementById('page-loader');
    if (loader) setTimeout(() => loader.classList.add('loaded'), 250);

    // Load data in parallel
    await Promise.all([loadMovies(), loadGenres()]);

    // Render all sections
    renderWelcomeBanner();
    renderHero();
    renderGenreChips();
    renderContinueWatching();
    renderTrending();
    renderTop10();
    renderIndonesiaFilms();
    renderAnimationFilms();
    renderRecommended();
    renderAllMovies();

    // Clear skeletons and animate content in
    if (window.CineSkeleton) {
      CineSkeleton.clearDashboard();
    }

    // Init section reveal animations
    if (window.CineTransitions) {
      CineTransitions.initSectionReveal();
    }
  }

  /* ─────────────────────────────────────────
     DATA LOADING
  ───────────────────────────────────────── */
  async function loadMovies() {
    try {
      const base = window.CineRouter ? CineRouter.getRootPath() : '../';
      const res  = await fetch(base + 'data/movies.json');
      const data = await res.json();
      movies = data.movies || [];
    } catch (e) {
      console.warn('[Dashboard] Could not load movies:', e);
      movies = [];
    }
  }

  async function loadGenres() {
    try {
      const base = window.CineRouter ? CineRouter.getRootPath() : '../';
      const res  = await fetch(base + 'data/genres.json');
      const data = await res.json();
      genres = data.genres || [];
    } catch (e) {
      genres = [];
    }
  }

  /* ─────────────────────────────────────────
     WELCOME BANNER
  ───────────────────────────────────────── */
  function renderWelcomeBanner() {
    const banner    = document.getElementById('welcome-banner');
    const avatarEl  = document.getElementById('welcome-avatar');
    const nameEl    = document.getElementById('welcome-name');

    if (!banner || !user) return;

    banner.style.display = 'flex';

    const hour = new Date().getHours();
    let greeting = 'Halo';
    if (hour >= 5  && hour < 12) greeting = 'Selamat Pagi';
    if (hour >= 12 && hour < 15) greeting = 'Selamat Siang';
    if (hour >= 15 && hour < 18) greeting = 'Selamat Sore';
    if (hour >= 18 || hour < 5 ) greeting = 'Selamat Malam';

    if (nameEl) nameEl.textContent = `${greeting}, ${user.displayName}! 👋`;

    if (avatarEl) {
      if (user.avatar) {
        avatarEl.innerHTML = `<img src="${esc(user.avatar)}" alt="${esc(user.displayName)}" />`;
      } else {
        const initials = window.CineApp
          ? CineApp.getInitials(user.displayName)
          : user.displayName.charAt(0).toUpperCase();
        avatarEl.textContent = initials;
      }
    }
  }

  /* ─────────────────────────────────────────
     HERO BANNER SLIDER
  ───────────────────────────────────────── */
  function renderHero() {
    const container = document.getElementById('hero-banner');
    const dotsEl    = document.getElementById('hero-dots');
    if (!container) return;

    // Pick featured + trending films for hero
    heroSlides = movies
      .filter(m => m.featured || m.trending)
      .filter(m => m.backdropUrl)
      .slice(0, 6);

    if (!heroSlides.length) {
      container.style.display = 'none';
      return;
    }

    // Build slides
    heroSlides.forEach((movie, i) => {
      const slide = document.createElement('div');
      slide.className = `db-hero__slide${i === 0 ? ' active' : ''}`;
      slide.setAttribute('aria-hidden', i !== 0);
      slide.dataset.index = i;

      const genres = (movie.genres || []).slice(0, 3);

      slide.innerHTML = `
        <img class="db-hero__backdrop"
             src="${esc(movie.backdropUrl)}"
             alt=""
             loading="${i === 0 ? 'eager' : 'lazy'}"
             onerror="this.style.display='none'" />
        <div class="db-hero__overlay"></div>
        <div class="db-hero__overlay-bottom"></div>

        <div class="db-hero__content">
          <div class="db-hero__badges">
            ${genres.map(g => `<span class="badge badge--emerald">${esc(g)}</span>`).join('')}
            ${movie.age_rating ? `<span class="badge badge--crimson">${esc(movie.age_rating)}</span>` : ''}
          </div>

          <h2 class="db-hero__title">${esc(movie.title)}</h2>

          <div class="db-hero__meta">
            <span class="db-hero__rating">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              ${movie.rating}
            </span>
            <span>${movie.year}</span>
            <span>${formatDuration(movie.duration)}</span>
            ${movie.language ? `<span class="badge badge--sm">${movie.language.toUpperCase()}</span>` : ''}
          </div>

          <p class="db-hero__synopsis">${esc(movie.synopsis || '')}</p>

          <div class="db-hero__actions">
            <a href="watch.html?id=${esc(movie.id)}" class="btn btn--primary btn--lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Tonton Sekarang
            </a>
            <a href="movie-detail.html?id=${esc(movie.id)}" class="btn btn--ghost btn--lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Info Lainnya
            </a>
          </div>
        </div>
      `;
      container.insertBefore(slide, container.querySelector('.db-hero__nav--prev'));
    });

    // Build dots
    if (dotsEl) {
      dotsEl.innerHTML = heroSlides.map((_, i) => `
        <button class="db-hero__dot${i === 0 ? ' active' : ''}"
                aria-label="Slide ${i + 1}"
                data-index="${i}">
        </button>
      `).join('');

      dotsEl.addEventListener('click', e => {
        const dot = e.target.closest('.db-hero__dot');
        if (dot) goToHeroSlide(parseInt(dot.dataset.index));
      });
    }

    // Arrow buttons
    document.getElementById('hero-prev')?.addEventListener('click', () => {
      goToHeroSlide((heroIndex - 1 + heroSlides.length) % heroSlides.length);
    });
    document.getElementById('hero-next')?.addEventListener('click', () => {
      goToHeroSlide((heroIndex + 1) % heroSlides.length);
    });

    // Auto-play
    startHeroAutoplay();

    // Pause on hover
    container.addEventListener('mouseenter', stopHeroAutoplay);
    container.addEventListener('mouseleave', startHeroAutoplay);

    // Touch/swipe support
    let touchStartX = 0;
    container.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    container.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        goToHeroSlide(diff > 0
          ? (heroIndex + 1) % heroSlides.length
          : (heroIndex - 1 + heroSlides.length) % heroSlides.length
        );
      }
    }, { passive: true });
  }

  function goToHeroSlide(index) {
    const slides   = document.querySelectorAll('.db-hero__slide');
    const dots     = document.querySelectorAll('.db-hero__dot');

    slides[heroIndex]?.classList.remove('active');
    slides[heroIndex]?.setAttribute('aria-hidden', 'true');
    dots[heroIndex]?.classList.remove('active');

    heroIndex = index;

    slides[heroIndex]?.classList.add('active');
    slides[heroIndex]?.setAttribute('aria-hidden', 'false');
    dots[heroIndex]?.classList.add('active');
  }

  function startHeroAutoplay() {
    stopHeroAutoplay();
    if (heroSlides.length > 1) {
      heroTimer = setInterval(() => {
        goToHeroSlide((heroIndex + 1) % heroSlides.length);
      }, 5000);
    }
  }

  function stopHeroAutoplay() {
    if (heroTimer) { clearInterval(heroTimer); heroTimer = null; }
  }

  /* ─────────────────────────────────────────
     GENRE CHIPS
  ───────────────────────────────────────── */
  function renderGenreChips() {
    const el = document.getElementById('genre-chips');
    if (!el) return;

    // Collect unique genres from movies
    const movieGenres = new Set();
    movies.forEach(m => (m.genres || []).forEach(g => movieGenres.add(g)));

    const chips = [
      { label: 'Semua', href: 'search.html' },
      ...Array.from(movieGenres).slice(0, 12).map(g => ({
        label: g,
        href: `search.html?genre=${encodeURIComponent(g)}`,
      })),
    ];

    el.innerHTML = chips.map(({ label, href }) => `
      <a href="${href}" class="db-genre-chip">${esc(label)}</a>
    `).join('');
  }

  /* ─────────────────────────────────────────
     CONTINUE WATCHING
  ───────────────────────────────────────── */
  function renderContinueWatching() {
    if (!user) return;

    const section = document.getElementById('continue-section');
    const row     = document.getElementById('continue-row');
    if (!section || !row) return;

    const history = CineStorage.History.getAll(user.id);
    if (!history.length) return;

    // Get last 8 watched movies
    const watched = history
      .slice(0, 8)
      .map(h => ({
        movie: movies.find(m => m.id === h.movieId),
        progress: CineStorage.Progress.get(user.id, h.movieId),
        watchedAt: h.watchedAt,
      }))
      .filter(h => h.movie);

    if (!watched.length) return;

    section.style.display = 'block';

    row.innerHTML = watched.map(({ movie, progress }) => {
      const pct = progress ? Math.min(Math.round((progress.seconds / (movie.duration * 60)) * 100), 99) : 15;
      return `
        <a href="watch.html?id=${esc(movie.id)}" class="db-continue-card" style="text-decoration:none;">
          <div class="db-continue-card__thumb">
            <img src="${esc(movie.backdropUrl || movie.posterUrl || '')}"
                 alt="${esc(movie.title)}"
                 loading="lazy"
                 onerror="this.parentElement.style.background='var(--color-bg-tertiary)';this.style.display='none'" />
            <div class="db-continue-card__thumb-overlay">
              <div class="db-continue-card__play-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </div>
            </div>
          </div>
          <div class="db-continue-card__info">
            <div class="db-continue-card__title">${esc(movie.title)}</div>
            <div class="db-continue-card__episode">${pct}% ditonton</div>
            <div class="db-continue-card__progress">
              <div class="db-continue-card__progress-bar" style="width:${pct}%"></div>
            </div>
          </div>
        </a>
      `;
    }).join('');

    // Clear history button
    document.getElementById('clear-history-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Hapus semua riwayat tontonan?')) {
        CineStorage.History.clear(user.id);
        section.style.display = 'none';
        if (window.Toast) Toast.info('Riwayat tontonan dihapus.');
      }
    });
  }

  /* ─────────────────────────────────────────
     TRENDING
  ───────────────────────────────────────── */
  function renderTrending() {
    const row = document.getElementById('trending-row');
    if (!row) return;

    const trending = movies.filter(m => m.trending).slice(0, 10);
    row.innerHTML = trending.map(m => buildMovieCard(m)).join('');
    bindWatchlistButtons(row);
  }

  /* ─────────────────────────────────────────
     TOP 10
  ───────────────────────────────────────── */
  function renderTop10() {
    const row = document.getElementById('top10-row');
    if (!row) return;

    const top10 = [...movies]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10);

    row.innerHTML = top10.map((m, i) => `
      <a href="movie-detail.html?id=${esc(m.id)}" class="db-top10-card" style="text-decoration:none;">
        <div class="db-top10-card__number">${i + 1}</div>
        <div class="db-top10-card__poster">
          <img src="${esc(m.posterUrl || '')}"
               alt="${esc(m.title)}"
               loading="lazy"
               onerror="this.parentElement.style.background='var(--color-bg-tertiary)';this.style.display='none'" />
        </div>
      </a>
    `).join('');
  }

  /* ─────────────────────────────────────────
     INDONESIA FILMS
  ───────────────────────────────────────── */
  function renderIndonesiaFilms() {
    const row = document.getElementById('indonesia-row');
    if (!row) return;

    const idMovies = movies.filter(m => m.country === 'Indonesia').slice(0, 10);
    if (!idMovies.length) {
      row.closest('section')?.remove();
      return;
    }
    row.innerHTML = idMovies.map(m => buildMovieCard(m)).join('');
    bindWatchlistButtons(row);
  }

  /* ─────────────────────────────────────────
     ANIMATION FILMS
  ───────────────────────────────────────── */
  function renderAnimationFilms() {
    const row = document.getElementById('animation-row');
    if (!row) return;

    const animMovies = movies
      .filter(m => (m.genres || []).some(g => ['Animasi', 'Musikal', 'Keluarga'].includes(g)))
      .slice(0, 10);

    if (!animMovies.length) {
      row.closest('section')?.remove();
      return;
    }
    row.innerHTML = animMovies.map(m => buildMovieCard(m)).join('');
    bindWatchlistButtons(row);
  }

  /* ─────────────────────────────────────────
     ALL MOVIES GRID (with load more)
  ───────────────────────────────────────── */
  function renderAllMovies() {
    const grid   = document.getElementById('all-movies-grid');
    const loadBtn = document.getElementById('load-more-btn');
    if (!grid) return;

    const renderPage = () => {
      const start = (allMoviesPage - 1) * PER_PAGE;
      const slice = movies.slice(start, start + PER_PAGE);

      slice.forEach(m => {
        const card = document.createElement('div');
        card.innerHTML = buildMovieCardGrid(m);
        grid.appendChild(card.firstElementChild);
      });

      bindWatchlistButtons(grid);

      if (movies.length > allMoviesPage * PER_PAGE) {
        if (loadBtn) loadBtn.style.display = 'inline-flex';
      } else {
        if (loadBtn) loadBtn.style.display = 'none';
      }
    };

    renderPage();

    loadBtn?.addEventListener('click', () => {
      allMoviesPage++;
      renderPage();
    });
  }

  /* ─────────────────────────────────────────
     REKOMENDASI BERDASARKAN PREFERENSI GENRE
  ───────────────────────────────────────── */
  function renderRecommended() {
    if (!user) return;

    const section  = document.getElementById('recommended-section');
    const row      = document.getElementById('recommended-row');
    const hintEl   = document.getElementById('recommended-hint');
    if (!section || !row) return;

    // 1. Collect preferred genres: from settings > history genres > watchlist genres
    let preferredGenres = [];
    const settings = window.CineStorage ? CineStorage.Settings.get(user.id) : {};
    if (settings.preferredGenres && settings.preferredGenres.length) {
      preferredGenres = settings.preferredGenres;
    } else {
      // Derive from history
      const history = CineStorage.History.getAll(user.id);
      const genreCount = {};
      history.slice(0, 30).forEach(h => {
        const m = movies.find(mv => mv.id === h.movieId);
        (m?.genres || []).forEach(g => {
          genreCount[g] = (genreCount[g] || 0) + 1;
        });
      });
      // Derive from watchlist
      const watchlistIds = CineStorage.Watchlist.getAll(user.id);
      watchlistIds.forEach(id => {
        const m = movies.find(mv => mv.id === id);
        (m?.genres || []).forEach(g => {
          genreCount[g] = (genreCount[g] || 0) + 0.5;
        });
      });
      preferredGenres = Object.entries(genreCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([g]) => g);
    }

    if (!preferredGenres.length) return;

    // 2. Exclude films already in watchlist/history
    const excludeIds = new Set([
      ...CineStorage.Watchlist.getAll(user.id),
      ...CineStorage.History.getAll(user.id).map(h => h.movieId),
    ]);

    // 3. Score films by genre match
    const scored = movies
      .filter(m => !excludeIds.has(m.id))
      .map(m => {
        const matchCount = (m.genres || []).filter(g => preferredGenres.includes(g)).length;
        return { movie: m, score: matchCount * 10 + m.rating };
      })
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(s => s.movie);

    if (!scored.length) return;

    section.style.display = 'block';
    if (hintEl) {
      hintEl.textContent = `Berdasarkan genre favoritmu: ${preferredGenres.slice(0,3).join(', ')}`;
    }

    row.innerHTML = scored.map(m => buildMovieCard(m)).join('');
    bindWatchlistButtons(row);
  }

  /* ─────────────────────────────────────────
     MOVIE CARD BUILDERS
  ───────────────────────────────────────── */
  function buildMovieCard(movie) {
    const inWatchlist = user ? CineStorage.Watchlist.has(user.id, movie.id) : false;
    return `
      <div class="db-movie-card" data-id="${esc(movie.id)}">
        <a href="movie-detail.html?id=${esc(movie.id)}" style="text-decoration:none;">
          <div class="db-movie-card__poster">
            <img src="${esc(movie.posterUrl || '')}"
                 alt="${esc(movie.title)}"
                 loading="lazy"
                 onerror="this.src='../assets/images/poster-placeholder.svg'" />
            <div class="db-movie-card__overlay">
              <div class="db-movie-card__play">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </div>
            </div>
            <div class="db-movie-card__rating">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              ${movie.rating}
            </div>
            ${user ? `
            <button class="db-movie-card__watchlist${inWatchlist ? ' saved' : ''}"
                    data-id="${esc(movie.id)}"
                    aria-label="${inWatchlist ? 'Hapus dari watchlist' : 'Tambah ke watchlist'}"
                    title="${inWatchlist ? 'Hapus dari Watchlist' : 'Tambah ke Watchlist'}">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="${inWatchlist ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>` : ''}
          </div>
        </a>
        <div class="db-movie-card__title" title="${esc(movie.title)}">${esc(movie.title)}</div>
        <div class="db-movie-card__year">${movie.year}</div>
      </div>
    `;
  }

  function buildMovieCardGrid(movie) {
    // Use existing .movie-card class from components.css for the grid layout
    const inWatchlist = user ? CineStorage.Watchlist.has(user.id, movie.id) : false;
    return `
      <div class="movie-card" data-id="${esc(movie.id)}">
        <a href="movie-detail.html?id=${esc(movie.id)}" class="movie-card__link" style="text-decoration:none;">
          <div class="movie-card__poster">
            <img src="${esc(movie.posterUrl || '')}"
                 alt="${esc(movie.title)}"
                 loading="lazy"
                 onerror="this.src='../assets/images/poster-placeholder.svg'"
                 class="movie-card__img" />
            <div class="movie-card__overlay">
              <div class="movie-card__rating">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--color-gold)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                ${movie.rating}
              </div>
              ${user ? `
              <button class="movie-card__watchlist-btn${inWatchlist ? ' saved' : ''}"
                      data-id="${esc(movie.id)}"
                      aria-label="Watchlist">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="${inWatchlist ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>` : ''}
            </div>
          </div>
          <div class="movie-card__info">
            <h3 class="movie-card__title">${esc(movie.title)}</h3>
            <div class="movie-card__meta">
              <span>${movie.year}</span>
              <span>·</span>
              <span>${(movie.genres || [])[0] || ''}</span>
            </div>
          </div>
        </a>
      </div>
    `;
  }

  /* ─────────────────────────────────────────
     WATCHLIST BUTTON EVENTS
  ───────────────────────────────────────── */
  function bindWatchlistButtons(container) {
    if (!user) return;

    container.querySelectorAll('[data-id]').forEach(btn => {
      if (!btn.classList.contains('db-movie-card__watchlist') &&
          !btn.classList.contains('movie-card__watchlist-btn')) return;

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const movieId = btn.dataset.id;
        const added = CineStorage.Watchlist.toggle(user.id, movieId);
        const svgPath = btn.querySelector('path');

        btn.classList.toggle('saved', added);
        if (svgPath) svgPath.setAttribute('fill', added ? 'currentColor' : 'none');

        // Heartbeat animation
        if (added && window.CineTransitions) {
          CineTransitions.heartbeat(btn);
        }

        if (window.Toast) {
          added
            ? Toast.success('Ditambahkan ke Watchlist! ❤️')
            : Toast.info('Dihapus dari Watchlist');
        }
      });
    });
  }

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
