import { C } from '../config';
import type { GameCtx } from './context';
import { playerCX } from './utils';

export function updateRescue(gc: GameCtx, dt: number): void {
  const player = gc.player;
  const r = player.rescue!;
  r.t += dt;
  const p = Math.min(1, r.t / C.RESCUE_TIME);
  const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; // easeInOutQuad
  // quadratic bezier: rise above both endpoints, then settle down
  const mx = (r.sx + r.tx) / 2;
  const my = Math.min(r.sy, r.ty) - 150;
  const u = 1 - e;
  player.x = u * u * r.sx + 2 * u * e * mx + e * e * r.tx;
  player.y = u * u * r.sy + 2 * u * e * my + e * e * r.ty;
  if (Math.random() < 0.3) {
    gc.particles.push({ kind: 'sparkle', x: playerCX(player) + (Math.random() - 0.5) * 40, y: player.y + player.h + 8, vx: 0, vy: 20, life: 0.8, t: 0 });
  }
  if (p >= 1) {
    player.rescue = null;
    player.y = r.ty;
    player.vy = 0;
  }
}
