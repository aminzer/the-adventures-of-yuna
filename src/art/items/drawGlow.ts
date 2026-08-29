import type { Ctx } from '../types';
import { circle } from '../shapes';
import { drawSparkle } from '../drawSparkle';

// a warm golden orb of starlight
export function drawGlow(g: Ctx): void {
  const grad = g.createRadialGradient(0, 0, 1, 0, 0, 13);
  grad.addColorStop(0, '#fff7d0');
  grad.addColorStop(0.55, '#ffd94d');
  grad.addColorStop(1, 'rgba(255,217,77,0)');
  g.fillStyle = grad;
  circle(g, 0, 0, 13);
  g.fill();
  g.fillStyle = '#fff2b0';
  drawSparkle(g, 0, 0, 6);
  g.fillStyle = 'rgba(255,255,255,0.9)';
  drawSparkle(g, 7, -6, 2.5);
  drawSparkle(g, -6, 6, 2);
}
