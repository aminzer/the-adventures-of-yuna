import type { Ctx } from '../types';
import { circle } from '../shapes';

// A friendly full moon for the night finale.
export function drawMoon(g: Ctx, t: number): void {
  g.save();
  const halo = g.createRadialGradient(0, 0, 12, 0, 0, 85);
  halo.addColorStop(0, 'rgba(235,240,255,0.55)');
  halo.addColorStop(1, 'rgba(235,240,255,0)');
  g.fillStyle = halo;
  circle(g, 0, 0, 85);
  g.fill();

  const body = g.createRadialGradient(-8, -8, 4, 0, 0, 34);
  body.addColorStop(0, '#fdfefb');
  body.addColorStop(1, '#dfe6ef');
  g.fillStyle = body;
  circle(g, 0, 0, 34);
  g.fill();

  // soft craters
  g.fillStyle = 'rgba(180,195,215,0.5)';
  circle(g, -10, 4, 6);
  g.fill();
  circle(g, 9, -9, 4.5);
  g.fill();
  circle(g, 6, 13, 3.5);
  g.fill();
  circle(g, -14, -12, 3);
  g.fill();

  // a slow gentle shimmer
  g.fillStyle = `rgba(255,255,255,${0.15 + 0.1 * Math.sin(t * 0.8)})`;
  circle(g, 0, 0, 34);
  g.fill();
  g.restore();
}
