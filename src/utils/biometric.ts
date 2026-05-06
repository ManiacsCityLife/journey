import { Capacitor } from '@capacitor/core';

export async function isBiometricAvailable(): Promise<boolean> {
  console.log('Checking biometric availability. Platform:', Capacitor.getPlatform());
  if (!Capacitor.isNativePlatform()) {
    console.log('Not a native platform, biometrics unavailable.');
    return false;
  }
  try {
    const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');
    const result = await NativeBiometric.isAvailable();
    console.log('Biometric availability result:', result);
    return !!result.isAvailable;
  } catch (e) {
    console.error('Biometric availability check failed:', e);
    return false;
  }
}

export async function authenticateBiometric(reason: string = 'Unlock your journey'): Promise<boolean> {
  console.log('Starting biometric authentication. Reason:', reason);
  
  // For development on web, we allow bypass to avoid getting stuck
  if (!Capacitor.isNativePlatform()) {
    console.log('Web platform detected, bypassing biometric for development.');
    return true; 
  }

  try {
    const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');
    const available = await NativeBiometric.isAvailable();
    console.log('Biometric availability check before auth:', available);
    
    if (!available.isAvailable) {
      console.warn('Biometrics not available on this device.');
      // If not available, we can't authenticate, so we must return false to keep it locked
      // unless we want to allow a fallback PIN (not implemented yet)
      return false;
    }

    await NativeBiometric.verifyIdentity({
      reason,
      title: 'Biometric Unlock',
      subtitle: 'Please authenticate to continue',
      description: 'Your data is protected by biometric security',
    });
    
    console.log('Biometric authentication successful.');
    return true;
  } catch (e: any) {
    console.error('Biometric authentication failed or cancelled:', e);
    // If user cancels or fails, we return false
    return false;
  }
}
