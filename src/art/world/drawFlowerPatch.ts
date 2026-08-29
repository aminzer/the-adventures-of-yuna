import type { Ctx } from '../types';
import { circle, ellipse } from '../shapes';

export function drawFlowerPatch(g: Ctx, t: number): void {
  const cols = ['#ff8ab0', '#ffd23e', '#b795ff'];
  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * 12;
    const sway = Math.sin(t * 1.5 + i) * 2;
    g.strokeStyle = '#4f9e51';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(x, 0);
    g.quadraticCurveTo(x + sway, -8, x + sway, -13 - i * 2);
    g.stroke();
    g.fillStyle = cols[i];
    for (let p = 0; p < 5; p++) {
      g.save();
      g.translate(x + sway, -13 - i * 2);
      g.rotate((p / 5) * Math.PI * 2 + t * 0.2);
      ellipse(g, 0, -3.5, 2.2, 3.5);
      g.fill();
      g.restore();
    }
    g.fillStyle = '#fff3c4';
    circle(g, x + sway, -13 - i * 2, 2.2);
    g.fill();
  }
}
