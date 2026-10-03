import { C } from '../config';
import { chapterStartLevel, stripesBeforeLevel } from '../levels';
import { chooseChapter } from './chooseChapter';
import type { GameCtx } from './context';
import { focusChapter } from './focusChapter';
import { loadLevel } from './loadLevel';

// ←/→ move the focus between chapter cards; Space or ↑ chooses. The chosen
// card lifts, then the screen fades and the chapter's first level opens.
export function updateChapterMenu(gc: GameCtx, dt: number, justPressed: Set<string>): void {
  gc.stateT += dt;
  gc.menuT += dt;

  if (!gc.menuChosen) {
    gc.fade = Math.max(0, gc.fade - dt / C.FADE_TIME);
    const dir = (justPressed.has('ArrowRight') ? 1 : 0) - (justPressed.has('ArrowLeft') ? 1 : 0);
    if (dir !== 0) focusChapter(gc, gc.menuIndex + dir);
    if (justPressed.has('Space') || justPressed.has('ArrowUp') || justPressed.has('Enter')) chooseChapter(gc);
    return;
  }

  // chosen: the card lifts for a moment, then fade into the chapter
  gc.menuWait += dt;
  if (gc.menuWait < 0.5) return;
  gc.fade = Math.min(1, gc.fade + dt / C.FADE_TIME);
  if (gc.fade >= 1) {
    const first = chapterStartLevel(gc.menuIndex);
    gc.levelIndex = first;
    gc.colorsRestored = stripesBeforeLevel(first);
    gc.stripeFill = 1;
    loadLevel(gc, first); // sets the level's melody (silently, at black) and story caption
    gc.jumpBuf = 0; // the Space that chose the chapter is not a jump
    gc.state = 'FADE_IN';
    gc.afterFade = 'PLAYING';
    gc.stateT = 0;
  }
}
