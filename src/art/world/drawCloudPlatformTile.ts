import type { Ctx } from '../types';
import { circle, ellipse, rr } from '../shapes';

// Puffy cloud platform (sky levels) — solid to stand on, soft to look at.
export function drawCloudPlatformTile(g: Ctx, x: number, y: number, T: number, leftEnd: boolean, rightEnd: boolean): void {
  const exL = leftEnd ? 0 : 12;
  const exR = rightEnd ? 0 : 12;
  g.fillStyle = 'rgba(255,255,255,0.96)';
  rr(g, x - exL, y + 4, T + exL + exR, T - 14, 16);
  g.fill();
  // puffs along the top
  for (let px = x + 8; px < x + T; px += 16) {
    circle(g, px, y + 8, 9);
    g.fill();
  }
  if (leftEnd) {
    circle(g, x + 2, y + 16, 10);
    g.fill();
  }
  if (rightEnd) {
    circle(g, x + T - 2, y + 16, 10);
    g.fill();
  }
  g.fillStyle = 'rgba(190,205,225,0.5)';
  ellipse(g, x + T / 2, y + T - 12, T / 2 - 2 + exL / 2 + exR / 2, 4);
  g.fill();
}
