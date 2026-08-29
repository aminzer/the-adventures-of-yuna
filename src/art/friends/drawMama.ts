import type { Ctx, FriendPose } from '../types';
import { circle } from '../shapes';
import { drawLuna } from '../drawLuna';

// Mama unicorn — Юна, just a little bigger and calmer, with a flower
// tucked into her mane. She waits at the end of the practice meadow.
export function drawMama(g: Ctx, o: FriendPose): void {
  g.save();
  g.translate(0, -o.hop);
  g.scale(1.18, 1.18);
  drawLuna(g, {
    t: o.t * 0.6, // slower, calmer movements
    walk: 0,
    facing: o.facing ?? -1,
    onGround: true,
    vy: 0,
    blink: Math.sin(o.t * 0.7) > 0.96 ? 1 : 0,
  });
  // the flower in her mane (mirrors with her facing)
  const fx = (o.facing ?? -1) * 10;
  g.fillStyle = '#ff8ab0';
  for (let p = 0; p < 5; p++) {
    g.save();
    g.translate(fx, -58);
    g.rotate((p / 5) * Math.PI * 2);
    g.beginPath();
    g.ellipse(0, -3, 1.8, 3, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }
  g.fillStyle = '#ffd23e';
  circle(g, fx, -58, 2);
  g.fill();
  g.restore();
}
