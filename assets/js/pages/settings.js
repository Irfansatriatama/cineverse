/**
 * CineVerse — settings.js
 * Halaman Pengaturan — Phase 2.2
 * Handles: tema, bahasa, kualitas video, preferensi konten, notifikasi, privasi, akun
 *
 * Depends on: storage.js, app.js, toast.js
 */

const SettingsPage = (() => {
  'use strict';

  /* ─────────────────────────────────────────
     STATE
  ───────────────────────────────────────── */
  let currentUser    = null;
  let currentSettings = {};
  let saveTimer      = null;
  let genres         = [];

  // Extended settings keys (beyond SettingsStorage defaults)
  const EXTENDED_KEYS = {
    HOVER_PREVIEW:       'hoverPreview',
    SAVE_PROGRESS:       'saveProgress',
    MUTE_DEFAULT:        'muteDefault',
    MATURE_CONTENT:      'matureContent',
    INTERNATIONAL:       'international',
    LOCAL_FIRST:         'localFirst',
    SAVE_HISTORY:        'saveHistory',
    HISTORY_RECOMMEND:   'historyRecommend',
    NOTIF_NEW_MOVIE:     'notifNewMovie',
    NOTIF_WATCHLIST:     'notifWatchlist',
    NOTIF_NEWS:          'notifNews',
    TOAST_WATCHLIST:     'toastWatchlist',
    TOAST_ACTIONS:       'toastActions',
    THEME_PREF:          'themePref',   // 'dark' | 'light' | 'system'
    SECTION_VISIBILITY:  'sectionVisibility',
    SECTION_ORDER:       'sectionOrder',
  };

  const DEFAULT_EXTENDED = {
    hoverPreview:      true,
    saveProgress:      true,
    muteDefault:       false,
    matureContent:     false,
    international:     true,
    localFirst:        false,
    saveHistory:       true,
    historyRecommend:  true,
    notifNewMovie:     true,
    notifWatchlist:    false,
    notifNews:         false,
    toastWatchlist:    true,
    toastActions:      true,
    themePref:         'dark',
    sectionVisibility: { hero: true, trending: true, top10: true, continue: true, recommended: true },
    sectionOrder:      ['hero', 'trending', 'top10', 'continue', 'recommended'],
  };

  /* ─────────────────────────────────────────
     INIT
  ───────────────────────────────────────── */
  async function init() {
    // Auth check
    if (window.CineStorage) {
      currentUser = CineStorage.User.getCurrent();
    }
    if (!currentUser) {
      window.location.replace('auth/login.html');
      return;
    }

    // Hide page loader early
    const loader = document.getElementById('page-loader');
    if (loader) setTimeout(() => loader.classList.add('loaded'), 250);

    // Load settings
    currentSettings = loadAllSettings();

    // Load genres for content section
    await loadGenres();

    // Render all sections
    renderSidebarNav();
    renderThemeSection();
    renderLanguageSection();
    renderPlaybackSection();
    renderContentSection();
    renderNotificationSection();
    renderPrivacySection();
    renderAccountSection();

    // Bind events
    bindSidebarNav();
    bindDangerZone();
    bindPrivacyActions();
    bindConfirmModal();
    bindDragSort();

    // Hash-based section activation (e.g. settings.html#notifications)
    activateSectionFromHash();

    // Init transitions
    if (window.CineTransitions) {
      CineTransitions.initSectionReveal();
    }
  }

  /* ─────────────────────────────────────────
     SETTINGS LOAD / SAVE
  ───────────────────────────────────────── */
  function loadAllSettings() {
    const base = window.CineStorage
      ? CineStorage.Settings.get(currentUser.id)
      : {};

    const extended = (() => {
      try {
        const raw = localStorage.getItem(`cineverse_settings_ext_${currentUser.id}`);
        return raw ? JSON.parse(raw) : {};
      } catch { return {}; }
    })();

    return { ...DEFAULT_EXTENDED, ...base, ...extended };
  }

  function saveSettings(partial) {
    // Merge
    currentSettings = { ...currentSettings, ...partial };

    // Save base settings (theme, language, autoplay, quality)
    if (window.CineStorage) {
      CineStorage.Settings.save(currentUser.id, {
        theme:           currentSettings.theme || currentSettings.themePref,
        language:        currentSettings.language,
        autoplay:        currentSettings.autoplay,
        quality:         currentSettings.quality,
        preferredGenres: currentSettings.preferredGenres,
      });
    }

    // Save extended settings
    try {
      const extKeys = Object.values(EXTENDED_KEYS);
      const extended = {};
      extKeys.forEach(k => {
        if (currentSettings[k] !== undefined) extended[k] = currentSettings[k];
      });
      localStorage.setItem(
        `cineverse_settings_ext_${currentUser.id}`,
        JSON.stringify(extended)
      );
    } catch (e) {
      console.error('[Settings] Save extended error:', e);
    }

    showSavedBadge();
  }

  function showSavedBadge() {
    const badge = document.getElementById('saved-badge');
    if (!badge) return;
    clearTimeout(saveTimer);
    badge.classList.add('visible');
    saveTimer = setTimeout(() => badge.classList.remove('visible'), 2200);
  }

  /* ─────────────────────────────────────────
     SIDEBAR NAVIGATION
  ───────────────────────────────────────── */
  function renderSidebarNav() {
    // Already in HTML, just ensure active state is correct
  }

  function bindSidebarNav() {
    const navItems    = document.querySelectorAll('.settings-nav__item');
    const sections    = document.querySelectorAll('.settings-section');

    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const target = item.dataset.section;

        navItems.forEach(i => i.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));

        item.classList.add('active');
        const targetSection = document.getElementById(`section-${target}`);
        if (targetSection) targetSection.classList.add('active');

        // Update URL hash
        history.replaceState(null, '', `#${target}`);
      });
    });
  }

  function activateSectionFromHash() {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;

    const navItem = document.querySelector(`.settings-nav__item[data-section="${hash}"]`);
    if (navItem) navItem.click();
  }

  /* ─────────────────────────────────────────
     SECTION: THEME
  ───────────────────────────────────────── */
  function renderThemeSection() {
    const themePref = currentSettings.themePref || currentSettings.theme || 'dark';
    const options   = document.querySelectorAll('.theme-option');

    options.forEach(opt => {
      const value = opt.dataset.themeValue;
      const radio = opt.querySelector('input[type="radio"]');
      if (radio) radio.checked = (value === themePref);

      opt.addEventListener('click', () => {
        options.forEach(o => o.querySelector('input').checked = false);
        radio.checked = true;
        applyTheme(value);
        saveSettings({ themePref: value, theme: value === 'system' ? getSystemTheme() : value });
      });
    });
  }

  function applyTheme(pref) {
    let theme = pref;
    if (pref === 'system') {
      theme = getSystemTheme();
    }
    document.documentElement.setAttribute('data-theme', theme);
    if (window.CineStorage) {
      CineStorage.Theme.set(theme);
    }
  }

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  /* ─────────────────────────────────────────
     SECTION: LANGUAGE
  ───────────────────────────────────────── */
  function renderLanguageSection() {
    const currentLang = currentSettings.language || 'id';
    const options      = document.querySelectorAll('.language-option');

    options.forEach(opt => {
      const value = opt.dataset.langValue;
      const radio = opt.querySelector('input[type="radio"]');
      if (radio) radio.checked = (value === currentLang);

      opt.addEventListener('click', () => {
        options.forEach(o => o.querySelector('input').checked = false);
        radio.checked = true;
        saveSettings({ language: value });
        showToast('info', `Bahasa diubah ke: ${value === 'id' ? 'Bahasa Indonesia' : 'English'}`);
      });
    });
  }

  /* ─────────────────────────────────────────
     SECTION: PLAYBACK
  ───────────────────────────────────────── */
  function renderPlaybackSection() {
    // Quality radio
    const currentQuality = currentSettings.quality || 'auto';
    const qualityOptions = document.querySelectorAll('.quality-option');

    qualityOptions.forEach(opt => {
      const value = opt.dataset.qualityValue;
      const radio = opt.querySelector('input[type="radio"]');
      if (radio) radio.checked = (value === currentQuality);

      opt.addEventListener('click', () => {
        qualityOptions.forEach(o => o.querySelector('input').checked = false);
        radio.checked = true;
        saveSettings({ quality: value });
      });
    });

    // Toggles
    bindToggle('toggle-autoplay',      'autoplay',      currentSettings.autoplay      !== false);
    bindToggle('toggle-hover-preview', EXTENDED_KEYS.HOVER_PREVIEW, currentSettings.hoverPreview !== false);
    bindToggle('toggle-save-progress', EXTENDED_KEYS.SAVE_PROGRESS, currentSettings.saveProgress !== false);
    bindToggle('toggle-mute-default',  EXTENDED_KEYS.MUTE_DEFAULT,  currentSettings.muteDefault  === true);
  }

  /* ─────────────────────────────────────────
     SECTION: CONTENT PREFERENCES
  ───────────────────────────────────────── */
  async function loadGenres() {
    try {
      // Try fetch from data/genres.json
      let path = '../data/genres.json';
      // Relative from pages/settings.html
      const res = await fetch(path);
      const data = await res.json();
      genres = data.genres || [];
    } catch {
      // Fallback: inline genres
      genres = [
        { id: 'action',    name: 'Action',      icon: '⚔️',  color: '#E50914' },
        { id: 'drama',     name: 'Drama',        icon: '🎭',  color: '#3B82F6' },
        { id: 'horror',    name: 'Horor',        icon: '👻',  color: '#7C3AED' },
        { id: 'comedy',    name: 'Komedi',       icon: '😂',  color: '#F5A623' },
        { id: 'sci-fi',    name: 'Sci-Fi',       icon: '🚀',  color: '#10B981' },
        { id: 'romance',   name: 'Romance',      icon: '❤️',  color: '#EC4899' },
        { id: 'thriller',  name: 'Thriller',     icon: '🔍',  color: '#8B5CF6' },
        { id: 'animation', name: 'Animasi',      icon: '🎨',  color: '#06B6D4' },
        { id: 'adventure', name: 'Petualangan',  icon: '🗺️',  color: '#84CC16' },
        { id: 'biography', name: 'Biografi',     icon: '📖',  color: '#F97316' },
        { id: 'history',   name: 'Sejarah',      icon: '🏛️',  color: '#A78BFA' },
        { id: 'fantasy',   name: 'Fantasi',      icon: '🧙',  color: '#34D399' },
        { id: 'crime',     name: 'Kriminal',     icon: '🔫',  color: '#6B7280' },
        { id: 'mystery',   name: 'Misteri',      icon: '🕵️',  color: '#60A5FA' },
      ];
    }
  }

  function renderContentSection() {
    renderGenreGrid();

    // Toggles
    bindToggle('toggle-mature-content', EXTENDED_KEYS.MATURE_CONTENT, currentSettings.matureContent === true);
    bindToggle('toggle-international',  EXTENDED_KEYS.INTERNATIONAL,  currentSettings.international  !== false);
    bindToggle('toggle-local-first',    EXTENDED_KEYS.LOCAL_FIRST,    currentSettings.localFirst     === true);

    // Section visibility toggles
    const visSections = currentSettings.sectionVisibility || DEFAULT_EXTENDED.sectionVisibility;
    document.querySelectorAll('[data-vis-section]').forEach(btn => {
      const id = btn.dataset.visSection;
      const isOn = visSections[id] !== false;
      setToggleState(btn, isOn);

      btn.addEventListener('click', () => {
        const newState = btn.getAttribute('aria-checked') !== 'true';
        setToggleState(btn, newState);
        const updated = { ...currentSettings.sectionVisibility, [id]: newState };
        saveSettings({ sectionVisibility: updated });
      });
    });
  }

  function renderGenreGrid() {
    const grid = document.getElementById('genre-grid');
    if (!grid) return;

    const selected = new Set(currentSettings.preferredGenres || []);
    const MAX_GENRES = 5;

    grid.innerHTML = genres.map(g => `
      <button
        class="genre-chip-toggle ${selected.has(g.id) ? 'selected' : ''}"
        data-genre="${g.id}"
        style="${selected.has(g.id) ? `color:${g.color}; border-color:${g.color}; box-shadow: 0 0 0 2px ${g.color}22;` : ''}"
        ${!selected.has(g.id) && selected.size >= MAX_GENRES ? 'disabled' : ''}
        aria-pressed="${selected.has(g.id)}"
      >
        <span>${g.icon}</span> ${escSafe(g.name)}
      </button>
    `).join('');

    // Bind click
    grid.querySelectorAll('.genre-chip-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const id  = btn.dataset.genre;
        const genreData = genres.find(g => g.id === id);
        const cur = new Set(currentSettings.preferredGenres || []);

        if (cur.has(id)) {
          cur.delete(id);
          btn.classList.remove('selected');
          btn.style.color        = '';
          btn.style.borderColor  = '';
          btn.style.boxShadow    = '';
          btn.setAttribute('aria-pressed', 'false');
        } else {
          if (cur.size >= MAX_GENRES) return;
          cur.add(id);
          btn.classList.add('selected');
          if (genreData) {
            btn.style.color       = genreData.color;
            btn.style.borderColor = genreData.color;
            btn.style.boxShadow   = `0 0 0 2px ${genreData.color}22`;
          }
          btn.setAttribute('aria-pressed', 'true');
        }

        // Update disabled state for unselected
        const newSelected = [...cur];
        const allBtns = grid.querySelectorAll('.genre-chip-toggle');
        allBtns.forEach(b => {
          if (!b.classList.contains('selected')) {
            b.disabled = newSelected.length >= MAX_GENRES;
          }
        });

        // Update counter
        const counter = document.getElementById('genre-counter');
        if (counter) counter.textContent = `${newSelected.length}/5 dipilih`;

        saveSettings({ preferredGenres: newSelected });
      });
    });

    // Initial counter
    const counter = document.getElementById('genre-counter');
    if (counter) counter.textContent = `${selected.size}/5 dipilih`;
  }

  /* ─────────────────────────────────────────
     SECTION: NOTIFICATIONS
  ───────────────────────────────────────── */
  function renderNotificationSection() {
    renderNotifPermissionBlock();

    bindToggle('toggle-notif-new-movie', EXTENDED_KEYS.NOTIF_NEW_MOVIE,  currentSettings.notifNewMovie !== false);
    bindToggle('toggle-notif-watchlist', EXTENDED_KEYS.NOTIF_WATCHLIST,  currentSettings.notifWatchlist === true);
    bindToggle('toggle-notif-news',      EXTENDED_KEYS.NOTIF_NEWS,       currentSettings.notifNews      === true);
    bindToggle('toggle-toast-watchlist', EXTENDED_KEYS.TOAST_WATCHLIST,  currentSettings.toastWatchlist !== false);
    bindToggle('toggle-toast-actions',   EXTENDED_KEYS.TOAST_ACTIONS,    currentSettings.toastActions   !== false);
  }

  function renderNotifPermissionBlock() {
    const block = document.getElementById('notif-permission-block');
    if (!block) return;

    const permission = 'Notification' in window ? Notification.permission : 'denied';

    const config = {
      default: {
        cls:   'notif-permission-block--default',
        icon:  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
        title: 'Izin Notifikasi Diperlukan',
        desc:  'Klik tombol ini untuk mengaktifkan notifikasi dari CineVerse',
        btn:   `<button class="btn btn--primary btn--sm" id="btn-request-notif">Aktifkan Notifikasi</button>`,
      },
      granted: {
        cls:   'notif-permission-block--granted',
        icon:  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
        title: 'Notifikasi Diizinkan',
        desc:  'Browser kamu mengizinkan CineVerse mengirim notifikasi',
        btn:   '',
      },
      denied: {
        cls:   'notif-permission-block--denied',
        icon:  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
        title: 'Notifikasi Diblokir',
        desc:  'Izinkan notifikasi melalui pengaturan browser kamu (klik ikon gembok di address bar)',
        btn:   '',
      },
    };

    const c = config[permission] || config.denied;
    block.className = `notif-permission-block ${c.cls}`;
    block.innerHTML = `
      <div class="notif-permission-block__icon">${c.icon}</div>
      <div class="notif-permission-block__text">
        <div class="notif-permission-block__title">${c.title}</div>
        <div class="notif-permission-block__desc">${c.desc}</div>
      </div>
      ${c.btn}
    `;

    // Bind request button
    const reqBtn = block.querySelector('#btn-request-notif');
    if (reqBtn) {
      reqBtn.addEventListener('click', async () => {
        try {
          const result = await Notification.requestPermission();
          renderNotifPermissionBlock();
          if (result === 'granted') {
            showToast('success', 'Notifikasi berhasil diaktifkan! 🔔');
          }
        } catch (e) {
          showToast('error', 'Gagal meminta izin notifikasi');
        }
      });
    }
  }

  /* ─────────────────────────────────────────
     SECTION: PRIVACY
  ───────────────────────────────────────── */
  function renderPrivacySection() {
    bindToggle('toggle-save-history',    EXTENDED_KEYS.SAVE_HISTORY,       currentSettings.saveHistory    !== false);
    bindToggle('toggle-history-recommend', EXTENDED_KEYS.HISTORY_RECOMMEND, currentSettings.historyRecommend !== false);

    renderDataSummary();
  }

  function renderDataSummary() {
    const el = document.getElementById('data-summary');
    if (!el || !window.CineStorage) return;

    const uid      = currentUser.id;
    const history  = CineStorage.History.get(uid);
    const watchlist= CineStorage.Watchlist.get(uid);
    const reviews  = CineStorage.Review.getAll(uid);

    el.innerHTML = `
      <div class="data-summary-item">
        <span class="data-summary-item__count">${Array.isArray(history) ? history.length : 0}</span>
        <span class="data-summary-item__label">Film Ditonton</span>
      </div>
      <div class="data-summary-item">
        <span class="data-summary-item__count">${Array.isArray(watchlist) ? watchlist.length : 0}</span>
        <span class="data-summary-item__label">Watchlist</span>
      </div>
      <div class="data-summary-item">
        <span class="data-summary-item__count">${reviews ? Object.keys(reviews).length : 0}</span>
        <span class="data-summary-item__label">Ulasan</span>
      </div>
    `;
  }

  function bindPrivacyActions() {
    // Export data
    document.getElementById('btn-export-data')?.addEventListener('click', exportUserData);

    // Clear history
    document.getElementById('btn-clear-history')?.addEventListener('click', () => {
      showConfirm(
        'Hapus Riwayat Tontonan',
        'Semua riwayat film yang pernah kamu tonton akan dihapus permanen. Aksi ini tidak bisa dibatalkan.',
        () => {
          if (window.CineStorage) CineStorage.History.clear(currentUser.id);
          renderDataSummary();
          showToast('success', 'Riwayat tontonan berhasil dihapus');
        }
      );
    });

    // Clear watchlist
    document.getElementById('btn-clear-watchlist')?.addEventListener('click', () => {
      showConfirm(
        'Kosongkan Watchlist',
        'Semua film di watchlist kamu akan dihapus. Kamu bisa menambahkan film lagi kapan saja.',
        () => {
          if (window.CineStorage) CineStorage.Watchlist.clear(currentUser.id);
          renderDataSummary();
          showToast('success', 'Watchlist berhasil dikosongkan');
        }
      );
    });
  }

  function exportUserData() {
    if (!window.CineStorage) return;
    const uid = currentUser.id;
    const exportData = {
      exportedAt: new Date().toISOString(),
      user:       { ...currentUser, passwordHash: '[REDACTED]' },
      settings:   currentSettings,
      watchlist:  CineStorage.Watchlist.get(uid),
      history:    CineStorage.History.get(uid),
      reviews:    CineStorage.Review.getAll(uid),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `cineverse-data-${uid}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Data kamu berhasil diekspor! 📥');
  }

  /* ─────────────────────────────────────────
     SECTION: ACCOUNT
  ───────────────────────────────────────── */
  function renderAccountSection() {
    const el = document.getElementById('account-info');
    if (!el || !currentUser) return;

    const joinedDate = (currentUser.createdAt || currentUser.joinedAt)
      ? new Date(currentUser.createdAt || currentUser.joinedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'Tidak diketahui';

    const avatarContent = currentUser.avatar
      ? `<img src="${currentUser.avatar}" alt="${escSafe(currentUser.displayName)}" />`
      : getInitials(currentUser.displayName);

    el.innerHTML = `
      <div class="account-info__avatar">${avatarContent}</div>
      <div class="account-info__details">
        <div class="account-info__name">${escSafe(currentUser.displayName)}</div>
        <div class="account-info__email">${escSafe(currentUser.email)}</div>
        <div class="account-info__joined">Bergabung sejak ${joinedDate}</div>
      </div>
    `;
  }

  function bindDangerZone() {
    // Reset settings
    document.getElementById('btn-reset-settings')?.addEventListener('click', () => {
      showConfirm(
        'Reset Semua Pengaturan',
        'Semua pengaturan (tema, bahasa, kualitas, dll) akan dikembalikan ke kondisi awal. Data film (watchlist, riwayat) tidak terpengaruh.',
        () => {
          if (window.CineStorage) {
            CineStorage.Settings.save(currentUser.id, CineStorage.Settings.getDefaults());
          }
          try {
            localStorage.removeItem(`cineverse_settings_ext_${currentUser.id}`);
          } catch {}
          showToast('success', 'Pengaturan berhasil direset ke default');
          setTimeout(() => window.location.reload(), 1200);
        }
      );
    });

    // Delete account
    document.getElementById('btn-delete-account')?.addEventListener('click', () => {
      showConfirm(
        'Hapus Akun Secara Permanen',
        '⚠️ PERHATIAN: Akun kamu beserta SEMUA DATA (profil, watchlist, riwayat, ulasan) akan dihapus permanen. Aksi ini tidak bisa dibatalkan!',
        () => {
          deleteAccount();
        }
      );
    });
  }

  function deleteAccount() {
    if (!window.CineStorage) return;
    const uid = currentUser.id;

    try {
      // Remove all user-specific keys
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes(uid) || key === 'cineverse_current_user')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));

      // Remove from users array
      const users = CineStorage.User.getAll().filter(u => u.id !== uid);
      localStorage.setItem('cineverse_users', JSON.stringify(users));

      showToast('success', 'Akun berhasil dihapus. Sampai jumpa! 👋');
      setTimeout(() => window.location.replace('../index.html'), 1500);
    } catch (e) {
      showToast('error', 'Gagal menghapus akun. Coba lagi.');
    }
  }

  /* ─────────────────────────────────────────
     TOGGLE HELPER
  ───────────────────────────────────────── */
  function bindToggle(elementId, settingKey, initialState) {
    const btn = document.getElementById(elementId);
    if (!btn) return;

    setToggleState(btn, initialState);

    btn.addEventListener('click', () => {
      const newState = btn.getAttribute('aria-checked') !== 'true';
      setToggleState(btn, newState);
      saveSettings({ [settingKey]: newState });
    });
  }

  function setToggleState(btn, isOn) {
    btn.setAttribute('aria-checked', isOn ? 'true' : 'false');
  }

  /* ─────────────────────────────────────────
     DRAG SORT (Section Visibility)
  ───────────────────────────────────────── */
  function bindDragSort() {
    const list = document.getElementById('section-visibility-list');
    if (!list) return;

    let dragEl = null;

    list.addEventListener('dragstart', e => {
      dragEl = e.target.closest('.section-vis-item');
      if (dragEl) {
        dragEl.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      }
    });

    list.addEventListener('dragend', () => {
      if (dragEl) dragEl.classList.remove('dragging');
      list.querySelectorAll('.section-vis-item').forEach(el => el.classList.remove('drag-over'));
      dragEl = null;

      // Save new order
      const newOrder = [...list.querySelectorAll('.section-vis-item')].map(el => el.dataset.sectionId);
      saveSettings({ sectionOrder: newOrder });
    });

    list.addEventListener('dragover', e => {
      e.preventDefault();
      const over = e.target.closest('.section-vis-item');
      if (!over || over === dragEl) return;

      list.querySelectorAll('.section-vis-item').forEach(el => el.classList.remove('drag-over'));
      over.classList.add('drag-over');

      const rect  = over.getBoundingClientRect();
      const after = e.clientY > rect.top + rect.height / 2;
      if (after) {
        over.parentNode.insertBefore(dragEl, over.nextSibling);
      } else {
        over.parentNode.insertBefore(dragEl, over);
      }
    });
  }

  /* ─────────────────────────────────────────
     CONFIRM MODAL
  ───────────────────────────────────────── */
  let confirmCallback = null;

  function showConfirm(title, desc, onConfirm) {
    const modal    = document.getElementById('confirm-modal');
    const titleEl  = document.getElementById('confirm-modal-title');
    const descEl   = document.getElementById('confirm-modal-desc');
    if (!modal) return;

    titleEl.textContent = title;
    descEl.textContent  = desc;
    confirmCallback     = onConfirm;
    modal.hidden        = false;
    document.body.style.overflow = 'hidden';
  }

  function hideConfirm() {
    const modal = document.getElementById('confirm-modal');
    if (modal) modal.hidden = true;
    document.body.style.overflow = '';
    confirmCallback = null;
  }

  function bindConfirmModal() {
    document.getElementById('confirm-cancel-btn')?.addEventListener('click', hideConfirm);
    document.getElementById('confirm-ok-btn')?.addEventListener('click', () => {
      if (typeof confirmCallback === 'function') confirmCallback();
      hideConfirm();
    });

    document.getElementById('confirm-modal')?.addEventListener('click', e => {
      if (e.target === e.currentTarget) hideConfirm();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') hideConfirm();
    });
  }

  /* ─────────────────────────────────────────
     TOAST HELPER
  ───────────────────────────────────────── */
  function showToast(type, message) {
    // Use CineToast if available, else fallback
    if (window.CineToast) {
      CineToast[type]?.(message) || CineToast.show?.(message, type);
    } else {
      // Simple fallback
      const container = document.getElementById('toast-container');
      if (!container) return;

      const colors = { success: '#10B981', error: '#E50914', info: '#3B82F6', warning: '#F5A623' };
      const toast  = document.createElement('div');
      toast.style.cssText = `
        padding: 12px 18px;
        background: var(--color-bg-secondary);
        border: 1px solid ${colors[type] || colors.info}44;
        border-left: 3px solid ${colors[type] || colors.info};
        border-radius: 8px;
        color: var(--color-text-primary);
        font-size: 0.875rem;
        margin-top: 8px;
        animation: slideUp 0.2s ease;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      `;
      toast.textContent = message;
      container.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }
  }

  /* ─────────────────────────────────────────
     UTILS
  ───────────────────────────────────────── */
  function getInitials(name = '') {
    return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
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
  return { init };

})();

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', SettingsPage.init);
} else {
  SettingsPage.init();
}
