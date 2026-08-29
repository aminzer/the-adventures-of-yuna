import { C } from '../config';
import { audio } from '../audio';
import type { GameCtx } from './context';
import { loadLevel } from './loadLevel';

export function updateFadeOut(gc: GameCtx, dt: number): void {
  gc.fade = Math.min(1, gc.fade + dt / C.FADE_TIME);
  if (gc.fade >= 1) {
    if (gc.afterFade === 'NEXT_LEVEL') {
      gc.levelIndex++;
      loadLevel(gc, gc.levelIndex);
      gc.afterFade = 'PLAYING';
    } else {
      gc.finaleT = 0;
      gc.particles = [];
      audio.setMood('night'); // switched silently, at the black moment
    }
    gc.state = 'FADE_IN';
  }
}
