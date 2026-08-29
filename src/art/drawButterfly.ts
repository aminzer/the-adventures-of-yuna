import type { Ctx } from './types';
import { ellipse } from './shapes';

export function drawButterfly(g: Ctx, t: number, alpha: number): void {
  g.save();
  g.globalAlpha = alpha;
  const flap = Math.sin(t * 16) * 0.7;
  g.fillStyle = '#ffb0d0';
  g.save();
  g.rotate(-0.2);
  g.scale(Math.max(0.2, Math.cos(flap)), 1);
  ellipse(g, -6, -3, 7, 5, -0.4);
  g.fill();
  ellipse(g, -5, 4, 5, 4, 0.3);
  g.fill();
  g.restore();
  g.save();
  g.rotate(0.2);
  g.scale(Math.max(0.2, Math.cos(flap + 0.4)), 1);
  g.fillStyle = '#ffc4dc';
  ellipse(g, 6, -3, 7, 5, 0.4);
  g.fill();
  ellipse(g, 5, 4, 5, 4, -0.3);
  g.fill();
  g.restore();
  g.fillStyle = '#7a5a6a';
  ellipse(g, 0, 0, 1.6, 5);
  g.fill();
  g.restore();
}
