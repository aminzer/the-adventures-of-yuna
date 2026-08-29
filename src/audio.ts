// The Adventures of Yuna — tiny WebAudio synth. No audio files: all gentle
// oscillator sounds, plus a slow generative pentatonic lullaby underneath.
// The AudioContext is created lazily on the first key press (autoplay policy).

export type SfxName =
  | 'jump' | 'star' | 'pickup' | 'give' | 'bloom' | 'cloud' | 'hint' | 'hop'
  | 'wings' | 'shimmer' | 'boing' | 'breath' | 'bark';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let duckGain: GainNode | null = null; // music dips while the narrator speaks
let muted = false;

function unlock(): void {
  if (!ctx) {
    const AC = window.AudioContext ?? (window as any).webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.5;
    master.connect(ctx.destination);
    duckGain = ctx.createGain();
    duckGain.gain.value = 1;
    duckGain.connect(master);
    startMusic();
  }
  if (ctx.state === 'suspended') void ctx.resume();
}

function suspend(): void {
  if (ctx && ctx.state === 'running') void ctx.suspend();
}

function resume(): void {
  if (ctx && ctx.state === 'suspended') void ctx.resume();
}

function toggleMute(): boolean {
  muted = !muted;
  if (master) master.gain.value = muted ? 0 : 0.5;
  return muted;
}

// One soft note: frequency glides f0 -> f1 over dur seconds, starting after `when`.
function tone(f0: number, f1: number, dur: number, type: OscillatorType, vol: number, when = 0): void {
  if (!ctx || !master) return;
  const t0 = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(f0, t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

// A single bell-flower note (song levels).
function playNote(freq: number): void {
  if (!ctx || muted) return;
  tone(freq, freq, 0.7, 'triangle', 0.22);
  tone(freq * 2, freq * 2, 0.4, 'sine', 0.07);
}

const SFX: Record<SfxName, () => void> = {
  jump() { tone(320, 560, 0.18, 'sine', 0.22); },
  star() { tone(1046, 1046, 0.09, 'sine', 0.16); tone(1568, 1568, 0.14, 'sine', 0.16, 0.07); },
  pickup() { tone(540, 860, 0.13, 'triangle', 0.2); },
  give() {
    tone(392, 392, 0.55, 'triangle', 0.16);
    tone(494, 494, 0.55, 'triangle', 0.13, 0.03);
    tone(587, 587, 0.5, 'triangle', 0.1, 0.06);
  },
  bloom() {
    // ascending pentatonic arpeggio — the sound of color coming back
    const notes = [523, 587, 659, 784, 880, 1046, 1318];
    notes.forEach((f, i) => tone(f, f, 0.55, 'triangle', 0.14, i * 0.24));
  },
  cloud() { tone(170, 330, 0.9, 'sine', 0.18); },
  wings() {
    // a light ascending shimmer — magic wings unfurling
    tone(660, 660, 0.35, 'sine', 0.15);
    tone(880, 880, 0.35, 'sine', 0.13, 0.09);
    tone(1174, 1174, 0.45, 'sine', 0.12, 0.18);
    tone(1568, 1760, 0.5, 'sine', 0.08, 0.27);
  },
  shimmer() { tone(1174, 1174, 0.3, 'sine', 0.1); tone(1568, 1568, 0.4, 'sine', 0.09, 0.1); },
  boing() { tone(220, 160, 0.25, 'triangle', 0.14); },
  breath() { tone(500, 900, 0.25, 'sine', 0.12); tone(1200, 1400, 0.2, 'sine', 0.06, 0.1); },
  bark() { tone(400, 700, 0.08, 'square', 0.06); tone(650, 450, 0.1, 'triangle', 0.12, 0.05); },
  hint() { tone(700, 780, 0.16, 'sine', 0.1); },
  hop() { tone(400, 620, 0.1, 'sine', 0.08); },
};

function play(name: SfxName): void {
  if (!ctx || muted) return;
  SFX[name]();
}

// ---------------------------------------------------------------- music
// Quiet, meditative generative music: a slow random walk over a pentatonic
// scale with soft pad chords underneath. Never repeats, never demands
// attention — and every level has its own MOOD (scale, register, tempo,
// timbre). Mood changes crossfade: the old melody's volume eases down
// first, then the new one eases up. No hard stops.

export type MoodName =
  | 'meadow' | 'sunny' | 'brook' | 'garden' | 'breeze' | 'twilight'
  | 'lullaby' | 'sky' | 'quiet' | 'sea' | 'playful' | 'night';

interface Mood {
  scale: number[]; // melody notes (empty = pads only)
  pads: number[][]; // slow background chords
  gapMin: number; // seconds between melody notes…
  gapVar: number; // …plus up to this much extra
  dur: number; // melody note length
  vol: number;
  type: OscillatorType;
  padEvery: number;
  padDur: number;
  padVol: number;
}

const MOODS: Record<MoodName, Mood> = {
  // C major pentatonic — the familiar meadow where it all begins
  meadow: { scale: [262, 294, 330, 392, 440, 523, 587, 659], pads: [[131, 196, 330], [110, 165, 262], [87, 131, 220], [98, 147, 294]], gapMin: 1.4, gapVar: 1.6, dur: 3.2, vol: 0.05, type: 'triangle', padEvery: 8, padDur: 9, padVol: 0.035 },
  // G major pentatonic, brighter and a touch quicker
  sunny: { scale: [392, 440, 494, 587, 659, 784], pads: [[98, 147, 247], [131, 196, 294], [110, 165, 220]], gapMin: 1.1, gapVar: 1.2, dur: 2.6, vol: 0.05, type: 'triangle', padEvery: 7, padDur: 8, padVol: 0.035 },
  // D major pentatonic, flowing like a little stream
  brook: { scale: [294, 330, 370, 440, 494, 587], pads: [[73, 110, 185], [98, 147, 220], [110, 165, 247]], gapMin: 1.3, gapVar: 1.4, dur: 3, vol: 0.05, type: 'sine', padEvery: 8, padDur: 9, padVol: 0.04 },
  // F major pentatonic — warm and green
  garden: { scale: [349, 392, 440, 523, 587, 698], pads: [[87, 131, 220], [116, 175, 262], [98, 147, 262]], gapMin: 1.3, gapVar: 1.5, dur: 3, vol: 0.05, type: 'triangle', padEvery: 8, padDur: 9, padVol: 0.035 },
  // A minor pentatonic up high — airy
  breeze: { scale: [440, 523, 587, 659, 784, 880], pads: [[110, 165, 262], [87, 131, 220], [131, 196, 330]], gapMin: 1.2, gapVar: 1.5, dur: 2.8, vol: 0.045, type: 'sine', padEvery: 7, padDur: 8, padVol: 0.035 },
  // A minor pentatonic low — the sleepy hour
  twilight: { scale: [220, 262, 294, 330, 392, 440], pads: [[55, 110, 165], [65, 98, 196], [73, 110, 220]], gapMin: 1.8, gapVar: 1.8, dur: 3.6, vol: 0.05, type: 'sine', padEvery: 9, padDur: 10, padVol: 0.04 },
  // E minor pentatonic, very slow and soft — for the lonely fox
  lullaby: { scale: [165, 196, 220, 247, 294, 330], pads: [[41, 82, 165], [49, 98, 147], [55, 110, 165]], gapMin: 2, gapVar: 2, dur: 4, vol: 0.05, type: 'sine', padEvery: 10, padDur: 11, padVol: 0.04 },
  // C pentatonic an octave up, sparse — thin air among the clouds
  sky: { scale: [523, 587, 659, 784, 880, 1046], pads: [[131, 262, 392], [110, 220, 330], [98, 196, 294]], gapMin: 1.6, gapVar: 2, dur: 3.4, vol: 0.04, type: 'sine', padEvery: 9, padDur: 10, padVol: 0.03 },
  // pads only — the bell-flowers carry the melody on the song level
  quiet: { scale: [], pads: [[131, 196, 330], [110, 165, 262]], gapMin: 3, gapVar: 2, dur: 3, vol: 0, type: 'sine', padEvery: 10, padDur: 11, padVol: 0.03 },
  // deep and slow, rocking like the tide
  sea: { scale: [147, 175, 196, 220, 262, 294], pads: [[37, 73, 147], [44, 87, 131], [49, 98, 175]], gapMin: 1.9, gapVar: 2, dur: 4.2, vol: 0.05, type: 'sine', padEvery: 9, padDur: 11, padVol: 0.045 },
  // quick little skipping notes — a game of tag
  playful: { scale: [330, 392, 440, 523, 587, 659], pads: [[131, 196, 330], [98, 147, 294], [110, 165, 262]], gapMin: 0.55, gapVar: 0.7, dur: 1.1, vol: 0.05, type: 'triangle', padEvery: 6, padDur: 7, padVol: 0.03 },
  // the goodnight song under the stars
  night: { scale: [220, 262, 294, 330, 392], pads: [[55, 110, 220], [65, 131, 196], [49, 98, 196]], gapMin: 2, gapVar: 2.2, dur: 4.5, vol: 0.05, type: 'sine', padEvery: 10, padDur: 12, padVol: 0.045 },
};

let currentMood: MoodName = 'meadow';
let musicGain: GainNode | null = null;
let musicTimerStarted = false;
let nextMelodyAt = 0;
let nextPadAt = 0;
let melodyIdx = 3;
let padIdx = 0;

function musicNote(freq: number, at: number, dur: number, vol: number, type: OscillatorType): void {
  if (!ctx || !musicGain) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, at);
  g.gain.linearRampToValueAtTime(vol, at + dur * 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(g).connect(musicGain);
  osc.start(at);
  osc.stop(at + dur + 0.1);
}

function retireMusicGain(): void {
  if (!ctx || !musicGain) return;
  const old = musicGain;
  const t = ctx.currentTime;
  old.gain.cancelScheduledValues(t);
  old.gain.setValueAtTime(Math.max(0.0001, old.gain.value), t);
  old.gain.linearRampToValueAtTime(0.0001, t + 0.25);
  setTimeout(() => {
    try { old.disconnect(); } catch { /* already gone */ }
  }, 1500);
  musicGain = null;
}

// Pick the music mood (each level has its own). This only switches the
// instruments — SILENTLY, at volume 0. The game drives the audible part:
// fadeMusicOut() while the old level is still on screen (volume reaches 0
// exactly at the switch moment), then fadeMusicIn() as the new level opens.
function setMood(name: MoodName): void {
  const changed = name !== currentMood;
  currentMood = name;
  if (!ctx || !master) return;
  if (!changed && musicGain) return;
  retireMusicGain();
  musicGain = ctx.createGain();
  musicGain.gain.setValueAtTime(0.0001, ctx.currentTime);
  musicGain.connect(duckGain ?? master);
  const m = MOODS[currentMood];
  melodyIdx = Math.max(0, Math.floor(m.scale.length / 2));
  padIdx = Math.floor(Math.random() * m.pads.length);
  nextPadAt = ctx.currentTime + 0.25;
  nextMelodyAt = ctx.currentTime + 0.7;
}

// Dip the music under the narrator.s voice, and bring it back after.
function duckMusic(on: boolean): void {
  if (!ctx || !duckGain) return;
  const t = ctx.currentTime;
  duckGain.gain.cancelScheduledValues(t);
  duckGain.gain.setValueAtTime(duckGain.gain.value, t);
  duckGain.gain.linearRampToValueAtTime(on ? 0.35 : 1, t + (on ? 0.25 : 0.6));
}

// Ease the current melody's volume down (to reach silence at the switch).
function fadeMusicOut(dur = 0.7): void {
  if (!ctx || !musicGain) return;
  const t = ctx.currentTime;
  musicGain.gain.cancelScheduledValues(t);
  musicGain.gain.setValueAtTime(Math.max(0.0001, musicGain.gain.value), t);
  musicGain.gain.linearRampToValueAtTime(0.0001, t + dur);
}

// Ease the (new) melody's volume up as the level becomes visible.
function fadeMusicIn(dur = 1.5): void {
  if (!ctx || !master) return;
  if (!musicGain) setMood(currentMood);
  const g = musicGain!;
  const t = ctx.currentTime;
  g.gain.cancelScheduledValues(t);
  g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), t);
  g.gain.linearRampToValueAtTime(1, t + dur);
}

function startMusic(): void {
  if (musicTimerStarted || !ctx) return;
  musicTimerStarted = true;
  setMood(currentMood);
  fadeMusicIn(1.5); // the game is already on screen when audio unlocks

  // schedule a little ahead of time, forever
  setInterval(() => {
    if (!ctx || ctx.state !== 'running') return;
    const horizon = ctx.currentTime + 1.5;
    const m = MOODS[currentMood];
    while (nextPadAt < horizon) {
      const chord = m.pads[padIdx % m.pads.length];
      padIdx++;
      for (const f of chord) musicNote(f, nextPadAt, m.padDur, m.padVol, 'sine');
      nextPadAt += m.padEvery;
    }
    while (nextMelodyAt < horizon) {
      if (m.scale.length === 0) {
        nextMelodyAt += 2;
        continue;
      }
      // gentle random walk over the mood's scale
      melodyIdx = Math.max(0, Math.min(m.scale.length - 1, melodyIdx + (Math.floor(Math.random() * 5) - 2)));
      musicNote(m.scale[melodyIdx], nextMelodyAt, m.dur, m.vol, m.type);
      nextMelodyAt += m.gapMin + Math.random() * m.gapVar;
    }
  }, 400);
}

export const audio = {
  unlock,
  play,
  playNote,
  setMood,
  fadeMusicOut,
  fadeMusicIn,
  duckMusic,
  toggleMute,
  suspend,
  resume,
  isMuted: () => muted,
};
