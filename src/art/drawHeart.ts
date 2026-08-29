import type { Ctx } from './types';

export function drawHeart(g: Ctx, s: number, color = '#f0637f'): void {
  g.fillStyle = color;
  g.beginPath();
  g.moveTo(0, s * 0.35);
  g.bezierCurveTo(-s, -s * 0.45, -s * 0.5, -s * 1.1, 0, -s * 0.45);
  g.bezierCurveTo(s * 0.5, -s * 1.1, s, -s * 0.45, 0, s * 0.35);
  g.closePath();
  g.fill();
}
