/**
 * CineVerse — pages/stats.js
 * Personal statistics page:
 * - Hero stat cards (films, hours, genres, avg rating)
 * - Activity bar chart (films per week/day via canvas)
 * - Genre breakdown bars
 * - Donut chart (top genres)
 * - Rating distribution
 * - Top directors
 * - Top-rated films watched
 * - Milestone badges
 * - Period filter: all / year / month / week
 *
 * No external chart library — pure Canvas 2D API
 * Depends on: storage.js, router.js, app.js
 */

(function () {
  'use strict';

  /* ─── State ─── */
  let movies      = [];
  let user        = null;
  let historyData = [];  // [{movieId, watchedAt}]
  let allItems    = [];  // [{movie, watchedAt}]
  let filtered    = [];  // current period items
  let period      = 'all';

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
    buildAllItems();
    applyPeriod();
    bindEvents();
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
      console.warn('[Stats] Could not load movies:', e);
      movies = [];
    }
  }

  function buildAllItems() {
    historyData = CineStorage.History.getAll(user.id);
    allItems = historyData
      .map(h => {
        const movie = movies.find(m => m.id === h.movieId);
        return movie ? { movie, watchedAt: h.watchedAt } : null;
      })
      .filter(Boolean);
  }

  /* ─────────────────────────────────────────
     PERIOD FILTER
  ───────────────────────────────────────── */
  function applyPeriod() {
    const now  = Date.now();
    const DAY  = 86400000;
    const cutoff = {
      all:   0,
      year:  now - 365 * DAY,
      month: now - 30  * DAY,
      week:  now - 7   * DAY,
    }[period] || 0;

    filtered = cutoff === 0
      ? allItems
      : allItems.filter(i => i.watchedAt >= cutoff);

    renderAll();
  }

  /* ─────────────────────────────────────────
     RENDER ALL SECTIONS
  ───────────────────────────────────────── */
  function renderAll() {
    if (filtered.length === 0 && allItems.length === 0) {
      showEmpty();
      return;
    }
    hideEmpty();
    renderHeroCards();
    renderActivityChart();
    renderGenreBars();
    renderDonut();
    renderRatingDist();
    renderDirectors();
    renderTopMovies();
    renderBadges();
  }

  function showEmpty() {
    const grid  = document.getElementById('st-hero-grid');
    const layout = document.querySelector('.st-layout');
    const empty = document.getElementById('st-empty');
    if (grid)   grid.classList.add('hidden');
    if (layout) layout.classList.add('hidden');
    if (empty)  empty.classList.remove('hidden');
  }

  function hideEmpty() {
    const empty = document.getElementById('st-empty');
    if (empty) empty.classList.add('hidden');
  }

  /* ─────────────────────────────────────────
     HERO CARDS
  ───────────────────────────────────────── */
  function renderHeroCards() {
    const grid = document.getElementById('st-hero-grid');
    if (!grid) return;

    const totalFilms   = filtered.length;
    const totalMinutes = filtered.reduce((s, i) => s + (i.movie.duration || 0), 0);
    const totalHours   = (totalMinutes / 60).toFixed(1);
    const avgRating    = filtered.length
      ? (filtered.reduce((s, i) => s + (i.movie.rating || 0), 0) / filtered.length).toFixed(1)
      : '—';
    const genreSet = new Set(filtered.flatMap(i => i.movie.genres || []));
    const totalGenres = genreSet.size;

    grid.innerHTML = `
      <div class="st-hero-card st-hero-card--crimson reveal">
        <div class="st-hero-card__icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/>
            <line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/>
            <line x1="2" y1="7" x2="7" y2="7"/><line x1="17" y1="7" x2="22" y2="7"/>
            <line x1="17" y1="17" x2="22" y2="17"/><line x1="2" y1="17" x2="7" y2="17"/>
          </svg>
        </div>
        <div class="st-hero-card__value" data-count="${totalFilms}">0</div>
        <div class="st-hero-card__label">Film Ditonton</div>
        <div class="st-hero-card__sub">${period === 'all' ? 'Sepanjang waktu' : getPeriodLabel()}</div>
      </div>
      <div class="st-hero-card st-hero-card--gold reveal">
        <div class="st-hero-card__icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div class="st-hero-card__value" data-count="${totalHours}" data-float="true">0</div>
        <div class="st-hero-card__label">Total Jam Nonton</div>
        <div class="st-hero-card__sub">${totalMinutes} menit total</div>
      </div>
      <div class="st-hero-card st-hero-card--blue reveal">
        <div class="st-hero-card__icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        </div>
        <div class="st-hero-card__value" data-count="${totalGenres}">0</div>
        <div class="st-hero-card__label">Genre Unik</div>
        <div class="st-hero-card__sub">Dari semua tontonan</div>
      </div>
      <div class="st-hero-card st-hero-card--emerald reveal">
        <div class="st-hero-card__icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
        <div class="st-hero-card__value" data-count="${avgRating}" data-float="true">—</div>
        <div class="st-hero-card__label">Rata-rata Rating</div>
        <div class="st-hero-card__sub">Film yang ditonton</div>
      </div>
    `;

    // Animate count-up
    grid.querySelectorAll('[data-count]').forEach(el => {
      animateCountUp(el);
    });
  }

  function getPeriodLabel() {
    return { year: '1 tahun terakhir', month: '30 hari terakhir', week: '7 hari terakhir' }[period] || '';
  }

  function animateCountUp(el) {
    const target   = parseFloat(el.dataset.count);
    const isFloat  = el.dataset.float === 'true';
    const duration = 800;
    const start    = performance.now();

    if (isNaN(target)) { el.textContent = el.dataset.count; return; }

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3);
      const current  = target * ease;
      el.textContent = isFloat ? current.toFixed(1) : Math.round(current);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = isFloat ? parseFloat(target).toFixed(1) : target;
    }

    requestAnimationFrame(step);
  }

  /* ─────────────────────────────────────────
     ACTIVITY CHART (Canvas bar chart)
  ───────────────────────────────────────── */
  function renderActivityChart() {
    const canvas = document.getElementById('st-activity-chart');
    const totalBadge = document.getElementById('st-activity-total');
    const emptyEl    = document.getElementById('st-chart-empty');
    if (!canvas) return;

    if (totalBadge) totalBadge.textContent = `${filtered.length} film`;

    if (filtered.length === 0) {
      canvas.classList.add('hidden');
      if (emptyEl) emptyEl.classList.remove('hidden');
      return;
    }
    canvas.classList.remove('hidden');
    if (emptyEl) emptyEl.classList.add('hidden');

    // Build data buckets: last N days/weeks depending on period
    const buckets = buildActivityBuckets();
    drawBarChart(canvas, buckets);
  }

  function buildActivityBuckets() {
    const now = Date.now();
    const DAY = 86400000;
    let buckets = [];

    if (period === 'week') {
      // 7 days
      for (let i = 6; i >= 0; i--) {
        const day = new Date(now - i * DAY);
        const label = day.toLocaleDateString('id-ID', { weekday: 'short' });
        const start = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
        const end   = start + DAY;
        buckets.push({ label, count: filtered.filter(f => f.watchedAt >= start && f.watchedAt < end).length });
      }
    } else if (period === 'month') {
      // 4 weeks
      for (let i = 3; i >= 0; i--) {
        const start = now - (i + 1) * 7 * DAY;
        const end   = now - i * 7 * DAY;
        const label = `M${4 - i}`;
        buckets.push({ label, count: filtered.filter(f => f.watchedAt >= start && f.watchedAt < end).length });
      }
    } else if (period === 'year') {
      // 12 months
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now);
        d.setMonth(d.getMonth() - i);
        const label = d.toLocaleDateString('id-ID', { month: 'short' });
        buckets.push({
          label,
          count: filtered.filter(f => {
            const fd = new Date(f.watchedAt);
            return fd.getMonth() === d.getMonth() && fd.getFullYear() === d.getFullYear();
          }).length,
        });
      }
    } else {
      // all time: group by month (last 12 with data)
      const monthMap = {};
      filtered.forEach(f => {
        const d   = new Date(f.watchedAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthMap[key] = (monthMap[key] || 0) + 1;
      });
      const keys = Object.keys(monthMap).sort();
      const recent = keys.slice(-12);
      buckets = recent.map(k => {
        const [y, m] = k.split('-');
        const label  = new Date(+y, +m - 1, 1).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
        return { label, count: monthMap[k] };
      });
    }

    return buckets;
  }

  function drawBarChart(canvas, buckets) {
    const dpr = window.devicePixelRatio || 1;
    const W   = canvas.offsetWidth  || 600;
    const H   = 180;

    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const paddingL = 28;
    const paddingR = 10;
    const paddingT = 10;
    const paddingB = 30;
    const chartW   = W - paddingL - paddingR;
    const chartH   = H - paddingT - paddingB;

    const maxVal = Math.max(...buckets.map(b => b.count), 1);
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    const textColor = isDark ? '#6B7280' : '#9CA3AF';

    ctx.clearRect(0, 0, W, H);

    // Grid lines
    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const y = paddingT + chartH - (i / gridLines) * chartH;
      ctx.strokeStyle = gridColor;
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.moveTo(paddingL, y);
      ctx.lineTo(paddingL + chartW, y);
      ctx.stroke();

      if (i > 0) {
        ctx.fillStyle = textColor;
        ctx.font      = `10px Inter, sans-serif`;
        ctx.textAlign = 'right';
        ctx.fillText(Math.round((i / gridLines) * maxVal), paddingL - 4, y + 3);
      }
    }

    // Bars
    const barGap = 4;
    const barW   = (chartW / buckets.length) - barGap;

    buckets.forEach((b, i) => {
      const x       = paddingL + i * (barW + barGap) + barGap / 2;
      const barH    = b.count > 0 ? (b.count / maxVal) * chartH : 0;
      const y       = paddingT + chartH - barH;

      // Gradient fill
      const grad = ctx.createLinearGradient(0, y, 0, paddingT + chartH);
      grad.addColorStop(0, '#E50914');
      grad.addColorStop(1, 'rgba(229,9,20,0.2)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      const radius = Math.min(4, barW / 2);
      if (barH > radius * 2) {
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + barW - radius, y);
        ctx.quadraticCurveTo(x + barW, y, x + barW, y + radius);
        ctx.lineTo(x + barW, paddingT + chartH);
        ctx.lineTo(x, paddingT + chartH);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
      } else {
        ctx.rect(x, paddingT + chartH - 2, barW, 2);
      }
      ctx.fill();

      // Label
      ctx.fillStyle = textColor;
      ctx.font      = `9px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(b.label, x + barW / 2, H - 8);
    });
  }

  /* ─────────────────────────────────────────
     GENRE BARS
  ───────────────────────────────────────── */
  function renderGenreBars() {
    const el = document.getElementById('st-genre-list');
    if (!el) return;

    const genreMap = {};
    filtered.forEach(i => {
      (i.movie.genres || []).forEach(g => { genreMap[g] = (genreMap[g] || 0) + 1; });
    });

    const sorted = Object.entries(genreMap).sort((a, b) => b[1] - a[1]).slice(0, 7);
    const max    = sorted[0]?.[1] || 1;

    if (sorted.length === 0) {
      el.innerHTML = '<p style="color:var(--color-text-muted);font-size:var(--font-size-sm)">Belum ada data genre.</p>';
      return;
    }

    el.innerHTML = sorted.map(([name, count]) => `
      <div class="st-genre-row">
        <div class="st-genre-row__top">
          <span class="st-genre-row__name">${name}</span>
          <span class="st-genre-row__count">${count} film</span>
        </div>
        <div class="st-genre-bar-track">
          <div class="st-genre-bar-fill" data-width="${(count / max * 100).toFixed(1)}%"></div>
        </div>
      </div>
    `).join('');

    // Animate bars after paint
    requestAnimationFrame(() => {
      el.querySelectorAll('.st-genre-bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.width;
      });
    });
  }

  /* ─────────────────────────────────────────
     DONUT CHART
  ───────────────────────────────────────── */
  const GENRE_COLORS = [
    '#E50914', '#F5A623', '#3B82F6', '#10B981', '#8B5CF6',
    '#EC4899', '#F59E0B', '#06B6D4', '#84CC16', '#EF4444',
  ];

  function renderDonut() {
    const canvas     = document.getElementById('st-donut-chart');
    const centerVal  = document.getElementById('st-donut-value');
    const legendEl   = document.getElementById('st-donut-legend');
    if (!canvas) return;

    const genreMap = {};
    filtered.forEach(i => {
      (i.movie.genres || []).forEach(g => { genreMap[g] = (genreMap[g] || 0) + 1; });
    });

    const sorted = Object.entries(genreMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
    if (sorted.length === 0) {
      canvas.parentElement.innerHTML = '<p style="color:var(--color-text-muted);font-size:var(--font-size-sm);text-align:center;padding:20px 0">Belum ada data.</p>';
      return;
    }

    const total = sorted.reduce((s, [, v]) => s + v, 0);
    if (centerVal) centerVal.textContent = sorted[0][0];

    const dpr  = window.devicePixelRatio || 1;
    const size = 220;
    canvas.width  = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width  = size + 'px';
    canvas.style.height = size + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const cx = size / 2, cy = size / 2;
    const outerR = 90, innerR = 58;
    let startAngle = -Math.PI / 2;

    sorted.forEach(([, count], i) => {
      const slice = (count / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, outerR, startAngle, startAngle + slice);
      ctx.closePath();
      ctx.fillStyle = GENRE_COLORS[i % GENRE_COLORS.length];
      ctx.fill();
      startAngle += slice;
    });

    // Inner circle (cutout)
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? '#111827' : '#fff';
    ctx.fill();

    // Legend
    if (legendEl) {
      legendEl.innerHTML = sorted.map(([name, count], i) => `
        <div class="st-legend-item">
          <span class="st-legend-dot" style="background:${GENRE_COLORS[i % GENRE_COLORS.length]}"></span>
          <span>${name} (${Math.round(count / total * 100)}%)</span>
        </div>
      `).join('');
    }
  }

  /* ─────────────────────────────────────────
     RATING DISTRIBUTION
  ───────────────────────────────────────── */
  function renderRatingDist() {
    const el = document.getElementById('st-rating-dist');
    if (!el) return;

    // Buckets: 9–10, 8–9, 7–8, 6–7, <6
    const buckets = [
      { label: '9–10', min: 9,   max: 11 },
      { label: '8–9',  min: 8,   max: 9  },
      { label: '7–8',  min: 7,   max: 8  },
      { label: '6–7',  min: 6,   max: 7  },
      { label: '<6',   min: 0,   max: 6  },
    ];

    buckets.forEach(b => {
      b.count = filtered.filter(i => i.movie.rating >= b.min && i.movie.rating < b.max).length;
    });

    const maxCount = Math.max(...buckets.map(b => b.count), 1);

    el.innerHTML = buckets.map(b => `
      <div class="st-rating-row">
        <span class="st-rating-label">${b.label}</span>
        <div class="st-rating-bar-track">
          <div class="st-rating-bar-fill" data-width="${(b.count / maxCount * 100).toFixed(1)}%"></div>
        </div>
        <span class="st-rating-count">${b.count}</span>
      </div>
    `).join('');

    requestAnimationFrame(() => {
      el.querySelectorAll('.st-rating-bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.width;
      });
    });
  }

  /* ─────────────────────────────────────────
     TOP DIRECTORS
  ───────────────────────────────────────── */
  function renderDirectors() {
    const el = document.getElementById('st-directors-list');
    if (!el) return;

    const dirMap = {};
    filtered.forEach(i => {
      const d = i.movie.director;
      if (d) dirMap[d] = (dirMap[d] || 0) + 1;
    });

    const sorted = Object.entries(dirMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

    if (sorted.length === 0) {
      el.innerHTML = '<p style="color:var(--color-text-muted);font-size:var(--font-size-sm)">Belum ada data.</p>';
      return;
    }

    const rankColors = ['st-director-rank--gold', 'st-director-rank--silver', 'st-director-rank--bronze'];

    el.innerHTML = sorted.map(([name, count], i) => {
      const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      const rankClass = rankColors[i] || '';
      return `
        <div class="st-director-row">
          <span class="st-director-rank ${rankClass}">${i + 1}</span>
          <div class="st-director-avatar">${initials}</div>
          <div class="st-director-info">
            <div class="st-director-name">${name}</div>
            <div class="st-director-count">${count} film ditonton</div>
          </div>
        </div>
      `;
    }).join('');
  }

  /* ─────────────────────────────────────────
     TOP MOVIES (by rating)
  ───────────────────────────────────────── */
  function renderTopMovies() {
    const el = document.getElementById('st-top-movies');
    if (!el) return;

    const base   = window.CineRouter ? CineRouter.getRootPath() : '../';
    const unique = {};
    filtered.forEach(i => { unique[i.movie.id] = i.movie; });

    const sorted = Object.values(unique)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5);

    if (sorted.length === 0) {
      el.innerHTML = '<p style="color:var(--color-text-muted);font-size:var(--font-size-sm)">Belum ada data.</p>';
      return;
    }

    const rankClasses = ['--1', '--2', '--3'];

    el.innerHTML = sorted.map((m, i) => {
      const stars = '★'.repeat(Math.round(m.rating / 2));
      const rc    = rankClasses[i] ? `st-top-movie-rank${rankClasses[i]}` : 'st-top-movie-rank--n';
      return `
        <a href="${base}pages/movie-detail.html?id=${m.id}" class="st-top-movie-row">
          <span class="st-top-movie-rank ${rc}">${i + 1}</span>
          <img class="st-top-movie-poster" src="${m.posterUrl}" alt="${m.title}" loading="lazy" onerror="this.src='../assets/images/poster-placeholder.svg'" />
          <div class="st-top-movie-info">
            <div class="st-top-movie-title">${m.title}</div>
            <div class="st-top-movie-meta">${m.year} · ${(m.genres || []).slice(0,2).join(', ')}</div>
          </div>
          <div class="st-top-movie-stars" title="Rating ${m.rating}">${stars}</div>
        </a>
      `;
    }).join('');
  }

  /* ─────────────────────────────────────────
     MILESTONE BADGES
  ───────────────────────────────────────── */
  const BADGES = [
    { id: 'first',    icon: '🎬', name: 'Pemula',       desc: 'Tonton film pertamamu',  threshold: 1   },
    { id: 'five',     icon: '🍿', name: 'Penikmat',     desc: 'Tonton 5 film',           threshold: 5   },
    { id: 'ten',      icon: '🎞️', name: 'Cinephile',    desc: 'Tonton 10 film',          threshold: 10  },
    { id: 'twenty',   icon: '🏆', name: 'Kritikus',     desc: 'Tonton 20 film',          threshold: 20  },
    { id: 'fifty',    icon: '🌟', name: 'Maestro',      desc: 'Tonton 50 film',          threshold: 50  },
    { id: 'hundred',  icon: '👑', name: 'Legenda',      desc: 'Tonton 100 film',         threshold: 100 },
    { id: 'genre5',   icon: '🎭', name: 'Penjelajah',   desc: 'Tonton 5 genre berbeda',  special: 'genre5' },
    { id: 'director', icon: '🎥', name: 'Fan Berat',    desc: 'Tonton 3 film 1 sutradara', special: 'director3' },
  ];

  function renderBadges() {
    const el = document.getElementById('st-badges');
    if (!el) return;

    const totalFilms  = allItems.length; // badges based on all-time
    const genreCount  = new Set(allItems.flatMap(i => i.movie.genres || [])).size;
    const dirMap      = {};
    allItems.forEach(i => { const d = i.movie.director; if (d) dirMap[d] = (dirMap[d] || 0) + 1; });
    const hasDir3     = Object.values(dirMap).some(c => c >= 3);

    el.innerHTML = BADGES.map(b => {
      let unlocked = false;

      if (b.special === 'genre5')    unlocked = genreCount >= 5;
      else if (b.special === 'director3') unlocked = hasDir3;
      else unlocked = totalFilms >= b.threshold;

      const progressText = b.threshold
        ? `${Math.min(totalFilms, b.threshold)} / ${b.threshold}`
        : '';

      return `
        <div class="st-badge ${unlocked ? 'st-badge--unlocked' : 'st-badge--locked'}" title="${b.desc}">
          <span class="st-badge__icon">${b.icon}</span>
          <span class="st-badge__name">${b.name}</span>
          <span class="st-badge__desc">${b.desc}</span>
          ${progressText && !unlocked ? `<span class="st-badge__progress">${progressText}</span>` : ''}
          ${unlocked ? `<span class="st-badge__progress">✓ Terbuka!</span>` : ''}
        </div>
      `;
    }).join('');
  }

  /* ─────────────────────────────────────────
     EVENTS
  ───────────────────────────────────────── */
  function bindEvents() {
    document.querySelectorAll('.st-period-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.st-period-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        period = btn.dataset.period;
        applyPeriod();
      });
    });

    // Redraw on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => renderActivityChart(), 200);
    });
  }

  /* ─── Boot ─── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
