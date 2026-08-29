import type { Ctx, FriendPose } from '../types';
import { circle, ellipse, rr } from '../shapes';
import { drawFace } from './drawFace';

export function drawTurtle(g: Ctx, o: FriendPose): void {
  g.save();
  g.translate(0, -o.hop);

  // legs + tail
  g.fillStyle = '#a8cf8e';
  ellipse(g, -12, -4, 4.5, 4);
  g.fill();
  ellipse(g, 6, -4, 4.5, 4);
  g.fill();
  g.beginPath();
  g.moveTo(-17, -8);
  g.lineTo(-22, -5);
  g.lineTo(-17, -4);
  g.closePath();
  g.fill();

  // shell dome
  g.fillStyle = '#79b06a';
  g.strokeStyle = '#5c8b4f';
  g.lineWidth = 2;
  g.beginPath();
  g.arc(-3, -6, 15, Math.PI, 0);
  g.closePath();
  g.fill();
  g.stroke();
  // shell pattern
  g.strokeStyle = 'rgba(70,110,60,0.5)';
  g.lineWidth = 1.5;
  g.beginPath();
  g.arc(-3, -6, 9, Math.PI, 0);
  g.moveTo(-3, -21);
  g.lineTo(-3, -6);
  g.moveTo(-10, -17);
  g.lineTo(-8, -6);
  g.moveTo(4, -17);
  g.lineTo(2, -6);
  g.stroke();
  // shell rim
  g.fillStyle = '#e6d9a3';
  rr(g, -19, -7, 32, 4, 2);
  g.fill();

  // head
  g.fillStyle = '#a8cf8e';
  g.strokeStyle = '#7fa568';
  g.lineWidth = 1.5;
  circle(g, 14, -11, 6.5);
  g.fill();
  g.stroke();

  drawFace(g, o, 15, -13, null, null, 15.5, -8.5);
  g.restore();
}
