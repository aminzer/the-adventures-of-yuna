import type { Ctx } from '../types';
import { circle } from '../shapes';

export function drawGroundTile(g: Ctx, x: number, y: number, T: number, grassTop: boolean, seed: number): void {
  g.fillStyle = '#a9744b';
  g.fillRect(x, y, T, T);
  // deterministic pebbles
  const n = (seed * 2654435761) % 97;
  if (n % 3 === 0) {
    g.fillStyle = 'rgba(120,80,50,0.45)';
    circle(g, x + 10 + (n % 25), y + 18 + (n % 20), 2.5);
    g.fill();
  }
  if (grassTop) {
    g.fillStyle = '#63c76a';
    g.fillRect(x, y, T, 13);
    g.beginPath();
    for (let i = 0; i < 4; i++) g.arc(x + 6 + i * 12, y + 13, 6, 0, Math.PI);
    g.fill();
    g.fillStyle = 'rgba(255,255,255,0.25)';
    g.fillRect(x, y, T, 3);
  }
}
