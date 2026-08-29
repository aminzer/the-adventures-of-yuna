import type { Ctx } from '../types';
import { circle, ellipse } from '../shapes';
import { drawSparkle } from '../drawSparkle';

// The wings pickup: a glowing pair of little wings waiting for Luna.
export function drawWingsPickup(g: Ctx, t: number): void {
  const glow = g.createRadialGradient(0, 0, 3, 0, 0, 26);
  glow.addColorStop(0, 'rgba(255,240,180,0.55)');
  glow.addColorStop(1, 'rgba(255,240,180,0)');
  g.fillStyle = glow;
  circle(g, 0, 0, 26);
  g.fill();
  const flap = Math.sin(t * 6) * 0.18;
  for (const s of [-1, 1]) {
    g.save();
    g.scale(s, 1);
    g.rotate(-0.35 + flap);
    g.fillStyle = 'rgba(255,255,255,0.95)';
    g.strokeStyle = 'rgba(255,215,120,0.9)';
    g.lineWidth = 1.2;
    for (let k = 0; k < 3; k++) {
      g.save();
      g.rotate(-0.5 - k * 0.3);
      ellipse(g, -10 - k * 1.5, 0, 11 + k * 1.5, 4.4 - k * 0.7);
      g.fill();
      g.stroke();
      g.restore();
    }
    g.restore();
  }
  g.fillStyle = '#fff2b0';
  drawSparkle(g, 0, -14, 3 + Math.sin(t * 5) * 1);
}
