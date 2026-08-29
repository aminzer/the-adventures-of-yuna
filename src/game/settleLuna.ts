import { C } from '../config';
import type { GameCtx } from './context';
import { moveX } from './moveX';
import { moveY } from './moveY';

// Gravity-only settle so Luna never hangs frozen in mid-air during cutscenes.
// With wings she simply hovers — fluttering in place through the ceremony.
export function settleLuna(gc: GameCtx, dt: number): void {
  const luna = gc.luna;
  if (luna.onGround) return;
  if (luna.hasWings) {
    luna.vy = 0;
    return;
  }
  luna.vx *= 0.9;
  moveX(gc, luna.vx * dt);
  luna.vy = Math.min(luna.vy + C.GRAVITY_DOWN * dt, C.MAX_FALL);
  moveY(gc, luna.vy * dt);
}
