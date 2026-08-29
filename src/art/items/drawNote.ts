import type { Ctx } from '../types';
import { ellipse } from '../shapes';

export function drawNote(g: Ctx, color = '#5a4a6f'): void {
  g.fillStyle = color;
  g.strokeStyle = color;
  ellipse(g, -3, 7, 4.5, 3.4, -0.35);
  g.fill();
  g.lineWidth = 2.2;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(1, 6);
  g.lineTo(1, -9);
  g.stroke();
  g.beginPath();
  g.moveTo(1, -9);
  g.quadraticCurveTo(7, -8, 8, -2);
  g.quadraticCurveTo(5.5, -5, 1, -4.5);
  g.closePath();
  g.fill();
}
