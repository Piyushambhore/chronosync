/**
 * Admin Cryptographic Authentication Utilities
 * Uses the Web Crypto API for secure SHA-256 hashing.
 */

const STORAGE_KEY_HASH = 'chronosync_admin_pwd_hash';
const STORAGE_KEY_SESSION = 'chronosync_admin_session';
const SALT = 'chronosync_admin_salt_2026_';

/**
 * Computes the SHA-256 hexadecimal hash of a given string.
 */
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(SALT + message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Checks if the user has already configured a custom admin master password.
 */
export function hasCustomAdminPassword(): boolean {
  return !!localStorage.getItem(STORAGE_KEY_HASH);
}

/**
 * Sets a new admin master password by storing its SHA-256 hash.
 */
export async function setAdminPassword(newPassword: string): Promise<void> {
  const hash = await sha256(newPassword);
  localStorage.setItem(STORAGE_KEY_HASH, hash);
}

/**
 * Verifies the entered password against the stored SHA-256 hash.
 * If no custom password was set yet, it falls back to default 'admin123'
 * or allows initializing the first-time password.
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const enteredHash = await sha256(password);
  const storedHash = localStorage.getItem(STORAGE_KEY_HASH);

  if (!storedHash) {
    // Default initial password: admin123
    const defaultHash = await sha256('admin123');
    return enteredHash === defaultHash;
  }

  return enteredHash === storedHash;
}

/**
 * Checks if the current browser session has an active admin token.
 */
export function isAdminAuthenticated(): boolean {
  return sessionStorage.getItem(STORAGE_KEY_SESSION) === 'active';
}

/**
 * Marks the current session as authenticated.
 */
export function setAdminSession(): void {
  sessionStorage.setItem(STORAGE_KEY_SESSION, 'active');
}

/**
 * Clears the active admin session (logs out).
 */
export function clearAdminSession(): void {
  sessionStorage.removeItem(STORAGE_KEY_SESSION);
}
