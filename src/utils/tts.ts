// Offline TTS: tries Capacitor's native plugin first, then Web Speech.
// Picks the best installed voice; user installs neural pack via Android settings.

// Android Google TTS voice naming (worth recognising):
//   en-us-x-iol-network   ← neural ("network" voices, work offline if downloaded)
//   en-us-x-sfg-local     ← classic offline
//   en-us-x-tpd-local     ← compact offline
function scoreVoice(name: string, lang: string): number {
  const n = name.toLowerCase();
  // Highest tier — neural / network voices on Android, WaveNet on Google Cloud
  if (/neural|wavenet|network/.test(n)) return 6;
  // Premium / enhanced packs (iOS/macOS naming)
  if (/enhanced|premium/.test(n)) return 5;
  // "Natural" voices (Microsoft / some Android skins)
  if (/natural/.test(n)) return 4;
  // Google's "x-" voice families on Android — generally better than the basic
  if (/-x-/.test(n) && lang.startsWith('en')) return 3;
  // Any explicitly Google voice in English
  if (n.includes('google') && lang.startsWith('en')) return 2;
  // Classic named voices (macOS/iOS)
  if (/samantha|karen|moira|daniel|alex|fiona/.test(n)) return 2;
  // Any English voice
  if (lang.startsWith('en')) return 1;
  return 0;
}

let capVoiceIdx: number | undefined;
let capVoiceName: string | undefined;
let capVoicesLoaded = false;

async function bestCapacitorVoice(): Promise<number | undefined> {
  if (capVoicesLoaded) return capVoiceIdx;
  capVoicesLoaded = true;
  try {
    const { TextToSpeech } = await import('@capacitor-community/text-to-speech');
    const result = await (TextToSpeech as unknown as { getSupportedVoices(): Promise<{ voices: { name: string; lang: string }[] }> }).getSupportedVoices();
    const voices = result?.voices ?? [];
    let best = -1;
    let bestScore = -1;
    voices.forEach((v, i) => {
      const s = scoreVoice(v.name, v.lang);
      if (s > bestScore) { bestScore = s; best = i; }
    });
    if (best >= 0) {
      capVoiceIdx = best;
      capVoiceName = voices[best]?.name;
    }
  } catch {
    // plugin not available
  }
  return capVoiceIdx;
}

/** Best-effort name of the voice currently in use. Empty until first speak. */
export function getActiveVoiceName(): string {
  if (capVoiceName) return capVoiceName;
  if ('speechSynthesis' in window) {
    const v = bestWebVoice();
    if (v) return v.name;
  }
  return 'Default';
}

function bestWebVoice(): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  return voices.reduce<SpeechSynthesisVoice>(
    (best, v) => scoreVoice(v.name, v.lang) > scoreVoice(best.name, best.lang) ? v : best,
    voices[0],
  );
}

let cachedRate: number | undefined;

export async function getTTSRate(): Promise<number> {
  if (cachedRate !== undefined) return cachedRate;
  try {
    const { storageGet } = await import('./storage');
    const r = await storageGet('ttsRate');
    cachedRate = r ? parseFloat(r) : 0.78;
  } catch {
    cachedRate = 0.78;
  }
  return cachedRate;
}

export async function setTTSRate(rate: number): Promise<void> {
  cachedRate = rate;
  try {
    const { storageSet } = await import('./storage');
    await storageSet('ttsRate', String(rate));
  } catch {
    // ignore
  }
}

export async function openTTSSettings(): Promise<void> {
  try {
    const { TextToSpeech } = await import('@capacitor-community/text-to-speech');
    await (TextToSpeech as unknown as { openInstall(): Promise<void> }).openInstall();
  } catch (e) {
    console.warn('[tts] openInstall not available:', e);
  }
}

export async function speak(text: string): Promise<void> {
  const rate = await getTTSRate();
  const pitch = 0.92;

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
  } catch {
    // fall through to Web Speech
  }

  await new Promise<void>(resolve => {
    if (!('speechSynthesis' in window)) { resolve(); return; }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = rate;
    utt.pitch = pitch;
    utt.volume = 1;
    utt.onend = () => resolve();
    utt.onerror = () => resolve();

    const trySpeak = () => {
      const v = bestWebVoice();
      if (v) utt.voice = v;
      window.speechSynthesis.speak(utt);
    };

    // Voices load asynchronously on some platforms
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
  } catch {
    // ignore
  }
  try {
    window.speechSynthesis?.cancel();
  } catch {
    // ignore
  }
}
