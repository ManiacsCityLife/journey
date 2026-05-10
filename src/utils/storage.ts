import { Preferences } from '@capacitor/preferences';

export async function storageGet(key: string): Promise<string | null> {
  try {
    const { value } = await Preferences.get({ key });
    return value;
  } catch (e) {
    console.error(`[storage] storageGet("${key}") failed:`, e);
    return null;
  }
}

export async function storageSet(key: string, value: string): Promise<void> {
  try {
    await Preferences.set({ key, value });
  } catch (e) {
    console.error(`[storage] storageSet("${key}") failed:`, e);
    throw e; // re-throw so callers can handle data-loss scenarios
  }
}

export async function storageRemove(key: string): Promise<void> {
  try {
    await Preferences.remove({ key });
  } catch (e) {
    console.error(`[storage] storageRemove("${key}") failed:`, e);
  }
}

export async function storageKeys(): Promise<string[]> {
  try {
    const { keys } = await Preferences.keys();
    return keys;
  } catch (e) {
    console.error('[storage] storageKeys() failed:', e);
    return [];
  }
}

export async function storageRemoveAll(): Promise<void> {
  try {
    const { keys } = await Preferences.keys();
    for (const key of keys) {
      await Preferences.remove({ key });
    }
  } catch (e) {
    console.error('[storage] storageRemoveAll() failed:', e);
  }
}

export async function storageClear(): Promise<void> {
  try {
    await Preferences.clear();
  } catch (e) {
    console.error('[storage] storageClear() failed:', e);
  }
}
