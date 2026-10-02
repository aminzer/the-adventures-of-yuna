import type { Ctx } from '../types';
import { circle } from '../shapes';

// A round hide-and-seek bush, origin on the ground line. Tall enough to hide
// a fox's body — and short enough for its ears to peek over the top.
export function drawBush(g: Ctx, t: number): void {
  g.save();
  const sway = Math.sin(t * 0.9) * 0.015;
  g.rotate(sway);
  g.fillStyle = '#2e7d44';
  circle(g, -24, -20, 20);
  g.fill();
  circle(g, 24, -19, 19);
  g.fill();
  g.fillStyle = '#379354';
  circle(g, 0, -32, 26);
  g.fill();
  g.fillStyle = '#45a563';
  circle(g, -10, -38, 14);
  g.fill();
  circle(g, 12, -34, 12);
  g.fill();
  // a few berries so every bush looks friendly
  g.fillStyle = '#e26a8d';
  circle(g, -16, -24, 3);
  g.fill();
  circle(g, 8, -18, 3);
  g.fill();
  circle(g, 20, -30, 3);
  g.fill();
  g.restore();
}
