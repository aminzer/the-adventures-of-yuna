import type { Ctx } from '../types';
import { circle, ellipse } from '../shapes';

// A twig nest with two hungry chicks peeking over the rim, origin on the
// ground line. The mother bird (a friend) is drawn on top of it.
export function drawNest(g: Ctx, t: number): void {
  g.save();
  // the bowl
  g.fillStyle = '#9b6b3a';
  ellipse(g, 0, -10, 30, 13);
  g.fill();
  g.fillStyle = '#7a5027';
  ellipse(g, 0, -16, 26, 6);
  g.fill();
  // twigs
  g.strokeStyle = '#c48a4e';
  g.lineWidth = 1.5;
  for (let i = 0; i < 9; i++) {
    const a = -0.3 + (i / 8) * 0.6;
    g.beginPath();
    g.moveTo(-28 + i * 7, -6 + Math.sin(i * 1.7) * 3);
    g.lineTo(-20 + i * 7 + Math.cos(a) * 6, -14 + Math.sin(i * 2.3) * 2);
    g.stroke();
  }
  // two small chicks at the rim's edges (the mother sits up in the middle),
  // mouths open, bobbing hungrily
  for (const [x, ph] of [[-23, 0], [24, 1.9]] as Array<[number, number]>) {
    const bob = Math.abs(Math.sin(t * 3 + ph)) * 3;
    g.save();
    g.translate(x, -16 - bob);
    g.fillStyle = '#ffd95e';
    circle(g, 0, 0, 5.5);
    g.fill();
    g.fillStyle = '#ff9f3a';
    g.beginPath();
    g.moveTo(x < 0 ? -5.5 : 5.5, -1);
    g.lineTo(x < 0 ? -11 : 11, -3.5);
    g.lineTo(x < 0 ? -11 : 11, 1.5);
    g.closePath();
    g.fill();
    g.fillStyle = '#33302c';
    circle(g, x < 0 ? -1.5 : 1.5, -1.5, 1.1);
    g.fill();
    g.restore();
  }
  g.restore();
}
