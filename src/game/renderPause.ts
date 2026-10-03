import { C } from '../config';
import { TEXTS } from '../texts';
import { captionText } from '../textOverrides';
import type { GameCtx } from './context';
import { PAUSE, PAUSE_ITEMS, pauseButtonY } from './pauseMenuLayout';

// The pause menu over the frozen game: a soft curtain and two big buttons.
export function renderPause(gc: GameCtx): void {
  const ctx = gc.ctx;
  const a = Math.min(1, gc.pauseT / 0.25);
  ctx.save();
  ctx.fillStyle = `rgba(20, 18, 32, ${0.55 * a})`;
  ctx.fillRect(0, 0, C.VIEW_W, C.VIEW_H);
  ctx.globalAlpha = a;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const px = C.VIEW_W / 2;
  const py = PAUSE.FIRST_Y + (PAUSE.BTN.h + PAUSE.BTN.gap) / 2;
  ctx.fillStyle = '#fffaf0';
  ctx.beginPath();
  ctx.roundRect(px - PAUSE.PANEL.w / 2, py - PAUSE.PANEL.h / 2, PAUSE.PANEL.w, PAUSE.PANEL.h, 24);
  ctx.fill();
  ctx.fillStyle = '#8a827a';
  ctx.font = '600 16px "Segoe UI", "Comic Sans MS", sans-serif';
  ctx.fillText('Пауза', px, py - PAUSE.PANEL.h / 2 + 28);

  const labels = [`▶  ${captionText(TEXTS.pauseContinue).shown}`, `☰  ${captionText(TEXTS.pauseToMenu).shown}`];
  for (let i = 0; i < PAUSE_ITEMS; i++) {
    const focused = i === gc.pauseIndex;
    const y = pauseButtonY(i);
    ctx.fillStyle = focused ? '#ffd27a' : '#f1ebe0';
    ctx.strokeStyle = focused ? '#e9a93c' : 'rgba(0,0,0,0.08)';
    ctx.lineWidth = focused ? 3 : 1.5;
    ctx.beginPath();
    ctx.roundRect(px - PAUSE.BTN.w / 2, y - PAUSE.BTN.h / 2, PAUSE.BTN.w, PAUSE.BTN.h, 16);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#33302c';
    ctx.font = `600 ${focused ? 22 : 20}px "Segoe UI", "Comic Sans MS", sans-serif`;
    ctx.fillText(labels[i], px, y + 1);
  }
  ctx.restore();
}
