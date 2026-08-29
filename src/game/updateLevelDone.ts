import { C } from '../config';
import { LEVELS } from '../levels';
import { audio } from '../audio';
import type { GameCtx } from './context';
import { updatePlaying } from './updatePlaying';

export function updateLevelDone(gc: GameCtx, dt: number): void {
  gc.stateT += dt;
  if (Math.random() < dt * 2 && gc.friends.length > 0) {
    const f = gc.friends[Math.floor(Math.random() * gc.friends.length)];
    gc.particles.push({
      kind: 'heart',
      x: f.x + (Math.random() - 0.5) * 50,
      y: f.y - 40,
      vx: (Math.random() - 0.5) * 30,
      vy: -50,
      life: 1.6,
      t: 0,
    });
  }
  // Luna is controllable during the celebration — hop around in the color!
  updatePlaying(gc, dt);
  if (gc.stateT > C.LEVEL_DONE_TIME || (gc.anyKeyFrame && gc.stateT > 1.5)) {
    gc.state = 'FADE_OUT';
    gc.stateT = 0;
    gc.afterFade = gc.levelIndex + 1 < LEVELS.length ? 'NEXT_LEVEL' : 'FINALE';
    // whatever volume is left must reach zero exactly with the black screen
    // (the celebration may have been skipped early by a key press)
    audio.fadeMusicOut(C.FADE_TIME);
  }
}
