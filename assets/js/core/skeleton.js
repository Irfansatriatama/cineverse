/**
 * CineVerse — skeleton.js
 * Phase 2.3: Skeleton loading system
 * Renders shimmer placeholders while content loads, then swaps with real content.
 *
 * Usage:
 *   CineSkeleton.showHero()          — show hero skeleton
 *   CineSkeleton.showMovieRow(el, n) — show n skeleton cards in row
 *   CineSkeleton.showTop10(el)       — show top10 skeletons
 *   CineSkeleton.showGrid(el, n)     — show grid skeletons
 *   CineSkeleton.clear(el)           — clear skeleton and animate content
 */

const CineSkeleton = (() => {
  'use strict';

  /* ─────────────────────────────────────────
     HERO SKELETON
  ───────────────────────────────────────── */
  function showHero(heroEl) {
    if (!heroEl) return;
    // Hide nav buttons while skeleton shows
    heroEl.querySelectorAll('.db-hero__nav').forEach(btn => {
      btn.style.visibility = 'hidden';
    });

    const sk = document.createElement('div');
    sk.className = 'skeleton skeleton-hero skeleton-placeholder';
    heroEl.prepend(sk);
  }

  function clearHero(heroEl) {
    if (!heroEl) return;
    heroEl.querySelectorAll('.skeleton-placeholder').forEach(el => el.remove());
    heroEl.querySelectorAll('.db-hero__nav').forEach(btn => {
      btn.style.visibility = '';
    });

    // Animate first slide in
    const firstSlide = heroEl.querySelector('.db-hero__slide.active');
    if (firstSlide) {
      firstSlide.style.animation = 'fadeIn 0.6s ease forwards';
    }
  }

  /* ─────────────────────────────────────────
     MOVIE ROW SKELETON
  ───────────────────────────────────────── */
  function showMovieRow(rowEl, count = 8) {
    if (!rowEl) return;
    rowEl.innerHTML = buildMovieRowSkeleton(count);
  }

  function buildMovieRowSkeleton(count) {
    return Array.from({ length: count }, () => `
      <div class="skeleton-movie-card">
        <div class="skeleton skeleton-poster"></div>
        <div class="skeleton skeleton-title" style="margin-top:6px;"></div>
        <div class="skeleton skeleton-subtitle"></div>
      </div>
    `).join('');
  }

  /* ─────────────────────────────────────────
     TOP 10 SKELETON
  ───────────────────────────────────────── */
  function showTop10(rowEl, count = 10) {
    if (!rowEl) return;
    rowEl.innerHTML = Array.from({ length: count }, (_, i) => `
      <div class="skeleton-top10-card">
        <div class="skeleton skeleton-top10-poster"></div>
      </div>
    `).join('');
  }

  /* ─────────────────────────────────────────
     GENRE CHIPS SKELETON
  ───────────────────────────────────────── */
  function showGenreChips(el) {
    if (!el) return;
    const widths = [70, 90, 80, 110, 75, 95, 85, 100, 70, 90];
    el.innerHTML = widths.map(w => `
      <div class="skeleton skeleton-chip" style="width:${w}px;"></div>
    `).join('');
  }

  /* ─────────────────────────────────────────
     WELCOME BANNER SKELETON
  ───────────────────────────────────────── */
  function showWelcome(containerEl) {
    if (!containerEl) return;
    const sk = document.createElement('div');
    sk.className = 'skeleton-welcome skeleton-placeholder';
    sk.innerHTML = `
      <div class="skeleton skeleton-welcome-avatar"></div>
      <div class="skeleton-welcome-text">
        <div class="skeleton skeleton-welcome-title"></div>
        <div class="skeleton skeleton-welcome-sub"></div>
      </div>
    `;
    containerEl.insertBefore(sk, containerEl.firstChild);
  }

  /* ─────────────────────────────────────────
     ALL MOVIES GRID SKELETON
  ───────────────────────────────────────── */
  function showGrid(gridEl, count = 12) {
    if (!gridEl) return;
    gridEl.innerHTML = Array.from({ length: count }, () => `
      <div class="skeleton-grid-card">
        <div class="skeleton skeleton-poster"></div>
        <div class="skeleton skeleton-title" style="margin-top:8px;"></div>
        <div class="skeleton skeleton-subtitle"></div>
      </div>
    `).join('');
  }

  /* ─────────────────────────────────────────
     SECTION TITLE SKELETON
  ───────────────────────────────────────── */
  function showSectionTitle(el, width = 180) {
    if (!el) return;
    el.innerHTML = `<div class="skeleton skeleton-section-title" style="width:${width}px;"></div>`;
  }

  /* ─────────────────────────────────────────
     CLEAR AND REVEAL
     Remove skeleton, animate real content in
  ───────────────────────────────────────── */
  function clearRow(rowEl, delay = 0) {
    if (!rowEl) return;
    // Remove skeleton items
    rowEl.querySelectorAll('.skeleton-movie-card, .skeleton-top10-card, .skeleton-grid-card, .skeleton-chip').forEach(el => el.remove());

    // Animate real cards
    if (window.CineTransitions) {
      CineTransitions.animateCards(rowEl, delay);
    }
  }

  function clearGrid(gridEl) {
    if (!gridEl) return;
    gridEl.querySelectorAll('.skeleton-grid-card').forEach(el => el.remove());
    if (window.CineTransitions) {
      CineTransitions.animateCards(gridEl, 0);
    }
  }

  function clearSection(el) {
    if (!el) return;
    el.querySelectorAll('.skeleton-placeholder').forEach(s => s.remove());
  }

  /* ─────────────────────────────────────────
     FULL DASHBOARD SKELETON SETUP
     Call this before data loads
  ───────────────────────────────────────── */
  function initDashboard() {
    // Welcome banner
    const welcomeContainer = document.querySelector('.container');
    if (welcomeContainer) {
      showWelcome(welcomeContainer);
    }

    // Hero
    showHero(document.getElementById('hero-banner'));

    // Genre chips
    showGenreChips(document.getElementById('genre-chips'));

    // Movie rows
    showMovieRow(document.getElementById('trending-row'));
    showTop10(document.getElementById('top10-row'));
    showMovieRow(document.getElementById('indonesia-row'));
    showMovieRow(document.getElementById('animation-row'));

    // All movies grid
    showGrid(document.getElementById('all-movies-grid'));
  }

  /* ─────────────────────────────────────────
     CLEAR ALL DASHBOARD SKELETONS
     Call this after all data renders
  ───────────────────────────────────────── */
  function clearDashboard() {
    // Clear hero
    clearHero(document.getElementById('hero-banner'));

    // Clear welcome skeleton
    document.querySelectorAll('.skeleton-placeholder').forEach(el => el.remove());

    // Animate all card rows
    [
      'trending-row',
      'indonesia-row',
      'animation-row',
    ].forEach((id, rowIndex) => {
      const row = document.getElementById(id);
      if (row) clearRow(row, rowIndex * 0.05);
    });

    clearGrid(document.getElementById('all-movies-grid'));

    // Progress bars animation
    if (window.CineTransitions) {
      CineTransitions.animateProgressBars(document.getElementById('continue-row'));
    }
  }

  /* ─────────────────────────────────────────
     EXPORT
  ───────────────────────────────────────── */
  return {
    showHero,
    clearHero,
    showMovieRow,
    showTop10,
    showGenreChips,
    showWelcome,
    showGrid,
    showSectionTitle,
    clearRow,
    clearGrid,
    clearSection,
    initDashboard,
    clearDashboard,
  };
})();

window.CineSkeleton = CineSkeleton;
