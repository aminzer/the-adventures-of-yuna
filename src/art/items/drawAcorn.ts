import type { Ctx } from '../types';
import { ellipse } from '../shapes';

export function drawAcorn(g: Ctx): void {
  // nut
  g.fillStyle = '#c89b62';
  g.strokeStyle = '#a37b46';
  g.lineWidth = 1.3;
  ellipse(g, 0, 2, 5.5, 7);
  g.fill();
  g.stroke();
  // cap
  g.fillStyle = '#8a5f3e';
  g.beginPath();
  g.arc(0, -3, 6.5, Math.PI, 0);
  g.closePath();
  g.fill();
  g.strokeStyle = '#6d4a2f';
  g.lineWidth = 2.4;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(0, -9);
  g.lineTo(1.5, -13);
  g.stroke();
  // shine
  g.fillStyle = 'rgba(255,255,255,0.3)';
  ellipse(g, -2, 3, 1.4, 3, 0.2);
  g.fill();
}
