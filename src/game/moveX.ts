import { C } from '../config';
import type { GameCtx } from './context';
import { solid } from './solid';

export function moveX(gc: GameCtx, dx: number): void {
  const T = C.TILE;
  const luna = gc.luna;
  luna.x += dx;
  const top = Math.floor((luna.y + 2) / T);
  const bottom = Math.floor((luna.y + luna.h - 2) / T);
  if (dx > 0) {
    const col = Math.floor((luna.x + luna.w) / T);
    for (let r = top; r <= bottom; r++) {
      if (solid(gc, col, r)) { luna.x = col * T - luna.w - 0.01; luna.vx = 0; break; }
    }
  } else if (dx < 0) {
    const col = Math.floor(luna.x / T);
    for (let r = top; r <= bottom; r++) {
      if (solid(gc, col, r)) { luna.x = (col + 1) * T + 0.01; luna.vx = 0; break; }
    }
  }
}
