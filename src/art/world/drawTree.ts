import type { Ctx } from '../types';
import { circle, rr } from '../shapes';

export function drawTree(g: Ctx, t: number): void {
  g.fillStyle = '#8a5f3e';
  rr(g, -5, -42, 10, 42, 4);
  g.fill();
  const sway = Math.sin(t * 0.8) * 1.5;
  g.fillStyle = '#5fae52';
  g.strokeStyle = '#4a9142';
  g.lineWidth = 2;
  circle(g, -14 + sway, -46, 14);
  g.fill();
  g.stroke();
  circle(g, 14 + sway, -46, 14);
  g.fill();
  g.stroke();
  circle(g, sway, -58, 18);
  g.fill();
  g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.2)';
  circle(g, -5 + sway, -62, 6);
  g.fill();
}
