/**
 * CineVerse — toast.js
 * Toast notification system
 */

const Toast = {
  container: null,

  _getContainer() {
    if (!this.container) {
      this.container = document.getElementById('toast-container');
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.setAttribute('role', 'alert');
        this.container.setAttribute('aria-live', 'polite');
        document.body.appendChild(this.container);
      }
    }
    return this.container;
  },

  _icons: {
    success: `<svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    error:   `<svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    warning: `<svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    info:    `<svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  },

  show(type, message, title = '', duration = 3500) {
    const container = this._getContainer();

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.setAttribute('role', 'status');
    toast.innerHTML = `
      ${this._icons[type] || this._icons.info}
      <div class="toast__text">
        ${title ? `<p class="toast__title">${title}</p>` : ''}
        <p class="toast__message">${message}</p>
      </div>
      <button class="toast__close" aria-label="Tutup notifikasi">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `;

    const closeBtn = toast.querySelector('.toast__close');
    closeBtn.addEventListener('click', () => this._dismiss(toast));

    container.appendChild(toast);

    // Auto dismiss
    const timer = setTimeout(() => this._dismiss(toast), duration);
    toast._timer = timer;

    return toast;
  },

  _dismiss(toast) {
    clearTimeout(toast._timer);
    toast.classList.add('hiding');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  },

  success(message, title = 'Berhasil') {
    return this.show('success', message, title);
  },
  error(message, title = 'Error') {
    return this.show('error', message, title);
  },
  warning(message, title = 'Perhatian') {
    return this.show('warning', message, title);
  },
  info(message, title = '') {
    return this.show('info', message, title);
  },
};

window.Toast = Toast;
