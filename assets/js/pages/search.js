/**
 * CineVerse — search.js
 * Pencarian film dengan filter genre, tahun, rating, bahasa.
 * Menggunakan Fuse.js untuk fuzzy search lokal.
 */

const SearchPage = (() => {

  const PAGE_SIZE = 24;
  let allMovies = [];
  let filteredMovies = [];
  let currentPage = 1;
  let currentUser = null;
  let fuseInstance = null;

  // Filter state
  let state = {
    query: '',
    genres: [],       // selected genres (OR logic)
    yearFrom: '',
    yearTo: '',
    ratingMin: 0,
    sort: 'relevance',
    language: '',
  };

  /* ─── INIT ─── */
  async function init() {
    setTimeout(() => {
      const loader = document.getElementById('page-loader');
      if (loader) loader.style.display = 'none';
    }, 250);

    currentUser = window.CineStorage?.User?.getCurrent() || null;

    // Load movies
    try {
      const resp = await fetch('../data/movies.json');
      const data = await resp.json();
      allMovies = data.movies || [];
    } catch (e) {
      console.error('[Search] Error loading movies:', e);
    }

    // Init Fuse.js (CDN fallback)
    initFuse();

    // Read URL params
    readURLParams();

    // Build UI
    buildGenreChips();
    buildYearOptions();
    restoreFilters();

    // Show results
    applyFilters();

    // Events
    bindEvents();

    setTimeout(() => forceReveal(), 400);
  }

  /* ─── FUSE INIT ─── */
  function initFuse() {
    // Try to use Fuse.js if loaded, otherwise use simple search
    if (typeof Fuse !== 'undefined') {
      fuseInstance = new Fuse(allMovies, {
        keys: [
          { name: 'title', weight: 0.5 },
          { name: 'originalTitle', weight: 0.3 },
          { name: 'director', weight: 0.2 },
          { name: 'cast', weight: 0.15 },
          { name: 'synopsis', weight: 0.1 },
          { name: 'tags', weight: 0.1 },
        ],
        threshold: 0.35,
        includeScore: true,
      });
    }
  }

  /* ─── URL PARAMS ─── */
  function readURLParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('q')) state.query = params.get('q');
    if (params.get('genre')) state.genres = [params.get('genre')];
    if (params.get('lang')) state.language = params.get('lang');
  }

  /* ─── BUILD GENRE CHIPS ─── */
  function buildGenreChips() {
    const genres = [...new Set(allMovies.flatMap(m => m.genres || []))].sort();
    const wrap = document.getElementById('srch-genre-chips');
    if (!wrap) return;

    wrap.innerHTML = genres.map(g =>
      `<button class="srch-chip ${state.genres.includes(g) ? 'active' : ''}"
               data-genre="${g}">${g}</button>`
    ).join('');

    wrap.querySelectorAll('.srch-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const genre = btn.dataset.genre;
        const idx = state.genres.indexOf(genre);
        if (idx === -1) {
          state.genres.push(genre);
        } else {
          state.genres.splice(idx, 1);
        }
        btn.classList.toggle('active', state.genres.includes(genre));
        applyFilters();
        updateActiveTags();
      });
    });
  }

  /* ─── BUILD YEAR OPTIONS ─── */
  function buildYearOptions() {
    const years = [...new Set(allMovies.map(m => m.year))].sort((a, b) => a - b);
    const fromEl = document.getElementById('srch-year-from');
    const toEl = document.getElementById('srch-year-to');

    if (fromEl) {
      fromEl.innerHTML = '<option value="">Dari</option>' +
        years.map(y => `<option value="${y}" ${state.yearFrom == y ? 'selected' : ''}>${y}</option>`).join('');
    }
    if (toEl) {
      toEl.innerHTML = '<option value="">Sampai</option>' +
        [...years].reverse().map(y => `<option value="${y}" ${state.yearTo == y ? 'selected' : ''}>${y}</option>`).join('');
    }
  }

  /* ─── RESTORE FILTERS FROM SESSION ─── */
  function restoreFilters() {
    // Restore search input
    const input = document.getElementById('srch-input');
    if (input && state.query) {
      input.value = state.query;
      const clearBtn = document.getElementById('srch-clear');
      if (clearBtn) clearBtn.style.display = 'flex';
    }

    // Restore sort
    const sortEl = document.getElementById('srch-sort');
    if (sortEl && state.sort) sortEl.value = state.sort;

    // Restore language
    const langEl = document.getElementById('srch-language');
    if (langEl && state.language) langEl.value = state.language;

    // Restore rating
    const ratingEl = document.getElementById('srch-rating-min');
    const ratingDisplay = document.getElementById('srch-rating-display');
    if (ratingEl) {
      ratingEl.value = state.ratingMin;
      if (ratingDisplay) ratingDisplay.textContent = state.ratingMin > 0 ? `${state.ratingMin}+` : 'Semua';
    }
  }

  /* ─── APPLY FILTERS ─── */
  function applyFilters() {
    currentPage = 1;

    let results = [...allMovies];

    // 1. Fuzzy search by query
    if (state.query.trim()) {
      if (fuseInstance) {
        const fuseResults = fuseInstance.search(state.query.trim());
        results = fuseResults.map(r => r.item);
      } else {
        const q = state.query.toLowerCase();
        results = results.filter(m =>
          m.title?.toLowerCase().includes(q) ||
          m.originalTitle?.toLowerCase().includes(q) ||
          m.director?.toLowerCase().includes(q) ||
          m.cast?.some(c => c.toLowerCase().includes(q)) ||
          m.synopsis?.toLowerCase().includes(q) ||
          m.tags?.some(t => t.toLowerCase().includes(q))
        );
      }
    }

    // 2. Genre filter (OR — film harus punya salah satu genre)
    if (state.genres.length > 0) {
      results = results.filter(m => m.genres?.some(g => state.genres.includes(g)));
    }

    // 3. Year range
    if (state.yearFrom) {
      results = results.filter(m => m.year >= parseInt(state.yearFrom));
    }
    if (state.yearTo) {
      results = results.filter(m => m.year <= parseInt(state.yearTo));
    }

    // 4. Rating min
    if (state.ratingMin > 0) {
      results = results.filter(m => (m.rating || 0) >= state.ratingMin);
    }

    // 5. Language
    if (state.language) {
      results = results.filter(m => m.language === state.language);
    }

    // 6. Sort
    if (!state.query.trim() || state.sort !== 'relevance') {
      sortResults(results);
    }

    filteredMovies = results;
    renderResults();
    updateResultCount();
    updateActiveTags();
  }

  /* ─── SORT ─── */
  function sortResults(arr) {
    switch (state.sort) {
      case 'rating-desc':
        arr.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'year-desc':
        arr.sort((a, b) => (b.year || 0) - (a.year || 0));
        break;
      case 'year-asc':
        arr.sort((a, b) => (a.year || 0) - (b.year || 0));
        break;
      case 'title-asc':
        arr.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        arr.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        // relevance — keep as is (fuse already sorted)
        break;
    }
  }

  /* ─── RENDER RESULTS ─── */
  function renderResults() {
    const skeleton = document.getElementById('srch-skeleton');
    const grid = document.getElementById('srch-grid');
    const empty = document.getElementById('srch-empty');
    const pagination = document.getElementById('srch-pagination');

    if (skeleton) skeleton.style.display = 'none';

    if (!filteredMovies.length) {
      if (grid) grid.style.display = 'none';
      if (empty) {
        empty.style.display = 'block';
        const desc = document.getElementById('srch-empty-desc');
        if (desc) {
          desc.textContent = state.query
            ? `Tidak ada film dengan kata kunci "${state.query}". Coba kata lain atau ubah filter.`
            : 'Tidak ada film yang sesuai filter. Coba ubah kriteria pencarian.';
        }
      }
      if (pagination) pagination.style.display = 'none';
      return;
    }

    if (empty) empty.style.display = 'none';
    if (grid) {
      grid.style.display = 'grid';
      const toShow = filteredMovies.slice(0, currentPage * PAGE_SIZE);
      grid.innerHTML = toShow.map(m => renderMovieCard(m)).join('');
      initCardEvents(grid);
    }

    // Pagination
    const total = filteredMovies.length;
    const shown = Math.min(currentPage * PAGE_SIZE, total);
    if (pagination) {
      pagination.style.display = shown < total ? 'flex' : 'none';
      const info = document.getElementById('srch-pagination-info');
      if (info) info.textContent = `Menampilkan ${shown} dari ${total} film`;
    }
  }

  /* ─── UPDATE COUNT ─── */
  function updateResultCount() {
    const el = document.getElementById('srch-result-count');
    if (el) {
      el.textContent = filteredMovies.length === allMovies.length
        ? `${allMovies.length} film`
        : `${filteredMovies.length} dari ${allMovies.length} film`;
    }
  }

  /* ─── UPDATE ACTIVE TAGS ─── */
  function updateActiveTags() {
    const wrap = document.getElementById('srch-active-filters');
    if (!wrap) return;

    const tags = [];

    if (state.query) tags.push({ label: `"${state.query}"`, action: () => { state.query = ''; const inp = document.getElementById('srch-input'); if (inp) inp.value = ''; applyFilters(); } });
    state.genres.forEach(g => tags.push({ label: g, action: () => { state.genres = state.genres.filter(x => x !== g); document.querySelector(`.srch-chip[data-genre="${g}"]`)?.classList.remove('active'); applyFilters(); } }));
    if (state.yearFrom) tags.push({ label: `Dari ${state.yearFrom}`, action: () => { state.yearFrom = ''; document.getElementById('srch-year-from').value = ''; applyFilters(); } });
    if (state.yearTo) tags.push({ label: `Sampai ${state.yearTo}`, action: () => { state.yearTo = ''; document.getElementById('srch-year-to').value = ''; applyFilters(); } });
    if (state.ratingMin > 0) tags.push({ label: `Rating ≥ ${state.ratingMin}`, action: () => { state.ratingMin = 0; document.getElementById('srch-rating-min').value = 0; document.getElementById('srch-rating-display').textContent = 'Semua'; applyFilters(); } });
    if (state.language) tags.push({ label: state.language === 'id' ? 'Indonesia' : 'English', action: () => { state.language = ''; document.getElementById('srch-language').value = ''; applyFilters(); } });

    if (!tags.length) {
      wrap.style.display = 'none';
      return;
    }

    wrap.style.display = 'flex';
    wrap.innerHTML = tags.map((t, i) => `
      <span class="srch-active-tag" data-idx="${i}">
        ${t.label}
        <button class="srch-active-tag__remove" aria-label="Hapus filter">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </span>`).join('');

    wrap.querySelectorAll('.srch-active-tag').forEach((el, i) => {
      el.querySelector('.srch-active-tag__remove').addEventListener('click', tags[i].action);
    });
  }

  /* ─── RESET ─── */
  function resetFilters() {
    state = { query: '', genres: [], yearFrom: '', yearTo: '', ratingMin: 0, sort: 'relevance', language: '' };

    const input = document.getElementById('srch-input');
    if (input) input.value = '';
    document.getElementById('srch-clear')?.style.setProperty('display', 'none');
    document.getElementById('srch-year-from') && (document.getElementById('srch-year-from').value = '');
    document.getElementById('srch-year-to') && (document.getElementById('srch-year-to').value = '');
    document.getElementById('srch-rating-min') && (document.getElementById('srch-rating-min').value = 0);
    document.getElementById('srch-rating-display') && (document.getElementById('srch-rating-display').textContent = 'Semua');
    document.getElementById('srch-sort') && (document.getElementById('srch-sort').value = 'relevance');
    document.getElementById('srch-language') && (document.getElementById('srch-language').value = '');
    document.querySelectorAll('.srch-chip.active').forEach(c => c.classList.remove('active'));

    applyFilters();
  }

  /* ─── BIND EVENTS ─── */
  function bindEvents() {
    // Search input (debounced)
    const input = document.getElementById('srch-input');
    const clearBtn = document.getElementById('srch-clear');
    if (input) {
      let debounceTimer;
      input.addEventListener('input', () => {
        state.query = input.value;
        clearBtn.style.display = state.query ? 'flex' : 'none';
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(applyFilters, 300);
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        state.query = '';
        if (input) input.value = '';
        clearBtn.style.display = 'none';
        applyFilters();
      });
    }

    // Year filters
    document.getElementById('srch-year-from')?.addEventListener('change', e => {
      state.yearFrom = e.target.value;
      applyFilters();
    });
    document.getElementById('srch-year-to')?.addEventListener('change', e => {
      state.yearTo = e.target.value;
      applyFilters();
    });

    // Rating slider
    const ratingSlider = document.getElementById('srch-rating-min');
    const ratingDisplay = document.getElementById('srch-rating-display');
    if (ratingSlider) {
      ratingSlider.addEventListener('input', () => {
        state.ratingMin = parseFloat(ratingSlider.value);
        if (ratingDisplay) ratingDisplay.textContent = state.ratingMin > 0 ? `${state.ratingMin}+` : 'Semua';
      });
      ratingSlider.addEventListener('change', applyFilters);
    }

    // Sort
    document.getElementById('srch-sort')?.addEventListener('change', e => {
      state.sort = e.target.value;
      applyFilters();
    });

    // Language
    document.getElementById('srch-language')?.addEventListener('change', e => {
      state.language = e.target.value;
      applyFilters();
    });

    // Reset buttons
    document.getElementById('srch-reset-filters')?.addEventListener('click', resetFilters);
    document.getElementById('srch-empty-reset')?.addEventListener('click', resetFilters);

    // Load more
    document.getElementById('srch-load-more')?.addEventListener('click', () => {
      currentPage++;
      renderResults();
    });
  }

  /* ─── RENDER MOVIE CARD ─── */
  function renderMovieCard(m) {
    const isInWatchlist = currentUser && window.CineStorage?.Watchlist?.has(currentUser.id, m.id);
    return `
      <div class="movie-card" data-id="${m.id}">
        <a href="movie-detail.html?id=${m.id}" class="movie-card__poster-link">
          <div class="movie-card__poster">
            <img src="${m.posterUrl || '../assets/images/poster-placeholder.svg'}"
                 alt="${m.title}"
                 loading="lazy"
                 onerror="this.src='../assets/images/poster-placeholder.svg'" />
            <div class="movie-card__overlay">
              <button class="movie-card__play-btn" aria-label="Lihat detail ${m.title}">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"/></svg>
              </button>
            </div>
            ${m.trending ? '<span class="movie-card__badge">🔥 Trending</span>' : ''}
          </div>
        </a>
        <button class="movie-card__wishlist ${isInWatchlist ? 'active' : ''}"
                aria-label="${isInWatchlist ? 'Hapus dari watchlist' : 'Tambah ke watchlist'}"
                data-movie-id="${m.id}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="${isInWatchlist ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
        <div class="movie-card__info">
          <h3 class="movie-card__title">
            <a href="movie-detail.html?id=${m.id}" style="color:inherit;text-decoration:none;">${m.title}</a>
          </h3>
          <div class="movie-card__meta">
            <span class="movie-card__rating">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--color-gold)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              ${m.rating?.toFixed(1) || '—'}
            </span>
            <span>${m.year || '—'}</span>
          </div>
        </div>
      </div>`;
  }

  /* ─── INIT CARD EVENTS ─── */
  function initCardEvents(container) {
    container.querySelectorAll('.movie-card__wishlist').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        if (!currentUser) {
          window.CineToast?.show('Masuk terlebih dahulu', 'info');
          return;
        }
        const id = btn.dataset.movieId;
        const added = window.CineStorage?.Watchlist?.toggle(currentUser.id, id);
        btn.classList.toggle('active', added);
        btn.querySelector('svg').setAttribute('fill', added ? 'currentColor' : 'none');
        window.CineToast?.show(added ? 'Ditambahkan ke Watchlist' : 'Dihapus dari Watchlist', added ? 'success' : 'info');
      });
    });
  }

  function forceReveal() {
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 60);
    });
  }

  return { init };

})();

document.addEventListener('DOMContentLoaded', SearchPage.init);
