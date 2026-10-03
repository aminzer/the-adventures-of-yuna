import { CHAPTERS } from '../levels';
import { audio } from '../audio';
import type { GameCtx } from './context';

// Open the chapter menu with one chapter in focus: a row of picture cards,
// ←/→ to look at another one, Space to start.
export function enterChapterMenu(gc: GameCtx, focus: number): void {
  gc.state = 'CHAPTER_MENU';
  gc.stateT = 0;
  gc.fade = 1;
  gc.menuIndex = Math.max(0, Math.min(CHAPTERS.length - 1, focus));
  gc.menuChosen = false;
  gc.menuT = 0;
  gc.menuWait = 0;
  gc.caption = null;
  gc.particles = [];
  audio.setMood('meadow'); // a calm tune for choosing
  audio.fadeMusicIn(1.5);
}
