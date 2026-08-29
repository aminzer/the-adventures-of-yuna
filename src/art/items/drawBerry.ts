import type { Ctx } from '../types';
import { ellipse } from '../shapes';

// a plump strawberry
export function drawBerry(g: Ctx): void {
  g.fillStyle = '#ef4d63';
  g.strokeStyle = '#d13850';
  g.lineWidth = 1.2;
  g.beginPath();
  g.moveTo(-8, -5);
  g.quadraticCurveTo(-9, 4, 0, 11);
  g.quadraticCurveTo(9, 4, 8, -5);
  g.quadraticCurveTo(0, -10, -8, -5);
  g.closePath();
  g.fill();
  g.stroke();
  g.fillStyle = '#ffe3b0';
  const seeds: Array<[number, number]> = [[-4, -2], [3, -3], [0, 3], [-3, 5], [4, 4]];
  for (const [px, py] of seeds) {
    ellipse(g, px, py, 0.9, 1.4);
    g.fill();
  }
  g.fillStyle = '#4f9e51';
  for (let i = 0; i < 4; i++) {
    g.save();
    g.translate(0, -7);
    g.rotate((i - 1.5) * 0.55);
    ellipse(g, 0, -3, 2, 4);
    g.fill();
    g.restore();
  }
}
