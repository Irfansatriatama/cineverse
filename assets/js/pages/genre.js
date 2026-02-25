/**
 * CineVerse — genre.js
 * Genre Explorer: tampilkan semua genre atau film per genre
 */

const GenrePage = (() => {

  const PAGE_SIZE = 24;

  // Genre metadata: emoji, color, description, gradient
  const GENRE_META = {
    'Aksi':          { emoji: '💥', color: '#EF4444', desc: 'Film penuh adegan aksi menegangkan dan pertarungan epik.' },
    'Petualangan':   { emoji: '🗺️', color: '#F59E0B', desc: 'Perjalanan seru melintasi dunia yang penuh misteri dan petualangan.' },
    'Animasi':       { emoji: '🎨', color: '#8B5CF6', desc: 'Dunia animasi yang penuh warna, kreativitas, dan imajinasi.' },
    'Biografi':      { emoji: '📖', color: '#6366F1', desc: 'Kisah nyata tokoh-tokoh inspiratif yang mengubah dunia.' },
    'Dokumenter':    { emoji: '🎥', color: '#64748B', desc: 'Kisah nyata dunia yang direkam dengan apik dan mendalam.' },
    'Drama':         { emoji: '🎭', color: '#EC4899', desc: 'Cerita mendalam tentang emosi manusia, hubungan, dan kehidupan.' },
    'Fantasi':       { emoji: '✨', color: '#A855F7', desc: 'Dunia ajaib penuh sihir, naga, dan petualangan luar biasa.' },
    'Horor':         { emoji: '👻', color: '#1F2937', desc: 'Film yang akan membuatmu merinding dan tak bisa tidur malam.' },
    'Komedi':        { emoji: '😂', color: '#F97316', desc: 'Hiburan penuh tawa dan momen lucu yang menghibur.' },
    'Misteri':       { emoji: '🔍', color: '#0EA5E9', desc: 'Teka-teki dan misteri yang akan membuatmu penasaran hingga akhir.' },
    'Musikal':       { emoji: '🎵', color: '#D946EF', desc: 'Perpaduan cerita indah dengan musik dan tarian memukau.' },
    'Olahraga':      { emoji: '⚽', color: '#22C55E', desc: 'Kisah inspiratif para atlet dan semangat pantang menyerah.' },
    'Romansa':       { emoji: '❤️', color: '#F43F5E', desc: 'Kisah cinta yang menghangatkan hati dan penuh perasaan.' },
    'Sci-Fi':        { emoji: '🚀', color: '#3B82F6', desc: 'Masa depan, teknologi, dan eksplorasi alam semesta yang menakjubkan.' },
    'Sejarah':       { emoji: '🏛️', color: '#78716C', desc: 'Kisah dari masa lalu yang membentuk peradaban manusia.' },
    'Superhero':     { emoji: '🦸', color: '#F59E0B', desc: 'Pahlawan super dengan kekuatan luar biasa yang melindungi dunia.' },
    'Thriller':      { emoji: '😰', color: '#6B7280', desc: 'Ketegangan yang membuatmu duduk di ujung kursi sepanjang film.' },
    'Western':       { emoji: '🤠', color: '#92400E', desc: 'Kisah dari era koboi, padang pasir, dan keadilan jalanan.' },
    'Indonesia':     { emoji: '🇮🇩', color: '#DC2626', desc: 'Film-film terbaik karya sineas Indonesia yang membanggakan.' },
    'Family':        { emoji: '👨‍👩‍👧‍👦', color: '#10B981', desc: 'Film cocok untuk semua usia, ditonton bersama keluarga.' },
  };

  const DEFAULT_META = { emoji: '🎬', color: '#E50914', desc: 'Kumpulan film terbaik dalam genre ini.' };

  let allMovies = [];
  let currentUser = null;
  let currentGenre = null;
  let genreMovies = [];
  let currentPage = 1;
  let sortMode = 'rating-desc';

  /* ─── INIT ─── */
  async function init() {
    setTimeout(() => {
      const loader = document.getElementById('page-loader');
      if (loader) loader.style.display = 'none';
    }, 250);

    currentUser = window.CineStorage?.User?.getCurrent() || null;

    try {
      const resp = await fetch('../data/movies.json');
      const data = await resp.json();
      allMovies = data.movies || [];
    } catch (e) {
      console.error('[Genre] Error loading movies:', e);
    }

    // Check URL param ?g=Genre
    const params = new URLSearchParams(window.location.search);
    const genreParam = params.get('g');

    if (genreParam) {
      showGenreDetail(genreParam);
    } else {
      showOverview();
    }

    setTimeout(() => forceReveal(), 400);
  }

  /* ─── OVERVIEW: All Genres ─── */
  function showOverview() {
    document.getElementById('genre-overview').style.display = 'block';
    document.getElementById('genre-detail').style.display = 'none';

    // Collect genres with counts
    const genreMap = {};
    allMovies.forEach(m => {
      (m.genres || []).forEach(g => {
        if (!genreMap[g]) genreMap[g] = { name: g, movies: [] };
        genreMap[g].movies.push(m);
      });
    });

    const genres = Object.values(genreMap).sort((a, b) => b.movies.length - a.movies.length);

    const grid = document.getElementById('genre-cards-grid');
    if (!grid) return;

    grid.innerHTML = genres.map(g => {
      const meta = GENRE_META[g.name] || DEFAULT_META;
      // Pick a backdrop from top rated movie in genre
      const topMovie = g.movies.sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
      const bg = topMovie?.backdropUrl || topMovie?.posterUrl || '';
      return `
        <button class="genre-card" data-genre="${g.name}"
                style="--genre-color: ${meta.color};"
                aria-label="Lihat film genre ${g.name}">
          <div class="genre-card__bg" style="${bg ? `background-image: url('${bg}')` : `background: linear-gradient(135deg, ${meta.color}33, #0A0E1A)`}"></div>
          <div class="genre-card__overlay"></div>
          <div class="genre-card__content">
            <div class="genre-card__emoji">${meta.emoji}</div>
            <div class="genre-card__name">${g.name}</div>
            <div class="genre-card__count">${g.movies.length} film</div>
          </div>
        </button>`;
    }).join('');

    // Click → show detail
    grid.querySelectorAll('.genre-card').forEach(card => {
      card.addEventListener('click', () => {
        const genre = card.dataset.genre;
        showGenreDetail(genre);
        // Update URL without reload
        history.pushState(null, '', `?g=${encodeURIComponent(genre)}`);
      });
    });
  }

  /* ─── GENRE DETAIL ─── */
  function showGenreDetail(genreName) {
    currentGenre = genreName;
    currentPage = 1;

    document.getElementById('genre-overview').style.display = 'none';
    document.getElementById('genre-detail').style.display = 'block';

    const meta = GENRE_META[genreName] || DEFAULT_META;

    // Nav
    document.getElementById('genre-detail-name').textContent = genreName;

    // Filter movies
    genreMovies = allMovies.filter(m => m.genres?.includes(genreName));
    document.getElementById('genre-detail-count').textContent = `${genreMovies.length} film`;

    // Banner
    const topBannerMovie = genreMovies.sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
    const bannerBg = document.getElementById('genre-banner-bg');
    if (bannerBg && topBannerMovie?.backdropUrl) {
      bannerBg.style.backgroundImage = `url('${topBannerMovie.backdropUrl}')`;
    }

    document.getElementById('genre-banner-emoji').textContent = meta.emoji;
    document.getElementById('genre-banner-title').textContent = genreName;
    document.getElementById('genre-banner-desc').textContent = meta.desc;

    // Search link
    const searchLink = document.getElementById('genre-search-link');
    if (searchLink) searchLink.href = `search.html?genre=${encodeURIComponent(genreName)}`;

    // Bind events
    const backBtn = document.getElementById('genre-back-btn');
    if (backBtn) {
      backBtn.replaceWith(backBtn.cloneNode(true)); // remove old listeners
      document.getElementById('genre-back-btn').addEventListener('click', () => {
        history.pushState(null, '', 'genre.html');
        showOverview();
      });
    }

    document.getElementById('genre-sort')?.addEventListener('change', e => {
      sortMode = e.target.value;
      renderGenreMovies();
    });

    document.getElementById('genre-load-more')?.addEventListener('click', () => {
      currentPage++;
      renderGenreMovies(true);
    });

    renderGenreMovies();
    setTimeout(() => forceReveal(), 300);
  }

  /* ─── RENDER GENRE MOVIES ─── */
  function renderGenreMovies(append = false) {
    const grid = document.getElementById('genre-movies-grid');
    if (!grid) return;

    // Sort
    let sorted = [...genreMovies];
    switch (sortMode) {
      case 'rating-desc': sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case 'year-desc': sorted.sort((a, b) => (b.year || 0) - (a.year || 0)); break;
      case 'year-asc': sorted.sort((a, b) => (a.year || 0) - (b.year || 0)); break;
      case 'title-asc': sorted.sort((a, b) => a.title.localeCompare(b.title)); break;
    }

    const toShow = sorted.slice(0, currentPage * PAGE_SIZE);

    if (!append) {
      grid.innerHTML = toShow.map(m => renderMovieCard(m)).join('');
    } else {
      // Append new movies
      const prev = (currentPage - 1) * PAGE_SIZE;
      const newMovies = sorted.slice(prev, currentPage * PAGE_SIZE);
      grid.insertAdjacentHTML('beforeend', newMovies.map(m => renderMovieCard(m)).join(''));
    }

    initCardEvents(grid);

    // Pagination
    const pagination = document.getElementById('genre-pagination');
    const paginationInfo = document.getElementById('genre-pagination-info');
    const total = sorted.length;
    const shown = Math.min(currentPage * PAGE_SIZE, total);

    if (pagination) pagination.style.display = shown < total ? 'flex' : 'none';
    if (paginationInfo) paginationInfo.textContent = `Menampilkan ${shown} dari ${total} film`;
  }

  /* ─── MOVIE CARD ─── */
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
              <button class="movie-card__play-btn" aria-label="Tonton ${m.title}">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"/></svg>
              </button>
            </div>
            ${m.trending ? '<span class="movie-card__badge">🔥 Trending</span>' : ''}
          </div>
        </a>
        <button class="movie-card__wishlist ${isInWatchlist ? 'active' : ''}"
                aria-label="Watchlist"
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

  // Handle browser back/forward
  window.addEventListener('popstate', () => {
    const params = new URLSearchParams(window.location.search);
    const g = params.get('g');
    if (g) showGenreDetail(g);
    else showOverview();
  });

  return { init };

})();

document.addEventListener('DOMContentLoaded', GenrePage.init);
