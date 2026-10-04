import type { Ctx } from '../types';

// A little heap of autumn leaves, origin on the ground line. Tall enough to
// hide most of an acorn — but not its cap. `shake` (0..1) ruffles it.
export function drawLeafPile(g: Ctx, t: number, shake: number): void {
  g.save();
  const wob = Math.sin(t * 18) * shake * 0.12;
  g.rotate(wob);
  const leaves: Array<[number, number, number, string]> = [
    [-16, -8, -0.6, '#d9893a'], [12, -7, 0.5, '#e0a23c'], [-4, -14, 0.1, '#b9772f'],
    [-20, -16, -0.9, '#8fae3c'], [16, -16, 0.8, '#cf6f2e'], [4, -22, -0.3, '#e6b94a'],
    [-10, -22, 0.6, '#9bb94a'], [8, -12, -1.1, '#c75d2a'],
  ];
  for (const [x, y, rot, color] of leaves) {
    g.save();
    g.translate(x, y + Math.sin(t * 9 + x) * shake * 3);
    g.rotate(rot + wob);
    g.fillStyle = color;
    g.beginPath();
    g.ellipse(0, 0, 13, 7, 0, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = 'rgba(0,0,0,0.12)';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(-10, 0);
    g.lineTo(10, 0);
    g.stroke();
    g.restore();
  }
  g.restore();
}
