import type { Ctx } from '../types';

// Rolling hills band, filled to the bottom of the view.
export function drawHills(g: Ctx, offsetX: number, baseY: number, amp: number, color: string, W: number, H: number): void {
  g.fillStyle = color;
  g.beginPath();
  g.moveTo(0, H);
  for (let px = 0; px <= W; px += 16) {
    const y = baseY + Math.sin((px + offsetX) * 0.004) * amp + Math.sin((px + offsetX) * 0.0113) * amp * 0.45;
    g.lineTo(px, y);
  }
  g.lineTo(W, H);
  g.closePath();
  g.fill();
}
