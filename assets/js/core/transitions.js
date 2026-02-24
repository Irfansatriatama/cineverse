/**
 * CineVerse — transitions.js
 * Phase 2.3: Page transition system
 * Cinematic slide transitions between pages + button ripple effects
 *
 * Depends on: nothing (standalone module)
 * Include in every page AFTER core scripts.
 */

const CineTransitions = (() => {
  'use strict';

  let overlay = null;
  let isTransitioning = false;

  /* ─────────────────────────────────────────
     INIT — create overlay, bind links
  ───────────────────────────────────────── */
  function init() {
    // Create transition overlay if not exists
    if (!document.getElementById('page-transition-overlay')) {
      overlay = document.createElement('div');
      overlay.id = 'page-transition-overlay';
      document.body.appendChild(overlay);
    } else {
      overlay = document.getElementById('page-transition-overlay');
    }

    // Page entrance animation
    animatePageIn();

    // Bind all internal links for transition
    bindLinks();

    // Bind ripple to all buttons
    bindRipple();
  }

  /* ─────────────────────────────────────────
     PAGE ENTRANCE
     Called when page loads
  ───────────────────────────────────────── */
  function animatePageIn() {
    const main = document.getElementById('main-content');
    if (main) {
      main.classList.add('page-transition-ready');
      // Small delay to let page-loader handle initial display
      requestAnimationFrame(() => {
        setTimeout(() => {
          main.classList.add('page-visible');
        }, 150);
      });
    }
  }

  /* ─────────────────────────────────────────
     PAGE EXIT TRANSITION
     Slide overlay in, then navigate
  ───────────────────────────────────────── */
  function navigateTo(url) {
    if (isTransitioning) return;
    isTransitioning = true;

    if (!overlay) {
      window.location.href = url;
      return;
    }

    overlay.className = 'entering';
    overlay.style.pointerEvents = 'all';

    // Safety timeout: if animationend never fires, navigate anyway & reset flag
    const safetyTimer = setTimeout(() => {
      isTransitioning = false;
      window.location.href = url;
    }, 1200);

    overlay.addEventListener('animationend', () => {
      clearTimeout(safetyTimer);
      window.location.href = url;
    }, { once: true });
  }

  /* ─────────────────────────────────────────
     BIND INTERNAL LINKS
     Intercept clicks on <a> tags for transitions
  ───────────────────────────────────────── */
  function bindLinks() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href');

      // Skip external, anchor, mailto, javascript, and new-tab links
      if (!href ||
          href.startsWith('http') ||
          href.startsWith('#') ||
          href.startsWith('mailto:') ||
          href.startsWith('javascript:') ||
          link.target === '_blank' ||
          link.hasAttribute('data-no-transition') ||
          e.ctrlKey || e.metaKey || e.shiftKey) {
        return;
      }

      // Skip if same page
      const resolvedUrl = new URL(href, window.location.href);
      if (resolvedUrl.href === window.location.href) {
        isTransitioning = false; // reset if somehow stuck
        return;
      }

      e.preventDefault();
      navigateTo(href);
    });

    // Reset flag on back/forward navigation
    window.addEventListener('pageshow', () => {
      isTransitioning = false;
    });

    // Handle browser back/forward
    window.addEventListener('popstate', () => {
      animatePageIn();
    });
  }

  /* ─────────────────────────────────────────
     RIPPLE EFFECT — for buttons
  ───────────────────────────────────────── */
  function bindRipple() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn, .db-genre-chip');
      if (!btn) return;

      // Remove any stale ripples that didn't clean up
      btn.querySelectorAll('.ripple-effect').forEach(r => r.remove());

      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      ripple.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
      `;

      btn.appendChild(ripple);

      // Primary removal via animationend
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
      // Fallback removal after 700ms in case animationend doesn't fire
      setTimeout(() => { if (ripple.parentNode) ripple.remove(); }, 700);
    });
  }

  /* ─────────────────────────────────────────
     SECTION REVEAL — intersection observer for
     side-entrance animations
  ───────────────────────────────────────── */
  function initSectionReveal() {
    const elements = document.querySelectorAll('.section-reveal-left, .section-reveal-right');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Stagger delay based on sibling index
          const siblings = entry.target.parentElement?.children;
          let delay = 0;
          if (siblings) {
            Array.from(siblings).forEach((sib, i) => {
              if (sib === entry.target) delay = i * 0.08;
            });
          }
          entry.target.style.transitionDelay = `${delay}s`;
          entry.target.classList.add('section-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    elements.forEach(el => observer.observe(el));
  }

  /* ─────────────────────────────────────────
     CARD STAGGER — animate cards as they appear
  ───────────────────────────────────────── */
  function animateCards(container, delay = 0) {
    if (!container) return;

    const cards = container.querySelectorAll(
      '.db-movie-card, .movie-card, .db-top10-card, .db-continue-card'
    );

    cards.forEach((card, i) => {
      card.classList.add('card-animate');
      card.style.animationDelay = `${delay + i * 0.05}s`;
    });
  }

  /* ─────────────────────────────────────────
     HEARTBEAT on watchlist add
  ───────────────────────────────────────── */
  function heartbeat(btn) {
    btn.classList.add('just-added');
    btn.addEventListener('animationend', () => btn.classList.remove('just-added'), { once: true });
  }

  /* ─────────────────────────────────────────
     PROGRESS BAR ANIMATE
  ───────────────────────────────────────── */
  function animateProgressBars(container) {
    if (!container) return;
    const bars = container.querySelectorAll('.db-continue-card__progress-bar');
    bars.forEach(bar => {
      bar.classList.add('progress-bar-animated');
    });
  }

  /* ─────────────────────────────────────────
     EXPORT
  ───────────────────────────────────────── */
  return {
    init,
    navigateTo,
    animateCards,
    animateProgressBars,
    heartbeat,
    initSectionReveal,
  };
})();

window.CineTransitions = CineTransitions;

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => CineTransitions.init());
} else {
  CineTransitions.init();
}
