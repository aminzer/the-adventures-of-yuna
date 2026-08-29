import type { Ctx } from '../types';
import { circle, ellipse } from '../shapes';

export function drawFlower(g: Ctx): void {
  g.strokeStyle = '#4f9e51';
  g.lineWidth = 2.5;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(0, -2);
  g.lineTo(0, 12);
  g.stroke();
  g.fillStyle = '#7cc860';
  ellipse(g, 4, 7, 4, 2, -0.5);
  g.fill();
  g.fillStyle = '#ff8ab0';
  for (let i = 0; i < 6; i++) {
    g.save();
    g.translate(0, -5);
    g.rotate((i / 6) * Math.PI * 2);
    ellipse(g, 0, -6, 3.2, 5.5);
    g.fill();
    g.restore();
  }
  g.fillStyle = '#ffd23e';
  circle(g, 0, -5, 3.5);
  g.fill();
}
