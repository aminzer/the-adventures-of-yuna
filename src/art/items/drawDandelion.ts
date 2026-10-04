import type { Ctx } from '../types';
import { circle, ellipse } from '../shapes';

// A fluffy dandelion clock — the thing a slow turtle can only dream of
// reaching at the top of the hill.
export function drawDandelion(g: Ctx): void {
  g.strokeStyle = '#5aa552';
  g.lineWidth = 2.5;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(0, -4);
  g.lineTo(0, 13);
  g.stroke();
  g.fillStyle = '#7cc860';
  ellipse(g, -4, 8, 4.5, 2, 0.6);
  g.fill();
  // the soft white head
  g.fillStyle = 'rgba(255,255,255,0.55)';
  circle(g, 0, -7, 9.5);
  g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.9)';
  g.lineWidth = 1;
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    g.beginPath();
    g.moveTo(0, -7);
    g.lineTo(Math.cos(a) * 8.5, -7 + Math.sin(a) * 8.5);
    g.stroke();
    g.fillStyle = '#ffffff';
    circle(g, Math.cos(a) * 8.5, -7 + Math.sin(a) * 8.5, 1.3);
    g.fill();
  }
  g.fillStyle = '#e9e2b8';
  circle(g, 0, -7, 2.2);
  g.fill();
  // two seeds already drifting off
  g.fillStyle = 'rgba(255,255,255,0.9)';
  circle(g, 11, -14, 1.2);
  g.fill();
  circle(g, 14, -9, 1);
  g.fill();
}
