import type { Ctx } from '../types';
import { circle, ellipse } from '../shapes';

export function drawRescueCloud(g: Ctx, t: number): void {
  const squash = 1 + Math.sin(t * 6) * 0.04;
  g.save();
  g.scale(1, squash);
  g.fillStyle = 'rgba(255,255,255,0.96)';
  ellipse(g, 0, 0, 30, 12);
  g.fill();
  circle(g, -14, -6, 11);
  g.fill();
  circle(g, 2, -9, 12);
  g.fill();
  circle(g, 16, -5, 10);
  g.fill();
  g.restore();
}
