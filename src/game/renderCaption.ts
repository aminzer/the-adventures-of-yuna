import { C } from '../config';
import type { GameCtx } from './context';

const FONT = (px: number): string => `600 ${px}px "Segoe UI", "Comic Sans MS", sans-serif`;
const MAX_W = 860;

// Break a line into at most `maxLines` lines that each fit MAX_W.
function wrap(ctx: CanvasRenderingContext2D, text: string, maxLines: number): string[] | null {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(next).width <= MAX_W) cur = next;
    else {
      if (cur) lines.push(cur);
      cur = w;
      if (lines.length >= maxLines) return null;
    }
  }
  if (cur) lines.push(cur);
  return lines.length <= maxLines ? lines : null;
}

// The subtitle bar: story lines and event messages, in warm Russian,
// on a soft rounded panel at the bottom of the screen. Long lines wrap onto
// a second line rather than shrinking into something a child can't read.
export function renderCaption(gc: GameCtx): void {
  const cap = gc.caption;
  if (!cap) return;
  const ctx = gc.ctx;
  const fadeIn = Math.min(1, cap.t / 0.25);
  const fadeOut = Math.min(1, (cap.dur - cap.t) / 0.4);
  const alpha = Math.max(0, Math.min(fadeIn, fadeOut));

  ctx.save();
  ctx.globalAlpha = alpha;
  let fontSize = 26;
  ctx.font = FONT(fontSize);
  let lines: string[] = [cap.text];
  if (ctx.measureText(cap.text).width > MAX_W) {
    fontSize = 23;
    ctx.font = FONT(fontSize);
    lines = wrap(ctx, cap.text, 2) ?? wrap(ctx, cap.text, 3) ?? [cap.text];
    if (lines.length === 1) {
      // a single unbreakable monster of a line — shrink as a last resort
      fontSize = Math.max(17, Math.floor((fontSize * MAX_W) / ctx.measureText(cap.text).width));
      ctx.font = FONT(fontSize);
    }
  }
  const w = Math.max(...lines.map((l) => ctx.measureText(l).width));
  const lineH = fontSize + 8;
  const padX = 26;
  const h = 46 + (lines.length - 1) * lineH;
  const x = (C.VIEW_W - w) / 2 - padX;
  const y = C.VIEW_H - h - 14;
  ctx.fillStyle = 'rgba(255,255,255,0.88)';
  ctx.beginPath();
  ctx.moveTo(x + 16, y);
  ctx.arcTo(x + w + padX * 2, y, x + w + padX * 2, y + h, 16);
  ctx.arcTo(x + w + padX * 2, y + h, x, y + h, 16);
  ctx.arcTo(x, y + h, x, y, 16);
  ctx.arcTo(x, y, x + w + padX * 2, y, 16);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,110,150,0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#4a3d50';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const firstY = y + h / 2 + 1 - ((lines.length - 1) * lineH) / 2;
  lines.forEach((l, i) => ctx.fillText(l, C.VIEW_W / 2, firstY + i * lineH));
  ctx.restore();
}
