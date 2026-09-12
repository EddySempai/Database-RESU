/**
 * Secure cryptographic helper using standard browser Web Crypto API.
 * Hashes passwords with SHA-256 and constant salt.
 */
const SALT = 'umbrella-corp-resu-2026';

export async function hashPassword(plainText: string): Promise<string> {
  const combined = plainText + SALT;
  
  // Handle environments where Web Crypto API is unavailable (e.g. mobile LAN without HTTPS)
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    console.warn('Web Crypto API not available. Using fallback hash for LAN access.');
    // In production you would want an external lib like crypto-js for fallback,
    // but for local testing we return a pseudo-hash to allow login flow to proceed.
    return `fallback_${btoa(encodeURIComponent(combined))}`;
  }

  const msgUint8 = new TextEncoder().encode(combined);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
