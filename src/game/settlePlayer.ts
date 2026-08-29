import { C } from '../config';
import type { GameCtx } from './context';
import { moveX } from './moveX';
import { moveY } from './moveY';

// Gravity-only settle so Yuna never hangs frozen in mid-air during cutscenes.
// With wings she simply hovers — fluttering in place through the ceremony.
export function settlePlayer(gc: GameCtx, dt: number): void {
  const player = gc.player;
  if (player.onGround) return;
  if (player.hasWings) {
    player.vy = 0;
    return;
  }
  player.vx *= 0.9;
  moveX(gc, player.vx * dt);
  player.vy = Math.min(player.vy + C.GRAVITY_DOWN * dt, C.MAX_FALL);
  moveY(gc, player.vy * dt);
}
