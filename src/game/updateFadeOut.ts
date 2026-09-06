import { C } from '../config';
import { CHAPTERS, chapterIndexOfLevel } from '../levels';
import { audio } from '../audio';
import type { GameCtx } from './context';
import { enterChapterCard } from './enterChapterCard';
import { loadLevel } from './loadLevel';

export function updateFadeOut(gc: GameCtx, dt: number): void {
  gc.fade = Math.min(1, gc.fade + dt / C.FADE_TIME);
  if (gc.fade >= 1) {
    if (gc.afterFade === 'NEXT_LEVEL') {
      gc.levelIndex++;
      loadLevel(gc, gc.levelIndex);
      gc.afterFade = 'PLAYING';
      gc.state = 'FADE_IN';
    } else if (gc.afterFade === 'CHAPTER_CARD') {
      // a finished chapter's scene fades out — turn the page to the next one
      gc.levelIndex++;
      enterChapterCard(gc);
    } else {
      gc.finaleChapter = chapterIndexOfLevel(gc.levelIndex);
      gc.finaleT = 0;
      gc.particles = [];
      audio.setMood(CHAPTERS[gc.finaleChapter].finaleMusic); // switched silently, at the black moment
      gc.state = 'FADE_IN';
    }
  }
}
