// PIN/passcode authentication using Web Crypto + Preferences storage.
// PIN is never stored in plaintext — we store a PBKDF2-derived hash + salt.
// Compatible with Android WebView (Web Crypto is available since API 21+).
import { storageGet, storageSet, storageRemove } from './storage';

const STORAGE_KEY = 'pin_credential';
const PBKDF2_ITER = 120_000;
const KEY_LEN = 32; // 256 bits
const SALT_LEN = 16;

interface PinCredential {
  v: 1;
  saltB64: string;
  hashB64: string;
  iter: number;
}

function bufToB64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

function b64ToBuf(b64: string): ArrayBuffer {
  const s = atob(b64);
  const bytes = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i);
  return bytes.buffer;
}

async function derive(pin: string, salt: ArrayBuffer, iter: number): Promise<ArrayBuffer> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(pin), { name: 'PBKDF2' }, false, ['deriveBits']
  );
  return await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' },
    key, KEY_LEN * 8
  );
}

/** Returns true if a PIN has been set up. */
export async function hasPin(): Promise<boolean> {
  const v = await storageGet(STORAGE_KEY);
  return !!v;
}

/** Set or replace the PIN. Throws if pin is too short. */
export async function setPin(pin: string): Promise<void> {
  if (!/^\d{4,8}$/.test(pin)) throw new Error('PIN must be 4–8 digits');
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN)).buffer;
  const hash = await derive(pin, salt, PBKDF2_ITER);
  const cred: PinCredential = {
    v: 1,
    saltB64: bufToB64(salt),
    hashB64: bufToB64(hash),
    iter: PBKDF2_ITER,
  };
  await storageSet(STORAGE_KEY, JSON.stringify(cred));
}

/** Verify a PIN. Returns true if it matches the stored hash. */
export async function verifyPin(pin: string): Promise<boolean> {
  const raw = await storageGet(STORAGE_KEY);
  if (!raw) return false;
  try {
    const cred: PinCredential = JSON.parse(raw);
    const salt = b64ToBuf(cred.saltB64);
    const computed = await derive(pin, salt, cred.iter || PBKDF2_ITER);
    const computedB64 = bufToB64(computed);
    // Constant-time compare
    if (computedB64.length !== cred.hashB64.length) return false;
    let diff = 0;
    for (let i = 0; i < computedB64.length; i++) {
      diff |= computedB64.charCodeAt(i) ^ cred.hashB64.charCodeAt(i);
    }
    return diff === 0;
  } catch (e) {
    console.error('[pin] verifyPin failed:', e);
    return false;
  }
}

/** Remove the stored PIN. */
export async function clearPin(): Promise<void> {
  await storageRemove(STORAGE_KEY);
}
