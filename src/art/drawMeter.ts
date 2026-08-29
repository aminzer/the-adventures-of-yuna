import type { Ctx } from './types';
import { rr } from './shapes';

// A continuous meter (wing sparkle, breath…). Drawn centered on the origin;
// pulses gently when nearly empty so a young player can SEE it's time to
// rest — never a number, never an alarm.
export function drawMeter(g: Ctx, frac: number, fillColor: string, t: number, W = 64, H = 10): void {
  const low = frac < 0.3;
  const pulse = low ? 0.65 + 0.35 * Math.sin(t * 8) : 1;

  g.save();
  // track
  g.fillStyle = 'rgba(255,255,255,0.78)';
  g.strokeStyle = 'rgba(120,110,150,0.5)';
  g.lineWidth = 1.5;
  rr(g, -W / 2, -H / 2, W, H, H / 2);
  g.fill();
  g.stroke();
  // fill — clipped to the rounded track so it stays smooth at any level
  rr(g, -W / 2, -H / 2, W, H, H / 2);
  g.clip();
  g.globalAlpha = pulse;
  g.fillStyle = fillColor;
  g.fillRect(-W / 2 + 1.5, -H / 2 + 1.5, Math.max(0, (W - 3) * frac), H - 3);
  // soft top shine
  g.globalAlpha = 0.35 * pulse;
  g.fillStyle = '#ffffff';
  g.fillRect(-W / 2 + 1.5, -H / 2 + 1.5, Math.max(0, (W - 3) * frac), 2.5);
  g.restore();
}
