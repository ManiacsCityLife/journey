// Offline TTS: tries Capacitor's native plugin first, then Web Speech.
// Picks the best installed voice (neural/WaveNet > enhanced > Google > default).

function scoreVoice(name: string, lang: string): number {
  const n = name.toLowerCase();
  if (/neural|wavenet/.test(n)) return 5;
  if (/enhanced|premium/.test(n)) return 4;
  if (/natural/.test(n)) return 3;
  if (n.includes('google') && lang.startsWith('en')) return 2;
  if (/samantha|karen|moira|daniel/.test(n)) return 2;
  if (lang.startsWith('en')) return 1;
  return 0;
}

let capVoiceIdx: number | undefined;
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
    capVoiceIdx = best >= 0 ? best : undefined;
  } catch {
    // plugin not available
  }
  return capVoiceIdx;
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
