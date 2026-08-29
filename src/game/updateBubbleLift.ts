import { C } from '../config';
import { LEVELS } from '../levels';
import { audio } from '../audio';
import type { GameCtx } from './context';

// The friendly bubble: when Luna's breath runs out it simply carries her
// straight up to the surface. Never a punishment — a soft elevator ride
// that ends with a big happy breath.
export function updateBubbleLift(gc: GameCtx, dt: number): void {
  const luna = gc.luna;
  const lift = luna.bubbleLift!;
  lift.t += dt;
  luna.vx = 0;
  luna.vy = 0;
  luna.y -= C.BUBBLE_LIFT_SPEED * dt;
  const waterRow = LEVELS[gc.levelIndex].water ?? 0;
  const waterY = waterRow * C.TILE;
  if (luna.y + 8 < waterY - 6) {
    luna.bubbleLift = null; // pop! — she is at the surface
    luna.air = 1; // …with a big fresh breath
    gc.airWarned = false;
    audio.play('breath');
  }
}
