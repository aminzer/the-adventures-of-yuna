import type { Ctx } from '../types';
import { circle } from '../shapes';

// A little glowing firefly — drawn in the front (always-colored) layer, so it
// shines like a tiny lantern even in the grey world.
export function drawFirefly(g: Ctx, t: number): void {
  g.save();
  const breathe = 1 + Math.sin(t * 4) * 0.15;
  g.fillStyle = 'rgba(255, 228, 130, 0.25)';
  circle(g, 0, 0, 13 * breathe);
  g.fill();
  g.fillStyle = 'rgba(255, 228, 130, 0.5)';
  circle(g, 0, 0, 7 * breathe);
  g.fill();
  g.fillStyle = '#ffd95e';
  circle(g, 0, 0, 3.6);
  g.fill();
  // fluttering wings
  const flut = 0.5 + Math.sin(t * 16) * 0.35;
  g.fillStyle = 'rgba(255,255,255,0.8)';
  g.beginPath();
  g.ellipse(-4.5, -5, 5, 2.4 * flut, -0.7, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.ellipse(4.5, -5, 5, 2.4 * flut, 0.7, 0, Math.PI * 2);
  g.fill();
  g.restore();
}
