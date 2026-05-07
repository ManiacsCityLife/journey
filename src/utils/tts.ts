// TTS utility: tries Capacitor TextToSpeech plugin first, falls back to Web Speech interface

export async function speak(text: string, rate = 0.82, pitch = 0.9): Promise<void> {
  try {
    const { TextToSpeech } = await import('@capacitor-community/text-to-speech');
    await TextToSpeech.speak({ text, lang: 'en-US', rate, pitch, volume: 1.0, category: 'ambient' });
    return;
  } catch {}
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) { resolve(); return; }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = rate; utt.pitch = pitch; utt.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const calm = voices.find(v => v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Moira') || v.name.includes('Female'));
    if (calm) utt.voice = calm;
    utt.onend = () => resolve();
    utt.onerror = () => resolve();
    window.speechSynthesis.speak(utt);
  });
}

export async function stopSpeaking(): Promise<void> {
  try {
    const { TextToSpeech } = await import('@capacitor-community/text-to-speech');
    await TextToSpeech.stop();
  } catch {}
  try { window.speechSynthesis?.cancel(); } catch {}
}
