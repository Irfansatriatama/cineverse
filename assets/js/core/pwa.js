/**
 * CineVerse — pwa.js
 * Phase 5.1: Service Worker registration + PWA install prompt
 *
 * Features:
 * - Register /sw.js service worker
 * - Detect standalone mode (already installed)
 * - Show custom install banner (not native browser prompt)
 * - Update available toast notification
 * - Online/Offline status indicator
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────
     SERVICE WORKER REGISTRATION
  ───────────────────────────────────────── */
  let swRegistration = null;

  async function registerSW() {
    if (!('serviceWorker' in navigator)) {
      console.log('[PWA] Service Worker not supported');
      return;
    }

    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      swRegistration = reg;
      console.log('[PWA] Service Worker registered:', reg.scope);

      // Check for updates
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateToast();
          }
        });
      });

      // Reload on controller change (after update)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });

    } catch (err) {
      console.warn('[PWA] Service Worker registration failed:', err);
    }
  }

  /* ─────────────────────────────────────────
     UPDATE TOAST
  ───────────────────────────────────────── */
  function showUpdateToast() {
    const toast = document.createElement('div');
    toast.className = 'pwa-update-toast';
    toast.innerHTML = `
      <div class="pwa-update-toast__content">
        <span class="pwa-update-toast__icon">🔄</span>
        <div>
          <strong>Update Tersedia!</strong>
          <p>Versi baru CineVerse sudah siap.</p>
        </div>
        <button class="pwa-update-toast__btn" id="pwa-update-btn">Perbarui</button>
        <button class="pwa-update-toast__dismiss" id="pwa-update-dismiss" aria-label="Tutup">✕</button>
      </div>
    `;

    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('visible'));

    document.getElementById('pwa-update-btn')?.addEventListener('click', () => {
      swRegistration?.waiting?.postMessage({ type: 'SKIP_WAITING' });
    });

    document.getElementById('pwa-update-dismiss')?.addEventListener('click', () => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 300);
    });
  }

  /* ─────────────────────────────────────────
     INSTALL PROMPT (A2HS)
  ───────────────────────────────────────── */
  let deferredPrompt = null;
  const DISMISS_KEY  = 'cineverse_pwa_dismissed';

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    // Don't show if already dismissed in this session
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    // Don't show if already running standalone
    if (isStandalone()) return;

    // Show banner after short delay
    setTimeout(showInstallBanner, 3000);
  });

  window.addEventListener('appinstalled', () => {
    hideInstallBanner();
    deferredPrompt = null;
    console.log('[PWA] App installed!');
    if (window.CineToast) {
      CineToast.show('CineVerse berhasil diinstall! 🎉', 'success');
    }
  });

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  }

  function showInstallBanner() {
    if (!deferredPrompt) return;
    if (document.getElementById('pwa-install-banner')) return;

    const banner = document.createElement('div');
    banner.id    = 'pwa-install-banner';
    banner.className = 'pwa-install-banner';
    banner.innerHTML = `
      <div class="pwa-install-banner__inner">
        <div class="pwa-install-banner__icon" aria-hidden="true">▶</div>
        <div class="pwa-install-banner__text">
          <strong>Install CineVerse</strong>
          <span>Akses lebih cepat langsung dari layar utama</span>
        </div>
        <div class="pwa-install-banner__actions">
          <button class="pwa-install-banner__dismiss" id="pwa-dismiss-btn" aria-label="Tutup">Nanti</button>
          <button class="pwa-install-banner__install" id="pwa-install-btn">Install</button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);
    requestAnimationFrame(() => banner.classList.add('visible'));

    document.getElementById('pwa-install-btn')?.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('[PWA] Install outcome:', outcome);
      deferredPrompt = null;
      hideInstallBanner();
    });

    document.getElementById('pwa-dismiss-btn')?.addEventListener('click', () => {
      sessionStorage.setItem(DISMISS_KEY, '1');
      hideInstallBanner();
    });
  }

  function hideInstallBanner() {
    const banner = document.getElementById('pwa-install-banner');
    if (!banner) return;
    banner.classList.remove('visible');
    setTimeout(() => banner.remove(), 400);
  }

  /* ─────────────────────────────────────────
     ONLINE / OFFLINE INDICATOR
  ───────────────────────────────────────── */
  function initNetworkStatus() {
    function showOffline() {
      let pill = document.getElementById('pwa-offline-pill');
      if (!pill) {
        pill = document.createElement('div');
        pill.id = 'pwa-offline-pill';
        pill.className = 'pwa-offline-pill';
        pill.textContent = '⚠ Offline — Mode Terbatas';
        document.body.appendChild(pill);
      }
      pill.classList.add('visible');
    }

    function hideOffline() {
      const pill = document.getElementById('pwa-offline-pill');
      if (pill) {
        pill.classList.remove('visible');
        setTimeout(() => pill.remove(), 300);
      }
      if (window.CineToast) {
        CineToast.show('Koneksi internet kembali 🌐', 'success');
      }
    }

    if (!navigator.onLine) showOffline();

    window.addEventListener('offline', showOffline);
    window.addEventListener('online',  hideOffline);
  }

  /* ─────────────────────────────────────────
     INJECT PWA CSS
  ───────────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById('pwa-styles')) return;
    const style = document.createElement('style');
    style.id = 'pwa-styles';
    style.textContent = `
      /* Install Banner */
      .pwa-install-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 9999;
        padding: 12px 16px;
        background: #111827;
        border-top: 1px solid rgba(229,9,20,0.4);
        box-shadow: 0 -8px 32px rgba(0,0,0,0.5);
        transform: translateY(100%);
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .pwa-install-banner.visible { transform: translateY(0); }
      .pwa-install-banner__inner {
        max-width: 960px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        gap: 14px;
        flex-wrap: wrap;
      }
      .pwa-install-banner__icon {
        width: 40px; height: 40px;
        background: #E50914;
        border-radius: 10px;
        display: flex; align-items: center; justify-content: center;
        color: #fff; font-size: 18px; flex-shrink: 0;
      }
      .pwa-install-banner__text {
        flex: 1;
        min-width: 0;
      }
      .pwa-install-banner__text strong {
        display: block;
        color: #F9FAFB;
        font-size: 14px;
        font-family: Inter, sans-serif;
      }
      .pwa-install-banner__text span {
        font-size: 12px;
        color: #9CA3AF;
        font-family: Inter, sans-serif;
      }
      .pwa-install-banner__actions {
        display: flex;
        gap: 8px;
        align-items: center;
        flex-shrink: 0;
      }
      .pwa-install-banner__dismiss {
        background: none; border: 1px solid rgba(255,255,255,0.15);
        color: #9CA3AF; padding: 7px 14px; border-radius: 8px;
        font-family: Inter, sans-serif; font-size: 13px; cursor: pointer;
        transition: all 0.2s;
      }
      .pwa-install-banner__dismiss:hover { border-color: rgba(255,255,255,0.3); color: #F9FAFB; }
      .pwa-install-banner__install {
        background: #E50914; border: none; color: #fff;
        padding: 8px 20px; border-radius: 8px;
        font-family: Inter, sans-serif; font-size: 13px;
        font-weight: 600; cursor: pointer; transition: background 0.2s;
      }
      .pwa-install-banner__install:hover { background: #B5070F; }

      /* Update Toast */
      .pwa-update-toast {
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 9999;
        background: #111827;
        border: 1px solid rgba(59,130,246,0.4);
        border-radius: 14px;
        padding: 14px 16px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        max-width: 340px;
        opacity: 0;
        transform: translateX(20px);
        transition: all 0.3s ease;
      }
      .pwa-update-toast.visible { opacity: 1; transform: translateX(0); }
      .pwa-update-toast__content {
        display: flex; align-items: flex-start; gap: 10px;
      }
      .pwa-update-toast__icon { font-size: 20px; flex-shrink: 0; margin-top: 2px; }
      .pwa-update-toast strong { display: block; color: #F9FAFB; font-size: 13px; font-family: Inter, sans-serif; margin-bottom: 2px; }
      .pwa-update-toast p { margin: 0; font-size: 12px; color: #9CA3AF; font-family: Inter, sans-serif; }
      .pwa-update-toast__btn {
        margin-left: auto; background: #3B82F6; border: none; color: #fff;
        padding: 6px 14px; border-radius: 8px; font-size: 12px; font-family: Inter, sans-serif;
        font-weight: 600; cursor: pointer; white-space: nowrap; flex-shrink: 0;
      }
      .pwa-update-toast__dismiss {
        background: none; border: none; color: #6B7280; cursor: pointer;
        font-size: 14px; padding: 2px; flex-shrink: 0; line-height: 1;
      }

      /* Offline Pill */
      .pwa-offline-pill {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        z-index: 9998;
        background: rgba(0,0,0,0.9);
        border: 1px solid rgba(245,166,35,0.5);
        color: #F5A623;
        padding: 8px 20px;
        border-radius: 99px;
        font-family: Inter, sans-serif;
        font-size: 13px;
        font-weight: 600;
        white-space: nowrap;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        transition: transform 0.3s ease;
      }
      .pwa-offline-pill.visible { transform: translateX(-50%) translateY(0); }

      @media (max-width: 480px) {
        .pwa-install-banner__inner { gap: 10px; }
        .pwa-install-banner__text span { display: none; }
        .pwa-update-toast { right: 10px; left: 10px; max-width: none; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ─────────────────────────────────────────
     BOOT
  ───────────────────────────────────────── */
  function boot() {
    injectStyles();
    initNetworkStatus();
    registerSW();

    // Expose for use by other modules
    window.CinePWA = { showInstallBanner, isStandalone };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
