import type { Ctx } from './types';
import { rr } from './shapes';

export function drawSpeaker(g: Ctx, muted: boolean): void {
  g.save();
  g.fillStyle = 'rgba(255,255,255,0.75)';
  rr(g, 0, 0, 40, 40, 10);
  g.fill();
  g.fillStyle = '#6a6a80';
  g.beginPath();
  g.moveTo(9, 16);
  g.lineTo(15, 16);
  g.lineTo(22, 10);
  g.lineTo(22, 30);
  g.lineTo(15, 24);
  g.lineTo(9, 24);
  g.closePath();
  g.fill();
  g.strokeStyle = '#6a6a80';
  g.lineWidth = 2.5;
  g.lineCap = 'round';
  if (muted) {
    g.beginPath();
    g.moveTo(26, 15);
    g.lineTo(34, 25);
    g.moveTo(34, 15);
    g.lineTo(26, 25);
    g.stroke();
  } else {
    g.beginPath();
    g.arc(23, 20, 6, -0.9, 0.9);
    g.stroke();
    g.beginPath();
    g.arc(23, 20, 10, -0.8, 0.8);
    g.stroke();
  }
  g.restore();
}
