import { C } from '../config';
import type { GameCtx } from './context';
import { solid } from './solid';

export function moveY(gc: GameCtx, dy: number): void {
  const T = C.TILE;
  const player = gc.player;
  player.y += dy;
  player.onGround = false;
  const left = Math.floor((player.x + 3) / T);
  const right = Math.floor((player.x + player.w - 3) / T);
  if (dy > 0) {
    const row = Math.floor((player.y + player.h) / T);
    for (let c = left; c <= right; c++) {
      if (solid(gc, c, row)) {
        player.y = row * T - player.h;
        player.vy = 0;
        player.onGround = true;
        break;
      }
    }
  } else if (dy < 0) {
    const row = Math.floor(player.y / T);
    for (let c = left; c <= right; c++) {
      if (solid(gc, c, row)) { player.y = (row + 1) * T + 0.01; player.vy = 0; break; }
    }
  }
}
