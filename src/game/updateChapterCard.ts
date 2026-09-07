import { C } from '../config';
import { voice } from '../voice';
import type { GameCtx } from './context';
import { loadLevel } from './loadLevel';

// The title page rests for a moment AND until the narrator has finished
// reading the chapter name (so the level's own story line never cuts it
// off) — then the title fades and the chapter's first level opens.
export function updateChapterCard(gc: GameCtx, dt: number): void {
  gc.stateT += dt;
  const narrated = gc.stateT >= C.CHAPTER_CARD_TIME && !voice.isSpeaking();
  if (narrated || gc.stateT >= C.CHAPTER_CARD_MAX) gc.cardOut += dt;
  if (gc.cardOut >= C.CHAPTER_CARD_OUT) {
    loadLevel(gc, gc.levelIndex); // sets the level's melody and story caption
    gc.fade = 1;
    gc.state = 'FADE_IN';
    gc.afterFade = 'PLAYING';
    gc.stateT = 0;
  }
}
