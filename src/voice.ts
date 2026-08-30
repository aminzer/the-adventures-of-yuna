// Russian voice-over for the subtitles, in order of preference:
//   1. a real person's recording   (public/voice-actor/, made in `npm run studio`)
//   2. a pre-generated neural clip  (public/voice/, made by `npm run voice`)
//   3. the browser's built-in speech synthesis
// Every caption passes through spokenText() — that is the exact line a clip
// is generated (or recorded) for.
import { audio } from './audio';
import { VOICE_CLIPS } from './voiceClips';
import { ACTOR_CLIPS } from './voiceActor';
import { spokenText, voiceKey } from './voiceText';

let enabled = true;
let muted = false;
let clip: HTMLAudioElement | null = null;

export { spokenText, voiceKey };

function synth(): SpeechSynthesis | null {
  return typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
}

// Prefer a friendly Russian voice; a few well-known names first.
function pickVoice(s: SpeechSynthesis): SpeechSynthesisVoice | null | undefined {
  const voices = s.getVoices();
  if (voices.length === 0) return undefined; // not loaded yet — let the browser choose
  const ru = voices.filter((v) => v.lang.toLowerCase().startsWith('ru'));
  if (ru.length === 0) return null; // no Russian voice on this machine
  const favourites = ['irina', 'svetlana', 'milena', 'dariya', 'katya', 'natural', 'google'];
  for (const name of favourites) {
    const hit = ru.find((v) => v.name.toLowerCase().includes(name));
    if (hit) return hit;
  }
  return ru[0];
}

function stopClip(): void {
  if (!clip) return;
  clip.onended = null;
  clip.onerror = null;
  clip.pause();
  clip = null;
}

function speakSynth(spoken: string): void {
  const s = synth();
  if (!s) return;
  const v = pickVoice(s);
  if (v === null) return; // nothing that can read Russian — stay silent
  s.cancel();
  const u = new SpeechSynthesisUtterance(spoken);
  u.lang = 'ru-RU';
  if (v) u.voice = v;
  u.rate = 0.9;
  u.pitch = 1.15;
  u.onstart = () => audio.duckMusic(true);
  u.onend = () => audio.duckMusic(false);
  u.onerror = () => audio.duckMusic(false);
  s.speak(u);
}

// The clip files that could voice this line, best first. A recording is
// attached to the line's slot (key of the original wording); a TTS clip is
// made for the exact words on screen.
export function clipUrls(slotKey: string, ttsKey = slotKey): string[] {
  const base = import.meta.env?.BASE_URL ?? './';
  const urls: string[] = [];
  if (ACTOR_CLIPS[slotKey]) urls.push(`${base}voice-actor/${ACTOR_CLIPS[slotKey]}`);
  if (VOICE_CLIPS[ttsKey]) urls.push(`${base}voice/${ttsKey}.mp3`);
  return urls;
}

// Try each clip in turn; if none can play, use the synthetic voice.
function playChain(urls: string[], spoken: string): void {
  if (urls.length === 0 || typeof Audio === 'undefined') {
    if (import.meta.env?.DEV) console.info(`[voice] browser speech: ${spoken}`);
    speakSynth(spoken);
    return;
  }
  const a = new Audio(urls[0]);
  clip = a;
  if (import.meta.env?.DEV) console.info(`[voice] ${urls[0]}`); // which source is playing — handy when a line sounds wrong
  a.onplay = () => audio.duckMusic(true);
  a.onended = () => audio.duckMusic(false);
  a.onerror = () => {
    audio.duckMusic(false);
    if (clip === a) playChain(urls.slice(1), spoken); // missing/unplayable → next option
  };
  a.play().catch(() => audio.duckMusic(false)); // e.g. before the first user gesture
}

export function speak(text: string, slotKey?: string): void {
  if (!enabled || muted) return;
  const spoken = spokenText(text);
  stopClip();
  synth()?.cancel(); // a new caption replaces the old one, in speech too
  const ttsKey = voiceKey(spoken);
  playChain(clipUrls(slotKey ?? ttsKey, ttsKey), spoken);
}

export function cancelSpeech(): void {
  stopClip();
  synth()?.cancel();
  audio.duckMusic(false);
}

export function setVoiceMuted(m: boolean): void {
  muted = m;
  if (m) cancelSpeech();
}

// Voice can be switched off on its own (a parent reading aloud may prefer
// the music without the narrator).
export function toggleVoice(): boolean {
  enabled = !enabled;
  if (!enabled) cancelSpeech();
  return enabled;
}

export const voice = { speak, cancelSpeech, setVoiceMuted, toggleVoice, spokenText, voiceKey, isEnabled: () => enabled };
