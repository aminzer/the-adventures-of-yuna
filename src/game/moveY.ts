import { C } from '../config';
import type { GameCtx } from './context';
import { solid } from './solid';

export function moveY(gc: GameCtx, dy: number): void {
  const T = C.TILE;
  const luna = gc.luna;
  luna.y += dy;
  luna.onGround = false;
  const left = Math.floor((luna.x + 3) / T);
  const right = Math.floor((luna.x + luna.w - 3) / T);
  if (dy > 0) {
    const row = Math.floor((luna.y + luna.h) / T);
    for (let c = left; c <= right; c++) {
      if (solid(gc, c, row)) {
        luna.y = row * T - luna.h;
        luna.vy = 0;
        luna.onGround = true;
        break;
      }
    }
  } else if (dy < 0) {
    const row = Math.floor(luna.y / T);
    for (let c = left; c <= right; c++) {
      if (solid(gc, c, row)) { luna.y = (row + 1) * T + 0.01; luna.vy = 0; break; }
    }
  }
}
