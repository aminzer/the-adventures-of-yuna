import { C } from '../config';
import type { GameCtx } from './context';

// The subtitle bar: story lines and event messages, in warm Russian,
// on a soft rounded panel at the bottom of the screen.
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
  ctx.font = `600 ${fontSize}px "Segoe UI", "Comic Sans MS", sans-serif`;
  let w = ctx.measureText(cap.text).width;
  if (w > 860) {
    fontSize = Math.max(17, Math.floor((fontSize * 860) / w));
    ctx.font = `600 ${fontSize}px "Segoe UI", "Comic Sans MS", sans-serif`;
    w = ctx.measureText(cap.text).width;
  }

  const padX = 26;
  const h = 46;
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
  ctx.fillText(cap.text, C.VIEW_W / 2, y + h / 2 + 1);
  ctx.restore();
}
