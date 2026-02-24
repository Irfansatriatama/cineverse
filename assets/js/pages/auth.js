/**
 * CineVerse — pages/auth.js
 * Handles Login & Register page interactions
 * Depends on: auth.js (core), validators.js, toast.js, storage.js
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────
     DETECT PAGE
  ───────────────────────────────────────── */
  const isLogin    = !!document.getElementById('login-form');
  const isRegister = !!document.getElementById('register-form');

  /* ─────────────────────────────────────────
     INIT
  ───────────────────────────────────────── */
  async function init() {
    // Apply theme
    CineStorage.Theme.apply();

    // Init auth core (seeds demo, redirects if already logged in)
    await AuthCore.init();

    // Load poster images for visual panel
    loadAuthPosters();

    if (isLogin)    initLoginPage();
    if (isRegister) initRegisterPage();
  }

  /* ─────────────────────────────────────────
     FLOATING POSTERS
  ───────────────────────────────────────── */
  async function loadAuthPosters() {
    const container = document.getElementById('auth-posters');
    if (!container) return;

    try {
      const res  = await fetch('../../data/movies.json');
      const data = await res.json();
      const movies = (data.movies || []).filter(m => m.posterUrl).slice(0, 5);

      movies.forEach((m, i) => {
        const div = document.createElement('div');
        div.className = `auth-poster auth-poster--${i + 1}`;
        div.innerHTML = `<img src="${m.posterUrl}" alt="" loading="lazy" onerror="this.parentElement.style.display='none'" />`;
        container.appendChild(div);
      });
    } catch (e) {
      // Silently fail — visual only
    }
  }

  /* ─────────────────────────────────────────
     ─── LOGIN PAGE ───
  ───────────────────────────────────────── */
  function initLoginPage() {
    const form        = document.getElementById('login-form');
    const emailInput  = document.getElementById('email');
    const passInput   = document.getElementById('password');
    const submitBtn   = document.getElementById('submit-btn');
    const toggleBtn   = document.getElementById('toggle-password');
    const fillDemo    = document.getElementById('fill-demo');
    const forgotLink  = document.getElementById('forgot-link');
    const rememberMe  = document.getElementById('remember-me');

    // Pre-fill remembered email
    const remembered = AuthCore.getRememberedEmail();
    if (remembered && emailInput) {
      emailInput.value = remembered;
      if (rememberMe) rememberMe.checked = true;
    }

    // Password toggle
    toggleBtn?.addEventListener('click', () => togglePasswordVisibility(passInput, toggleBtn));

    // Demo fill
    fillDemo?.addEventListener('click', () => {
      emailInput.value = AuthCore.getDemoEmail();
      passInput.value  = AuthCore.getDemoPassword();
      clearFieldError(emailInput);
      clearFieldError(passInput);
    });

    // Forgot password (placeholder)
    forgotLink?.addEventListener('click', (e) => {
      e.preventDefault();
      showAlert('info', 'Fitur lupa password akan hadir di versi berikutnya. Gunakan akun demo untuk mencoba!');
    });

    // Real-time validation
    emailInput?.addEventListener('blur', () => {
      const err = Validators.email(emailInput.value);
      Validators.showFieldError(emailInput, err);
    });

    passInput?.addEventListener('blur', () => {
      if (!passInput.value) Validators.showFieldError(passInput, 'Password wajib diisi');
      else Validators.showFieldError(passInput, null);
    });

    // Form submit
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      // Validate
      const emailErr = Validators.email(emailInput.value);
      const passErr  = passInput.value ? null : 'Password wajib diisi';

      Validators.showFieldError(emailInput, emailErr);
      Validators.showFieldError(passInput, passErr);

      if (emailErr || passErr) return;

      // Loading state
      setSubmitLoading(submitBtn, true);

      try {
        const result = await AuthCore.login({
          email:    emailInput.value,
          password: passInput.value,
          remember: rememberMe?.checked || false,
        });

        if (result.success) {
          if (window.Toast) Toast.success(`Selamat datang, ${result.user.displayName}! 🎬`);
          // Redirect after brief delay
          setTimeout(() => {
            window.location.replace('../dashboard.html');
          }, 800);
        } else {
          showAlert('error', result.error);
          setSubmitLoading(submitBtn, false);
          // Shake form
          form.classList.add('shake');
          setTimeout(() => form.classList.remove('shake'), 500);
        }
      } catch (err) {
        console.error('[Auth] Login error:', err);
        showAlert('error', 'Terjadi kesalahan. Silakan coba lagi.');
        setSubmitLoading(submitBtn, false);
      }
    });
  }

  /* ─────────────────────────────────────────
     ─── REGISTER PAGE ───
  ───────────────────────────────────────── */
  function initRegisterPage() {
    const form         = document.getElementById('register-form');
    const nameInput    = document.getElementById('fullname');
    const emailInput   = document.getElementById('email');
    const passInput    = document.getElementById('password');
    const confirmInput = document.getElementById('confirm-password');
    const submitBtn    = document.getElementById('submit-btn');
    const togglePass   = document.getElementById('toggle-password');
    const toggleConf   = document.getElementById('toggle-confirm');
    const agreeTerms   = document.getElementById('agree-terms');
    const strengthBox  = document.getElementById('password-strength');

    // Password toggle buttons
    togglePass?.addEventListener('click', () => togglePasswordVisibility(passInput, togglePass));
    toggleConf?.addEventListener('click', () => togglePasswordVisibility(confirmInput, toggleConf));

    // Password strength meter
    passInput?.addEventListener('input', () => {
      updatePasswordStrength(passInput.value);
      if (confirmInput.value) {
        const err = Validators.confirmPassword(confirmInput.value, passInput.value);
        Validators.showFieldError(confirmInput, err);
      }
    });

    // Real-time validation
    nameInput?.addEventListener('blur', () => {
      Validators.showFieldError(nameInput, Validators.displayName(nameInput.value));
    });

    emailInput?.addEventListener('blur', () => {
      Validators.showFieldError(emailInput, Validators.email(emailInput.value));
    });

    passInput?.addEventListener('blur', () => {
      Validators.showFieldError(passInput, Validators.password(passInput.value));
    });

    confirmInput?.addEventListener('blur', () => {
      Validators.showFieldError(confirmInput, Validators.confirmPassword(confirmInput.value, passInput.value));
    });

    // Form submit
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      // Full validation
      const nameErr    = Validators.displayName(nameInput.value);
      const emailErr   = Validators.email(emailInput.value);
      const passErr    = Validators.password(passInput.value);
      const confirmErr = Validators.confirmPassword(confirmInput.value, passInput.value);
      const termsErr   = agreeTerms?.checked ? null : 'Kamu harus menyetujui syarat & ketentuan';

      Validators.showFieldError(nameInput, nameErr);
      Validators.showFieldError(emailInput, emailErr);
      Validators.showFieldError(passInput, passErr);
      Validators.showFieldError(confirmInput, confirmErr);

      if (termsErr) {
        showAlert('error', termsErr);
        return;
      }

      if (nameErr || emailErr || passErr || confirmErr) return;

      // Loading state
      setSubmitLoading(submitBtn, true);

      try {
        const result = await AuthCore.register({
          displayName: nameInput.value,
          email:       emailInput.value,
          password:    passInput.value,
        });

        if (result.success) {
          if (window.Toast) Toast.success(`Akun berhasil dibuat! Selamat datang, ${result.user.displayName}! 🎉`);
          setTimeout(() => {
            window.location.replace('../dashboard.html');
          }, 1000);
        } else {
          showAlert('error', result.error);
          setSubmitLoading(submitBtn, false);
        }
      } catch (err) {
        console.error('[Auth] Register error:', err);
        showAlert('error', 'Terjadi kesalahan. Silakan coba lagi.');
        setSubmitLoading(submitBtn, false);
      }
    });

    /* ── Password Strength Meter ── */
    function updatePasswordStrength(value) {
      if (!strengthBox) return;

      if (!value) {
        strengthBox.style.display = 'none';
        return;
      }

      strengthBox.style.display = 'block';

      const { score, label, color } = Validators.passwordStrength(value);

      // Reset bars
      for (let i = 1; i <= 4; i++) {
        const bar = document.getElementById(`bar-${i}`);
        if (!bar) continue;
        bar.className = 'strength-bar';
        if (i <= score) bar.classList.add(`active-${score}`);
      }

      const labelEl = document.getElementById('password-strength-label');
      if (labelEl) {
        labelEl.textContent = label;
        labelEl.style.color = color;
      }
    }
  }

  /* ─────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────── */
  function togglePasswordVisibility(input, btn) {
    if (!input || !btn) return;
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';

    const icon = btn.querySelector('svg');
    if (!icon) return;

    if (isPassword) {
      // Show "eye-off" icon
      icon.innerHTML = `
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      `;
      btn.setAttribute('aria-label', 'Sembunyikan password');
    } else {
      // Show "eye" icon
      icon.innerHTML = `
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      `;
      btn.setAttribute('aria-label', 'Tampilkan password');
    }
  }

  function setSubmitLoading(btn, isLoading) {
    if (!btn) return;
    btn.classList.toggle('loading', isLoading);
    btn.disabled = isLoading;
  }

  function showAlert(type, message) {
    const el = document.getElementById('auth-alert');
    if (!el) return;

    const icons = {
      error: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
      info:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="8"/><line x1="12" y1="12" x2="12" y2="16"/></svg>`,
    };

    const colors = {
      error: '#EF4444',
      info:  '#3B82F6',
    };

    el.style.display   = 'flex';
    el.style.alignItems = 'center';
    el.style.gap       = '10px';
    el.style.padding   = '12px 16px';
    el.style.borderRadius = '8px';
    el.style.background = type === 'error'
      ? 'rgba(239,68,68,0.08)'
      : 'rgba(59,130,246,0.08)';
    el.style.border     = `1px solid ${type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.3)'}`;
    el.style.color      = colors[type] || '#F9FAFB';
    el.style.fontSize   = '0.875rem';
    el.innerHTML = `${icons[type] || ''}<span>${message}</span>`;
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function hideAlert() {
    const el = document.getElementById('auth-alert');
    if (el) el.style.display = 'none';
  }

  function clearFieldError(input) {
    if (!input) return;
    input.classList.remove('error');
    const wrapper = input.closest('.form-group');
    wrapper?.querySelector('.form-error')?.remove();
  }

  /* ─── START ─── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
