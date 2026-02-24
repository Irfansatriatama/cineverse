/**
 * CineVerse — storage.js
 * Abstraction layer for localStorage & sessionStorage
 * All data keys prefixed with 'cineverse_' for namespacing
 */

const KEYS = {
  // User
  USERS:        'cineverse_users',
  CURRENT_USER: 'cineverse_current_user',
  SETTINGS:     'cineverse_settings',

  // Film
  WATCHLIST:  'cineverse_watchlist',
  HISTORY:    'cineverse_history',
  REVIEWS:    'cineverse_reviews',
  PROGRESS:   'cineverse_progress',

  // UI
  THEME:    'cineverse_theme',
  LANGUAGE: 'cineverse_language',

  // Session (stored in sessionStorage)
  SESSION_SCROLL:  'cineverse_scroll',
  SESSION_FILTERS: 'cineverse_filters',
  SESSION_FORM:    'cineverse_form_state',
};

/* ─────────────────────────────────────────
   LOCAL STORAGE HELPERS
───────────────────────────────────────── */

/**
 * Save data to localStorage
 * @param {string} key
 * @param {*} data
 */
function lsSet(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('[Storage] lsSet error:', e);
    return false;
  }
}

/**
 * Get data from localStorage
 * @param {string} key
 * @param {*} fallback - default value if key doesn't exist
 * @returns {*}
 */
function lsGet(key, fallback = null) {
  try {
    const item = localStorage.getItem(key);
    return item !== null ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error('[Storage] lsGet error:', e);
    return fallback;
  }
}

/**
 * Remove key from localStorage
 * @param {string} key
 */
function lsRemove(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    return false;
  }
}

/* ─────────────────────────────────────────
   SESSION STORAGE HELPERS
───────────────────────────────────────── */

function ssSet(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    return false;
  }
}

function ssGet(key, fallback = null) {
  try {
    const item = sessionStorage.getItem(key);
    return item !== null ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

function ssRemove(key) {
  try {
    sessionStorage.removeItem(key);
    return true;
  } catch (e) {
    return false;
  }
}

/* ─────────────────────────────────────────
   USER STORAGE API
───────────────────────────────────────── */

const UserStorage = {
  /** Get all registered users */
  getAll() {
    return lsGet(KEYS.USERS, []);
  },

  /** Save all users array */
  saveAll(users) {
    return lsSet(KEYS.USERS, users);
  },

  /** Find user by email */
  findByEmail(email) {
    return this.getAll().find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  /** Find user by id */
  findById(id) {
    return this.getAll().find(u => u.id === id) || null;
  },

  /** Add new user */
  add(user) {
    const users = this.getAll();
    users.push(user);
    return lsSet(KEYS.USERS, users);
  },

  /** Update existing user */
  update(id, updates) {
    const users = this.getAll();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return false;
    users[idx] = { ...users[idx], ...updates, updatedAt: Date.now() };
    return lsSet(KEYS.USERS, users);
  },

  /** Get currently logged-in user */
  getCurrent() {
    return lsGet(KEYS.CURRENT_USER, null);
  },

  /** Set current user (login) */
  setCurrent(user) {
    return lsSet(KEYS.CURRENT_USER, user);
  },

  /** Clear current user (logout) */
  clearCurrent() {
    return lsRemove(KEYS.CURRENT_USER);
  },

  /** Check if user is logged in */
  isLoggedIn() {
    return this.getCurrent() !== null;
  },
};

/* ─────────────────────────────────────────
   WATCHLIST STORAGE API
───────────────────────────────────────── */

const WatchlistStorage = {
  _key(userId) {
    return `${KEYS.WATCHLIST}_${userId}`;
  },

  getAll(userId) {
    return lsGet(this._key(userId), []);
  },

  add(userId, movieId) {
    const list = this.getAll(userId);
    if (!list.includes(movieId)) {
      list.push(movieId);
      lsSet(this._key(userId), list);
    }
  },

  remove(userId, movieId) {
    const list = this.getAll(userId).filter(id => id !== movieId);
    lsSet(this._key(userId), list);
  },

  toggle(userId, movieId) {
    const list = this.getAll(userId);
    if (list.includes(movieId)) {
      this.remove(userId, movieId);
      return false; // removed
    } else {
      this.add(userId, movieId);
      return true; // added
    }
  },

  has(userId, movieId) {
    return this.getAll(userId).includes(movieId);
  },

  clear(userId) {
    lsRemove(this._key(userId));
  },
};

/* ─────────────────────────────────────────
   HISTORY STORAGE API
───────────────────────────────────────── */

const HistoryStorage = {
  _key(userId) {
    return `${KEYS.HISTORY}_${userId}`;
  },

  getAll(userId) {
    return lsGet(this._key(userId), []);
  },

  add(userId, movieId) {
    const history = this.getAll(userId);
    const existing = history.findIndex(h => h.movieId === movieId);
    const entry = { movieId, watchedAt: Date.now() };

    if (existing !== -1) {
      history[existing] = entry; // update timestamp
    } else {
      history.unshift(entry); // newest first
    }

    // Keep max 200 entries
    if (history.length > 200) history.splice(200);
    lsSet(this._key(userId), history);
  },

  remove(userId, movieId) {
    const history = this.getAll(userId).filter(h => h.movieId !== movieId);
    lsSet(this._key(userId), history);
  },

  clear(userId) {
    lsRemove(this._key(userId));
  },
};

/* ─────────────────────────────────────────
   PROGRESS STORAGE API
───────────────────────────────────────── */

const ProgressStorage = {
  _key(userId) {
    return `${KEYS.PROGRESS}_${userId}`;
  },

  get(userId, movieId) {
    const all = lsGet(this._key(userId), {});
    return all[movieId] || null;
  },

  save(userId, movieId, seconds) {
    const all = lsGet(this._key(userId), {});
    all[movieId] = { seconds, savedAt: Date.now() };
    lsSet(this._key(userId), all);
  },

  clear(userId, movieId) {
    const all = lsGet(this._key(userId), {});
    delete all[movieId];
    lsSet(this._key(userId), all);
  },
};

/* ─────────────────────────────────────────
   REVIEW STORAGE API
───────────────────────────────────────── */

const ReviewStorage = {
  _key(movieId) {
    return `${KEYS.REVIEWS}_${movieId}`;
  },

  getAll(movieId) {
    return lsGet(this._key(movieId), []);
  },

  getUserReview(movieId, userId) {
    return this.getAll(movieId).find(r => r.userId === userId) || null;
  },

  save(movieId, userId, rating, text = '') {
    const reviews = this.getAll(movieId);
    const existing = reviews.findIndex(r => r.userId === userId);
    const review = { userId, rating, text, createdAt: Date.now() };

    if (existing !== -1) {
      reviews[existing] = review;
    } else {
      reviews.push(review);
    }
    lsSet(this._key(movieId), reviews);
  },

  remove(movieId, userId) {
    const reviews = this.getAll(movieId).filter(r => r.userId !== userId);
    lsSet(this._key(movieId), reviews);
  },

  getAvgRating(movieId) {
    const reviews = this.getAll(movieId);
    if (!reviews.length) return 0;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  },
};

/* ─────────────────────────────────────────
   SETTINGS STORAGE API
───────────────────────────────────────── */

const SettingsStorage = {
  _key(userId) {
    return `${KEYS.SETTINGS}_${userId}`;
  },

  getDefaults() {
    return {
      theme: 'dark',
      language: 'id',
      autoplay: true,
      notifications: false,
      preferredGenres: [],
      quality: 'auto',
    };
  },

  get(userId) {
    return { ...this.getDefaults(), ...lsGet(this._key(userId), {}) };
  },

  save(userId, settings) {
    const current = this.get(userId);
    return lsSet(this._key(userId), { ...current, ...settings });
  },

  getSetting(userId, key) {
    return this.get(userId)[key];
  },

  setSetting(userId, key, value) {
    return this.save(userId, { [key]: value });
  },
};

/* ─────────────────────────────────────────
   THEME STORAGE
───────────────────────────────────────── */

const ThemeStorage = {
  get() {
    return lsGet(KEYS.THEME, 'dark');
  },
  set(theme) {
    lsSet(KEYS.THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
  },
  toggle() {
    const current = this.get();
    const next = current === 'dark' ? 'light' : 'dark';
    this.set(next);
    return next;
  },
  apply() {
    const theme = this.get();
    document.documentElement.setAttribute('data-theme', theme);
  },
};

/* ─────────────────────────────────────────
   SESSION STORAGE API
───────────────────────────────────────── */

const SessionStorage = {
  saveScroll(page, position) {
    ssSet(`${KEYS.SESSION_SCROLL}_${page}`, position);
  },
  getScroll(page) {
    return ssGet(`${KEYS.SESSION_SCROLL}_${page}`, 0);
  },
  saveFilters(filters) {
    ssSet(KEYS.SESSION_FILTERS, filters);
  },
  getFilters() {
    return ssGet(KEYS.SESSION_FILTERS, {});
  },
  clearFilters() {
    ssRemove(KEYS.SESSION_FILTERS);
  },
  saveFormState(form, data) {
    ssSet(`${KEYS.SESSION_FORM}_${form}`, data);
  },
  getFormState(form) {
    return ssGet(`${KEYS.SESSION_FORM}_${form}`, null);
  },
};

/* ─────────────────────────────────────────
   EXPORT
───────────────────────────────────────── */

window.CineStorage = {
  KEYS,
  // Raw helpers
  lsGet,
  lsSet,
  lsRemove,
  ssGet,
  ssSet,
  ssRemove,
  // Domain APIs
  User:     UserStorage,
  Watchlist: WatchlistStorage,
  History:  HistoryStorage,
  Progress: ProgressStorage,
  Review:   ReviewStorage,
  Settings: SettingsStorage,
  Theme:    ThemeStorage,
  Session:  SessionStorage,
};
