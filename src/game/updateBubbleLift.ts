import { C } from '../config';
import { LEVELS } from '../levels';
import { audio } from '../audio';
import type { GameCtx } from './context';

// The friendly bubble: when Yuna's breath runs out it simply carries her
// straight up to the surface. Never a punishment — a soft elevator ride
// that ends with a big happy breath.
export function updateBubbleLift(gc: GameCtx, dt: number): void {
  const player = gc.player;
  const lift = player.bubbleLift!;
  lift.t += dt;
  player.vx = 0;
  player.vy = 0;
  player.y -= C.BUBBLE_LIFT_SPEED * dt;
  const waterRow = LEVELS[gc.levelIndex].water ?? 0;
  const waterY = waterRow * C.TILE;
  if (player.y + 8 < waterY - 6) {
    player.bubbleLift = null; // pop! — she is at the surface
    player.air = 1; // …with a big fresh breath
    gc.airWarned = false;
    audio.play('breath');
  }
}
