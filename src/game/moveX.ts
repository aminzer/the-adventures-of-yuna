import { C } from '../config';
import type { GameCtx } from './context';
import { solid } from './solid';

export function moveX(gc: GameCtx, dx: number): void {
  const T = C.TILE;
  const player = gc.player;
  player.x += dx;
  const top = Math.floor((player.y + 2) / T);
  const bottom = Math.floor((player.y + player.h - 2) / T);
  if (dx > 0) {
    const col = Math.floor((player.x + player.w) / T);
    for (let r = top; r <= bottom; r++) {
      if (solid(gc, col, r)) { player.x = col * T - player.w - 0.01; player.vx = 0; break; }
    }
  } else if (dx < 0) {
    const col = Math.floor(player.x / T);
    for (let r = top; r <= bottom; r++) {
      if (solid(gc, col, r)) { player.x = (col + 1) * T + 0.01; player.vx = 0; break; }
    }
  }
}
