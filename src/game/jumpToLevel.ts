import { LEVELS } from '../levels';
import type { GameCtx } from './context';
import { loadLevel } from './loadLevel';

// Secret grown-up shortcut (Shift+L+level number): start any level directly,
// with the rainbow showing the colors that would already be restored
// (practice levels earn no stripe, so they don't count).
export function jumpToLevel(gc: GameCtx, idx: number): void {
  gc.levelIndex = idx;
  gc.colorsRestored = LEVELS.slice(0, idx).filter((l) => !l.practice).length;
  gc.stripeFill = 1;
  loadLevel(gc, idx);
  gc.fade = 1;
  gc.state = 'FADE_IN';
  gc.afterFade = 'PLAYING';
  gc.stateT = 0;
}
