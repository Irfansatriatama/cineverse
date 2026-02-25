/**
 * CineVerse — movie-detail.js
 * Halaman Detail Film: load data, trailer, watchlist, rating & review
 */

const MovieDetailPage = (() => {

  let movie = null;
  let allMovies = [];
  let currentUser = null;
  let selectedRating = 0;

  /* ─── INIT ─── */
  async function init() {
    // Hide page loader
    setTimeout(() => {
      const loader = document.getElementById('page-loader');
      if (loader) loader.style.display = 'none';
    }, 250);

    currentUser = window.CineStorage?.User?.getCurrent() || null;

    // Get movie id from URL ?id=m001
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get('id');

    if (!movieId) {
      show404();
      return;
    }

    try {
      const resp = await fetch('../data/movies.json');
      const data = await resp.json();
      allMovies = data.movies || [];
      movie = allMovies.find(m => m.id === movieId);

      if (!movie) {
        show404();
        return;
      }

      renderMovie();
      renderRelated();
      renderReviews();
      initReviewForm();

    } catch (err) {
      console.error('[MovieDetail] Error loading movie:', err);
      show404();
    }

    // Reveal animations
    setTimeout(() => forceReveal(), 600);
  }

  /* ─── RENDER MOVIE ─── */
  function renderMovie() {
    // Hide skeleton, show layout
    const skeleton = document.getElementById('md-skeleton');
    const layout = document.getElementById('md-layout');
    if (skeleton) skeleton.style.display = 'none';
    if (layout) layout.style.display = 'grid';

    // Backdrop
    const backdrop = document.getElementById('md-backdrop');
    if (backdrop && movie.backdropUrl) {
      backdrop.style.backgroundImage = `url('${movie.backdropUrl}')`;
    }

    // Poster
    const poster = document.getElementById('md-poster');
    if (poster) {
      poster.src = movie.posterUrl || '../assets/images/poster-placeholder.svg';
      poster.alt = `Poster ${movie.title}`;
      poster.onerror = function() {
        this.src = '../assets/images/poster-placeholder.svg';
      };
    }

    // Age badge
    const ageBadge = document.getElementById('md-age-badge');
    if (ageBadge) ageBadge.textContent = movie.age_rating || '';

    // Title
    const titleEl = document.getElementById('md-title');
    if (titleEl) titleEl.textContent = movie.title;

    // Original title
    const origEl = document.getElementById('md-original-title');
    if (origEl) {
      if (movie.originalTitle && movie.originalTitle !== movie.title) {
        origEl.textContent = movie.originalTitle;
      } else {
        origEl.style.display = 'none';
      }
    }

    // Breadcrumb title
    const bcTitle = document.getElementById('md-breadcrumb-title');
    if (bcTitle) bcTitle.textContent = movie.title;

    // Page title
    document.title = `${movie.title} — CineVerse`;

    // Meta: rating chip
    const ratingChip = document.getElementById('md-rating-chip');
    const ratingNum = document.getElementById('md-rating-num');
    if (ratingNum) ratingNum.textContent = movie.rating?.toFixed(1) || '—';

    // Meta items
    setText('md-year-chip', movie.year || '—');
    setText('md-duration-chip', movie.duration ? formatDuration(movie.duration) : '—');
    setText('md-country-chip', movie.country || '—');

    // Quick stats
    setText('md-stat-rating', movie.rating ? `${movie.rating.toFixed(1)} / 10` : '—');
    setText('md-stat-duration', movie.duration ? formatDuration(movie.duration) : '—');
    setText('md-stat-year', movie.year || '—');
    setText('md-stat-language', movie.language === 'id' ? 'Indonesia' : movie.language === 'en' ? 'English' : (movie.language || '—'));

    // Genres
    const genresRow = document.getElementById('md-genres-row');
    if (genresRow && movie.genres) {
      genresRow.innerHTML = movie.genres.map(g =>
        `<a href="genre.html?g=${encodeURIComponent(g)}" class="md-genre-badge">${g}</a>`
      ).join('');
    }

    // Synopsis
    setText('md-synopsis', movie.synopsis || 'Sinopsis tidak tersedia.');

    // Director
    setText('md-director', movie.director || 'Tidak diketahui');

    // Cast
    const castEl = document.getElementById('md-cast-list');
    if (castEl && movie.cast) {
      castEl.innerHTML = movie.cast.map(name =>
        `<span class="md-cast-chip">${name}</span>`
      ).join('');
    }

    // Tags
    const tagsRow = document.getElementById('md-tags-row');
    const tagsSection = document.getElementById('md-tags-section');
    if (tagsRow && movie.tags && movie.tags.length) {
      tagsRow.innerHTML = movie.tags.map(t =>
        `<span class="md-tag">#${t}</span>`
      ).join('');
    } else if (tagsSection) {
      tagsSection.style.display = 'none';
    }

    // Watch button
    const watchBtn = document.getElementById('md-btn-watch');
    if (watchBtn) {
      watchBtn.href = `watch.html?id=${movie.id}`;
    }

    // Trailer button
    const trailerBtn = document.getElementById('md-btn-trailer');
    if (trailerBtn) {
      if (movie.trailerKey) {
        trailerBtn.addEventListener('click', openTrailer);
      } else {
        trailerBtn.style.display = 'none';
      }
    }

    // Watchlist button
    renderWatchlistBtn();
    const wlBtn = document.getElementById('md-btn-watchlist');
    if (wlBtn) {
      wlBtn.addEventListener('click', toggleWatchlist);
    }
  }

  /* ─── WATCHLIST ─── */
  function renderWatchlistBtn() {
    const btn = document.getElementById('md-btn-watchlist');
    const label = document.getElementById('md-watchlist-label');
    const icon = document.getElementById('md-watchlist-icon');
    if (!btn || !label) return;

    if (!currentUser) {
      btn.dataset.requiresAuth = 'true';
      return;
    }

    const inList = window.CineStorage?.Watchlist?.has(currentUser.id, movie.id);
    btn.classList.toggle('in-watchlist', inList);
    label.textContent = inList ? 'Hapus dari Watchlist' : 'Tambah ke Watchlist';
    if (icon) {
      icon.setAttribute('fill', inList ? 'currentColor' : 'none');
    }
  }

  function toggleWatchlist() {
    if (!currentUser) {
      window.CineToast?.show('Masuk terlebih dahulu untuk menambah ke watchlist', 'info');
      setTimeout(() => { window.location.href = 'auth/login.html'; }, 1200);
      return;
    }
    const added = window.CineStorage?.Watchlist?.toggle(currentUser.id, movie.id);
    renderWatchlistBtn();
    window.CineToast?.show(
      added ? `"${movie.title}" ditambahkan ke Watchlist` : `"${movie.title}" dihapus dari Watchlist`,
      added ? 'success' : 'info'
    );
    // Heartbeat animation
    if (added && window.CineTransitions?.heartbeat) {
      window.CineTransitions.heartbeat(document.getElementById('md-btn-watchlist'));
    }
  }

  /* ─── TRAILER ─── */
  let trailerListenersBound = false;

  function initTrailerListeners() {
    if (trailerListenersBound) return;
    trailerListenersBound = true;

    const backdrop = document.getElementById('md-trailer-backdrop');
    const closeBtn = document.getElementById('md-trailer-close');
    if (backdrop) backdrop.addEventListener('click', closeTrailer);
    if (closeBtn) closeBtn.addEventListener('click', closeTrailer);
    document.addEventListener('keydown', onKeyClose);
  }

  function openTrailer() {
    const modal = document.getElementById('md-trailer-modal');
    const iframe = document.getElementById('md-trailer-iframe');
    if (!modal || !iframe || !movie?.trailerKey) return;

    initTrailerListeners();

    // Tampilkan modal dulu, baru set src iframe agar browser render iframe dalam konteks visible
    modal.style.display = 'flex';
    // Force reflow sebelum add class agar animasi berjalan
    void modal.offsetWidth;
    modal.classList.remove('is-closing');
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    // Set iframe src setelah layout ter-paint agar video ter-render dengan benar
    // Gunakan double rAF untuk memastikan browser sudah selesai layout + paint
    const origin = window.location.origin !== 'null' ? window.location.origin : '';
    const originParam = origin ? `&origin=${encodeURIComponent(origin)}` : '';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        iframe.src = `https://www.youtube.com/embed/${movie.trailerKey}?autoplay=1&rel=0&enablejsapi=1${originParam}`;
      });
    });
  }

  function closeTrailer() {
    const modal = document.getElementById('md-trailer-modal');
    const iframe = document.getElementById('md-trailer-iframe');
    if (!modal || modal.style.display === 'none') return;

    modal.classList.remove('is-open');
    modal.classList.add('is-closing');
    setTimeout(() => {
      modal.style.display = 'none';
      modal.classList.remove('is-closing');
      if (iframe) iframe.src = '';
      document.body.style.overflow = '';
    }, 200);
  }

  function onKeyClose(e) {
    if (e.key === 'Escape') closeTrailer();
  }

  /* ─── RELATED MOVIES ─── */
  function renderRelated() {
    const row = document.getElementById('md-related-row');
    if (!row) return;

    const related = allMovies
      .filter(m => m.id !== movie.id && m.genres?.some(g => movie.genres?.includes(g)))
      .slice(0, 8);

    if (!related.length) {
      document.getElementById('md-related-section').style.display = 'none';
      return;
    }

    row.innerHTML = related.map(m => renderMovieCard(m)).join('');
    initCardWatchlist(row);
  }

  /* ─── RATING & REVIEWS ─── */
  function renderReviews() {
    if (!movie) return;

    const reviews = window.CineStorage?.Review?.getAll(movie.id) || [];
    renderRatingSummary(reviews);
    renderReviewList(reviews);
  }

  function renderRatingSummary(reviews) {
    const bigEl = document.getElementById('md-rating-big');
    const starsEl = document.getElementById('md-avg-stars');
    const votesEl = document.getElementById('md-rating-votes');

    if (!reviews.length) {
      if (bigEl) bigEl.textContent = '—';
      if (starsEl) starsEl.innerHTML = renderStars(0);
      if (votesEl) votesEl.textContent = 'Belum ada ulasan';
      return;
    }

    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    if (bigEl) bigEl.textContent = avg.toFixed(1);
    if (starsEl) starsEl.innerHTML = renderStars(avg);
    if (votesEl) votesEl.textContent = `${reviews.length} ulasan`;
  }

  function renderReviewList(reviews) {
    const list = document.getElementById('md-review-list');
    if (!list) return;

    if (!reviews.length) {
      list.innerHTML = `
        <div class="md-reviews-empty">
          <div class="md-reviews-empty__icon">💬</div>
          <p>Belum ada ulasan. Jadilah yang pertama memberikan ulasan!</p>
        </div>`;
      return;
    }

    const users = window.CineStorage?.User?.getAll() || [];
    list.innerHTML = reviews.map(r => {
      const user = users.find(u => u.id === r.userId);
      const name = user?.displayName || user?.name || 'Pengguna';
      const initial = name.charAt(0).toUpperCase();
      const isMine = currentUser && r.userId === currentUser.id;
      const dateStr = r.createdAt ? new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
      return `
        <div class="md-review-card ${isMine ? 'md-review-card--mine' : ''}" data-user-id="${r.userId}">
          <div class="md-review-card__header">
            <div class="md-review-card__avatar">${initial}</div>
            <div class="md-review-card__meta">
              <div class="md-review-card__name">${name}${isMine ? ' <span style="font-size:11px;color:var(--color-crimson);">(Kamu)</span>' : ''}</div>
              <div class="md-review-card__date">${dateStr}</div>
            </div>
            <div class="md-review-card__stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
          </div>
          ${r.text ? `<p class="md-review-card__text">${escapeHtml(r.text)}</p>` : ''}
        </div>`;
    }).join('');
  }

  /* ─── REVIEW FORM ─── */
  function initReviewForm() {
    const formWrap = document.getElementById('md-review-form-wrap');
    const loginPrompt = document.getElementById('md-login-prompt');
    const formTitle = document.getElementById('md-review-form-title');
    const starPicker = document.getElementById('md-star-picker');
    const textarea = document.getElementById('md-review-textarea');
    const charCount = document.getElementById('md-review-char-count');
    const submitBtn = document.getElementById('md-submit-review');

    if (!currentUser) {
      // Show login prompt, hide form
      if (formTitle) formTitle.style.display = 'none';
      if (starPicker) starPicker.style.display = 'none';
      if (textarea) textarea.style.display = 'none';
      if (submitBtn) submitBtn.style.display = 'none';
      if (document.querySelector('.md-review-form__actions')) document.querySelector('.md-review-form__actions').style.display = 'none';
      if (loginPrompt) loginPrompt.style.display = 'block';
      return;
    }

    // Load existing review if any
    const existingReview = window.CineStorage?.Review?.getUserReview(movie.id, currentUser.id);
    if (existingReview) {
      selectedRating = existingReview.rating;
      if (textarea) textarea.value = existingReview.text || '';
      if (charCount) charCount.textContent = (existingReview.text || '').length;
      if (formTitle) formTitle.textContent = 'Edit Ulasanmu';
      updateStarDisplay();
    }

    // Star picker interaction
    if (starPicker) {
      const stars = starPicker.querySelectorAll('.md-star-btn');
      stars.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
          const hoverRating = parseInt(btn.dataset.rating);
          stars.forEach((s, i) => s.classList.toggle('hovered', i < hoverRating));
        });
        btn.addEventListener('mouseleave', () => {
          stars.forEach(s => s.classList.remove('hovered'));
        });
        btn.addEventListener('click', () => {
          selectedRating = parseInt(btn.dataset.rating);
          updateStarDisplay();
        });
      });
    }

    // Char counter
    if (textarea) {
      textarea.addEventListener('input', () => {
        if (charCount) charCount.textContent = textarea.value.length;
      });
    }

    // Submit
    if (submitBtn) {
      submitBtn.addEventListener('click', submitReview);
    }
  }

  function updateStarDisplay() {
    const stars = document.querySelectorAll('.md-star-btn');
    stars.forEach((btn, i) => btn.classList.toggle('active', i < selectedRating));
  }

  function submitReview() {
    if (!currentUser || !movie) return;

    if (!selectedRating) {
      window.CineToast?.show('Pilih rating bintang terlebih dahulu', 'error');
      return;
    }

    const textarea = document.getElementById('md-review-textarea');
    const text = textarea?.value?.trim() || '';

    window.CineStorage?.Review?.save(movie.id, currentUser.id, selectedRating, text);
    window.CineToast?.show('Ulasanmu berhasil disimpan! 🎉', 'success');

    renderReviews();

    const formTitle = document.getElementById('md-review-form-title');
    if (formTitle) formTitle.textContent = 'Edit Ulasanmu';
  }

  /* ─── HELPERS ─── */
  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function formatDuration(min) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h > 0 ? `${h}j ${m}m` : `${m}m`;
  }

  function renderStars(rating) {
    const full = Math.round(rating);
    return '★'.repeat(full) + '<span class="star-empty">' + '★'.repeat(5 - full) + '</span>';
  }

  function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function show404() {
    const skeleton = document.getElementById('md-skeleton');
    const layout = document.getElementById('md-layout');
    const relSection = document.getElementById('md-related-section');
    const reviewSection = document.getElementById('md-reviews-section');
    const el404 = document.getElementById('md-404');

    if (skeleton) skeleton.style.display = 'none';
    if (layout) layout.style.display = 'none';
    if (relSection) relSection.style.display = 'none';
    if (reviewSection) reviewSection.style.display = 'none';
    if (el404) el404.style.display = 'block';

    const loader = document.getElementById('page-loader');
    if (loader) loader.style.display = 'none';
  }

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

  function initCardWatchlist(container) {
    container.querySelectorAll('.movie-card__wishlist').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!currentUser) {
          window.CineToast?.show('Masuk terlebih dahulu', 'info');
          return;
        }
        const movieId = btn.dataset.movieId;
        const added = window.CineStorage?.Watchlist?.toggle(currentUser.id, movieId);
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

  /* ─── PUBLIC ─── */
  return { init };

})();

document.addEventListener('DOMContentLoaded', MovieDetailPage.init);
