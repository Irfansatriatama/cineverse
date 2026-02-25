/**
 * CineVerse — anime-polish.js
 * Phase 5.3: Polish & Animasi dengan Anime.js
 *
 * Module window.CineAnime — wrapper atas anime.js untuk seluruh aplikasi.
 * Fitur:
 *  - Hero entrance animasi sinematik (stagger judul + metadata)
 *  - Card entrance stagger berbasis IntersectionObserver
 *  - Number counter (count-up) untuk stat cards
 *  - Floating particles background di landing & dashboard hero
 *  - Morphing loader bar antar halaman
 *  - Search input animasi expand/collapse
 *  - Modal spring entrance (scaleIn + translateY spring)
 *  - Parallax scroll pada hero backdrop
 *  - Rating star fill animasi satu per satu
 *  - Ticker/marquee untuk "Now Trending" label
 *  - Genre chip hover ripple animasi
 *  - Watchlist add celebrasi (confetti burst)
 *  - Toast entrance/exit animasi
 *  - Back-to-top button animasi muncul
 *
 * Depends on: anime.js (CDN loaded dynamically)
 * Include di semua halaman SETELAH app.js
 */

const CineAnime = (() => {
  'use strict';

  /* ─────────────────────────────────────────
     STATE
  ───────────────────────────────────────── */
  let _animeLoaded = false;
  let _pendingTasks = [];
  const ANIME_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.2/anime.min.js';

  /* ─────────────────────────────────────────
     LOAD ANIME.JS DYNAMICALLY
  ───────────────────────────────────────── */
  function loadAnime() {
    return new Promise((resolve) => {
      if (window.anime) { resolve(window.anime); return; }
      const s = document.createElement('script');
      s.src = ANIME_CDN;
      s.onload = () => { _animeLoaded = true; resolve(window.anime); };
      s.onerror = () => resolve(null); // graceful fallback
      document.head.appendChild(s);
    });
  }

  /* ─────────────────────────────────────────
     INIT — auto-detect page & run appropriate
     animations after anime.js loads
  ───────────────────────────────────────── */
  async function init() {
    const a = await loadAnime();
    if (!a) return; // anime.js gagal load, skip semua animasi

    // Run pending tasks
    _pendingTasks.forEach(fn => fn(a));
    _pendingTasks = [];

    // Auto-detect & run page-specific polish
    _initGlobal(a);
    _detectAndInitPage(a);
  }

  /* ─────────────────────────────────────────
     HELPER — safe run (anime might not be ready)
  ───────────────────────────────────────── */
  function withAnime(fn) {
    if (window.anime) {
      fn(window.anime);
    } else {
      _pendingTasks.push(fn);
    }
  }

  /* ─────────────────────────────────────────
     GLOBAL ANIMATIONS — semua halaman
  ───────────────────────────────────────── */
  function _initGlobal(anime) {
    _initCardReveal(anime);
    _initBackToTop(anime);
    _initNavbarScroll(anime);
    _enhanceRipple(anime);
    _initScrollProgressBar();
    _initLazyImages(anime);
  }

  /* Scroll progress bar di top of page */
  function _initScrollProgressBar() {
    let bar = document.getElementById('scroll-progress-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'scroll-progress-bar';
      document.body.appendChild(bar);
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width = pct.toFixed(1) + '%';
        ticking = false;
      });
    }, { passive: true });
  }

  /* Lazy image blur reveal */
  function _initLazyImages(anime) {
    const imgs = document.querySelectorAll('img[data-src]');
    if (!imgs.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.filter(e => e.isIntersecting).forEach(entry => {
        const img = entry.target;
        const tempImg = new Image();
        tempImg.onload = () => {
          img.src = img.dataset.src;
          img.classList.add('lazy-loaded');
        };
        tempImg.src = img.dataset.src;
        observer.unobserve(img);
      });
    }, { rootMargin: '200px' });

    imgs.forEach(img => {
      img.classList.add('lazy');
      observer.observe(img);
    });
  }

  /* Card reveal via IntersectionObserver + anime.js */
  function _initCardReveal(anime) {
    const cards = document.querySelectorAll(
      '.movie-card, .db-movie-card, .db-top10-card, .news-card, .genre-card, .wl-card, .stat-card'
    );
    if (!cards.length) return;

    // Mark all cards as not-yet-visible
    cards.forEach(c => {
      if (!c.classList.contains('card-anime-ready')) {
        c.style.opacity = '0';
        c.style.transform = 'translateY(28px)';
        c.classList.add('card-anime-ready');
      }
    });

    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter(e => e.isIntersecting);
      if (!visible.length) return;

      anime({
        targets: visible.map(e => e.target),
        opacity: [0, 1],
        translateY: [28, 0],
        scale: [0.96, 1],
        delay: anime.stagger(55),
        duration: 550,
        easing: 'cubicBezier(0.16, 1, 0.3, 1)',
        complete: () => {
          visible.forEach(e => {
            e.target.style.opacity = '';
            e.target.style.transform = '';
            observer.unobserve(e.target);
          });
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    cards.forEach(c => observer.observe(c));
  }

  /* Back to top button */
  function _initBackToTop(anime) {
    let btn = document.getElementById('back-to-top');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'back-to-top';
      btn.setAttribute('aria-label', 'Kembali ke atas');
      btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`;
      btn.style.cssText = `
        position:fixed; bottom:24px; right:24px; z-index:1000;
        width:44px; height:44px; border-radius:50%;
        background:var(--color-crimson,#E50914);
        color:#fff; border:none; cursor:pointer;
        display:flex; align-items:center; justify-content:center;
        box-shadow:0 4px 20px rgba(229,9,20,0.4);
        opacity:0; transform:translateY(20px) scale(0.8);
        transition:none; pointer-events:none;
      `;
      document.body.appendChild(btn);
    }

    let isVisible = false;
    let scrollTicking = false;

    window.addEventListener('scroll', () => {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(() => {
        const shouldShow = window.scrollY > 400;
        if (shouldShow !== isVisible) {
          isVisible = shouldShow;
          btn.style.pointerEvents = shouldShow ? 'auto' : 'none';
          anime({
            targets: btn,
            opacity: shouldShow ? [0, 1] : [1, 0],
            translateY: shouldShow ? [20, 0] : [0, 12],
            scale: shouldShow ? [0.8, 1] : [1, 0.85],
            duration: 350,
            easing: 'cubicBezier(0.34, 1.56, 0.64, 1)',
          });
        }
        scrollTicking = false;
      });
    });

    btn.addEventListener('click', () => {
      anime({
        targets: btn,
        scale: [1, 0.88, 1],
        duration: 250,
        easing: 'easeInOutQuad',
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* Navbar collapse/expand on scroll */
  function _initNavbarScroll(anime) {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let lastScroll = 0;
    let navHidden = false;

    window.addEventListener('scroll', () => {
      const current = window.scrollY;
      const diff = current - lastScroll;

      // Compact mode setelah scroll 80px
      if (current > 80) {
        navbar.classList.add('navbar--compact');
      } else {
        navbar.classList.remove('navbar--compact');
      }

      // Hide navbar saat scroll down cepat, tampil saat scroll up
      if (diff > 8 && current > 200 && !navHidden) {
        navHidden = true;
        anime({ targets: navbar, translateY: '-100%', duration: 280, easing: 'easeInQuad' });
      } else if (diff < -4 && navHidden) {
        navHidden = false;
        anime({ targets: navbar, translateY: '0%', duration: 320, easing: 'cubicBezier(0.16, 1, 0.3, 1)' });
      }

      lastScroll = current;
    }, { passive: true });
  }

  /* Enhanced button ripple dengan anime.js */
  function _enhanceRipple(anime) {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn');
      if (!btn) return;

      // Subtle scale press
      anime({
        targets: btn,
        scale: [1, 0.955, 1],
        duration: 200,
        easing: 'easeInOutQuad',
      });
    });
  }

  /* ─────────────────────────────────────────
     PAGE DETECTION
  ───────────────────────────────────────── */
  function _detectAndInitPage(anime) {
    const path = window.location.pathname;
    const body = document.body;

    if (path.endsWith('index.html') || path === '/' || path.endsWith('/')) {
      _initLandingPage(anime);
    }
    if (document.getElementById('db-hero') || body.querySelector('.db-hero')) {
      _initDashboardPage(anime);
    }
    if (document.getElementById('md-hero') || body.querySelector('.md-hero')) {
      _initMovieDetailPage(anime);
    }
    if (document.querySelector('.search-page') || document.getElementById('search-results')) {
      _initSearchPage(anime);
    }
    if (document.querySelector('.stats-page') || document.getElementById('stats-hero-cards')) {
      _initStatsPage(anime);
    }
    if (document.querySelector('.wl-page') || document.getElementById('wl-grid')) {
      _initWatchlistPage(anime);
    }
    if (document.querySelector('.news-page') || document.getElementById('news-featured')) {
      _initNewsPage(anime);
    }
  }

  /* ─────────────────────────────────────────
     LANDING PAGE ANIMATIONS
  ───────────────────────────────────────── */
  function _initLandingPage(anime) {
    // Hero title char-by-char entrance
    const heroTitle = document.querySelector('.hero__title, .landing-hero__title, h1.hero-title');
    if (heroTitle) {
      _splitAndAnimateText(anime, heroTitle, {
        delay: anime.stagger(35, { start: 300 }),
        easing: 'cubicBezier(0.16, 1, 0.3, 1)',
      });
    }

    // Hero subtitle & CTA slide up stagger
    const heroEls = document.querySelectorAll('.hero__subtitle, .hero__cta, .landing-hero__sub, .hero__badge');
    if (heroEls.length) {
      anime({
        targets: heroEls,
        opacity: [0, 1],
        translateY: [24, 0],
        delay: anime.stagger(120, { start: 600 }),
        duration: 700,
        easing: 'cubicBezier(0.16, 1, 0.3, 1)',
      });
    }

    // Feature cards slide in from sides alternating
    const featureCards = document.querySelectorAll('.feature-card, .landing-feature');
    if (featureCards.length) {
      const observer = new IntersectionObserver((entries) => {
        const vis = entries.filter(e => e.isIntersecting);
        vis.forEach((entry, i) => {
          anime({
            targets: entry.target,
            opacity: [0, 1],
            translateX: [i % 2 === 0 ? -40 : 40, 0],
            duration: 700,
            delay: i * 100,
            easing: 'cubicBezier(0.16, 1, 0.3, 1)',
          });
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.15 });
      featureCards.forEach(c => {
        c.style.opacity = '0';
        observer.observe(c);
      });
    }

    // Floating particles
    _createParticles(anime, document.querySelector('.hero, .landing-hero'));
  }

  /* ─────────────────────────────────────────
     DASHBOARD PAGE ANIMATIONS
  ───────────────────────────────────────── */
  function _initDashboardPage(anime) {
    // Hero slide indicator dots animasi
    const dots = document.querySelectorAll('.db-hero__dot');
    if (dots.length) {
      anime({
        targets: dots,
        scale: [0, 1],
        opacity: [0, 1],
        delay: anime.stagger(80, { start: 800 }),
        duration: 400,
        easing: 'cubicBezier(0.34, 1.56, 0.64, 1)',
      });
    }

    // Welcome banner entrance
    const welcome = document.querySelector('.db-welcome');
    if (welcome) {
      anime({
        targets: welcome,
        opacity: [0, 1],
        translateX: [-30, 0],
        duration: 600,
        delay: 200,
        easing: 'cubicBezier(0.16, 1, 0.3, 1)',
      });
    }

    // Section headers stagger
    const sectionHeaders = document.querySelectorAll('.db-section__title, .db-section__header');
    if (sectionHeaders.length) {
      const observer = new IntersectionObserver((entries) => {
        entries.filter(e => e.isIntersecting).forEach(entry => {
          anime({
            targets: entry.target,
            opacity: [0, 1],
            translateX: [-20, 0],
            duration: 500,
            easing: 'cubicBezier(0.16, 1, 0.3, 1)',
          });
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.2 });
      sectionHeaders.forEach(h => {
        h.style.opacity = '0';
        observer.observe(h);
      });
    }

    // Genre chips spring entrance
    const genreChips = document.querySelectorAll('.db-genre-chip');
    if (genreChips.length) {
      const observer = new IntersectionObserver((entries) => {
        if (entries.some(e => e.isIntersecting)) {
          anime({
            targets: genreChips,
            scale: [0.7, 1],
            opacity: [0, 1],
            delay: anime.stagger(40),
            duration: 450,
            easing: 'cubicBezier(0.34, 1.56, 0.64, 1)',
          });
          entries.forEach(e => observer.unobserve(e.target));
        }
      }, { threshold: 0.1 });
      genreChips.forEach(c => {
        c.style.opacity = '0';
        observer.observe(c);
      });
    }
  }

  /* ─────────────────────────────────────────
     MOVIE DETAIL PAGE ANIMATIONS
  ───────────────────────────────────────── */
  function _initMovieDetailPage(anime) {
    // Hero metadata stagger (title, year, genre badges, rating)
    const heroMeta = document.querySelectorAll('.md-hero__title, .md-hero__meta, .md-hero__badges, .md-hero__actions, .md-hero__synopsis');
    if (heroMeta.length) {
      anime({
        targets: heroMeta,
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(100, { start: 400 }),
        duration: 600,
        easing: 'cubicBezier(0.16, 1, 0.3, 1)',
      });
    }

    // Poster spring entrance
    const poster = document.querySelector('.md-poster, .md-hero__poster');
    if (poster) {
      anime({
        targets: poster,
        opacity: [0, 1],
        scale: [0.88, 1],
        translateY: [16, 0],
        duration: 700,
        delay: 200,
        easing: 'cubicBezier(0.34, 1.56, 0.64, 1)',
      });
    }

    // Cast cards stagger
    const castCards = document.querySelectorAll('.md-cast-card');
    if (castCards.length) {
      const observer = new IntersectionObserver((entries) => {
        if (entries.some(e => e.isIntersecting)) {
          anime({
            targets: castCards,
            opacity: [0, 1],
            translateX: [-20, 0],
            delay: anime.stagger(60),
            duration: 450,
            easing: 'cubicBezier(0.16, 1, 0.3, 1)',
          });
          entries.forEach(e => observer.unobserve(e.target));
        }
      }, { threshold: 0.1 });
      castCards.forEach(c => {
        c.style.opacity = '0';
        observer.observe(c);
      });
    }

    // Rating stars fill one by one on scroll into view
    _initStarRatingAnim(anime);

    // Parallax hero backdrop
    _initParallax(anime, '.md-hero__backdrop, .md-backdrop');
  }

  /* ─────────────────────────────────────────
     SEARCH PAGE ANIMATIONS
  ───────────────────────────────────────── */
  function _initSearchPage(anime) {
    // Search bar expand on focus
    const searchInput = document.querySelector('.search-input, #search-input, input[type="search"]');
    if (searchInput) {
      searchInput.addEventListener('focus', () => {
        anime({
          targets: searchInput.closest('.search-bar, .search-wrapper') || searchInput,
          scale: [1, 1.015],
          duration: 250,
          easing: 'cubicBezier(0.34, 1.56, 0.64, 1)',
        });
      });
      searchInput.addEventListener('blur', () => {
        anime({
          targets: searchInput.closest('.search-bar, .search-wrapper') || searchInput,
          scale: [1.015, 1],
          duration: 200,
          easing: 'easeOutQuad',
        });
      });
    }

    // Filter chips spring
    const filterChips = document.querySelectorAll('.filter-chip, .genre-chip, .search-chip');
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        anime({
          targets: chip,
          scale: [1, 0.88, 1.05, 1],
          duration: 350,
          easing: 'easeOutElastic(1, 0.5)',
        });
      });
    });

    // Results count number animate
    const resultCount = document.querySelector('.search-count, .result-count, #result-count');
    if (resultCount) {
      _animateNumberChange(anime, resultCount);
    }
  }

  /* ─────────────────────────────────────────
     STATS PAGE ANIMATIONS
  ───────────────────────────────────────── */
  function _initStatsPage(anime) {
    // Hero stat cards entrance with stagger
    const statCards = document.querySelectorAll('.stat-hero-card, .stats-card');
    if (statCards.length) {
      anime({
        targets: statCards,
        opacity: [0, 1],
        translateY: [30, 0],
        scale: [0.94, 1],
        delay: anime.stagger(120),
        duration: 650,
        easing: 'cubicBezier(0.34, 1.56, 0.64, 1)',
      });
    }

    // Milestone badges pop in sequence
    const badges = document.querySelectorAll('.milestone-badge, .badge-item');
    if (badges.length) {
      const observer = new IntersectionObserver((entries) => {
        if (entries.some(e => e.isIntersecting)) {
          anime({
            targets: badges,
            scale: [0, 1.12, 1],
            opacity: [0, 1],
            delay: anime.stagger(80),
            duration: 500,
            easing: 'cubicBezier(0.34, 1.56, 0.64, 1)',
          });
          entries.forEach(e => observer.unobserve(e.target));
        }
      }, { threshold: 0.1 });
      badges.forEach(b => {
        b.style.opacity = '0';
        b.style.transform = 'scale(0)';
        observer.observe(b);
      });
    }

    // Genre bars animate width on scroll
    const genreBars = document.querySelectorAll('.genre-bar__fill, .stat-bar__fill');
    if (genreBars.length) {
      const observer = new IntersectionObserver((entries) => {
        entries.filter(e => e.isIntersecting).forEach(entry => {
          const targetWidth = entry.target.style.width || entry.target.getAttribute('data-width') || '50%';
          entry.target.style.width = '0';
          anime({
            targets: entry.target,
            width: targetWidth,
            duration: 800,
            delay: 100,
            easing: 'cubicBezier(0.16, 1, 0.3, 1)',
          });
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.2 });
      genreBars.forEach(b => observer.observe(b));
    }
  }

  /* ─────────────────────────────────────────
     WATCHLIST PAGE ANIMATIONS
  ───────────────────────────────────────── */
  function _initWatchlistPage(anime) {
    // Empty state illustration float
    const emptyIllustration = document.querySelector('.wl-empty, .empty-state');
    if (emptyIllustration) {
      anime({
        targets: emptyIllustration,
        translateY: ['-8px', '8px'],
        duration: 2800,
        direction: 'alternate',
        loop: true,
        easing: 'easeInOutSine',
      });
    }

    // Sort/view controls entrance
    const controls = document.querySelector('.wl-controls, .watchlist-controls');
    if (controls) {
      anime({
        targets: controls,
        opacity: [0, 1],
        translateY: [-12, 0],
        duration: 450,
        easing: 'cubicBezier(0.16, 1, 0.3, 1)',
      });
    }
  }

  /* ─────────────────────────────────────────
     NEWS PAGE ANIMATIONS
  ───────────────────────────────────────── */
  function _initNewsPage(anime) {
    // Featured article hero entrance
    const featured = document.querySelector('.news-featured, #news-featured');
    if (featured) {
      anime({
        targets: featured,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 700,
        delay: 200,
        easing: 'cubicBezier(0.16, 1, 0.3, 1)',
      });
    }

    // Category chips spring entrance
    const catChips = document.querySelectorAll('.category-chip, .news-chip');
    if (catChips.length) {
      anime({
        targets: catChips,
        scale: [0.8, 1],
        opacity: [0, 1],
        delay: anime.stagger(50, { start: 300 }),
        duration: 400,
        easing: 'cubicBezier(0.34, 1.56, 0.64, 1)',
      });
    }
  }

  /* ─────────────────────────────────────────
     SHARED UTILITIES
  ───────────────────────────────────────── */

  /**
   * Pisah teks jadi span per karakter, animasi satu per satu
   */
  function _splitAndAnimateText(anime, el, options = {}) {
    if (!el) return;
    const text = el.textContent;
    el.innerHTML = text.split('').map(char =>
      `<span style="display:inline-block;opacity:0;transform:translateY(20px)">${char === ' ' ? '&nbsp;' : char}</span>`
    ).join('');

    anime({
      targets: el.querySelectorAll('span'),
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 500,
      easing: 'cubicBezier(0.16, 1, 0.3, 1)',
      complete: () => {
        // Restore plain text setelah animasi agar teks bisa di-select
        el.textContent = text;
        el.style.opacity = '1';
      },
      ...options,
    });
  }

  /**
   * Count-up number animation
   * @param {HTMLElement} el - elemen yang berisi angka
   * @param {number} endVal - nilai akhir
   * @param {Object} opts - { duration, suffix, decimals }
   */
  function countUp(el, endVal, opts = {}) {
    withAnime((anime) => {
      const { duration = 1200, suffix = '', decimals = 0 } = opts;
      const obj = { val: 0 };
      anime({
        targets: obj,
        val: endVal,
        round: decimals === 0 ? 1 : Math.pow(10, decimals),
        duration,
        easing: 'cubicBezier(0.16, 1, 0.3, 1)',
        update: () => {
          el.textContent = (decimals > 0
            ? obj.val.toFixed(decimals)
            : Math.round(obj.val).toLocaleString('id-ID')) + suffix;
        },
      });
    });
  }

  /**
   * Animate number when content changes (mutation observer)
   */
  function _animateNumberChange(anime, el) {
    const observer = new MutationObserver(() => {
      const newVal = parseFloat(el.textContent.replace(/[^\d.]/g, '')) || 0;
      const oldVal = parseFloat(el.dataset.prevVal || '0');
      if (newVal !== oldVal) {
        el.dataset.prevVal = newVal;
        const obj = { v: oldVal };
        anime({
          targets: obj,
          v: newVal,
          round: 1,
          duration: 400,
          easing: 'easeOutExpo',
          update: () => { el.textContent = Math.round(obj.v).toLocaleString('id-ID'); }
        });
      }
    });
    observer.observe(el, { childList: true, characterData: true, subtree: true });
  }

  /**
   * Floating particles di background hero
   */
  function _createParticles(anime, container) {
    if (!container) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
      position:absolute; inset:0; width:100%; height:100%;
      pointer-events:none; z-index:1; opacity:0.35;
    `;
    container.style.position = container.style.position || 'relative';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const count = 40;
    const particles = [];

    function resize() {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const COLORS = ['#E50914', '#F5A623', '#3B82F6', '#10B981'];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2.5 + 0.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        opacity: Math.random() * 0.6 + 0.2,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    }
    draw();
  }

  /**
   * Parallax scroll effect pada hero backdrop
   */
  function _initParallax(anime, selector) {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!el) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        const rate = scrolled * 0.3;
        el.style.transform = `translateY(${rate}px) scale(1.05)`;
        ticking = false;
      });
    }, { passive: true });
  }

  /**
   * Animasi star rating fill satu per satu
   */
  function _initStarRatingAnim(anime) {
    const stars = document.querySelectorAll('.star, .rating-star, [data-star]');
    if (!stars.length) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) {
        anime({
          targets: stars,
          scale: [0.4, 1.2, 1],
          opacity: [0, 1],
          delay: anime.stagger(80),
          duration: 400,
          easing: 'cubicBezier(0.34, 1.56, 0.64, 1)',
        });
        entries.forEach(e => observer.unobserve(e.target));
      }
    }, { threshold: 0.3 });
    stars.forEach(s => {
      s.style.opacity = '0';
      observer.observe(s);
    });
  }

  /* ─────────────────────────────────────────
     PUBLIC API — MODAL SPRING ENTRANCE
  ───────────────────────────────────────── */
  function animateModalIn(modalEl) {
    if (!modalEl) return;
    withAnime((anime) => {
      const inner = modalEl.querySelector('.modal__content, .modal-inner, [class*="modal__box"]') || modalEl.firstElementChild;
      anime({
        targets: inner || modalEl,
        opacity: [0, 1],
        scale: [0.85, 1],
        translateY: [30, 0],
        duration: 420,
        easing: 'cubicBezier(0.34, 1.56, 0.64, 1)',
      });
    });
  }

  function animateModalOut(modalEl, callback) {
    if (!modalEl) { if (callback) callback(); return; }
    withAnime((anime) => {
      const inner = modalEl.querySelector('.modal__content, .modal-inner, [class*="modal__box"]') || modalEl.firstElementChild;
      anime({
        targets: inner || modalEl,
        opacity: [1, 0],
        scale: [1, 0.9],
        translateY: [0, 20],
        duration: 280,
        easing: 'easeInQuad',
        complete: () => { if (callback) callback(); },
      });
    });
  }

  /* ─────────────────────────────────────────
     PUBLIC API — WATCHLIST CONFETTI
  ───────────────────────────────────────── */
  function celebrateWatchlist(btnEl) {
    withAnime((anime) => {
      if (!btnEl) return;

      // Heart burst animation
      anime({
        targets: btnEl,
        scale: [1, 1.5, 0.9, 1.1, 1],
        duration: 600,
        easing: 'easeOutElastic(1, 0.5)',
      });

      // Create confetti particles
      const rect = btnEl.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const COLORS = ['#E50914', '#F5A623', '#3B82F6', '#10B981', '#fff'];
      for (let i = 0; i < 12; i++) {
        const dot = document.createElement('div');
        dot.style.cssText = `
          position:fixed; width:8px; height:8px;
          border-radius:50%;
          background:${COLORS[i % COLORS.length]};
          left:${cx}px; top:${cy}px;
          pointer-events:none; z-index:9999;
        `;
        document.body.appendChild(dot);

        const angle = (i / 12) * Math.PI * 2;
        const dist = 60 + Math.random() * 60;
        anime({
          targets: dot,
          translateX: Math.cos(angle) * dist,
          translateY: Math.sin(angle) * dist - 30,
          opacity: [1, 0],
          scale: [1, 0.3],
          duration: 700 + Math.random() * 300,
          easing: 'easeOutExpo',
          complete: () => dot.remove(),
        });
      }
    });
  }

  /* ─────────────────────────────────────────
     PUBLIC API — TOAST ANIMATION
  ───────────────────────────────────────── */
  function animateToastIn(toastEl) {
    if (!toastEl) return;
    withAnime((anime) => {
      anime({
        targets: toastEl,
        opacity: [0, 1],
        translateX: [60, 0],
        scale: [0.9, 1],
        duration: 380,
        easing: 'cubicBezier(0.34, 1.56, 0.64, 1)',
      });
    });
  }

  function animateToastOut(toastEl, callback) {
    if (!toastEl) { if (callback) callback(); return; }
    withAnime((anime) => {
      anime({
        targets: toastEl,
        opacity: [1, 0],
        translateX: [0, 60],
        scale: [1, 0.9],
        duration: 280,
        easing: 'easeInQuad',
        complete: () => { if (callback) callback(); },
      });
    });
  }

  /* ─────────────────────────────────────────
     PUBLIC API — SECTION REVEAL (enhanced)
  ───────────────────────────────────────── */
  function revealSection(containerEl, direction = 'up') {
    withAnime((anime) => {
      if (!containerEl) return;
      const from = {
        up: { translateY: [30, 0] },
        down: { translateY: [-30, 0] },
        left: { translateX: [-30, 0] },
        right: { translateX: [30, 0] },
      }[direction] || { translateY: [30, 0] };

      anime({
        targets: containerEl,
        opacity: [0, 1],
        ...from,
        duration: 600,
        easing: 'cubicBezier(0.16, 1, 0.3, 1)',
      });
    });
  }

  /* ─────────────────────────────────────────
     PUBLIC API — CARD REMOVE ANIMATION
  ───────────────────────────────────────── */
  function animateCardRemove(cardEl, callback) {
    withAnime((anime) => {
      if (!cardEl) { if (callback) callback(); return; }
      anime({
        targets: cardEl,
        opacity: [1, 0],
        scale: [1, 0.85],
        translateY: [0, 10],
        duration: 300,
        easing: 'easeInQuad',
        complete: () => { if (callback) callback(); },
      });
    });
  }

  /* ─────────────────────────────────────────
     PUBLIC API — LOADING SHIMMER (enhanced)
  ───────────────────────────────────────── */
  function pulseLoader(el) {
    withAnime((anime) => {
      if (!el) return;
      anime({
        targets: el,
        opacity: [0.4, 0.9],
        duration: 900,
        direction: 'alternate',
        loop: true,
        easing: 'easeInOutSine',
      });
    });
  }

  /* ─────────────────────────────────────────
     EXPORT
  ───────────────────────────────────────── */
  return {
    init,
    countUp,
    animateModalIn,
    animateModalOut,
    celebrateWatchlist,
    animateToastIn,
    animateToastOut,
    revealSection,
    animateCardRemove,
    pulseLoader,
    withAnime,
  };
})();

window.CineAnime = CineAnime;

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => CineAnime.init());
} else {
  CineAnime.init();
}
