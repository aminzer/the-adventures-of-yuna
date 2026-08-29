import type { Ctx } from '../types';
import { circle } from '../shapes';

// The puppy's dream: a little red play ball (bubble icon for chase levels).
export function drawBall(g: Ctx): void {
  g.fillStyle = '#e85560';
  circle(g, 0, 0, 9);
  g.fill();
  g.fillStyle = '#ffffff';
  g.beginPath();
  g.arc(0, 0, 9, Math.PI * 1.2, Math.PI * 1.8);
  g.arc(0, -14, 9, Math.PI * 0.66, Math.PI * 0.34, true);
  g.closePath();
  g.fill();
  g.strokeStyle = '#c23a48';
  g.lineWidth = 1.4;
  circle(g, 0, 0, 9);
  g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.85)';
  circle(g, -3, -4, 1.8);
  g.fill();
}
