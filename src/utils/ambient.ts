// Procedural ambient audio — no MP3 files needed, generated via Web Audio interface

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;

export type AmbientType = 'rain' | 'forest' | 'ocean' | 'fire';

export function startAmbient(type: AmbientType, volume = 0.18): void {
  stopAmbient();
  try {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 2);
    masterGain.connect(ctx.destination);

    if (type === 'rain') buildRain();
    else if (type === 'forest') buildForest();
    else if (type === 'ocean') buildOcean();
    else if (type === 'fire') buildFire();
  } catch (e) {
    console.warn('Ambient audio failed to start:', e);
  }
}

function buildRain(): void {
  if (!ctx || !masterGain) return;
  const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf; src.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass'; filter.frequency.value = 3000; filter.Q.value = 0.4;
  const filter2 = ctx.createBiquadFilter();
  filter2.type = 'lowpass'; filter2.frequency.value = 8000;
  src.connect(filter); filter.connect(filter2); filter2.connect(masterGain);
  src.start();
}

function buildForest(): void {
  if (!ctx || !masterGain) return;
  // Soft wind: filtered noise
  const buf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    const w = Math.random() * 2 - 1;
    data[i] = (last + 0.02 * w) / 1.02;
    last = data[i];
  }
  const src = ctx.createBufferSource();
  src.buffer = buf; src.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass'; filter.frequency.value = 600;
  // LFO for gentle wind swell
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.08; lfoGain.gain.value = 200;
  lfo.connect(lfoGain); lfoGain.connect(filter.frequency);
  src.connect(filter); filter.connect(masterGain);
  src.start(); lfo.start();
}

function buildOcean(): void {
  if (!ctx || !masterGain) return;
  const buf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    const w = Math.random() * 2 - 1;
    data[i] = (last + 0.015 * w) / 1.015 * 4;
    last = data[i];
  }
  const src = ctx.createBufferSource();
  src.buffer = buf; src.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass'; filter.frequency.value = 400; filter.Q.value = 0.3;
  // Wave LFO
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.12; lfoGain.gain.value = 150;
  lfo.connect(lfoGain); lfoGain.connect(filter.frequency);
  src.connect(filter); filter.connect(masterGain);
  src.start(); lfo.start();
}

function buildFire(): void {
  if (!ctx || !masterGain) return;
  const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf; src.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass'; filter.frequency.value = 150; filter.Q.value = 1.5;
  const filter2 = ctx.createBiquadFilter();
  filter2.type = 'lowpass'; filter2.frequency.value = 400;
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.3; lfoGain.gain.value = 60;
  lfo.connect(lfoGain); lfoGain.connect(filter.frequency);
  src.connect(filter); filter.connect(filter2); filter2.connect(masterGain);
  src.start(); lfo.start();
}

export function stopAmbient(fadeDuration = 2): void {
  if (!ctx || !masterGain) return;
  const c = ctx; const g = masterGain;
  g.gain.linearRampToValueAtTime(0, c.currentTime + fadeDuration);
  setTimeout(() => { try { c.close(); } catch {} }, (fadeDuration + 0.5) * 1000);
  ctx = null; masterGain = null;
}
