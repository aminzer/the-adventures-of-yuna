import type { Ctx } from './types';

// A drifting "Zzz" sleep mark (one Z; particles stack a few of them).
export function drawZzz(g: Ctx, s: number): void {
  g.lineWidth = Math.max(1.4, s * 0.28);
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.beginPath();
  g.moveTo(-s / 2, -s / 2);
  g.lineTo(s / 2, -s / 2);
  g.lineTo(-s / 2, s / 2);
  g.lineTo(s / 2, s / 2);
  g.stroke();
}
