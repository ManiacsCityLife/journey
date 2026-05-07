// Simple localStorage storage — works reliably on Android WebView.
// localStorage persists between app restarts and is only cleared if the user
// explicitly wipes app data. No async bridge = no hangs, no race conditions.

export async function storageGet(key: string): Promise<string | null> {
  try { return localStorage.getItem(key); } catch { return null; }
}

export async function storageSet(key: string, value: string): Promise<void> {
  try { localStorage.setItem(key, value); } catch {}
}

export async function storageRemove(key: string): Promise<void> {
  try { localStorage.removeItem(key); } catch {}
}

export async function storageKeys(): Promise<string[]> {
  try { return Object.keys(localStorage); } catch { return []; }
}

// No-op — migration no longer needed
export function migrateFromLocalStorage(): void {}

