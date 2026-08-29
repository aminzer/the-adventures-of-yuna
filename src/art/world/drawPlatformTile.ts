import type { Ctx } from '../types';
import { rr } from '../shapes';

export function drawPlatformTile(g: Ctx, x: number, y: number, T: number, leftEnd: boolean, rightEnd: boolean): void {
  // inner edges extend into the neighbor tile so the platform reads as one piece
  const exL = leftEnd ? 0 : 12;
  const exR = rightEnd ? 0 : 12;
  g.fillStyle = '#8a5f3e';
  rr(g, x - exL, y + 6, T + exL + exR, T - 12, 10);
  g.fill();
  g.fillStyle = '#63c76a';
  rr(g, x - exL, y, T + exL + exR, 16, 8);
  g.fill();
  g.fillStyle = 'rgba(255,255,255,0.25)';
  g.fillRect(x + (leftEnd ? 5 : 0), y + 1.5, T - (leftEnd ? 5 : 0) - (rightEnd ? 5 : 0), 2.5);
}
