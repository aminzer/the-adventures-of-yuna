// Subtitle lines rewritten by the voice actor in the recording studio.
// src/textOverrides.json is written by the dev server (voice-studio plugin)
// and maps the ORIGINAL line's key (voiceKey of its spoken form) to the new
// text — so a line keeps its identity, its recording and its place even
// after being reworded.
import overrides from './textOverrides.json';
import { spokenText, voiceKey } from './voiceText';

export const TEXT_OVERRIDES: Record<string, string> = overrides;

// What to show (and say) for a caption written in the code.
export function captionText(text: string): { slot: string; shown: string } {
  const slot = voiceKey(spokenText(text));
  return { slot, shown: TEXT_OVERRIDES[slot] ?? text };
}
