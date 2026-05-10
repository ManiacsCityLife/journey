/**
 * Fully offline TTS — two tiers, no network calls ever.
 *
 *  Tier 1 — Capacitor native TTS (device engine, smart voice selection)
 *  Tier 2 — Web Speech API fallback
 *
 *  Both tiers probe installed voices and score them so the best available
 *  neural/WaveNet pack wins automatically.
 *
 *  Rate is user-adjustable and persisted under 'ttsRate' in storage.
 *
 * ── Piper WASM upgrade path ────────────────────────────────────────────────
 *  When we're ready to bundle a ~60 MB ONNX voice model, add a Tier 0 here:
 *    const audio = await piperSpeak(text);   // all in-process, no net
 *    audio.play(); return;
 *  until then, a properly installed Google TTS neural pack (downloaded once
 *  from Android Settings → Accessibility → Text-to-speech) is the best
 *  offline quality available.
 */

// ── Voice scoring ──────────────────────────────────────────────────────────
function scoreVoice(name: string, lang: string): number {
  const n = name.toLowerCase();
  // Neural / WaveNet packs — dramatically better quality
  if (/neural|wavenet/.test(n)) return 5;
  // Enhanced / premium packs
  if (/enhanced|premium/.test(n)) return 4;
  // "Natural" in name
  if (/natural/.test(n)) return 3;
  // Google voice in English
  if (n.includes('google') && lang.startsWith('en')) return 2;
  // Classic named voices (macOS/iOS emulated)
  if (/samantha|karen|moira|daniel/.test(n)) return 2;
  // Any English voice
  if (lang.startsWith('en')) return 1;
  return 0;
}

// ── Capacitor TTS voice cache ──────────────────────────────────────────────
let _capVoiceIdx: number | undefined = undefined;
let _capVoicesLoaded = false;

async function bestCapacitorVoice(): Promise<number | undefined> {
  if (_capVoicesLoaded) return _capVoiceIdx;
  _capVoicesLoaded = true;
  try {
    const { TextToSpeech } = await import('@capacitor-community/text-to-speech');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (TextToSpeech as any).getSupportedVoices();
    const voices: { name: string; lang: string }[] = result?.voices ?? [];
    let best = -1;
    let bestScore = -1;
    voices.forEach((v, i) => {
      const s = scoreVoice(v.name, v.lang);
      if (s > bestScore) { bestScore = s; best = i; }
    });
    _capVoiceIdx = best >= 0 ? best : undefined;
  } catch { /* plugin absent */ }
  return _capVoiceIdx;
}

// ── Web Speech voice selection ─────────────────────────────────────────────
function bestWebVoice(): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  return voices.reduce<SpeechSynthesisVoice>((best, v) =>
    scoreVoice(v.name, v.lang) > scoreVoice(best.name, best.lang) ? v : best,
    voices[0],
  );
}

// ── Rate preference ────────────────────────────────────────────────────────
let _cachedRate: number | undefined;

export async function getTTSRate(): Promise<number> {
  if (_cachedRate !== undefined) return _cachedRate;
  try {
    const { storageGet } = await import('./storage');
    const r = await storageGet('ttsRate');
    _cachedRate = r ? parseFloat(r) : 0.78;
  } catch {
    _cachedRate = 0.78;
  }
  return _cachedRate;
}

export async function setTTSRate(rate: number): Promise<void> {
  _cachedRate = rate;
  try {
    const { storageSet } = await import('./storage');
    await storageSet('ttsRate', String(rate));
  } catch { /* storage unavailable */ }
}

// ── Open Android TTS settings ──────────────────────────────────────────────
export async function openTTSSettings(): Promise<void> {
  try {
    const { TextToSpeech } = await import('@capacitor-community/text-to-speech');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (TextToSpeech as any).openInstall();
  } catch (e) {
    console.warn('[tts] openInstall not available on this platform:', e);
  }
}

// ── Public API ─────────────────────────────────────────────────────────────

export async function speak(text: string): Promise<void> {
  const rate  = await getTTSRate();
  const pitch = 0.92;

  // Tier 1 — Capacitor native TTS
  try {
    const { TextToSpeech } = await import('@capacitor-community/text-to-speech');
    const voiceIdx = await bestCapacitorVoice();
    await TextToSpeech.speak({
      text,
      lang: 'en-US',
      rate,
      pitch,
      volume: 1.0,
      category: 'ambient',
      ...(voiceIdx !== undefined && { voice: voiceIdx }),
    });
    return;
  } catch { /* plugin absent — fall through */ }

  // Tier 2 — Web Speech API
  await new Promise<void>(resolve => {
    if (!('speechSynthesis' in window)) { resolve(); return; }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = rate; utt.pitch = pitch; utt.volume = 1;
    utt.onend  = () => resolve();
    utt.onerror = () => resolve();

    const trySpeak = () => {
      const v = bestWebVoice();
      if (v) utt.voice = v;
      window.speechSynthesis.speak(utt);
    };

    // voices load asynchronously on first call on some platforms
    if (window.speechSynthesis.getVoices().length > 0) {
      trySpeak();
    } else {
      window.speechSynthesis.addEventListener('voiceschanged', trySpeak, { once: true });
    }
  });
}

export async function stopSpeaking(): Promise<void> {
  try {
    const { TextToSpeech } = await import('@capacitor-community/text-to-speech');
    await TextToSpeech.stop();
  } catch { /* not available */ }
  try { window.speechSynthesis?.cancel(); } catch { /* not available */ }
}
