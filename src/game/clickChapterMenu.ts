import { menuHit } from './chapterMenuLayout';
import { chooseChapter } from './chooseChapter';
import type { GameCtx } from './context';
import { focusChapter } from './focusChapter';

// Mouse / touch in the chapter menu: a card starts that chapter (after its
// title is read), the pill starts the focused one, the side arrows move focus.
export function clickChapterMenu(gc: GameCtx, mx: number, my: number): void {
  if (gc.state !== 'CHAPTER_MENU' || gc.menuChosen) return;
  const hit = menuHit(mx, my);
  if (!hit) return;
  if (hit.kind === 'card') {
    focusChapter(gc, hit.index);
    chooseChapter(gc);
  } else if (hit.kind === 'pill') {
    chooseChapter(gc);
  } else {
    focusChapter(gc, gc.menuIndex + hit.dir);
  }
}
