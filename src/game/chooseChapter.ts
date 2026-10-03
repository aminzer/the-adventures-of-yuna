import { audio } from '../audio';
import type { GameCtx } from './context';

// Choose the focused chapter: the card lifts; updateChapterMenu lets the
// title narration finish and then opens the chapter's first level.
export function chooseChapter(gc: GameCtx): void {
  if (gc.menuChosen) return;
  gc.menuChosen = true;
  gc.menuWait = 0;
  audio.play('star');
}
