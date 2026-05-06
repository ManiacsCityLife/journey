import { Capacitor } from '@capacitor/core';

export async function isBiometricAvailable(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');
    const result = await NativeBiometric.isAvailable();
    return !!result.isAvailable;
  } catch (e) {
    console.error('Biometric availability check failed:', e);
    return false;
  }
}

export async function authenticateBiometric(reason: string = 'Unlock your journey'): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return true; // Always succeed on web for dev
  try {
    const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');
    const available = await NativeBiometric.isAvailable();
    if (!available.isAvailable) return true;

    await NativeBiometric.verifyIdentity({
      reason,
      title: 'Biometric Unlock',
      subtitle: 'Please authenticate to continue',
      description: 'Your data is protected by biometric security',
    });
    return true;
  } catch (e: any) {
    console.error('Biometric authentication failed:', e);
    // If user cancels or fails, we return false
    return false;
  }
}
