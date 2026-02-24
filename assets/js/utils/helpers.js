/**
 * CineVerse — helpers.js
 * General utility functions used across the app
 */

const Helpers = {
  /* ─── STRING ─── */

  /**
   * Truncate string to maxLength with ellipsis
   */
  truncate(str, maxLength = 100) {
    if (!str) return '';
    return str.length > maxLength ? str.slice(0, maxLength).trim() + '…' : str;
  },

  /**
   * Capitalize first letter of each word
   */
  titleCase(str) {
    return str.replace(/\b\w/g, l => l.toUpperCase());
  },

  /**
   * Slugify a string
   */
  slug(str) {
    return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  },

  /* ─── NUMBER ─── */

  /**
   * Format number with thousands separator
   */
  formatNumber(num) {
    return new Intl.NumberFormat('id-ID').format(num);
  },

  /**
   * Format runtime in minutes to "Xj Ym" or "Xh Ym"
   */
  formatRuntime(minutes) {
    if (!minutes) return '-';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    return m === 0 ? `${h}j` : `${h}j ${m}m`;
  },

  /**
   * Format file size in bytes to human readable
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  },

  /* ─── DATE ─── */

  /**
   * Format date to locale string (Indonesian)
   */
  formatDate(dateInput, options = {}) {
    const date = new Date(dateInput);
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('id-ID', { ...defaultOptions, ...options });
  },

  /**
   * Relative time (e.g., "3 hari lalu")
   */
  timeAgo(dateInput) {
    const seconds = Math.floor((Date.now() - new Date(dateInput)) / 1000);
    const intervals = [
      { label: 'tahun',  secs: 31536000 },
      { label: 'bulan',  secs: 2592000 },
      { label: 'minggu', secs: 604800 },
      { label: 'hari',   secs: 86400 },
      { label: 'jam',    secs: 3600 },
      { label: 'menit',  secs: 60 },
    ];
    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.secs);
      if (count >= 1) return `${count} ${interval.label} lalu`;
    }
    return 'baru saja';
  },

  /**
   * Format seconds to MM:SS or HH:MM:SS
   */
  formatSeconds(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    if (h > 0) {
      return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  },

  /* ─── DOM ─── */

  /**
   * Get element or throw
   */
  getEl(selector, parent = document) {
    return parent.querySelector(selector);
  },

  /**
   * Get all elements
   */
  getAllEl(selector, parent = document) {
    return Array.from(parent.querySelectorAll(selector));
  },

  /**
   * Create element with attributes and content
   */
  createElement(tag, attrs = {}, content = '') {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([key, val]) => {
      if (key === 'class') el.className = val;
      else if (key === 'html') el.innerHTML = val;
      else el.setAttribute(key, val);
    });
    if (content && typeof content === 'string') el.textContent = content;
    return el;
  },

  /**
   * Smooth scroll to element
   */
  scrollTo(selector) {
    const el = document.querySelector(selector);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  /**
   * Add/remove class with optional delay
   */
  toggleClass(el, cls, force) {
    if (typeof el === 'string') el = document.querySelector(el);
    if (!el) return;
    el.classList.toggle(cls, force);
  },

  /* ─── EVENT ─── */

  /**
   * Debounce function
   */
  debounce(fn, delay = 300) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  /**
   * Throttle function
   */
  throttle(fn, limit = 200) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /* ─── ARRAY ─── */

  /**
   * Shuffle array (Fisher-Yates)
   */
  shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  },

  /**
   * Get random items from array
   */
  sample(arr, n = 1) {
    return this.shuffle(arr).slice(0, n);
  },

  /**
   * Group array by key
   */
  groupBy(arr, key) {
    return arr.reduce((groups, item) => {
      const group = item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  },

  /* ─── URL / NAVIGATION ─── */

  /**
   * Get query param from URL
   */
  getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  },

  /**
   * Build query string from object
   */
  buildQuery(params) {
    return new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== null && v !== undefined))
    ).toString();
  },

  /* ─── MISC ─── */

  /**
   * Deep clone object
   */
  clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  /**
   * Lazy load image
   */
  lazyLoad(img) {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            el.src = el.dataset.src;
            el.removeAttribute('data-src');
            observer.unobserve(el);
          }
        });
      });
      observer.observe(img);
    } else {
      img.src = img.dataset.src;
    }
  },

  /**
   * Init all lazy images on page
   */
  initLazyImages() {
    document.querySelectorAll('img[data-src]').forEach(img => this.lazyLoad(img));
  },

  /**
   * Copy text to clipboard
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Check if mobile device
   */
  isMobile() {
    return window.innerWidth <= 768;
  },

  /**
   * Get initials from name (max 2 chars)
   */
  getInitials(name) {
    return name
      .split(' ')
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase();
  },
};

window.Helpers = Helpers;
