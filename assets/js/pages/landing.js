/**
 * CineVerse — landing.js
 * Landing page interactions: trending movies, genres, particles, scroll effects
 */

(function () {
  'use strict';

  /* ─── DOM REFS ─── */
  const loader       = document.getElementById('page-loader');
  const trendingRow  = document.getElementById('trending-row');
  const genresGrid   = document.getElementById('genres-grid');
  const heroPosters  = document.getElementById('hero-posters');
  const particlesCtn = document.getElementById('particles');

  /* ─── DATA ─── */
  let movies = [];
  let genres = [];

  /* ─────────────────────────────────────────
     INIT
  ───────────────────────────────────────── */
  async function init() {
    // Apply saved theme
    if (window.CineStorage) {
      CineStorage.Theme.apply();
    }

    // Load data
    await Promise.all([loadMovies(), loadGenres()]);

    // Render sections
    renderHeroPosters();
    renderTrending();
    renderGenres();

    // Init particles
    createParticles();

    // Init scroll effects
    initScrollEffects();

    // Hide loader
    setTimeout(() => {
      loader?.classList.add('loaded');
    }, 600);
  }

  /* ─────────────────────────────────────────
     DATA LOADING
  ───────────────────────────────────────── */
  async function loadMovies() {
    try {
      const res = await fetch('data/movies.json');
      const data = await res.json();
      movies = data.movies || [];
    } catch (e) {
      console.warn('[Landing] Could not load movies:', e);
      movies = [];
    }
  }

  async function loadGenres() {
    try {
      const res = await fetch('data/genres.json');
      const data = await res.json();
      genres = data.genres || [];
    } catch (e) {
      genres = [];
    }
  }

  /* ─────────────────────────────────────────
     RENDER: HERO POSTERS
  ───────────────────────────────────────── */
  function renderHeroPosters() {
    if (!heroPosters || !movies.length) return;

    // Pick featured / trending movies for posters
    const picks = movies
      .filter(m => m.posterUrl)
      .slice(0, 7);

    heroPosters.innerHTML = `<div class="poster-glow"></div>`;

    picks.slice(0, 6).forEach((movie, i) => {
      const div = document.createElement('div');
      div.className = 'poster-float';
      div.style.animationDelay = `${i * 0.3}s`;
      div.innerHTML = `
        <img src="${movie.posterUrl}" 
             alt="${escapeHtml(movie.title)}" 
             loading="lazy"
             onerror="this.parentElement.style.display='none'" />
      `;
      heroPosters.appendChild(div);
    });
  }

  /* ─────────────────────────────────────────
     RENDER: TRENDING ROW
  ───────────────────────────────────────── */
  function renderTrending() {
    if (!trendingRow) return;

    const trending = movies.filter(m => m.trending).slice(0, 10);

    if (!trending.length) {
      trendingRow.innerHTML = '<p style="color: var(--color-text-muted); padding: 1rem;">Tidak ada data trending.</p>';
      return;
    }

    trendingRow.innerHTML = trending.map(m => renderMovieCard(m)).join('');

    // Add wishlist toggle
    trendingRow.querySelectorAll('.movie-card__wishlist').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const movieId = btn.closest('[data-movie-id]')?.dataset.movieId;
        if (!movieId) return;

        const user = window.CineStorage?.User?.getCurrent();
        if (!user) {
          if (window.Toast) Toast.info('Masuk dulu untuk menyimpan watchlist!');
          else window.location.href = 'pages/auth/login.html';
          return;
        }

        const added = CineStorage.Watchlist.toggle(user.id, movieId);
        btn.classList.toggle('active', added);
        const icon = btn.querySelector('svg');
        if (icon) icon.setAttribute('fill', added ? 'currentColor' : 'none');
        if (window.Toast) Toast[added ? 'success' : 'info'](
          added ? 'Ditambahkan ke watchlist' : 'Dihapus dari watchlist'
        );
      });
    });
  }

  /* ─────────────────────────────────────────
     RENDER: GENRES GRID
  ───────────────────────────────────────── */
  function renderGenres() {
    if (!genresGrid || !genres.length) return;

    genresGrid.innerHTML = genres.map(g => `
      <a href="pages/genre.html?id=${g.id}" class="genre-chip" 
         aria-label="${g.name} (${g.count} film)"
         style="--genre-color: ${g.color}">
        <span class="genre-chip__icon" role="img" aria-label="${g.name}">${g.icon}</span>
        <span class="genre-chip__name">${g.name}</span>
      </a>
    `).join('');
  }

  /* ─────────────────────────────────────────
     RENDER: MOVIE CARD
  ───────────────────────────────────────── */
  function renderMovieCard(movie) {
    const rating = movie.rating?.toFixed(1) || '—';
    const genres = (movie.genres || []).slice(0, 2).join(', ');

    return `
      <article class="movie-card" 
               data-movie-id="${movie.id}"
               onclick="window.location.href='pages/movie-detail.html?id=${movie.id}'"
               tabindex="0"
               role="button"
               aria-label="${escapeHtml(movie.title)} (${movie.year})">
        <div class="movie-card__poster">
          <img src="${movie.posterUrl}" 
               alt="${escapeHtml(movie.title)}"
               loading="lazy"
               onerror="this.src='assets/images/poster-placeholder.svg'" />
          <div class="movie-card__overlay" aria-hidden="true">
            <div class="movie-card__play-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </div>
          </div>
          ${movie.trending ? `<div class="movie-card__badge"><span class="badge badge--crimson">Trending</span></div>` : ''}
          <button class="movie-card__wishlist" aria-label="Tambah ke watchlist" title="Tambah ke watchlist">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>
        <div class="movie-card__info">
          <h3 class="movie-card__title">${escapeHtml(movie.title)}</h3>
          <div class="movie-card__meta">
            <div class="movie-card__rating">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              ${rating}
            </div>
            <span>•</span>
            <span>${movie.year}</span>
          </div>
        </div>
      </article>
    `;
  }

  /* ─────────────────────────────────────────
     PARTICLES
  ───────────────────────────────────────── */
  function createParticles() {
    if (!particlesCtn) return;

    const count = 25;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.bottom = '-10px';
      p.style.width = (Math.random() * 3 + 1) + 'px';
      p.style.height = p.style.width;
      p.style.animationDuration = (Math.random() * 15 + 10) + 's';
      p.style.animationDelay = (Math.random() * 10) + 's';
      p.style.opacity = (Math.random() * 0.6 + 0.2).toFixed(2);
      particlesCtn.appendChild(p);
    }
  }

  /* ─────────────────────────────────────────
     SCROLL EFFECTS
  ───────────────────────────────────────── */
  function initScrollEffects() {
    // Navbar scroll glass
    const navbar = document.getElementById('navbar');
    const onScroll = Helpers?.throttle
      ? Helpers.throttle(() => {
          if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 60);
        }, 100)
      : () => {
          if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 60);
        };

    window.addEventListener('scroll', onScroll, { passive: true });

    // Intersection Observer for reveal classes
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
      );

      document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
        observer.observe(el);
      });
    } else {
      // Fallback: show all
      document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
        el.classList.add('visible');
      });
    }
  }

  /* ─────────────────────────────────────────
     NAVBAR HAMBURGER
  ───────────────────────────────────────── */
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileMenu   = document.getElementById('mobile-menu');

  hamburgerBtn?.addEventListener('click', () => {
    const isOpen = mobileMenu?.classList.toggle('open');
    hamburgerBtn.classList.toggle('open', isOpen);
    hamburgerBtn.setAttribute('aria-expanded', isOpen);
  });

  // Close mobile menu on outside click
  document.addEventListener('click', (e) => {
    if (!hamburgerBtn?.contains(e.target) && !mobileMenu?.contains(e.target)) {
      mobileMenu?.classList.remove('open');
      hamburgerBtn?.classList.remove('open');
    }
  });

  /* ─────────────────────────────────────────
     KEYBOARD NAVIGATION (movie cards)
  ───────────────────────────────────────── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target?.classList.contains('movie-card')) {
      e.target.click();
    }
  });

  /* ─────────────────────────────────────────
     UTILITY
  ───────────────────────────────────────── */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ─── START ─── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
