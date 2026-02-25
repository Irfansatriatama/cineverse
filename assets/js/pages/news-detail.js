/**
 * CineVerse — news-detail.js
 * Halaman detail artikel: full body, reading progress bar,
 * author info, estimasi baca, related articles, share ke clipboard
 */

(async function () {
  'use strict';

  /* ─────────────────────────────────────────
     DOM REFS
  ───────────────────────────────────────── */
  const progressBarEl     = document.getElementById('nd-progress-bar');
  const progressFillEl    = document.getElementById('nd-progress-fill');
  const progressPctEl     = document.getElementById('nd-progress-pct');
  const skeletonEl        = document.getElementById('nd-skeleton');
  const articleInnerEl    = document.getElementById('nd-article-inner');
  const errorEl           = document.getElementById('nd-error');
  const breadcrumbCatEl   = document.getElementById('nd-breadcrumb-cat');
  const catEl             = document.getElementById('nd-cat');
  const titleEl           = document.getElementById('nd-title');
  const authorAvatarEl    = document.getElementById('nd-author-avatar');
  const authorEl          = document.getElementById('nd-author');
  const dateEl            = document.getElementById('nd-date');
  const readtimeEl        = document.getElementById('nd-readtime');
  const heroImgEl         = document.getElementById('nd-hero-img');
  const tagsEl            = document.getElementById('nd-tags');
  const bodyEl            = document.getElementById('nd-body');
  const relatedListEl     = document.getElementById('nd-related-list');
  const shareBtn          = document.getElementById('nd-share-btn');
  const shareBtnFooter    = document.getElementById('nd-share-btn-footer');

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
      'Box Office':  'cat--box-office',
      'Berita Film': 'cat--berita-film',
      'Review':      'cat--review',
      'Penghargaan': 'cat--penghargaan',
      'Listicle':    'cat--listicle',
      'Analisis':    'cat--analisis',
      'Trailer':     'cat--trailer',
      'Tips':        'cat--tips',
      'Rekomendasi': 'cat--rekomendasi',
    };
    return map[cat] || 'cat--default';
  }

  function getBasePath() {
    return window.CineRouter ? CineRouter.getRootPath() : '../';
  }

  function buildDetailUrl(article) {
    const base = getBasePath();
    return `${base}pages/news-detail.html?id=${encodeURIComponent(article.id)}`;
  }

  /**
   * Parse article body: handle numbered list format "N. Title — desc" and plain paragraphs.
   * Converts newline-separated text into rendered HTML.
   */
  function parseBody(bodyText) {
    if (!bodyText) return '<p>Konten tidak tersedia.</p>';

    const lines = bodyText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const html = [];
    let inOl = false;

    lines.forEach(line => {
      // Numbered list item: "1. Something" or "1. **Title** — desc"
      const listMatch = line.match(/^(\d+)\.\s+(.+)$/);
      if (listMatch) {
        if (!inOl) { html.push('<ol>'); inOl = true; }
        // Bold the part before " — " if present
        let content = escHtml(listMatch[2]).replace(
          /^([^—]+) — (.+)$/,
          '<strong>$1</strong> — $2'
        );
        html.push(`<li>${content}</li>`);
      } else {
        if (inOl) { html.push('</ol>'); inOl = false; }
        html.push(`<p>${escHtml(line)}</p>`);
      }
    });

    if (inOl) html.push('</ol>');
    return html.join('\n');
  }

  /* ─────────────────────────────────────────
     READING PROGRESS
  ───────────────────────────────────────── */
  function setupReadingProgress() {
    function updateProgress() {
      const scrollTop    = window.scrollY;
      const docHeight    = document.documentElement.scrollHeight;
      const winHeight    = window.innerHeight;
      const scrollable   = docHeight - winHeight;
      if (scrollable <= 0) return;

      const pct = Math.min(100, Math.round((scrollTop / scrollable) * 100));

      // Top progress bar
      progressBarEl.style.width = pct + '%';
      progressBarEl.setAttribute('aria-valuenow', pct);

      // Sidebar widget
      if (progressFillEl) progressFillEl.style.width = pct + '%';
      if (progressPctEl)  progressPctEl.textContent = pct + '%';
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress(); // initial
  }

  /* ─────────────────────────────────────────
     SHARE TO CLIPBOARD
  ───────────────────────────────────────── */
  function setupShare() {
    async function copyLink(btn) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        const original = btn.innerHTML;
        btn.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Tersalin!
        `;
        btn.style.background = 'var(--color-emerald)';
        btn.style.borderColor = 'var(--color-emerald)';
        btn.style.color = '#fff';
        setTimeout(() => {
          btn.innerHTML = original;
          btn.style.background = '';
          btn.style.borderColor = '';
          btn.style.color = '';
        }, 2000);
      } catch {
        // Fallback: select + copy
        const tmp = document.createElement('input');
        tmp.value = window.location.href;
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand('copy');
        document.body.removeChild(tmp);
        if (window.CineToast) CineToast.show('Link disalin!', 'success');
      }
    }

    if (shareBtn)       shareBtn.addEventListener('click', () => copyLink(shareBtn));
    if (shareBtnFooter) shareBtnFooter.addEventListener('click', () => copyLink(shareBtnFooter));
  }

  /* ─────────────────────────────────────────
     RENDER ARTICLE
  ───────────────────────────────────────── */
  function renderArticle(article) {
    // Page title
    document.title = `${article.title} — CineVerse`;

    // Breadcrumb category
    if (breadcrumbCatEl) breadcrumbCatEl.textContent = article.category;

    // Category badge
    catEl.textContent = article.category;
    catEl.className = `nd-article__cat ${getCatClass(article.category)}`;

    // Title
    titleEl.textContent = article.title;

    // Author avatar (first letter)
    const initial = (article.author || 'A').charAt(0).toUpperCase();
    authorAvatarEl.textContent = initial;

    // Author & date
    authorEl.textContent = article.author || 'CineVerse';
    dateEl.textContent   = formatDate(article.publishedAt);

    // Read time
    const rt = article.readTime || 5;
    readtimeEl.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      ${rt} menit baca
    `;

    // Hero image
    heroImgEl.src = article.imageUrl || '';
    heroImgEl.alt = article.title;

    // Tags
    if (article.tags && article.tags.length > 0) {
      tagsEl.innerHTML = article.tags
        .map(t => `<span class="nd-tag">#${escHtml(t)}</span>`)
        .join('');
    } else {
      tagsEl.style.display = 'none';
    }

    // Body
    bodyEl.innerHTML = parseBody(article.body || article.excerpt);

    // Show article, hide skeleton
    skeletonEl.style.display = 'none';
    articleInnerEl.style.display = '';
  }

  /* ─────────────────────────────────────────
     RENDER RELATED ARTICLES
  ───────────────────────────────────────── */
  function renderRelated(allArticles, currentId) {
    // Filter out current article, prefer same category
    const current = allArticles.find(a => a.id === currentId);
    const others  = allArticles.filter(a => a.id !== currentId);

    // Sort: same category first, then by date
    const related = others.sort((a, b) => {
      const aSameCat = current && a.category === current.category ? 1 : 0;
      const bSameCat = current && b.category === current.category ? 1 : 0;
      if (bSameCat !== aSameCat) return bSameCat - aSameCat;
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    }).slice(0, 4);

    if (related.length === 0) {
      relatedListEl.innerHTML = '<p style="font-size:var(--font-size-sm);color:var(--color-text-muted);">Tidak ada artikel terkait.</p>';
      return;
    }

    relatedListEl.innerHTML = related.map(article => `
      <a href="${buildDetailUrl(article)}" class="nd-related-card" aria-label="${escHtml(article.title)}">
        <div class="nd-related-card__img-wrap">
          <img
            src="${escHtml(article.imageUrl)}"
            alt="${escHtml(article.title)}"
            class="nd-related-card__img"
            loading="lazy"
            onerror="this.src='../assets/images/poster-placeholder.svg'"
          />
        </div>
        <div class="nd-related-card__body">
          <span class="nd-related-card__cat">${escHtml(article.category)}</span>
          <span class="nd-related-card__title">${escHtml(article.title)}</span>
          <span class="nd-related-card__meta">${formatDate(article.publishedAt)} · ${article.readTime} mnt</span>
        </div>
      </a>
    `).join('');
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
     SHOW ERROR STATE
  ───────────────────────────────────────── */
  function showError() {
    skeletonEl.style.display = 'none';
    articleInnerEl.style.display = 'none';
    errorEl.style.display = 'flex';
  }

  /* ─────────────────────────────────────────
     INIT
  ───────────────────────────────────────── */
  try {
    // Get article id from URL param
    const articleId = window.CineRouter
      ? CineRouter.getParam('id')
      : new URLSearchParams(window.location.search).get('id');

    if (!articleId) {
      showError();
      return;
    }

    // Load all articles
    const allArticles = await loadArticles();
    const article = allArticles.find(a => a.id === articleId || a.slug === articleId);

    if (!article) {
      showError();
      return;
    }

    // Render article content
    renderArticle(article);

    // Render related articles
    renderRelated(allArticles, article.id);

    // Setup reading progress tracking
    setupReadingProgress();

    // Setup share buttons
    setupShare();

  } catch (err) {
    console.error('[news-detail.js] Error:', err);
    showError();
  }

})();
