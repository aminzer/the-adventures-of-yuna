import type { Ctx } from '../types';
import { circle } from '../shapes';
import { drawSparkle } from '../drawSparkle';

export function drawPearl(g: Ctx): void {
  // soft glow
  const halo = g.createRadialGradient(0, 0, 2, 0, 0, 14);
  halo.addColorStop(0, 'rgba(255,255,255,0.5)');
  halo.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = halo;
  circle(g, 0, 0, 14);
  g.fill();
  // the pearl, faintly iridescent
  const body = g.createRadialGradient(-3, -3, 1, 0, 0, 9);
  body.addColorStop(0, '#ffffff');
  body.addColorStop(0.6, '#f2e8f0');
  body.addColorStop(1, '#d8c8dd');
  g.fillStyle = body;
  circle(g, 0, 0, 9);
  g.fill();
  g.strokeStyle = 'rgba(180,160,190,0.6)';
  g.lineWidth = 1;
  g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.95)';
  circle(g, -3, -3.5, 2);
  g.fill();
  drawSparkle(g, 5, -6, 2.2);
}
