/**
 * CineVerse — news.js
 * Halaman berita: load articles, filter kategori, search, sort, load more
 */

(async function () {
  'use strict';

  /* ─────────────────────────────────────────
     STATE
  ───────────────────────────────────────── */
  let allArticles = [];
  let filteredArticles = [];
  let activeCategory = 'all';
  let searchQuery = '';
  let sortOrder = 'newest';
  let page = 1;
  const PAGE_SIZE = 8;

  /* ─────────────────────────────────────────
     DOM REFS
  ───────────────────────────────────────── */
  const featuredEl       = document.getElementById('news-featured');
  const categoriesEl     = document.getElementById('news-categories');
  const gridEl           = document.getElementById('news-grid');
  const emptyEl          = document.getElementById('news-empty');
  const emptyTextEl      = document.getElementById('news-empty-text');
  const emptyResetBtn    = document.getElementById('news-empty-reset');
  const loadmoreWrap     = document.getElementById('news-loadmore');
  const loadmoreBtn      = document.getElementById('news-loadmore-btn');
  const searchInput      = document.getElementById('news-search-input');
  const searchClearBtn   = document.getElementById('news-search-clear');
  const searchInfoEl     = document.getElementById('news-search-info');
  const searchInfoTextEl = document.getElementById('news-search-info-text');
  const searchInfoClear  = document.getElementById('news-search-info-clear');
  const sectionTitleEl   = document.getElementById('news-section-title');
  const sortSelect       = document.getElementById('news-sort-select');

  /* ─────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────── */
  function escHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatDate(dateStr) {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  }

  function getCatClass(cat) {
    const map = {
      'Box Office':   'cat--box-office',
      'Berita Film':  'cat--berita-film',
      'Review':       'cat--review',
      'Penghargaan':  'cat--penghargaan',
      'Listicle':     'cat--listicle',
      'Analisis':     'cat--analisis',
      'Trailer':      'cat--trailer',
      'Tips':         'cat--tips',
      'Rekomendasi':  'cat--rekomendasi',
    };
    return map[cat] || 'cat--default';
  }

  function getBasePath() {
    return window.CineRouter ? CineRouter.getRootPath() : '../';
  }

  function buildNewsDetailUrl(article) {
    const base = getBasePath();
    return `${base}pages/news-detail.html?id=${encodeURIComponent(article.id)}`;
  }

  /* ─────────────────────────────────────────
     LOAD DATA
  ───────────────────────────────────────── */
  async function loadArticles() {
    const base = getBasePath();
    const resp = await fetch(`${base}data/news.json`);
    if (!resp.ok) throw new Error('Failed to load news.json');
    const data = await resp.json();
    return data.articles || [];
  }

  /* ─────────────────────────────────────────
     CATEGORY CHIPS
  ───────────────────────────────────────── */
  function buildCategoryChips(articles) {
    const cats = ['all', ...new Set(articles.map(a => a.category))];

    // Clear existing except 'Semua'
    const existing = categoriesEl.querySelectorAll('.news-cat-chip');
    existing.forEach(c => c.remove());

    cats.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'news-cat-chip' + (cat === 'all' ? ' active' : '');
      btn.dataset.cat = cat;
      btn.textContent = cat === 'all' ? 'Semua' : cat;

      // Add count badge
      const count = cat === 'all' ? articles.length : articles.filter(a => a.category === cat).length;
      const badge = document.createElement('span');
      badge.style.cssText = 'margin-left:4px;font-size:0.65rem;opacity:0.7;';
      badge.textContent = `(${count})`;
      btn.appendChild(badge);

      btn.addEventListener('click', () => {
        activeCategory = cat;
        categoriesEl.querySelectorAll('.news-cat-chip').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        page = 1;
        applyFilters();
      });
      categoriesEl.appendChild(btn);
    });
  }

  /* ─────────────────────────────────────────
     FILTER & SORT
  ───────────────────────────────────────── */
  function applyFilters() {
    let articles = [...allArticles];

    // Category filter
    if (activeCategory !== 'all') {
      articles = articles.filter(a => a.category === activeCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      articles = articles.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        (a.tags && a.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    // Sort
    switch (sortOrder) {
      case 'newest':
        articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        break;
      case 'oldest':
        articles.sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt));
        break;
      case 'readtime-asc':
        articles.sort((a, b) => (a.readTime || 0) - (b.readTime || 0));
        break;
      case 'readtime-desc':
        articles.sort((a, b) => (b.readTime || 0) - (a.readTime || 0));
        break;
    }

    filteredArticles = articles;
    updateSearchInfo();
    updateSectionTitle();
    renderGrid();
  }

  function updateSearchInfo() {
    const hasSearch = searchQuery.trim().length > 0;
    const hasCat = activeCategory !== 'all';

    if (hasSearch || hasCat) {
      searchInfoEl.style.display = 'flex';
      let msg = '';
      if (hasSearch && hasCat) {
        msg = `Menampilkan ${filteredArticles.length} artikel untuk "<strong>${escHtml(searchQuery)}</strong>" dalam kategori <strong>${escHtml(activeCategory)}</strong>`;
      } else if (hasSearch) {
        msg = `Menampilkan ${filteredArticles.length} artikel untuk "<strong>${escHtml(searchQuery)}</strong>"`;
      } else {
        msg = `Menampilkan ${filteredArticles.length} artikel dalam kategori <strong>${escHtml(activeCategory)}</strong>`;
      }
      searchInfoTextEl.innerHTML = msg;
    } else {
      searchInfoEl.style.display = 'none';
    }
  }

  function updateSectionTitle() {
    if (activeCategory !== 'all') {
      sectionTitleEl.textContent = activeCategory;
    } else if (searchQuery.trim()) {
      sectionTitleEl.textContent = 'Hasil Pencarian';
    } else {
      sectionTitleEl.textContent = 'Semua Artikel';
    }
  }

  /* ─────────────────────────────────────────
     RENDER FEATURED
  ───────────────────────────────────────── */
  function renderFeatured(articles) {
    const featured = articles.find(a => a.featured) || articles[0];
    if (!featured) { featuredEl.style.display = 'none'; return; }

    featuredEl.innerHTML = `
      <a href="${buildNewsDetailUrl(featured)}" class="news-featured-card" aria-label="${escHtml(featured.title)}">
        <div class="news-featured-card__img-wrap">
          <img
            src="${escHtml(featured.imageUrl)}"
            alt="${escHtml(featured.title)}"
            class="news-featured-card__img"
            loading="eager"
            onerror="this.src='../assets/images/poster-placeholder.svg'"
          />
        </div>
        <div class="news-featured-card__body">
          <div class="news-featured-badge">
            <span class="news-featured-badge__dot"></span>
            Artikel Unggulan
          </div>
          <span class="news-cat-chip news-featured-card__cat ${getCatClass(featured.category)}" style="pointer-events:none;border:none;">${escHtml(featured.category)}</span>
          <h2 class="news-featured-card__title">${escHtml(featured.title)}</h2>
          <p class="news-featured-card__excerpt">${escHtml(featured.excerpt)}</p>
          <div class="news-featured-card__meta">
            <span class="news-featured-card__author">${escHtml(featured.author)}</span>
            <span class="news-featured-card__sep"></span>
            <span class="news-featured-card__date">${formatDate(featured.publishedAt)}</span>
            <span class="news-featured-card__read">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${featured.readTime} mnt baca
            </span>
          </div>
          <span class="news-read-more">
            Baca Selengkapnya
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </span>
        </div>
      </a>
    `;
  }

  /* ─────────────────────────────────────────
     RENDER GRID
  ───────────────────────────────────────── */
  function renderGrid(append = false) {
    const start = append ? page * PAGE_SIZE : 0;
    const end   = (page) * PAGE_SIZE;
    const slice = filteredArticles.slice(start, end);

    if (!append) {
      gridEl.innerHTML = '';
      page = 1;
    }

    if (filteredArticles.length === 0) {
      gridEl.innerHTML = '';
      emptyEl.style.display = 'flex';
      loadmoreWrap.style.display = 'none';
      emptyTextEl.textContent = searchQuery
        ? `Tidak ada artikel untuk "${searchQuery}".`
        : 'Tidak ada artikel dalam kategori ini.';
      return;
    }

    emptyEl.style.display = 'none';

    slice.forEach((article, i) => {
      const card = buildArticleCard(article, i);
      gridEl.appendChild(card);
    });

    // Load more button
    if (filteredArticles.length > page * PAGE_SIZE) {
      loadmoreWrap.style.display = 'flex';
    } else {
      loadmoreWrap.style.display = 'none';
    }
  }

  function buildArticleCard(article, idx) {
    const a = document.createElement('a');
    a.className = 'news-card';
    a.href = buildNewsDetailUrl(article);
    a.setAttribute('aria-label', article.title);
    a.style.animationDelay = `${idx * 60}ms`;

    a.innerHTML = `
      <div class="news-card__img-wrap">
        <img
          src="${escHtml(article.imageUrl)}"
          alt="${escHtml(article.title)}"
          class="news-card__img"
          loading="lazy"
          onerror="this.src='../assets/images/poster-placeholder.svg'"
        />
        <span class="news-card__cat-badge ${getCatClass(article.category)}">${escHtml(article.category)}</span>
      </div>
      <div class="news-card__body">
        <h3 class="news-card__title">${escHtml(article.title)}</h3>
        <p class="news-card__excerpt">${escHtml(article.excerpt)}</p>
        <div class="news-card__footer">
          <span class="news-card__date">${formatDate(article.publishedAt)}</span>
          <span class="news-card__readtime">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${article.readTime} mnt
          </span>
        </div>
      </div>
    `;

    return a;
  }

  /* ─────────────────────────────────────────
     EVENTS
  ───────────────────────────────────────── */
  let searchDebounce = null;
  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value;
    searchClearBtn.style.display = searchQuery ? 'flex' : 'none';
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      page = 1;
      applyFilters();
    }, 300);
  });

  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    searchClearBtn.style.display = 'none';
    page = 1;
    applyFilters();
    searchInput.focus();
  });

  searchInfoClear.addEventListener('click', () => {
    // Reset both search and category
    searchInput.value = '';
    searchQuery = '';
    searchClearBtn.style.display = 'none';
    activeCategory = 'all';
    categoriesEl.querySelectorAll('.news-cat-chip').forEach(c => {
      c.classList.toggle('active', c.dataset.cat === 'all');
    });
    page = 1;
    applyFilters();
  });

  sortSelect.addEventListener('change', () => {
    sortOrder = sortSelect.value;
    page = 1;
    applyFilters();
  });

  loadmoreBtn.addEventListener('click', () => {
    page++;
    const start = (page - 1) * PAGE_SIZE;
    const end   = page * PAGE_SIZE;
    const slice = filteredArticles.slice(start, end);

    slice.forEach((article, i) => {
      const card = buildArticleCard(article, i);
      gridEl.appendChild(card);
    });

    if (filteredArticles.length > page * PAGE_SIZE) {
      loadmoreWrap.style.display = 'flex';
    } else {
      loadmoreWrap.style.display = 'none';
    }
  });

  emptyResetBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    searchClearBtn.style.display = 'none';
    activeCategory = 'all';
    categoriesEl.querySelectorAll('.news-cat-chip').forEach(c => {
      c.classList.toggle('active', c.dataset.cat === 'all');
    });
    page = 1;
    applyFilters();
  });

  // Keyboard shortcut: Ctrl/Cmd+K to focus search
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
  });

  /* ─────────────────────────────────────────
     INIT
  ───────────────────────────────────────── */
  try {
    allArticles = await loadArticles();

    // Sort by newest by default
    allArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    // Build category chips
    buildCategoryChips(allArticles);

    // Render featured article
    renderFeatured(allArticles);

    // Initial render
    filteredArticles = [...allArticles];
    renderGrid();

  } catch (err) {
    console.error('[news.js] Failed to load articles:', err);
    featuredEl.innerHTML = '';
    gridEl.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--color-text-muted);">
        <p>Gagal memuat artikel. Pastikan server lokal berjalan.</p>
      </div>
    `;
  }

})();
