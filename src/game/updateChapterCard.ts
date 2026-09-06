import { C } from '../config';
import type { GameCtx } from './context';
import { loadLevel } from './loadLevel';

// The title page rests for a moment, then the chapter's first level opens.
export function updateChapterCard(gc: GameCtx, dt: number): void {
  gc.stateT += dt;
  if (gc.stateT >= C.CHAPTER_CARD_TIME) {
    loadLevel(gc, gc.levelIndex); // sets the level's melody and story caption
    gc.fade = 1;
    gc.state = 'FADE_IN';
    gc.afterFade = 'PLAYING';
    gc.stateT = 0;
  }
}
