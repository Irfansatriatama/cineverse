/**
 * CineVerse — navbar.js
 * Global navbar component: scroll effect, mobile hamburger, theme toggle
 * Auth state is handled by app.js (CineApp.initNavbarAuth)
 */

(function () {
  'use strict';

  function init() {
    const navbar       = document.getElementById('navbar');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileMenu   = document.getElementById('mobile-menu');

    if (!navbar) return;

    /* ─── Scroll Effect ─── */
    const handleScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    /* ─── Hamburger / Mobile Menu ─── */
    hamburgerBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = mobileMenu?.classList.toggle('open');
      hamburgerBtn.classList.toggle('open', isOpen);
      hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', (e) => {
      if (
        mobileMenu?.classList.contains('open') &&
        !hamburgerBtn?.contains(e.target) &&
        !mobileMenu?.contains(e.target)
      ) {
        mobileMenu.classList.remove('open');
        hamburgerBtn?.classList.remove('open');
        hamburgerBtn?.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        mobileMenu?.classList.remove('open');
        hamburgerBtn?.classList.remove('open');
        hamburgerBtn?.setAttribute('aria-expanded', 'false');
      }
    });

    /* ─── Theme Toggle ─── */
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn && window.CineStorage) {
      updateThemeIcon(themeToggleBtn, CineStorage.Theme.get());
      themeToggleBtn.addEventListener('click', () => {
        const next = CineStorage.Theme.toggle();
        updateThemeIcon(themeToggleBtn, next);
      });
    }
  }

  function updateThemeIcon(btn, theme) {
    if (!btn) return;
    if (theme === 'dark') {
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
      btn.setAttribute('aria-label', 'Mode Terang');
    } else {
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
      btn.setAttribute('aria-label', 'Mode Gelap');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
