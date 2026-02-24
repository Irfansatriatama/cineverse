/**
 * CineVerse — validators.js
 * Form validation functions for auth and other forms
 */

const Validators = {
  /**
   * Validate email format
   */
  email(value) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value || !value.trim()) return 'Email wajib diisi';
    if (!re.test(value.trim())) return 'Format email tidak valid';
    return null;
  },

  /**
   * Validate password strength
   * Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
   */
  password(value) {
    if (!value) return 'Password wajib diisi';
    if (value.length < 8) return 'Password minimal 8 karakter';
    if (!/[A-Z]/.test(value)) return 'Password harus mengandung huruf kapital';
    if (!/[a-z]/.test(value)) return 'Password harus mengandung huruf kecil';
    if (!/[0-9]/.test(value)) return 'Password harus mengandung angka';
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value))
      return 'Password harus mengandung karakter khusus (!@#$%...)';
    return null;
  },

  /**
   * Validate password confirmation
   */
  confirmPassword(value, original) {
    if (!value) return 'Konfirmasi password wajib diisi';
    if (value !== original) return 'Password tidak cocok';
    return null;
  },

  /**
   * Validate username / display name
   */
  displayName(value) {
    if (!value || !value.trim()) return 'Nama wajib diisi';
    if (value.trim().length < 2) return 'Nama minimal 2 karakter';
    if (value.trim().length > 50) return 'Nama maksimal 50 karakter';
    return null;
  },

  /**
   * Validate required field
   */
  required(value, fieldName = 'Field') {
    if (value === null || value === undefined || String(value).trim() === '') {
      return `${fieldName} wajib diisi`;
    }
    return null;
  },

  /**
   * Validate min length
   */
  minLength(value, min, fieldName = 'Field') {
    if (!value || value.length < min) return `${fieldName} minimal ${min} karakter`;
    return null;
  },

  /**
   * Validate max length
   */
  maxLength(value, max, fieldName = 'Field') {
    if (value && value.length > max) return `${fieldName} maksimal ${max} karakter`;
    return null;
  },

  /**
   * Get password strength score 0-4
   */
  passwordStrength(password) {
    let score = 0;
    if (!password) return { score: 0, label: '', color: '' };
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score++;

    const levels = [
      { label: '', color: '' },
      { label: 'Lemah', color: '#E50914' },
      { label: 'Cukup', color: '#F5A623' },
      { label: 'Kuat', color: '#3B82F6' },
      { label: 'Sangat Kuat', color: '#10B981' },
    ];
    return { score, ...levels[score] };
  },

  /**
   * Validate and show/hide error on form field
   * @param {HTMLElement} input
   * @param {string|null} errorMsg - null = valid
   */
  showFieldError(input, errorMsg) {
    const wrapper = input.closest('.form-group');
    if (!wrapper) return;

    // Remove existing error
    const existingError = wrapper.querySelector('.form-error');
    if (existingError) existingError.remove();

    if (errorMsg) {
      input.classList.add('error');
      const errorEl = document.createElement('p');
      errorEl.className = 'form-error';
      errorEl.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> ${errorMsg}`;
      wrapper.appendChild(errorEl);
    } else {
      input.classList.remove('error');
    }
  },

  /**
   * Clear all field errors in a form
   */
  clearFormErrors(form) {
    form.querySelectorAll('.form-error').forEach(el => el.remove());
    form.querySelectorAll('.form-input.error').forEach(el => el.classList.remove('error'));
  },
};

window.Validators = Validators;
