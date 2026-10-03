import { C } from '../config';
import { CHAPTERS, chapterIndexOfLevel } from '../levels';
import { audio } from '../audio';
import type { GameCtx } from './context';
import { enterChapterMenu } from './enterChapterMenu';
import { loadLevel } from './loadLevel';

export function updateFadeOut(gc: GameCtx, dt: number): void {
  gc.fade = Math.min(1, gc.fade + dt / C.FADE_TIME);
  if (gc.fade >= 1) {
    if (gc.afterFade === 'NEXT_LEVEL') {
      gc.levelIndex++;
      loadLevel(gc, gc.levelIndex);
      gc.afterFade = 'PLAYING';
      gc.state = 'FADE_IN';
    } else if (gc.afterFade === 'CHAPTER_MENU') {
      // back to the chapter menu (after a chapter's final scene, or from the
      // pause menu) — whoever started the fade said which chapter to focus
      enterChapterMenu(gc, gc.menuFocusOnFade);
    } else {
      gc.finaleChapter = chapterIndexOfLevel(gc.levelIndex);
      gc.chapterDone[gc.finaleChapter] = true;
      gc.finaleT = 0;
      gc.particles = [];
      audio.setMood(CHAPTERS[gc.finaleChapter].finaleMusic); // switched silently, at the black moment
      gc.state = 'FADE_IN';
    }
  }
}
