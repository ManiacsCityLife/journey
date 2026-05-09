// Image utilities for Vision Board.
// We use a plain <input type="file"> to invoke the native gallery/camera picker
// (works in Capacitor WebView without adding a new plugin), then downscale and
// JPEG-compress the result so it fits comfortably in Preferences storage.

const MAX_DIM = 1200;        // Largest side, in CSS pixels
const QUALITY = 0.82;

/**
 * Open the native file picker, return a downscaled JPEG data URL.
 * Resolves to null if the user cancels.
 */
export function pickImage(): Promise<string | null> {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.position = 'fixed';
    input.style.left = '-9999px';
    document.body.appendChild(input);

    let resolved = false;
    const finish = (val: string | null) => {
      if (resolved) return;
      resolved = true;
      try { document.body.removeChild(input); } catch {}
      resolve(val);
    };

    // Cancel detection: if focus returns to window without a file, treat as cancel
    const onFocus = () => {
      setTimeout(() => {
        if (!input.files || input.files.length === 0) finish(null);
        window.removeEventListener('focus', onFocus);
      }, 500);
    };
    window.addEventListener('focus', onFocus);

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return finish(null);
      try {
        const dataUrl = await fileToResizedJpeg(file);
        finish(dataUrl);
      } catch (e) {
        console.error('[image] pick/resize failed:', e);
        finish(null);
      }
    };

    input.click();
  });
}

function fileToResizedJpeg(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Image decode failed'));
      img.onload = () => {
        const { width, height } = scale(img.naturalWidth, img.naturalHeight, MAX_DIM);
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas not supported'));
        ctx.drawImage(img, 0, 0, width, height);
        try {
          resolve(canvas.toDataURL('image/jpeg', QUALITY));
        } catch (e) {
          reject(e);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function scale(w: number, h: number, max: number): { width: number; height: number } {
  if (w <= max && h <= max) return { width: w, height: h };
  if (w >= h) return { width: max, height: Math.round(h * max / w) };
  return { width: Math.round(w * max / h), height: max };
}
