// Local app lock — PIN + optional Face ID (WebAuthn platform authenticator).
// Entirely client-side: the Supabase session stays alive, this only gates the
// UI on the device. PIN is stored salted-hashed; biometric uses a platform
// credential whose successful assertion (Face ID / Touch ID) unlocks.

const PIN_HASH = 'tracker-pin-hash';
const PIN_SALT = 'tracker-pin-salt';
const BIO_CRED = 'tracker-bio-cred';

export const PIN_LENGTH = 4;

function ls(): Storage | null {
  return typeof window !== 'undefined' ? window.localStorage : null;
}

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ── PIN ──────────────────────────────────────────────────
export function hasPin(): boolean {
  return !!ls()?.getItem(PIN_HASH);
}

export async function setPin(pin: string): Promise<void> {
  const salt = crypto.randomUUID();
  ls()?.setItem(PIN_SALT, salt);
  ls()?.setItem(PIN_HASH, await sha256Hex(salt + pin));
}

export async function verifyPin(pin: string): Promise<boolean> {
  const salt = ls()?.getItem(PIN_SALT);
  const hash = ls()?.getItem(PIN_HASH);
  if (!salt || !hash) return false;
  return (await sha256Hex(salt + pin)) === hash;
}

export function clearPin(): void {
  ls()?.removeItem(PIN_HASH);
  ls()?.removeItem(PIN_SALT);
  clearBiometric(); // biometric without a PIN fallback makes no sense
}

// ── Biometric (WebAuthn) ─────────────────────────────────
function b64urlEncode(buf: ArrayBuffer): string {
  let s = '';
  for (const b of new Uint8Array(buf)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(str: string): Uint8Array<ArrayBuffer> {
  let s = str.replace(/-/g, '+').replace(/_/g, '/');
  s += '='.repeat((4 - (s.length % 4)) % 4);
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export async function isBiometricSupported(): Promise<boolean> {
  if (typeof window === 'undefined' || !('PublicKeyCredential' in window)) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export function hasBiometric(): boolean {
  return !!ls()?.getItem(BIO_CRED);
}

export async function registerBiometric(): Promise<boolean> {
  if (!(await isBiometricSupported())) return false;
  try {
    const cred = (await navigator.credentials.create({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rp: { name: 'Трекер', id: location.hostname },
        user: {
          id: crypto.getRandomValues(new Uint8Array(16)),
          name: 'tracker-user',
          displayName: 'Tracker',
        },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
        authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
        timeout: 60000,
        attestation: 'none',
      },
    })) as PublicKeyCredential | null;
    if (!cred) return false;
    ls()?.setItem(BIO_CRED, b64urlEncode(cred.rawId));
    return true;
  } catch {
    return false;
  }
}

export async function biometricUnlock(): Promise<boolean> {
  const stored = ls()?.getItem(BIO_CRED);
  if (!stored) return false;
  try {
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        allowCredentials: [{ type: 'public-key', id: b64urlDecode(stored), transports: ['internal'] }],
        userVerification: 'required',
        rpId: location.hostname,
        timeout: 60000,
      },
    });
    return !!assertion;
  } catch {
    return false;
  }
}

export function clearBiometric(): void {
  ls()?.removeItem(BIO_CRED);
}
