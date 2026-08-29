import type { BubbleIcon } from '../levels';
import type { Ctx } from './types';
import { circle } from './shapes';
import { drawHeart } from './drawHeart';
import { drawItem } from './items/drawItem';

// Cloud bubble with the wished-for item inside; heartAmt crossfades icon -> heart.
export function drawThoughtBubble(g: Ctx, iconKind: BubbleIcon, pulse: number, heartAmt: number): void {
  g.save();
  g.scale(pulse, pulse);
  g.fillStyle = 'rgba(255,255,255,0.95)';
  g.strokeStyle = 'rgba(160,160,190,0.55)';
  g.lineWidth = 1.5;
  // trailing puffs (toward the friend below)
  circle(g, -12, 26, 3);
  g.fill();
  circle(g, -8, 19, 4.5);
  g.fill();
  // main blob
  g.beginPath();
  g.arc(-10, 2, 12, Math.PI * 0.5, Math.PI * 1.5);
  g.arc(-5, -9, 10, Math.PI * 0.9, Math.PI * 1.9);
  g.arc(6, -10, 10, Math.PI * 1.1, Math.PI * 0.05);
  g.arc(11, 2, 11, Math.PI * 1.5, Math.PI * 0.5);
  g.closePath();
  g.fill();
  g.stroke();
  // icon (item crossfading into a heart)
  if (heartAmt < 1) {
    g.globalAlpha = 1 - heartAmt;
    drawItem(g, iconKind, 0.85);
  }
  if (heartAmt > 0) {
    g.globalAlpha = heartAmt;
    drawHeart(g, 11, '#f0637f');
  }
  g.globalAlpha = 1;
  g.restore();
}
