import type { Ctx, FriendPose } from '../types';
import { circle, ellipse } from '../shapes';
import { drawFace } from './drawFace';

export function drawBunny(g: Ctx, o: FriendPose): void {
  g.save();
  g.translate(0, -o.hop);
  const t = o.t;

  // ears — droopy when sad, up and wiggly when happy
  for (const s of [-1, 1]) {
    const rot = o.happy
      ? s * (0.22 + Math.sin(t * 6 + s) * 0.06)
      : s * 1.35 + Math.sin(t * 1.2) * 0.03;
    g.save();
    g.translate(s * 5, -44);
    g.rotate(rot);
    g.fillStyle = '#edd3ab';
    g.strokeStyle = '#cfa976';
    g.lineWidth = 1.5;
    ellipse(g, 0, -11, 4.2, 12);
    g.fill();
    g.stroke();
    g.fillStyle = '#f7c1c9';
    ellipse(g, 0, -10, 2, 8);
    g.fill();
    g.restore();
  }

  // body + belly
  g.fillStyle = '#edd3ab';
  g.strokeStyle = '#cfa976';
  g.lineWidth = 1.5;
  ellipse(g, 0, -16, 14, 13);
  g.fill();
  g.stroke();
  g.fillStyle = '#fbf0dc';
  ellipse(g, 0, -12, 8, 8);
  g.fill();

  // tail + feet
  g.fillStyle = '#fffaf0';
  circle(g, -13, -10, 4);
  g.fill();
  g.fillStyle = '#edd3ab';
  ellipse(g, -6, -3, 5, 3);
  g.fill();
  ellipse(g, 7, -3, 5, 3);
  g.fill();

  // head
  g.fillStyle = '#edd3ab';
  g.strokeStyle = '#cfa976';
  circle(g, 0, -37, 11);
  g.fill();
  g.stroke();
  g.fillStyle = '#fbf0dc';
  circle(g, 0, -33, 4.5);
  g.fill();
  g.fillStyle = '#e58ca0';
  g.beginPath();
  g.moveTo(-1.8, -35.5);
  g.lineTo(1.8, -35.5);
  g.lineTo(0, -33.2);
  g.closePath();
  g.fill();

  drawFace(g, o, -4.5, -39, 4.5, -39, 0, -31.5);
  g.restore();
}
