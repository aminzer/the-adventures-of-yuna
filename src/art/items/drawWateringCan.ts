import type { Ctx } from '../types';
import { ellipse, rr } from '../shapes';

export function drawWateringCan(g: Ctx): void {
  // body
  g.fillStyle = '#5aa8c8';
  g.strokeStyle = '#4187a5';
  g.lineWidth = 1.4;
  rr(g, -7, -6, 14, 13, 3);
  g.fill();
  g.stroke();
  // spout
  g.strokeStyle = '#5aa8c8';
  g.lineWidth = 3.5;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(-7, -1);
  g.lineTo(-13, -8);
  g.stroke();
  g.fillStyle = '#4187a5';
  ellipse(g, -13.5, -8.5, 2.6, 1.8, -0.7);
  g.fill();
  // top handle
  g.strokeStyle = '#4187a5';
  g.lineWidth = 2.2;
  g.beginPath();
  g.arc(0, -6, 5.5, Math.PI, 0);
  g.stroke();
  // shine
  g.fillStyle = 'rgba(255,255,255,0.35)';
  rr(g, -4.5, -4, 3, 8, 1.5);
  g.fill();
}
