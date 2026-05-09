// Continuous speech recognition.
//
// Why this is more complex than it looks:
//  - Android's SpeechRecognizer auto-stops after ~5–10 seconds of silence.
//  - Web Speech (Chrome) does the same.
//  - For a journal voice-note we want it to keep going until the *user* stops,
//    so we transparently restart the engine each time it ends and accumulate
//    the transcript across restarts.
//
// Public API:
//   startListening(callbacks) — begins listening; auto-restarts until stopped.
//   stopListening()           — user-initiated stop, fires onFinal+onEnd once.
//   isListening()             — synchronous state check.

interface Callbacks {
  onPartial: (text: string) => void;
  onFinal: (text: string) => void;
  onEnd: () => void;
}

type Engine = 'capacitor' | 'web' | null;

// Tunables
const RESTART_DELAY_MS = 250;     // Pause between auto-restarts (avoids plugin races)
const STOP_GRACE_MS    = 800;     // How long to wait for engine 'stopped' event after user stop

let userWants = false;            // True between user-tap-start and user-tap-stop
let engine: Engine = null;
let accumulated = '';             // Final text accumulated across restarts
let lastInterim = '';             // Most recent partial since the last restart
let webRec: any = null;
let cb: Callbacks | null = null;
let sessionId = 0;                // Bumped on stop; prevents zombie restarts/callbacks
let pendingRestartTimer: ReturnType<typeof setTimeout> | null = null;

function combined(): string {
  const a = accumulated.trim();
  const b = lastInterim.trim();
  if (!a && !b) return '';
  if (!b) return a;
  if (!a) return b;
  return `${a} ${b}`;
}

function commitInterim() {
  if (lastInterim.trim()) {
    accumulated = combined();
    lastInterim = '';
  }
}

function clearRestartTimer() {
  if (pendingRestartTimer) {
    clearTimeout(pendingRestartTimer);
    pendingRestartTimer = null;
  }
}

async function startCapacitor(mySession: number): Promise<boolean> {
  try {
    const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
    const res = await SpeechRecognition.available();
    if (!res.available) return false;
    const perm = await SpeechRecognition.requestPermissions();
    if (perm?.speechRecognition !== 'granted') return false;

    // Wipe any zombie listeners from prior sessions
    await SpeechRecognition.removeAllListeners();

    await SpeechRecognition.addListener('partialResults', (data: any) => {
      if (mySession !== sessionId) return;
      const text = data?.matches?.[0];
      if (typeof text === 'string') {
        lastInterim = text;
        cb?.onPartial(combined());
      }
    });

    await SpeechRecognition.addListener('listeningState', (data: any) => {
      if (mySession !== sessionId) return;
      if (data?.status !== 'stopped') return;

      // Engine stopped (silence timeout). Commit the interim into accumulated text.
      commitInterim();
      cb?.onPartial(combined());

      if (!userWants) return;  // User-initiated stop will run cleanup itself

      // Auto-restart after a short delay so the plugin has time to settle.
      clearRestartTimer();
      pendingRestartTimer = setTimeout(async () => {
        pendingRestartTimer = null;
        if (mySession !== sessionId || !userWants) return;
        try {
          await SpeechRecognition.start({
            language: 'en-US', maxResults: 1, partialResults: true, popup: false,
          });
        } catch (e) {
          console.error('[speech] capacitor restart failed:', e);
          forceCleanup();
        }
      }, RESTART_DELAY_MS);
    });

    await SpeechRecognition.start({
      language: 'en-US', maxResults: 1, partialResults: true, popup: false,
    });
    engine = 'capacitor';
    return true;
  } catch (e) {
    console.error('[speech] capacitor start failed:', e);
    return false;
  }
}

function startWeb(mySession: number): boolean {
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SR) return false;
  try {
    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = 'en-US';

    r.onresult = (e: any) => {
      if (mySession !== sessionId) return;
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) accumulated = (accumulated.trim() + ' ' + t).trim();
        else interim += t;
      }
      lastInterim = interim;
      cb?.onPartial(combined());
    };

    r.onend = () => {
      if (mySession !== sessionId) return;
      commitInterim();
      if (!userWants) return;
      clearRestartTimer();
      pendingRestartTimer = setTimeout(() => {
        pendingRestartTimer = null;
        if (mySession !== sessionId || !userWants) return;
        try { r.start(); }
        catch (err) { console.error('[speech] web restart failed:', err); forceCleanup(); }
      }, RESTART_DELAY_MS);
    };

    r.onerror = (e: any) => {
      if (mySession !== sessionId) return;
      // 'no-speech' / 'aborted' / 'network' are recoverable — onend handles restart.
      const recoverable = ['no-speech', 'aborted', 'network'];
      if (!recoverable.includes(e?.error)) {
        console.error('[speech] web error:', e?.error);
      }
    };

    r.start();
    webRec = r;
    engine = 'web';
    return true;
  } catch (e) {
    console.error('[speech] web start failed:', e);
    return false;
  }
}

function forceCleanup() {
  // Capture and run callbacks once, then reset all state.
  const callbacks = cb;
  const finalText = combined();
  cb = null;
  accumulated = '';
  lastInterim = '';
  webRec = null;
  engine = null;
  userWants = false;
  clearRestartTimer();
  if (callbacks) {
    try { callbacks.onFinal(finalText); } catch (e) { console.error('[speech] onFinal threw:', e); }
    try { callbacks.onEnd(); } catch (e) { console.error('[speech] onEnd threw:', e); }
  }
}

export async function startListening(
  onPartial: (text: string) => void,
  onFinal: (text: string) => void,
  onEnd: () => void,
  options?: { initialText?: string }
): Promise<boolean> {
  // If something is already listening, stop it cleanly first.
  if (userWants) await stopListening();

  sessionId++;
  const mySession = sessionId;
  userWants = true;
  accumulated = (options?.initialText || '').trim();
  lastInterim = '';
  cb = { onPartial, onFinal, onEnd };
  clearRestartTimer();

  const ok = await startCapacitor(mySession);
  if (ok) return true;

  const okWeb = startWeb(mySession);
  if (okWeb) return true;

  // No engine available
  forceCleanup();
  return false;
}

export async function stopListening(): Promise<void> {
  if (!userWants) return;

  // 1) Mark as stopped synchronously and invalidate session BEFORE async work
  //    so any in-flight engine events know to bail out.
  userWants = false;
  sessionId++;
  clearRestartTimer();

  // 2) Capture text + callbacks now, then fire onEnd immediately so the UI
  //    flips out of "Listening…" right away — no waiting on engine events.
  const callbacks = cb;
  const finalText = combined();
  const wasEngine = engine;
  cb = null;
  accumulated = '';
  lastInterim = '';
  engine = null;
  const wasWebRec = webRec;
  webRec = null;

  if (callbacks) {
    try { callbacks.onFinal(finalText); } catch (e) { console.error('[speech] onFinal threw:', e); }
    try { callbacks.onEnd(); } catch (e) { console.error('[speech] onEnd threw:', e); }
  }

  // 3) Asynchronously stop the engine in the background. Errors here don't
  //    matter — the UI already moved on.
  if (wasEngine === 'capacitor') {
    try {
      const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
      try { await SpeechRecognition.stop(); } catch (e) { /* engine already stopped */ }
      try { await SpeechRecognition.removeAllListeners(); } catch (e) { /* ignore */ }
    } catch (e) {
      console.error('[speech] capacitor stop teardown failed:', e);
    }
  } else if (wasEngine === 'web') {
    try { wasWebRec?.stop(); } catch (e) { /* engine already stopped */ }
  }

  // 4) Safety: if anything stale fires within STOP_GRACE_MS, the bumped
  //    sessionId guards against reentry.
  void STOP_GRACE_MS;  // referenced for documentation; sessionId guards.
}

export function isListening(): boolean { return userWants; }
