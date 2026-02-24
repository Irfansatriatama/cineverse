/**
 * CineVerse — app.js
 * Global app initializer. Runs on every page.
 * Handles: theme, router guard, navbar state, page loader
 *
 * Include this BEFORE page-specific scripts.
 * Depends on: storage.js, router.js, navbar.js
 */

const CineApp = (() => {
  'use strict';

  /* ─────────────────────────────────────────
     INIT — call on every page load
  ───────────────────────────────────────── */
  async function init() {
    // 1. Apply saved theme immediately (prevent flash)
    if (window.CineStorage) {
      CineStorage.Theme.apply();
    }

    // 2. Route guard — will redirect if needed
    if (window.CineRouter) {
      const allowed = CineRouter.guard();
      if (!allowed) return; // redirecting, stop here
    }

    // 3. Init navbar with auth awareness
    initNavbarAuth();

    // 4. Page transition: reveal body
    revealPage();

    // 5. Init scroll-reveal for .reveal elements
    initScrollReveal();
  }

  /* ─────────────────────────────────────────
     NAVBAR AUTH STATE
     Updates navbar links based on login status
  ───────────────────────────────────────── */
  function initNavbarAuth() {
    if (!window.CineStorage) return;

    const user = CineStorage.User.getCurrent();
    const base = window.CineRouter ? CineRouter.getRootPath() : './';

    // ── Desktop navbar actions area
    const actionsEl = document.querySelector('.navbar__actions');
    if (actionsEl) {
      if (user) {
        actionsEl.innerHTML = buildUserMenu(user, base);
        bindUserMenuEvents(actionsEl, base);
      } else {
        actionsEl.innerHTML = buildGuestMenu(base);
      }
    }

    // ── Mobile menu auth section
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
      // Remove existing auth buttons from mobile menu
      mobileMenu.querySelectorAll('.navbar-auth-mobile').forEach(el => el.remove());

      const mobileAuth = document.createElement('div');
      mobileAuth.className = 'navbar-auth-mobile';
      mobileAuth.style.cssText = 'display:flex; flex-direction:column; gap:8px; padding-top:8px;';

      if (user) {
        mobileAuth.innerHTML = `
          <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid rgba(255,255,255,0.08);">
            <div style="width:36px;height:36px;border-radius:50%;background:var(--color-crimson);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.9rem;color:#fff;flex-shrink:0;">
              ${getInitials(user.displayName)}
            </div>
            <div>
              <div style="font-size:0.875rem;font-weight:600;color:var(--color-text-primary);">${escSafe(user.displayName)}</div>
              <div style="font-size:0.75rem;color:var(--color-text-muted);">${escSafe(user.email)}</div>
            </div>
          </div>
          <a href="${base}pages/profile.html" class="btn btn--ghost btn--sm">Profil Saya</a>
          <button class="btn btn--ghost btn--sm" id="mobile-logout-btn" style="color:var(--color-crimson);">Keluar</button>
        `;
        mobileMenu.appendChild(mobileAuth);
        mobileMenu.querySelector('#mobile-logout-btn')?.addEventListener('click', () => logout(base));
      } else {
        mobileAuth.innerHTML = `
          <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:8px;display:flex;flex-direction:column;gap:8px;">
            <a href="${base}pages/auth/login.html" class="btn btn--ghost btn--sm">Masuk</a>
            <a href="${base}pages/auth/register.html" class="btn btn--primary btn--sm">Daftar Gratis</a>
          </div>
        `;
        mobileMenu.appendChild(mobileAuth);
      }
    }

    // ── Update active nav link
    updateActiveNavLink();
  }

  function buildGuestMenu(base) {
    return `
      <a href="${base}pages/auth/login.html" class="btn btn--ghost btn--sm">Masuk</a>
      <a href="${base}pages/auth/register.html" class="btn btn--primary btn--sm">Daftar Gratis</a>
    `;
  }

  function buildUserMenu(user, base) {
    const initials = getInitials(user.displayName);
    return `
      <a href="${base}pages/search.html" class="navbar__icon-btn" aria-label="Cari film" title="Cari Film">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </a>
      <div class="navbar__user-menu" id="user-menu">
        <button class="navbar__avatar-btn" id="avatar-btn" aria-label="Menu akun" aria-expanded="false">
          ${user.avatar
            ? `<img src="${user.avatar}" alt="${escSafe(user.displayName)}" class="navbar__avatar-img" />`
            : `<div class="navbar__avatar-initials">${initials}</div>`
          }
        </button>
        <div class="navbar__user-dropdown" id="user-dropdown" aria-hidden="true">
          <div class="navbar__user-info">
            <div class="navbar__user-name">${escSafe(user.displayName)}</div>
            <div class="navbar__user-email">${escSafe(user.email)}</div>
          </div>
          <div class="navbar__dropdown-divider"></div>
          <a href="${base}pages/dashboard.html" class="navbar__dropdown-item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Dashboard
          </a>
          <a href="${base}pages/profile.html" class="navbar__dropdown-item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Profil Saya
          </a>
          <a href="${base}pages/settings.html" class="navbar__dropdown-item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            Pengaturan
          </a>
          <a href="${base}pages/stats.html" class="navbar__dropdown-item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            Statistik Saya
          </a>
          <div class="navbar__dropdown-divider"></div>
          <button class="navbar__dropdown-item navbar__dropdown-item--danger" id="logout-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Keluar
          </button>
        </div>
      </div>
    `;
  }

  function bindUserMenuEvents(container, base) {
    const avatarBtn   = container.querySelector('#avatar-btn');
    const dropdown    = container.querySelector('#user-dropdown');
    const logoutBtn   = container.querySelector('#logout-btn');

    if (avatarBtn && dropdown) {
      avatarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown.classList.toggle('open');
        avatarBtn.setAttribute('aria-expanded', isOpen);
        dropdown.setAttribute('aria-hidden', !isOpen);
      });

      // Close on outside click
      document.addEventListener('click', () => {
        dropdown.classList.remove('open');
        avatarBtn?.setAttribute('aria-expanded', 'false');
        dropdown.setAttribute('aria-hidden', 'true');
      });

      // Close on Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          dropdown.classList.remove('open');
          avatarBtn?.setAttribute('aria-expanded', 'false');
        }
      });
    }

    logoutBtn?.addEventListener('click', () => logout(base));
  }

  function logout(base) {
    CineStorage.User.clearCurrent();
    window.location.replace(base + 'index.html');
  }

  /* ─────────────────────────────────────────
     ACTIVE NAV LINK
  ───────────────────────────────────────── */
  function updateActiveNavLink() {
    const path = window.location.pathname;
    document.querySelectorAll('.navbar__nav-link').forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href') || '';
      // Match by filename
      const linkFile = href.split('/').pop().split('?')[0];
      const currFile = path.split('/').pop().split('?')[0];
      if (linkFile && currFile && (linkFile === currFile || (currFile === '' || currFile === 'index.html') && (linkFile === 'index.html' || href === './' || href === '/'))) {
        link.classList.add('active');
      }
    });
  }

  /* ─────────────────────────────────────────
     PAGE REVEAL
  ───────────────────────────────────────── */
  function revealPage() {
    const loader = document.getElementById('page-loader');
    if (loader) {
      setTimeout(() => loader.classList.add('loaded'), 400);
    }
  }

  /* ─────────────────────────────────────────
     SCROLL REVEAL
  ───────────────────────────────────────── */
  function initScrollReveal() {
    const elements = document.querySelectorAll(
      '.reveal, .reveal-left, .reveal-right, .section-reveal-left, .section-reveal-right'
    );
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Stagger delay for siblings
          const parent = entry.target.parentElement;
          const siblings = parent ? Array.from(parent.children) : [];
          const idx = siblings.indexOf(entry.target);
          const delay = idx * 0.06;

          entry.target.style.transitionDelay = `${delay}s`;
          entry.target.classList.add('revealed');
          entry.target.classList.add('visible');
          entry.target.classList.add('section-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '100px 0px 100px 0px' });

    elements.forEach(el => observer.observe(el));
  }

  /* ─────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────── */
  function getInitials(name = '') {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(w => w[0].toUpperCase())
      .join('');
  }

  function escSafe(str = '') {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ─────────────────────────────────────────
     EXPORT
  ───────────────────────────────────────── */
  return {
    init,
    initNavbarAuth,
    updateActiveNavLink,
    getInitials,
  };
})();

window.CineApp = CineApp;

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => CineApp.init());
} else {
  CineApp.init();
}
