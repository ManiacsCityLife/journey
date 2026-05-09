import { Capacitor } from '@capacitor/core';

export type BiometricError = 'unavailable' | 'cancelled' | 'lockout' | 'no_hardware' | 'no_enrollment' | 'unknown';
export type BiometricKind = 'face' | 'fingerprint' | 'iris' | 'unknown' | 'none';

export interface BiometricCapability {
  available: boolean;
  kind: BiometricKind;
  reason?: string;            // Human-readable reason if unavailable
  errorCode?: number;
}

export interface BiometricResult {
  success: boolean;
  error?: BiometricError;
  message?: string;
}

/** Detailed availability check — useful for onboarding screens. */
export async function getBiometricCapability(): Promise<BiometricCapability> {
  if (!Capacitor.isNativePlatform()) {
    return { available: false, kind: 'none', reason: 'Not running on a native device' };
  }
  try {
    const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');
    const r = await NativeBiometric.isAvailable();
    if (!r.isAvailable) {
      // Plugin error codes: 1 = no hardware, 2 = no enrolment, others = unknown
      const code = (r as any).errorCode ?? 0;
      let reason = 'Biometric unavailable on this device';
      let kind: BiometricKind = 'none';
      if (code === 1) reason = 'Your device has no biometric hardware';
      else if (code === 2) reason = 'No biometrics enrolled. Add a fingerprint or face in your phone settings, then try again.';
      return { available: false, kind, reason, errorCode: code };
    }
    // biometryType: 1=touch, 2=face, 3=iris, 4=face+touch, 0=none
    const t = (r as any).biometryType ?? 0;
    let kind: BiometricKind = 'unknown';
    if (t === 1) kind = 'fingerprint';
    else if (t === 2) kind = 'face';
    else if (t === 3) kind = 'iris';
    else if (t === 4) kind = 'fingerprint';
    return { available: true, kind };
  } catch (e: any) {
    console.error('[biometric] capability check failed:', e);
    return { available: false, kind: 'none', reason: e?.message ?? 'Plugin not available' };
  }
}

export async function isBiometricAvailable(): Promise<boolean> {
  return (await getBiometricCapability()).available;
}

export async function authenticateBiometric(reason: string = 'Unlock your journey'): Promise<boolean> {
  return (await authenticateBiometricDetailed(reason)).success;
}

export async function authenticateBiometricDetailed(reason: string = 'Unlock your journey'): Promise<BiometricResult> {
  if (!Capacitor.isNativePlatform()) {
    return { success: false, error: 'unavailable', message: 'Not a native platform' };
  }

  try {
    const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');
    const cap = await getBiometricCapability();
    if (!cap.available) {
      const err: BiometricError =
        cap.errorCode === 1 ? 'no_hardware' :
        cap.errorCode === 2 ? 'no_enrollment' : 'unavailable';
      return { success: false, error: err, message: cap.reason };
    }

    await NativeBiometric.verifyIdentity({
      reason,
      title: 'Unlock Journey Forward',
      subtitle: 'Authenticate to continue',
      description: 'Your data stays private on this device',
    });
    return { success: true };
  } catch (e: any) {
    // @capgo error shapes vary by Android API. Possible numeric codes:
    //   10 / 13 = user cancelled        7 / 8 = lockout
    //   11      = biometric not enrolled
    //   12      = no hardware
    const code: number = e?.code ?? e?.errorCode ?? 0;
    const msg: string = (e?.message ?? '').toString().toLowerCase();
    if (code === 10 || code === 13 || msg.includes('cancel')) {
      return { success: false, error: 'cancelled', message: 'Authentication cancelled' };
    }
    if (code === 7 || code === 8 || msg.includes('lockout')) {
      return { success: false, error: 'lockout', message: 'Too many failed attempts. Try again in a moment.' };
    }
    if (code === 11) return { success: false, error: 'no_enrollment', message: 'No biometrics enrolled on this device' };
    if (code === 12) return { success: false, error: 'no_hardware', message: 'No biometric hardware found' };
    console.error('[biometric] authenticate failed:', e);
    return { success: false, error: 'unknown', message: e?.message ?? 'Unknown error' };
  }
}
