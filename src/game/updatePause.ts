import { audio } from '../audio';
import type { GameCtx } from './context';
import { leaveToChapterMenu } from './leaveToChapterMenu';
import { PAUSE_ITEMS } from './pauseMenuLayout';
import { resumeGame } from './resumeGame';

export function focusPauseItem(gc: GameCtx, index: number): void {
  const next = Math.max(0, Math.min(PAUSE_ITEMS - 1, index));
  if (next === gc.pauseIndex) return;
  gc.pauseIndex = next;
  audio.play('hint');
}

export function choosePauseItem(gc: GameCtx): void {
  if (gc.pauseIndex === 0) resumeGame(gc);
  else leaveToChapterMenu(gc);
}

// ↑/↓ (or ←/→) move between the two choices, Space/Enter picks, Esc resumes.
export function updatePause(gc: GameCtx, dt: number, justPressed: Set<string>): void {
  gc.pauseT += dt;
  if (justPressed.has('Escape')) {
    resumeGame(gc);
    return;
  }
  const dir =
    (justPressed.has('ArrowDown') || justPressed.has('ArrowRight') ? 1 : 0) -
    (justPressed.has('ArrowUp') || justPressed.has('ArrowLeft') ? 1 : 0);
  if (dir !== 0) focusPauseItem(gc, gc.pauseIndex + dir);
  if (justPressed.has('Space') || justPressed.has('Enter')) choosePauseItem(gc);
}
