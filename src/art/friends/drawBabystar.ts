import type { Ctx, FriendPose } from '../types';
import { circle } from '../shapes';
import { drawFace } from './drawFace';

// A little fallen star, sitting dim and sad until its glow comes home.
export function drawBabystar(g: Ctx, o: FriendPose): void {
  g.save();
  g.translate(0, -o.hop - 16);
  const t = o.t;
  const breathe = Math.sin(t * (o.happy ? 5 : 1.8)) * (o.happy ? 2 : 1);
  g.translate(0, breathe);
  g.rotate(o.happy ? Math.sin(t * 4) * 0.08 : -0.12);

  if (o.happy) {
    // its glow is back!
    const halo = g.createRadialGradient(0, 0, 4, 0, 0, 34);
    halo.addColorStop(0, 'rgba(255,236,150,0.75)');
    halo.addColorStop(1, 'rgba(255,236,150,0)');
    g.fillStyle = halo;
    circle(g, 0, 0, 34);
    g.fill();
  }

  // plump five-point star body
  g.fillStyle = o.happy ? '#ffd94d' : '#e8d9a8';
  g.strokeStyle = o.happy ? '#f0b429' : '#c4b283';
  g.lineWidth = 1.6;
  g.lineJoin = 'round';
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 17 : 8.5;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.closePath();
  g.fill();
  g.stroke();

  // little face in the middle
  drawFace(g, o, -3.5, -1, 3.5, -1, 0, 4.5);
  // blush
  g.fillStyle = 'rgba(255,150,140,0.4)';
  circle(g, -6, 2.5, 1.8);
  g.fill();
  circle(g, 6, 2.5, 1.8);
  g.fill();

  g.restore();
}
