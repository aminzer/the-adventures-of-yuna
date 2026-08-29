import { C } from '../../config';
import type { Ctx } from '../types';
import { greyMix } from '../color';

// Mix a stripe color toward a pale hazy sky tone (atmospheric distance).
function haze(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const [gr, gg, gb] = greyMix((n >> 16) & 255, (n >> 8) & 255, n & 255, 0);
  const r = Math.round(gr + (223 - gr) * amt);
  const g2 = Math.round(gg + (238 - gg) * amt);
  const b = Math.round(gb + (245 - gb) * amt);
  return `rgb(${r},${g2},${b})`;
}

// The persistent rainbow in the sky. restored = how many stripes are back.
// In levels it is part of the LANDSCAPE — a distant arc rising from behind
// the hills (drawn between sky and hills, occluded by everything in front);
// in the finale it becomes the huge full-sky rainbow framing the party.
// sink: how far the horizon has dropped (flying high on tall sky levels).
// soften: 1 = hazy and quiet (normal play), 0 = fully vivid (the bloom!).
// newFill: the freshly earned stripe sweeps in along the arc, left to right
// (0 → 1), with a little spark of light leading the way.
export function drawRainbow(
  g: Ctx, restored: number, W: number,
  big = false, sink = 0, soften = 0, newFill = 1,
): void {
  const colors = C.RAINBOW;
  const cx = W / 2;
  const cy = big ? 620 : 580 + sink;
  const r0 = big ? 460 : 380;
  const step = big ? 15 : 12;
  const a0 = big ? Math.PI * 1.02 : Math.PI;
  const a1 = big ? Math.PI * 1.98 : Math.PI * 2;
  const sweeping = !big && newFill < 1 && restored > 0;
  const sweepEnd = a0 + (a1 - a0) * (1 - Math.pow(1 - newFill, 2)); // ease-out
  g.save();
  // a real blur where the renderer supports it — softer still in browsers
  if (!big && soften > 0.05 && 'filter' in g) {
    g.filter = `blur(${(soften * 2.5).toFixed(1)}px)`;
  }
  for (let i = 0; i < colors.length; i++) {
    const r = r0 - i * step;
    const isSweeping = sweeping && i === restored - 1;
    g.beginPath();
    g.arc(cx, cy, r, a0, isSweeping ? sweepEnd : a1);
    if (i < restored) {
      g.globalAlpha = big ? 0.9 : 0.8 - 0.38 * soften;
      g.strokeStyle = big ? colors[i] : haze(colors[i], soften * 0.45);
      g.lineWidth = step;
    } else {
      g.globalAlpha = (big ? 0.14 : 0.15) * (1 - soften * 0.4);
      g.strokeStyle = '#ffffff';
      g.lineWidth = step - 5;
    }
    g.stroke();
  }
  // the spark of light painting the new stripe
  if (sweeping) {
    const r = r0 - (restored - 1) * step;
    const hx = cx + Math.cos(sweepEnd) * r;
    const hy = cy + Math.sin(sweepEnd) * r;
    const halo = g.createRadialGradient(hx, hy, 2, hx, hy, 26);
    halo.addColorStop(0, 'rgba(255,255,255,0.95)');
    halo.addColorStop(0.4, 'rgba(255,244,200,0.6)');
    halo.addColorStop(1, 'rgba(255,244,200,0)');
    g.globalAlpha = 1;
    g.fillStyle = halo;
    g.beginPath();
    g.arc(hx, hy, 26, 0, Math.PI * 2);
    g.fill();
  }
  g.restore();
}
