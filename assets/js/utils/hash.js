/**
 * CineVerse — hash.js
 * Password hashing using Web Crypto API (SHA-256)
 * No external dependencies needed.
 */

const HashUtil = {
  /**
   * Hash a string using SHA-256
   * @param {string} input
   * @returns {Promise<string>} hex string
   */
  async sha256(input) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Hash password with a salt
   * @param {string} password
   * @param {string} salt
   * @returns {Promise<string>}
   */
  async hashPassword(password, salt) {
    return this.sha256(`${password}::${salt}`);
  },

  /**
   * Generate a random salt
   * @returns {string}
   */
  generateSalt() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Verify password against stored hash
   * @param {string} password - plain text
   * @param {string} hash - stored hash
   * @param {string} salt - stored salt
   * @returns {Promise<boolean>}
   */
  async verifyPassword(password, hash, salt) {
    const computed = await this.hashPassword(password, salt);
    return computed === hash;
  },

  /**
   * Generate a random unique ID
   * @returns {string}
   */
  generateId() {
    const ts = Date.now().toString(36);
    const rand = Math.random().toString(36).substring(2, 9);
    return `${ts}-${rand}`;
  },
};

window.HashUtil = HashUtil;
