import { C } from '../config';
import type { GameCtx } from './context';
import { lunaCX } from './utils';

export function updateRescue(gc: GameCtx, dt: number): void {
  const luna = gc.luna;
  const r = luna.rescue!;
  r.t += dt;
  const p = Math.min(1, r.t / C.RESCUE_TIME);
  const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; // easeInOutQuad
  // quadratic bezier: rise above both endpoints, then settle down
  const mx = (r.sx + r.tx) / 2;
  const my = Math.min(r.sy, r.ty) - 150;
  const u = 1 - e;
  luna.x = u * u * r.sx + 2 * u * e * mx + e * e * r.tx;
  luna.y = u * u * r.sy + 2 * u * e * my + e * e * r.ty;
  if (Math.random() < 0.3) {
    gc.particles.push({ kind: 'sparkle', x: lunaCX(luna) + (Math.random() - 0.5) * 40, y: luna.y + luna.h + 8, vx: 0, vy: 20, life: 0.8, t: 0 });
  }
  if (p >= 1) {
    luna.rescue = null;
    luna.y = r.ty;
    luna.vy = 0;
  }
}
