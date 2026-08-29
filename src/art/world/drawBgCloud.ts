import type { Ctx } from '../types';
import { circle, ellipse } from '../shapes';

export function drawBgCloud(g: Ctx): void {
  g.fillStyle = 'rgba(255,255,255,0.85)';
  ellipse(g, 0, 0, 26, 12);
  g.fill();
  ellipse(g, -16, 4, 16, 9);
  g.fill();
  ellipse(g, 17, 4, 15, 8);
  g.fill();
  circle(g, -4, -8, 11);
  g.fill();
}
