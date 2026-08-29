import type { Ctx } from '../types';
import { circle } from '../shapes';
import { greyMix } from '../color';

// mute: 0 = full color, 1 = the storm's grey (the sun dims with the world)
export function drawSun(g: Ctx, t: number, mute = 0): void {
  g.save();
  const [gr, gg, gb] = greyMix(255, 236, 160, mute);
  const grad = g.createRadialGradient(0, 0, 10, 0, 0, 80);
  grad.addColorStop(0, `rgba(${gr},${gg},${gb},0.9)`);
  grad.addColorStop(1, `rgba(${gr},${gg},${gb},0)`);
  g.fillStyle = grad;
  circle(g, 0, 0, 80);
  g.fill();
  const [br, bg, bb] = greyMix(255, 224, 138, mute);
  g.fillStyle = `rgb(${br},${bg},${bb})`;
  circle(g, 0, 0, 34);
  g.fill();
  const [rr2, rg, rb] = greyMix(255, 215, 120, mute);
  g.strokeStyle = `rgba(${rr2},${rg},${rb},0.8)`;
  g.lineWidth = 3;
  g.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + t * 0.1;
    g.beginPath();
    g.moveTo(Math.cos(a) * 42, Math.sin(a) * 42);
    g.lineTo(Math.cos(a) * 52, Math.sin(a) * 52);
    g.stroke();
  }
  g.restore();
}
