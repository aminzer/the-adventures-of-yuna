import type { Ctx, FriendPose } from '../types';
import { circle, ellipse, rr } from '../shapes';

// A round owl dozing on a tree stump. Sad = asleep, happy = wide awake.
export function drawOwl(g: Ctx, o: FriendPose): void {
  g.save();
  const t = o.t;

  // the stump
  g.fillStyle = '#8a5f3e';
  rr(g, -13, -26, 26, 26, 3);
  g.fill();
  g.fillStyle = '#a9744b';
  ellipse(g, 0, -26, 13, 4);
  g.fill();
  g.strokeStyle = 'rgba(120,80,50,0.6)';
  g.lineWidth = 1;
  ellipse(g, 0, -26, 8, 2.4);
  g.stroke();

  g.translate(0, -o.hop);
  // gentle breathing while asleep
  const breath = o.happy ? 0 : Math.sin(t * 1.6) * 1.2;
  g.translate(0, breath);

  // body (egg shape)
  g.fillStyle = '#8d7ab5';
  g.strokeStyle = '#6f5f96';
  g.lineWidth = 1.5;
  ellipse(g, 0, -44, 13, 17);
  g.fill();
  g.stroke();

  // belly feathers
  g.fillStyle = '#d8cfe8';
  ellipse(g, 0, -39, 8, 10);
  g.fill();
  g.strokeStyle = 'rgba(111,95,150,0.4)';
  g.lineWidth = 1;
  for (let row = 0; row < 3; row++) {
    for (let k = -1; k <= 1; k++) {
      g.beginPath();
      g.arc(k * 4.5, -42 + row * 4.5, 2.2, 0.15 * Math.PI, 0.85 * Math.PI);
      g.stroke();
    }
  }

  // wings — folded asleep, lifted in joy when awake
  for (const s of [-1, 1]) {
    g.save();
    g.translate(s * 11, -48);
    g.rotate(o.happy ? s * (0.7 + Math.sin(t * 12) * 0.15) : s * 0.12);
    g.fillStyle = '#7a68a3';
    ellipse(g, 0, 6, 4.5, 10, s * 0.15);
    g.fill();
    g.restore();
  }

  // ear tufts
  for (const s of [-1, 1]) {
    g.fillStyle = '#8d7ab5';
    g.beginPath();
    g.moveTo(s * 4, -58);
    g.lineTo(s * 9, -66);
    g.lineTo(s * 9.5, -56);
    g.closePath();
    g.fill();
  }

  // face discs + eyes
  g.fillStyle = '#f5f0e0';
  circle(g, -5, -52, 5.5);
  g.fill();
  circle(g, 5, -52, 5.5);
  g.fill();
  if (o.happy) {
    g.fillStyle = '#3a3040';
    circle(g, -5, -52, 3);
    g.fill();
    circle(g, 5, -52, 3);
    g.fill();
    g.fillStyle = '#ffffff';
    circle(g, -4, -53, 1.1);
    g.fill();
    circle(g, 6, -53, 1.1);
    g.fill();
  } else {
    // fast asleep: ∩ closed lids
    g.strokeStyle = '#3a3040';
    g.lineWidth = 1.6;
    g.lineCap = 'round';
    g.beginPath();
    g.arc(-5, -51, 2.6, Math.PI * 1.15, Math.PI * 1.85);
    g.stroke();
    g.beginPath();
    g.arc(5, -51, 2.6, Math.PI * 1.15, Math.PI * 1.85);
    g.stroke();
  }

  // beak
  g.fillStyle = '#f2a13d';
  g.beginPath();
  g.moveTo(-2, -48);
  g.lineTo(2, -48);
  g.lineTo(0, -44.5);
  g.closePath();
  g.fill();

  // toes on the stump
  g.strokeStyle = '#f2a13d';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(-5, -27);
  g.lineTo(-5, -25);
  g.moveTo(0, -27);
  g.lineTo(0, -25);
  g.moveTo(5, -27);
  g.lineTo(5, -25);
  g.stroke();

  g.restore();
}
