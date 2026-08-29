// Pure helpers shared by the game, the TTS generator and the recording
// studio — deliberately free of imports so the studio page does not pull the
// whole game (and its hot-reloading manifest) into its module graph.

// Symbols in captions become words (or vanish) when spoken aloud.
export function spokenText(text: string): string {
  return text
    .replace(/←/g, 'влево')
    .replace(/→/g, 'вправо')
    .replace(/↑/g, 'вверх')
    .replace(/[☀-➿\u{1f300}-\u{1faff}❤]/gu, '') // emoji & dingbats
    .replace(/\s+/g, ' ')
    .trim();
}

// Stable short id for a spoken line (djb2 hash) — the clip's file name.
export function voiceKey(spoken: string): string {
  let h = 5381;
  for (const ch of spoken) h = ((h * 33) ^ ch.codePointAt(0)!) >>> 0;
  return h.toString(16).padStart(8, '0');
}
