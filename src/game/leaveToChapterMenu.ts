import { C } from '../config';
import { chapterIndexOfLevel } from '../levels';
import { audio } from '../audio';
import { voice } from '../voice';
import type { GameCtx } from './context';

// From the pause menu to the chapter menu: fade the level out; the menu opens
// with the chapter we were in already in focus.
export function leaveToChapterMenu(gc: GameCtx): void {
  voice.cancelSpeech();
  gc.state = 'FADE_OUT';
  gc.stateT = 0;
  gc.afterFade = 'CHAPTER_MENU';
  gc.menuFocusOnFade = chapterIndexOfLevel(gc.levelIndex);
  audio.duckMusic(false);
  audio.fadeMusicOut(C.FADE_TIME);
}
