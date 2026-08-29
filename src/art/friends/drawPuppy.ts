import type { Ctx, FriendPose } from '../types';
import { circle, ellipse } from '../shapes';

// A bouncy golden puppy who wants to play tag. Never sad — just playful
// until it's caught (happy = tagged, blissfully pleased with the game).
export function drawPuppy(g: Ctx, o: FriendPose): void {
  g.save();
  g.scale(o.facing ?? 1, 1);
  g.translate(0, -o.hop);
  const t = o.t;

  // wagging tail (always wagging — it's a puppy)
  const wag = Math.sin(t * (o.happy ? 14 : 9)) * 0.45;
  g.strokeStyle = '#c9954f';
  g.lineWidth = 5;
  g.lineCap = 'round';
  g.save();
  g.translate(-12, -16);
  g.rotate(-0.7 + wag);
  g.beginPath();
  g.moveTo(0, 0);
  g.lineTo(-9, -7);
  g.stroke();
  g.restore();

  // body — front end low, tail end up: the classic "play with me!" bow
  g.fillStyle = '#e3b271';
  g.strokeStyle = '#b8874a';
  g.lineWidth = 1.5;
  ellipse(g, -3, -13, 12, 9.5, o.happy ? 0 : 0.12);
  g.fill();
  g.stroke();
  g.fillStyle = '#f7e3c3';
  ellipse(g, 1, -9.5, 6, 5);
  g.fill();

  // paws
  g.fillStyle = '#e3b271';
  ellipse(g, -9, -2.5, 4, 2.5);
  g.fill();
  ellipse(g, 6, -2.5, 4, 2.5);
  g.fill();

  // head
  g.fillStyle = '#e3b271';
  g.strokeStyle = '#b8874a';
  circle(g, 8, -25, 9.5);
  g.fill();
  g.stroke();

  // floppy ears
  for (const s of [-1, 1]) {
    g.save();
    g.translate(8 + s * 6.5, -32);
    g.rotate(s * (1 + Math.sin(t * 8 + s) * 0.12));
    g.fillStyle = '#c9954f';
    ellipse(g, 0, 5, 3.4, 7);
    g.fill();
    g.restore();
  }

  // muzzle + nose
  g.fillStyle = '#f7e3c3';
  ellipse(g, 13, -21.5, 5, 4);
  g.fill();
  g.fillStyle = '#4a3a35';
  circle(g, 16, -23, 1.8);
  g.fill();

  // happy tongue
  g.fillStyle = '#f08a9b';
  ellipse(g, 14.5, -17.5, 2, 3.4, 0.2);
  g.fill();

  // eyes — round and eager; blissful ∪ when caught
  g.strokeStyle = '#4a3a35';
  g.lineWidth = 1.6;
  g.lineCap = 'round';
  if (o.happy) {
    g.beginPath();
    g.arc(5, -26, 2.2, Math.PI * 1.15, Math.PI * 1.85);
    g.stroke();
    g.beginPath();
    g.arc(11.5, -26.5, 2.2, Math.PI * 1.15, Math.PI * 1.85);
    g.stroke();
  } else {
    g.fillStyle = '#4a3a35';
    circle(g, 5, -27, 2);
    g.fill();
    circle(g, 11.5, -27.5, 2);
    g.fill();
    g.fillStyle = '#ffffff';
    circle(g, 5.7, -27.7, 0.8);
    g.fill();
    circle(g, 12.2, -28.2, 0.8);
    g.fill();
  }

  g.restore();
}
