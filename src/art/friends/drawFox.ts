import type { Ctx, FriendPose } from '../types';
import { circle, ellipse } from '../shapes';
import { drawFace } from './drawFace';

// A little fox sitting with its tail curled round. Lonely when sad.
export function drawFox(g: Ctx, o: FriendPose): void {
  g.save();
  g.translate(0, -o.hop);
  const t = o.t;

  // tail — wrapped tightly when lonely, happy wag when comforted
  g.lineCap = 'round';
  g.strokeStyle = '#e8853f';
  g.lineWidth = 9;
  g.beginPath();
  if (o.happy) {
    const wag = Math.sin(t * 10) * 5;
    g.moveTo(-8, -8);
    g.quadraticCurveTo(-20, -12, -18 + wag, -28);
  } else {
    g.moveTo(-10, -6);
    g.quadraticCurveTo(-18, -4, -2, -2.5);
  }
  g.stroke();
  // white tail tip
  g.strokeStyle = '#fff6ec';
  g.lineWidth = 5;
  g.beginPath();
  if (o.happy) {
    const wag = Math.sin(t * 10) * 5;
    g.moveTo(-19 + wag, -22);
    g.lineTo(-18 + wag, -28);
  } else {
    g.moveTo(-8, -2.8);
    g.lineTo(-2, -2.5);
  }
  g.stroke();

  // haunch + chest
  g.fillStyle = '#e8853f';
  g.strokeStyle = '#c2662a';
  g.lineWidth = 1.5;
  ellipse(g, -3, -11, 12, 10.5);
  g.fill();
  g.stroke();
  g.fillStyle = '#fff6ec';
  ellipse(g, 4, -9, 5.5, 7);
  g.fill();

  // front legs
  g.strokeStyle = '#e8853f';
  g.lineWidth = 5;
  g.beginPath();
  g.moveTo(6, -12);
  g.lineTo(6, -2);
  g.stroke();
  g.fillStyle = '#c2662a';
  ellipse(g, 6, -2, 3.5, 2);
  g.fill();

  // ears — flat and back when lonely, tall when happy
  for (const s of [-1, 1]) {
    g.save();
    g.translate(7 + s * 6, -38);
    g.rotate(o.happy ? s * 0.2 : s * 0.55 - 0.35);
    g.fillStyle = '#e8853f';
    g.beginPath();
    g.moveTo(-3.5, 3);
    g.lineTo(0, o.happy ? -8 : -5);
    g.lineTo(3.5, 3);
    g.closePath();
    g.fill();
    g.fillStyle = '#4a3a35';
    g.beginPath();
    g.moveTo(-1.6, 1);
    g.lineTo(0, o.happy ? -5 : -3);
    g.lineTo(1.6, 1);
    g.closePath();
    g.fill();
    g.restore();
  }

  // head — hangs a little lower when lonely
  const hy = o.happy ? -31 : -29;
  g.fillStyle = '#e8853f';
  g.strokeStyle = '#c2662a';
  g.lineWidth = 1.5;
  circle(g, 7, hy, 9.5);
  g.fill();
  g.stroke();
  // cheek fluff
  g.fillStyle = '#fff6ec';
  ellipse(g, 12.5, hy + 3.5, 5.5, 4);
  g.fill();
  g.fillStyle = '#4a3a35';
  circle(g, 16.5, hy + 2, 1.4);
  g.fill();

  drawFace(g, o, 4, hy - 2, 11, hy - 2.5, null, null);
  g.restore();
}
