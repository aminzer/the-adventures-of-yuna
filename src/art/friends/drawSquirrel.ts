import type { Ctx, FriendPose } from '../types';
import { circle, ellipse } from '../shapes';
import { drawFace } from './drawFace';

export function drawSquirrel(g: Ctx, o: FriendPose): void {
  g.save();
  g.translate(0, -o.hop);
  const t = o.t;

  // big fluffy tail — drooping behind when sad, proud S-curve when happy
  g.strokeStyle = '#a35f36';
  g.lineWidth = 11;
  g.lineCap = 'round';
  g.beginPath();
  if (o.happy) {
    const wag = Math.sin(t * 9) * 3;
    g.moveTo(-9, -8);
    g.quadraticCurveTo(-22, -14, -19 + wag, -34);
    g.quadraticCurveTo(-17 + wag, -44, -8 + wag, -42);
  } else {
    g.moveTo(-9, -6);
    g.quadraticCurveTo(-22, -8, -24, -2);
  }
  g.stroke();
  g.strokeStyle = '#c47a4a';
  g.lineWidth = 6;
  g.stroke();

  // body
  g.fillStyle = '#c47a4a';
  g.strokeStyle = '#9c5c33';
  g.lineWidth = 1.5;
  ellipse(g, 0, -13, 11, 11);
  g.fill();
  g.stroke();
  g.fillStyle = '#f2ddc4';
  ellipse(g, 2, -10, 6, 7);
  g.fill();

  // feet + paws
  g.fillStyle = '#c47a4a';
  ellipse(g, -4, -2.5, 4.5, 2.5);
  g.fill();
  ellipse(g, 6, -2.5, 4.5, 2.5);
  g.fill();

  // ears — flat when sad, perky when happy
  for (const s of [-1, 1]) {
    g.save();
    g.translate(2 + s * 6, -38);
    g.rotate(o.happy ? s * 0.15 : s * 0.9);
    g.fillStyle = '#c47a4a';
    ellipse(g, 0, -3, 3.2, 5);
    g.fill();
    g.fillStyle = '#e8b48a';
    ellipse(g, 0, -2.5, 1.6, 3);
    g.fill();
    g.restore();
  }

  // head
  g.fillStyle = '#c47a4a';
  g.strokeStyle = '#9c5c33';
  circle(g, 2, -30, 9.5);
  g.fill();
  g.stroke();
  g.fillStyle = '#f2ddc4';
  ellipse(g, 4, -26.5, 4.5, 3.5);
  g.fill();
  g.fillStyle = '#5a4038';
  circle(g, 5, -28.5, 1.1);
  g.fill();

  drawFace(g, o, -1, -32, 7, -32, null, null);
  g.restore();
}
