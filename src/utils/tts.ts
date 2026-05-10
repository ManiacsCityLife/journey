/**
 * Unified TTS — three tiers in priority order:
 *
 *  1. ElevenLabs (if the user has saved their API key)
 *     → human-quality, requires internet, sends text to ElevenLabs servers.
 *     The user opts in explicitly and provides their own key.
 *
 *  2. @capacitor-community/text-to-speech (Capacitor plugin)
 *     → uses the device's native TTS engine — no internet, decent quality on
 *     modern Android with Google TTS or Samsung Voice installed.
 *
 *  3. Web Speech API — last-resort fallback when the plugin isn't available.
 *
 * The key is stored in Preferences under 'elevenLabsKey'. Because tts.ts
 * reads it here, callers (JournalScreen, etc.) need no changes when the user
 * adds or removes the key.
 */

// ── ElevenLabs voice catalogue ─────────────────────────────────────────────
export const ELEVENLABS_VOICES: { id: string; name: string }[] = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel  —  warm & clear (recommended)' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi  —  strong & confident' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella  —  soft & soothing' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni  —  calm male' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam  —  deep male' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh  —  warm male' },
];

export const DEFAULT_ELEVENLABS_VOICE = '21m00Tcm4TlvDq8ikWAM';

// ── In-memory credential cache ─────────────────────────────────────────────
// 'undefined' = not yet loaded; 'null' = loaded but absent; string = the key
let _cachedKey: string | null | undefined = undefined;
let _cachedVoice: string = DEFAULT_ELEVENLABS_VOICE;
let _currentAudio: HTMLAudioElement | null = null;

/** Call this whenever the user saves or clears an ElevenLabs key. */
export function clearTTSCache(): void {
  _cachedKey = undefined;
  _cachedVoice = DEFAULT_ELEVENLABS_VOICE;
}

async function loadCredentials(): Promise<{ key: string; voice: string } | null> {
  if (_cachedKey === undefined) {
    try {
      const { storageGet } = await import('./storage');
      _cachedKey = await storageGet('elevenLabsKey') || null;
      _cachedVoice = await storageGet('elevenLabsVoice') || DEFAULT_ELEVENLABS_VOICE;
    } catch {
      _cachedKey = null;
    }
  }
  return _cachedKey ? { key: _cachedKey, voice: _cachedVoice } : null;
}

// ── ElevenLabs fetch ───────────────────────────────────────────────────────
async function speakElevenLabs(text: string, key: string, voiceId: string): Promise<void> {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: { stability: 0.45, similarity_boost: 0.75 },
      }),
    },
  );
  if (!res.ok) throw new Error(`ElevenLabs HTTP ${res.status}`);
  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    _currentAudio = audio;
    audio.onended = () => { URL.revokeObjectURL(url); _currentAudio = null; resolve(); };
    audio.onerror = () => { URL.revokeObjectURL(url); _currentAudio = null; reject(new Error('audio playback failed')); };
    audio.play().catch(e => { URL.revokeObjectURL(url); _currentAudio = null; reject(e); });
  });
}

// ── Web Speech fallback ────────────────────────────────────────────────────
function speakWebSpeech(text: string, rate: number, pitch: number): Promise<void> {
  return new Promise(resolve => {
    if (!('speechSynthesis' in window)) { resolve(); return; }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = rate; utt.pitch = pitch; utt.volume = 1;
    // Prefer a neural/natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.name.includes('Samantha') ||
      v.name.includes('Karen')    ||
      v.name.includes('Moira')    ||
      v.name.includes('Google')   ||
      /neural|natural|premium/i.test(v.name)
    );
    if (preferred) utt.voice = preferred;
    utt.onend  = () => resolve();
    utt.onerror = () => resolve();
    window.speechSynthesis.speak(utt);
  });
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Speak `text` using the best available engine.
 * Callers don't need to know which tier is active — just call speak().
 */
export async function speak(text: string, rate = 0.82, pitch = 0.9): Promise<void> {
  // Tier 1: ElevenLabs
  const creds = await loadCredentials();
  if (creds) {
    try {
      await speakElevenLabs(text, creds.key, creds.voice);
      return;
    } catch (e) {
      console.warn('[tts] ElevenLabs failed, falling back to device TTS:', e);
    }
  }

  // Tier 2: Capacitor native TTS (device engine)
  try {
    const { TextToSpeech } = await import('@capacitor-community/text-to-speech');
    await TextToSpeech.speak({ text, lang: 'en-US', rate, pitch, volume: 1.0, category: 'ambient' });
    return;
  } catch { /* plugin not available */ }

  // Tier 3: Web Speech API
  await speakWebSpeech(text, rate, pitch);
}

/** Stop whatever is currently playing. */
export async function stopSpeaking(): Promise<void> {
  if (_currentAudio) { _currentAudio.pause(); _currentAudio = null; }
  try {
    const { TextToSpeech } = await import('@capacitor-community/text-to-speech');
    await TextToSpeech.stop();
  } catch { /* not available */ }
  try { window.speechSynthesis?.cancel(); } catch { /* not available */ }
}
