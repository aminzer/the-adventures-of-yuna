import type { Ctx } from './types';
import { circle } from './shapes';

export function drawStar(g: Ctx, s: number, glow: number): void {
  g.save();
  if (glow > 0) {
    g.fillStyle = `rgba(255,225,120,${0.25 * glow})`;
    circle(g, 0, 0, s * 1.9);
    g.fill();
  }
  g.fillStyle = '#ffd94d';
  g.strokeStyle = '#f0b429';
  g.lineWidth = 1.5;
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? s : s * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.closePath();
  g.fill();
  g.stroke();
  g.restore();
}
