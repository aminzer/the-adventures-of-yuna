import { CHAPTERS } from '../levels';
import { audio } from '../audio';
import type { GameCtx } from './context';

// Move the chapter menu's focus to another card.
export function focusChapter(gc: GameCtx, index: number): void {
  const next = Math.max(0, Math.min(CHAPTERS.length - 1, index));
  if (next === gc.menuIndex) return;
  gc.menuIndex = next;
  gc.menuT = 0;
  audio.play('hint');
}
