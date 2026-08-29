import type { Ctx, FriendPose } from '../types';
import { circle, ellipse } from '../shapes';
import { drawFace } from './drawFace';

export function drawBird(g: Ctx, o: FriendPose): void {
  g.save();
  g.translate(0, -o.hop);
  const t = o.t;

  // tail feathers
  g.strokeStyle = '#4da4b6';
  g.lineWidth = 3;
  g.lineCap = 'round';
  for (let i = -1; i <= 1; i++) {
    g.beginPath();
    g.moveTo(-8, -11);
    g.lineTo(-15, -13 + i * 3);
    g.stroke();
  }

  // body + belly
  g.fillStyle = '#6ec6d8';
  g.strokeStyle = '#4da4b6';
  g.lineWidth = 1.5;
  circle(g, 0, -11, 10);
  g.fill();
  g.stroke();
  g.fillStyle = '#eafcff';
  circle(g, 2, -8, 5.5);
  g.fill();

  // wing — droopy when sad, fluttering when happy
  const wingRot = o.happy ? Math.sin(t * 14) * 0.5 - 0.4 : 0.55;
  g.save();
  g.translate(-3, -11);
  g.rotate(wingRot);
  g.fillStyle = '#57b1c4';
  ellipse(g, -3, 2, 7, 4, 0.4);
  g.fill();
  g.restore();

  // head tuft
  g.strokeStyle = '#4da4b6';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(2, -20);
  g.lineTo(3, -25);
  g.moveTo(5, -19.5);
  g.lineTo(7, -24);
  g.stroke();

  // beak
  g.fillStyle = '#f2a13d';
  g.beginPath();
  g.moveTo(9, -14);
  g.lineTo(15.5, -11.5);
  g.lineTo(9, -9);
  g.closePath();
  g.fill();

  // feet
  g.strokeStyle = '#e8a04c';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(-3, -1);
  g.lineTo(-3, 0);
  g.moveTo(3, -1);
  g.lineTo(3, 0);
  g.stroke();

  drawFace(g, o, 3, -15, null, null, null, null);
  g.restore();
}
