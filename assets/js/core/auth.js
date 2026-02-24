/**
 * CineVerse — auth.js (core)
 * Authentication logic: register, login, logout, session management
 * Depends on: storage.js, hash.js
 */

const AuthCore = (() => {
  'use strict';

  const DEMO_EMAIL    = 'demo@cineverse.id';
  const DEMO_PASSWORD = 'Demo@1234';
  const DEMO_NAME     = 'Demo User';

  /* ─────────────────────────────────────────
     INIT — seed demo account if not exists
  ───────────────────────────────────────── */
  async function init() {
    // Apply saved theme
    if (window.CineStorage) CineStorage.Theme.apply();

    // Check if already logged in → redirect
    const current = CineStorage.User.getCurrent();
    if (current) {
      const isAuthPage = window.location.pathname.includes('/auth/');
      if (isAuthPage) {
        window.location.replace('../dashboard.html');
        return;
      }
    }

    // Seed demo user if not exists
    await seedDemoUser();
  }

  async function seedDemoUser() {
    const existing = CineStorage.User.findByEmail(DEMO_EMAIL);
    if (!existing) {
      const salt = HashUtil.generateSalt();
      const hash = await HashUtil.hashPassword(DEMO_PASSWORD, salt);
      CineStorage.User.add({
        id:           'demo-user',
        email:         DEMO_EMAIL,
        displayName:   DEMO_NAME,
        passwordHash:  hash,
        passwordSalt:  salt,
        avatar:        null,
        joinedAt:      '2025-01-01T00:00:00.000Z',
        preferences:   { genres: [], notifications: true, newsletter: false },
        isDemo:        true,
      });
    }
  }

  /* ─────────────────────────────────────────
     REGISTER
  ───────────────────────────────────────── */
  async function register({ displayName, email, password }) {
    const existing = CineStorage.User.findByEmail(email);
    if (existing) {
      return { success: false, error: 'Email sudah terdaftar. Silakan masuk atau gunakan email lain.' };
    }

    const salt = HashUtil.generateSalt();
    const hash = await HashUtil.hashPassword(password, salt);
    const id   = HashUtil.generateId();

    const newUser = {
      id,
      email:        email.toLowerCase().trim(),
      displayName:  displayName.trim(),
      passwordHash: hash,
      passwordSalt: salt,
      avatar:       null,
      joinedAt:     new Date().toISOString(),
      preferences:  { genres: [], notifications: false, newsletter: false },
      isDemo:       false,
    };

    CineStorage.User.add(newUser);

    const sessionUser = sanitizeUser(newUser);
    CineStorage.User.setCurrent(sessionUser);

    return { success: true, user: sessionUser };
  }

  /* ─────────────────────────────────────────
     LOGIN
  ───────────────────────────────────────── */
  async function login({ email, password, remember = false }) {
    const users = CineStorage.User.getAll();
    const user  = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

    if (!user) {
      return { success: false, error: 'Email tidak terdaftar. Periksa kembali atau daftar akun baru.' };
    }

    const valid = await HashUtil.verifyPassword(password, user.passwordHash, user.passwordSalt);
    if (!valid) {
      return { success: false, error: 'Password salah. Coba lagi atau gunakan "Lupa Password".' };
    }

    const sessionUser = sanitizeUser(user);
    CineStorage.User.setCurrent(sessionUser);

    if (remember) {
      localStorage.setItem('cineverse_remember', email.toLowerCase().trim());
    } else {
      localStorage.removeItem('cineverse_remember');
    }

    return { success: true, user: sessionUser };
  }

  /* ─────────────────────────────────────────
     LOGOUT
  ───────────────────────────────────────── */
  function logout() {
    CineStorage.User.clearCurrent();
    window.location.href = getBasePath() + 'index.html';
  }

  /* ─────────────────────────────────────────
     GET CURRENT USER
  ───────────────────────────────────────── */
  function getCurrentUser() {
    return CineStorage.User.getCurrent();
  }

  /* ─────────────────────────────────────────
     REQUIRE AUTH (redirect if not logged in)
  ───────────────────────────────────────── */
  function requireAuth() {
    const user = CineStorage.User.getCurrent();
    if (!user) {
      const base = getBasePath();
      window.location.replace(base + 'pages/auth/login.html');
      return null;
    }
    return user;
  }

  /* ─────────────────────────────────────────
     GET REMEMBERED EMAIL
  ───────────────────────────────────────── */
  function getRememberedEmail() {
    return localStorage.getItem('cineverse_remember') || '';
  }

  /* ─────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────── */
  function sanitizeUser(user) {
    // Never expose hash/salt to session
    const { passwordHash, passwordSalt, ...safe } = user;
    return safe;
  }

  function getBasePath() {
    const path = window.location.pathname;
    if (path.includes('/pages/auth/')) return '../../';
    if (path.includes('/pages/')) return '../';
    return './';
  }

  /* ─────────────────────────────────────────
     EXPORT
  ───────────────────────────────────────── */
  return { init, register, login, logout, getCurrentUser, requireAuth, getRememberedEmail, getDemoEmail: () => DEMO_EMAIL, getDemoPassword: () => DEMO_PASSWORD };
})();

window.AuthCore = AuthCore;
