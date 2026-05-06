// Simple localStorage storage — works reliably on Android WebView.
// localStorage persists between app restarts and is only cleared if the user
// explicitly wipes app data. No async bridge = no hangs, no race conditions.

export function storageGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

export function storageSet(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch {}
}

export function storageRemove(key: string): void {
  try { localStorage.removeItem(key); } catch {}
}

export function storageKeys(): string[] {
  try { return Object.keys(localStorage); } catch { return []; }
}

// No-op — migration no longer needed
export function migrateFromLocalStorage(): void {}

