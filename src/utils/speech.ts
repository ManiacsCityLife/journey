// Speech Recognition utility: Capacitor plugin first, Web Speech interface fallback

let webRecognition: any = null;
let capacitorOnEndCallback: (() => void) | null = null;

export async function startListening(
  onPartial: (text: string) => void,
  onFinal: (text: string) => void,
  onEnd: () => void
): Promise<void> {
  let finalText = '';
  try {
    const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
    const res = await SpeechRecognition.available();
    if (!res.available) throw new Error('Not available');
    await SpeechRecognition.requestPermissions();
    await SpeechRecognition.removeAllListeners();

    capacitorOnEndCallback = onEnd;

    await SpeechRecognition.addListener('partialResults', (data: any) => {
      if (data.matches?.[0]) {
        finalText = data.matches[0];
        onPartial(finalText);
      }
    });

    // listeningState fires with { status: 'stopped' } when mic stops
    await SpeechRecognition.addListener('listeningState', (data: any) => {
      if (data?.status === 'stopped') {
        onFinal(finalText);  // now contains the last recognised speech
        onEnd();
        capacitorOnEndCallback = null;
      }
    });

    await SpeechRecognition.start({ language: 'en-US', maxResults: 1, partialResults: true, popup: false });
    return;
  } catch {}

  // Web Speech fallback
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SR) { onEnd(); return; }
  const r = new SR();
  r.continuous = true; r.interimResults = true; r.lang = 'en-US';
  r.onresult = (e: any) => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) finalText += e.results[i][0].transcript + ' ';
      else interim = e.results[i][0].transcript;
    }
    if (e.results[e.resultIndex]?.isFinal) onFinal(finalText);
    else onPartial(finalText + interim);
  };
  r.onend = () => { onFinal(finalText); onEnd(); };
  r.onerror = () => onEnd();
  r.start();
  webRecognition = r;
}

export function stopListening(): void {
  // Capacitor path — stop is async but we don't await it
  // listeningState listener will fire onEnd when it actually stops
  import('@capacitor-community/speech-recognition').then(({ SpeechRecognition }) => {
    SpeechRecognition.stop().catch(() => {});
  }).catch(() => {});

  // Web Speech fallback
  try { webRecognition?.stop(); webRecognition = null; } catch {}

  // Safety fallback: if listeningState never fires, fire onEnd after 500ms
  if (capacitorOnEndCallback) {
    const cb = capacitorOnEndCallback;
    capacitorOnEndCallback = null;
    setTimeout(() => cb(), 500);
  }
}
