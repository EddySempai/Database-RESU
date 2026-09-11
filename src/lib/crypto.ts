/**
 * Secure cryptographic helper using standard browser Web Crypto API.
 * Hashes passwords with SHA-256 and constant salt.
 */
const SALT = 'umbrella-corp-resu-2026';

export async function hashPassword(plainText: string): Promise<string> {
  const combined = plainText + SALT;
  const msgUint8 = new TextEncoder().encode(combined);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
