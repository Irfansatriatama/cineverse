/**
 * CineVerse — profile.js
 * Profile page: edit info, avatar upload, change password, activity tab
 * Depends on: storage.js, auth.js, hash.js, validators.js, toast.js, app.js
 */

const ProfilePage = (() => {
  'use strict';

  let currentUser = null;
  let allMovies   = [];

  // Genre list (mirrors genres.json)
  const GENRES = [
    'Action','Adventure','Animation','Comedy','Crime',
    'Documentary','Drama','Fantasy','Horror','Mystery',
    'Romance','Sci-Fi','Thriller','Western'
  ];

  /* ─────────────────────────────────────────
     INIT
  ───────────────────────────────────────── */
  async function init() {
    currentUser = CineStorage.User.getCurrent();
    if (!currentUser) return; // app.js guard handles redirect

    // Load movies data for activity tab
    try {
      const resp = await fetch('../data/movies.json');
      const data = await resp.json();
      allMovies = data.movies || data || [];
    } catch (_) {}

    populateHeader();
    populateTabs();
    initTabs();
    initAvatarUpload();
    initEditForm();
    initPasswordForm();
    initActivity();
    initDangerZone();
    initConfirmModal();
  }

  /* ─────────────────────────────────────────
     HEADER
  ───────────────────────────────────────── */
  function populateHeader() {
    const u = currentUser;

    qs('#header-name').textContent  = u.displayName || 'Pengguna';
    qs('#header-email').textContent = u.email || '';
    qs('#header-bio').textContent   = u.bio || '';

    const joined = u.createdAt
      ? new Date(u.createdAt).toLocaleDateString('id-ID', { year:'numeric', month:'long' })
      : '—';
    qs('#header-joined').textContent = joined;

    // Avatar
    renderAvatarDisplay();

    // Stats
    const watchlistCount = CineStorage.Watchlist.getAll(u.id).length;
    const historyCount   = CineStorage.History.getAll(u.id).length;
    qs('#stat-watchlist').textContent = watchlistCount;
    qs('#stat-watched').textContent   = historyCount;

    // Count reviews across movies (simple check)
    let reviewCount = 0;
    allMovies.forEach(m => {
      const r = CineStorage.Review.getUserReview(m.id, u.id);
      if (r) reviewCount++;
    });
    qs('#stat-reviews').textContent = reviewCount;
  }

  function renderAvatarDisplay() {
    const u = currentUser;
    const initEl  = qs('#avatar-initials');
    const imgEl   = qs('#avatar-img');
    const removeBtn = qs('#remove-avatar-btn');

    if (u.avatar) {
      imgEl.src = u.avatar;
      imgEl.style.display = 'block';
      initEl.style.display = 'none';
      removeBtn.style.display = 'flex';
    } else {
      imgEl.style.display = 'none';
      initEl.style.display = 'flex';
      initEl.textContent = getInitials(u.displayName);
      removeBtn.style.display = 'none';
    }
  }

  /* ─────────────────────────────────────────
     TABS
  ───────────────────────────────────────── */
  function populateTabs() {
    // genre chips for edit form
    buildGenreChips();
    populateEditForm();
  }

  function initTabs() {
    const tabs   = qsa('.profile-tab');
    const panels = qsa('.profile-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        qs(`#panel-${target}`)?.classList.add('active');
      });
    });
  }

  /* ─────────────────────────────────────────
     AVATAR UPLOAD
  ───────────────────────────────────────── */
  function initAvatarUpload() {
    const avatarEl    = qs('#profile-avatar');
    const fileInput   = qs('#avatar-input');
    const uploadBtn   = qs('#upload-avatar-btn');
    const removeBtn   = qs('#remove-avatar-btn');

    // Click avatar or overlay → trigger file
    avatarEl.addEventListener('click', () => fileInput.click());
    uploadBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        showToast('Ukuran foto maksimal 2MB.', 'error');
        return;
      }

      if (!file.type.startsWith('image/')) {
        showToast('Format file harus berupa gambar.', 'error');
        return;
      }

      try {
        const base64 = await readFileAsBase64(file);
        const resized = await resizeImage(base64, 200, 200);

        // Save to storage
        CineStorage.User.update(currentUser.id, { avatar: resized });
        // Refresh currentUser
        currentUser = CineStorage.User.findById(currentUser.id);
        CineStorage.User.setCurrent(currentUser);

        renderAvatarDisplay();
        // Also update navbar
        if (window.CineApp) CineApp.initNavbarAuth();

        showToast('Foto profil berhasil diperbarui! 📸', 'success');
      } catch (err) {
        showToast('Gagal memproses foto.', 'error');
      }

      // Reset input
      fileInput.value = '';
    });

    removeBtn.addEventListener('click', () => {
      showConfirmModal(
        'Hapus Foto Profil',
        'Apakah kamu yakin ingin menghapus foto profil?',
        () => {
          CineStorage.User.update(currentUser.id, { avatar: null });
          currentUser = CineStorage.User.findById(currentUser.id);
          CineStorage.User.setCurrent(currentUser);

          renderAvatarDisplay();
          if (window.CineApp) CineApp.initNavbarAuth();
          showToast('Foto profil dihapus.', 'info');
        }
      );
    });
  }

  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function resizeImage(base64, maxW, maxH) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        const ratio = Math.min(maxW / width, maxH / height);
        width  = Math.round(width  * ratio);
        height = Math.round(height * ratio);

        canvas.width  = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = base64;
    });
  }

  /* ─────────────────────────────────────────
     EDIT PROFILE FORM
  ───────────────────────────────────────── */
  function populateEditForm() {
    const u = currentUser;
    setVal('#input-displayname', u.displayName || '');
    setVal('#input-email', u.email || '');
    setVal('#input-bio', u.bio || '');
    setVal('#input-gender', u.gender || '');
    setVal('#input-birthyear', u.birthYear || '');

    // Bio char counter
    updateBioCounter(u.bio?.length || 0);

    // Genre selections
    const prefs = u.preferredGenres || [];
    qsa('.genre-chip-toggle').forEach(chip => {
      if (prefs.includes(chip.dataset.genre)) {
        chip.classList.add('selected');
      }
    });
  }

  function buildGenreChips() {
    const container = qs('#genre-chips-select');
    if (!container) return;

    container.innerHTML = GENRES.map(genre => `
      <button type="button" class="genre-chip-toggle" data-genre="${genre}">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        ${genre}
      </button>
    `).join('');

    container.addEventListener('click', (e) => {
      const chip = e.target.closest('.genre-chip-toggle');
      if (!chip) return;

      const selectedChips = qsa('.genre-chip-toggle.selected');
      if (!chip.classList.contains('selected') && selectedChips.length >= 5) {
        showToast('Maksimal 5 genre favorit.', 'warning');
        return;
      }
      chip.classList.toggle('selected');
    });
  }

  function initEditForm() {
    const form      = qs('#edit-profile-form');
    const bioInput  = qs('#input-bio');
    const cancelBtn = qs('#cancel-edit-btn');

    // Bio counter
    bioInput?.addEventListener('input', () => {
      updateBioCounter(bioInput.value.length);
    });

    // Cancel → restore
    cancelBtn?.addEventListener('click', () => {
      populateEditForm();
      showToast('Perubahan dibatalkan.', 'info');
    });

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validateEditForm()) return;

      const saveBtn = qs('#save-profile-btn');
      setLoading(saveBtn, true);

      const displayName = qs('#input-displayname').value.trim();
      const bio         = qs('#input-bio').value.trim();
      const gender      = qs('#input-gender').value;
      const birthYear   = qs('#input-birthyear').value;
      const preferredGenres = [...qsa('.genre-chip-toggle.selected')].map(c => c.dataset.genre);

      CineStorage.User.update(currentUser.id, {
        displayName,
        bio,
        gender,
        birthYear: birthYear ? parseInt(birthYear) : null,
        preferredGenres,
      });

      currentUser = CineStorage.User.findById(currentUser.id);
      CineStorage.User.setCurrent(currentUser);

      // Update header display
      qs('#header-name').textContent = currentUser.displayName;
      qs('#header-bio').textContent  = currentUser.bio || '';
      qs('#avatar-initials').textContent = getInitials(currentUser.displayName);

      if (window.CineApp) CineApp.initNavbarAuth();

      await sleep(400);
      setLoading(saveBtn, false);
      showToast('Profil berhasil diperbarui! ✅', 'success');
    });
  }

  function validateEditForm() {
    clearErrors();
    let valid = true;

    const name = qs('#input-displayname').value.trim();
    if (!name) {
      setError('#err-displayname', 'Nama tampilan tidak boleh kosong.');
      qs('#input-displayname').classList.add('is-invalid');
      valid = false;
    } else if (name.length < 2) {
      setError('#err-displayname', 'Nama minimal 2 karakter.');
      qs('#input-displayname').classList.add('is-invalid');
      valid = false;
    } else if (name.length > 50) {
      setError('#err-displayname', 'Nama maksimal 50 karakter.');
      qs('#input-displayname').classList.add('is-invalid');
      valid = false;
    } else {
      qs('#input-displayname').classList.add('is-valid');
    }

    const birthYear = qs('#input-birthyear').value;
    if (birthYear) {
      const yr = parseInt(birthYear);
      if (yr < 1920 || yr > 2010) {
        setError('#err-birthyear', 'Tahun lahir tidak valid (1920–2010).');
        qs('#input-birthyear').classList.add('is-invalid');
        valid = false;
      }
    }

    return valid;
  }

  function updateBioCounter(count) {
    const el = qs('#bio-char-count');
    if (el) {
      el.textContent = count;
      el.style.color = count > 180 ? 'var(--color-gold)' : '';
      el.style.color = count >= 200 ? 'var(--color-crimson)' : el.style.color;
    }
  }

  /* ─────────────────────────────────────────
     CHANGE PASSWORD FORM
  ───────────────────────────────────────── */
  function initPasswordForm() {
    const form = qs('#change-password-form');
    const newPassInput = qs('#input-new-pass');

    // Password strength meter
    newPassInput?.addEventListener('input', () => {
      updateStrengthMeter(newPassInput.value);
    });

    // Toggle show/hide password buttons
    qsa('.form-toggle-pass').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const input    = qs('#' + targetId);
        if (!input) return;

        const isPass = input.type === 'password';
        input.type = isPass ? 'text' : 'password';
        btn.querySelector('.eye-open').style.display  = isPass ? 'none'  : 'inline';
        btn.querySelector('.eye-closed').style.display = isPass ? 'inline' : 'none';
      });
    });

    form?.addEventListener('reset', () => {
      clearPasswordErrors();
      updateStrengthMeter('');
    });

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!await validatePasswordForm()) return;

      const saveBtn = qs('#save-password-btn');
      setLoading(saveBtn, true);

      const newPass = qs('#input-new-pass').value;
      const hashed  = await hashPassword(newPass);

      CineStorage.User.update(currentUser.id, { passwordHash: hashed });
      currentUser = CineStorage.User.findById(currentUser.id);
      CineStorage.User.setCurrent(currentUser);

      form.reset();
      updateStrengthMeter('');

      await sleep(400);
      setLoading(saveBtn, false);
      showToast('Password berhasil diubah! 🔐', 'success');
    });
  }

  async function validatePasswordForm() {
    clearPasswordErrors();
    let valid = true;

    const currentPass = qs('#input-current-pass').value;
    const newPass     = qs('#input-new-pass').value;
    const confirmPass = qs('#input-confirm-pass').value;

    // Verify current password
    if (!currentPass) {
      setError('#err-current-pass', 'Password saat ini wajib diisi.');
      qs('#input-current-pass').classList.add('is-invalid');
      valid = false;
    } else {
      const hashedCurrent = await hashPassword(currentPass);
      const storedUser = CineStorage.User.findById(currentUser.id);
      if (storedUser.passwordHash !== hashedCurrent) {
        setError('#err-current-pass', 'Password saat ini tidak sesuai.');
        qs('#input-current-pass').classList.add('is-invalid');
        valid = false;
      }
    }

    // Validate new password
    if (!newPass) {
      setError('#err-new-pass', 'Password baru wajib diisi.');
      qs('#input-new-pass').classList.add('is-invalid');
      valid = false;
    } else if (newPass.length < 8) {
      setError('#err-new-pass', 'Password minimal 8 karakter.');
      qs('#input-new-pass').classList.add('is-invalid');
      valid = false;
    } else if (newPass === currentPass) {
      setError('#err-new-pass', 'Password baru tidak boleh sama dengan password lama.');
      qs('#input-new-pass').classList.add('is-invalid');
      valid = false;
    } else {
      qs('#input-new-pass').classList.add('is-valid');
    }

    // Confirm password
    if (!confirmPass) {
      setError('#err-confirm-pass', 'Konfirmasi password wajib diisi.');
      qs('#input-confirm-pass').classList.add('is-invalid');
      valid = false;
    } else if (newPass !== confirmPass) {
      setError('#err-confirm-pass', 'Konfirmasi password tidak cocok.');
      qs('#input-confirm-pass').classList.add('is-invalid');
      valid = false;
    } else if (valid) {
      qs('#input-confirm-pass').classList.add('is-valid');
    }

    return valid;
  }

  function updateStrengthMeter(password) {
    const bars  = [qs('#ps-bar-1'), qs('#ps-bar-2'), qs('#ps-bar-3'), qs('#ps-bar-4')];
    const label = qs('#ps-label');
    if (!label) return;

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const labels = ['', 'Lemah', 'Cukup', 'Kuat', 'Sangat Kuat'];
    const colors = ['', 'active-1', 'active-2', 'active-3', 'active-4'];

    bars.forEach((bar, i) => {
      bar.className = 'pass-strength__bar';
      if (password && i < strength) {
        bar.classList.add(colors[strength]);
      }
    });

    label.textContent = password ? labels[strength] : '—';
    label.style.color = strength <= 1 ? 'var(--color-crimson)'
      : strength === 2 ? 'var(--color-gold)'
      : strength === 3 ? 'var(--color-blue)'
      : 'var(--color-emerald)';
  }

  /* ─────────────────────────────────────────
     ACTIVITY TAB
  ───────────────────────────────────────── */
  function initActivity() {
    const history = CineStorage.History.getAll(currentUser.id);
    const watchlist = CineStorage.Watchlist.getAll(currentUser.id);

    // History list
    if (history.length > 0) {
      qs('#activity-empty').style.display = 'none';

      const listEl = document.createElement('div');
      listEl.className = 'activity-list';

      const recent = history.slice(0, 15);
      recent.forEach(entry => {
        const movie = allMovies.find(m => m.id === entry.movieId);
        if (!movie) return;

        const timeAgo = formatTimeAgo(entry.watchedAt);
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
          <img
            src="${movie.poster || '../assets/images/poster-placeholder.svg'}"
            alt="${escSafe(movie.title)}"
            class="activity-item__poster"
            onerror="this.src='../assets/images/poster-placeholder.svg'"
          />
          <div class="activity-item__info">
            <div class="activity-item__title">${escSafe(movie.title)}</div>
            <div class="activity-item__meta">${movie.year} · ${movie.genre?.[0] || ''}</div>
          </div>
          <div class="activity-item__time">${timeAgo}</div>
        `;
        item.addEventListener('click', () => {
          window.location.href = `movie-detail.html?id=${movie.id}`;
        });
        listEl.appendChild(item);
      });

      qs('#activity-content').appendChild(listEl);
    }

    // Watchlist preview
    if (watchlist.length > 0) {
      const card = qs('#watchlist-card');
      card.style.display = 'block';

      const grid = qs('#watchlist-preview');
      const previewIds = watchlist.slice(0, 12);

      previewIds.forEach(movieId => {
        const movie = allMovies.find(m => m.id === movieId);
        if (!movie) return;

        const item = document.createElement('div');
        item.className = 'watchlist-poster';
        item.title = movie.title;
        item.innerHTML = `
          <img
            src="${movie.poster || '../assets/images/poster-placeholder.svg'}"
            alt="${escSafe(movie.title)}"
            onerror="this.src='../assets/images/poster-placeholder.svg'"
          />
        `;
        item.addEventListener('click', () => {
          window.location.href = `movie-detail.html?id=${movie.id}`;
        });
        grid.appendChild(item);
      });
    }
  }

  /* ─────────────────────────────────────────
     DANGER ZONE
  ───────────────────────────────────────── */
  function initDangerZone() {
    qs('#clear-history-btn')?.addEventListener('click', () => {
      showConfirmModal(
        'Hapus Riwayat Tontonan',
        'Semua riwayat tontonan kamu akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.',
        () => {
          CineStorage.History.clear(currentUser.id);
          qs('#stat-watched').textContent = 0;
          // Clear activity list
          const listEl = qs('.activity-list');
          if (listEl) listEl.remove();
          qs('#activity-empty').style.display = 'flex';
          showToast('Riwayat tontonan berhasil dihapus.', 'success');
        }
      );
    });

    qs('#clear-watchlist-btn')?.addEventListener('click', () => {
      showConfirmModal(
        'Hapus Semua Watchlist',
        'Semua film di watchlist kamu akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.',
        () => {
          const key = CineStorage.KEYS.WATCHLIST + '_' + currentUser.id;
          CineStorage.lsRemove(key);
          qs('#stat-watchlist').textContent = 0;
          const card = qs('#watchlist-card');
          if (card) card.style.display = 'none';
          showToast('Watchlist berhasil dihapus.', 'success');
        }
      );
    });
  }

  /* ─────────────────────────────────────────
     CONFIRM MODAL
  ───────────────────────────────────────── */
  let confirmCallback = null;

  function initConfirmModal() {
    const modal     = qs('#confirm-modal');
    const cancelBtn = qs('#confirm-cancel');
    const okBtn     = qs('#confirm-ok');

    cancelBtn?.addEventListener('click', () => closeConfirmModal());
    okBtn?.addEventListener('click', () => {
      if (typeof confirmCallback === 'function') confirmCallback();
      closeConfirmModal();
    });

    modal?.addEventListener('click', (e) => {
      if (e.target === modal) closeConfirmModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeConfirmModal();
    });
  }

  function showConfirmModal(title, text, callback) {
    qs('#confirm-modal-title').textContent = title;
    qs('#confirm-modal-text').textContent  = text;
    confirmCallback = callback;
    qs('#confirm-modal').classList.add('open');
    qs('#confirm-modal').removeAttribute('aria-hidden');
  }

  function closeConfirmModal() {
    qs('#confirm-modal').classList.remove('open');
    qs('#confirm-modal').setAttribute('aria-hidden', 'true');
    confirmCallback = null;
  }

  /* ─────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────── */
  function qs(selector) {
    return document.querySelector(selector);
  }

  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

  function setVal(selector, val) {
    const el = qs(selector);
    if (el) el.value = val;
  }

  function setError(selector, msg) {
    const el = qs(selector);
    if (el) el.textContent = msg;
  }

  function clearErrors() {
    qsa('.form-error').forEach(el => el.textContent = '');
    qsa('.form-input').forEach(el => {
      el.classList.remove('is-invalid', 'is-valid');
    });
  }

  function clearPasswordErrors() {
    ['#err-current-pass','#err-new-pass','#err-confirm-pass'].forEach(sel => setError(sel, ''));
    ['#input-current-pass','#input-new-pass','#input-confirm-pass'].forEach(sel => {
      qs(sel)?.classList.remove('is-invalid','is-valid');
    });
  }

  function setLoading(btn, loading) {
    if (!btn) return;
    btn.disabled = loading;
    if (loading) {
      btn.dataset.origText = btn.innerHTML;
      btn.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation:spin 0.8s linear infinite;">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        Menyimpan...
      `;
    } else {
      btn.innerHTML = btn.dataset.origText || 'Simpan';
    }
  }

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

  function formatTimeAgo(timestamp) {
    if (!timestamp) return '';
    const diff = Date.now() - timestamp;
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);

    if (mins < 1)   return 'Baru saja';
    if (mins < 60)  return `${mins}m lalu`;
    if (hours < 24) return `${hours}j lalu`;
    if (days < 7)   return `${days}h lalu`;

    return new Date(timestamp).toLocaleDateString('id-ID', { day:'numeric', month:'short' });
  }

  async function hashPassword(pass) {
    // Use the hash utility from hash.js
    if (window.HashUtil && HashUtil.sha256) {
      return await HashUtil.sha256(pass);
    }
    // Fallback: simple hash simulation
    return btoa(encodeURIComponent(pass));
  }

  function showToast(msg, type = 'info') {
    if (window.Toast) {
      Toast.show(type, msg);
    } else {
      console.log(`[Toast] ${type}: ${msg}`);
    }
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  /* ─────────────────────────────────────────
     EXPORT & AUTO-INIT
  ───────────────────────────────────────── */
  return { init };

})();

// Init when DOM ready, after app.js
document.addEventListener('DOMContentLoaded', () => {
  // Small delay to ensure app.js guard has run
  setTimeout(() => ProfilePage.init(), 50);
});

window.ProfilePage = ProfilePage;
