import type { Ctx } from '../types';

// A tuft of gently swaying seaweed (underwater decoration).
export function drawSeaweed(g: Ctx, t: number): void {
  const strands: Array<[number, number, string]> = [
    [-8, 46, '#3f9e7a'],
    [0, 64, '#54b58a'],
    [8, 38, '#3f9e7a'],
  ];
  g.lineCap = 'round';
  for (const [x, h, color] of strands) {
    const sway = Math.sin(t * 1.1 + x) * 7;
    g.strokeStyle = color;
    g.lineWidth = 5;
    g.beginPath();
    g.moveTo(x, 0);
    g.quadraticCurveTo(x - sway * 0.4, -h * 0.5, x + sway, -h);
    g.stroke();
  }
}
