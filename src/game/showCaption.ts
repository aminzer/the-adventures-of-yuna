import { captionText } from '../textOverrides';
import { voice } from '../voice';
import type { GameCtx } from './context';

// Show a subtitle at the bottom of the screen for a few seconds — and read it
// aloud (very short flashes like «Звёздочка!» stay silent to avoid chatter).
// The voice actor may have reworded the line in the studio: the reworded
// text is shown and spoken, while the recording stays attached to the slot.
export function showCaption(gc: GameCtx, text: string, dur = 3): void {
  const { slot, shown } = captionText(text);
  gc.caption = { text: shown, t: 0, dur };
  if (dur >= 2) voice.speak(shown, slot);
}
