import { Capacitor } from '@capacitor/core';

export async function isBiometricAvailable(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }
  try {
    const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');
    const result = await NativeBiometric.isAvailable();
    return !!result.isAvailable;
  } catch (e) {
    return false;
  }
}

export async function authenticateBiometric(reason: string = 'Unlock your journey'): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    // In production, we don't bypass on web. 
    // If it's not a native platform, we return false to ensure security.
    return false; 
  }

  try {
    const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');
    const available = await NativeBiometric.isAvailable();
    
    if (!available.isAvailable) {
      return false;
    }

    await NativeBiometric.verifyIdentity({
      reason,
      title: 'Biometric Unlock',
      subtitle: 'Please authenticate to continue',
      description: 'Your data is protected by biometric security',
    });
    
    return true;
  } catch (e: any) {
    return false;
  }
}
