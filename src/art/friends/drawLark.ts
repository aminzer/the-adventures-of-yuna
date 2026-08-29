import type { Ctx, FriendPose } from '../types';
import { circle, ellipse } from '../shapes';
import { drawFace } from './drawFace';

// A little golden lark. Sad = forgot its song, head hung low.
// Happy = singing with its beak to the sky.
export function drawLark(g: Ctx, o: FriendPose): void {
  g.save();
  g.translate(0, -o.hop);
  const t = o.t;

  // tail feathers, perked up
  g.strokeStyle = '#c98d28';
  g.lineWidth = 3;
  g.lineCap = 'round';
  for (let i = -1; i <= 1; i++) {
    g.beginPath();
    g.moveTo(-7, -12);
    g.lineTo(-14, -18 + i * 3);
    g.stroke();
  }

  // body
  g.fillStyle = '#f0c045';
  g.strokeStyle = '#c98d28';
  g.lineWidth = 1.5;
  ellipse(g, 0, -11, 9.5, 8.5);
  g.fill();
  g.stroke();
  g.fillStyle = '#fdf0d0';
  ellipse(g, 2, -8, 5, 5);
  g.fill();

  // it also sings while showing the demo melody, even before it is happy
  const sing = o.happy || o.singing;

  // wing — droopy when sad, lifted mid-song
  const wingRot = sing ? Math.sin(t * 10) * 0.35 - 0.5 : 0.5;
  g.save();
  g.translate(-3, -12);
  g.rotate(wingRot);
  g.fillStyle = '#e0a832';
  ellipse(g, -3, 2, 6.5, 3.6, 0.4);
  g.fill();
  g.restore();

  // head — hung low when sad, thrown back while singing
  const hx = sing ? 4 : 6;
  const hy = sing ? -22 : -18;
  g.fillStyle = '#f0c045';
  g.strokeStyle = '#c98d28';
  circle(g, hx, hy, 6.5);
  g.fill();
  g.stroke();
  // crest feathers
  g.strokeStyle = '#c98d28';
  g.lineWidth = 1.8;
  g.beginPath();
  g.moveTo(hx - 1, hy - 6);
  g.lineTo(hx - 3, hy - 11);
  g.moveTo(hx + 2, hy - 6);
  g.lineTo(hx + 2.5, hy - 11);
  g.stroke();

  // beak — open to the sky when singing
  g.fillStyle = '#e8933d';
  if (sing) {
    const open = 1.5 + Math.sin(t * 12) * 1;
    g.beginPath();
    g.moveTo(hx + 4, hy - 3);
    g.lineTo(hx + 10, hy - 6 - open);
    g.lineTo(hx + 5.5, hy - 1);
    g.closePath();
    g.fill();
    g.beginPath();
    g.moveTo(hx + 4, hy - 1);
    g.lineTo(hx + 10, hy + 1 + open * 0.4);
    g.lineTo(hx + 5, hy + 1.5);
    g.closePath();
    g.fill();
  } else {
    g.beginPath();
    g.moveTo(hx + 5, hy - 2);
    g.lineTo(hx + 11, hy);
    g.lineTo(hx + 5, hy + 2);
    g.closePath();
    g.fill();
  }

  // feet
  g.strokeStyle = '#c98d28';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(-2, -2);
  g.lineTo(-2, 0);
  g.moveTo(3, -2);
  g.lineTo(3, 0);
  g.stroke();

  drawFace(g, o, hx + 1, hy - 3.5, null, null, null, null);
  g.restore();
}
