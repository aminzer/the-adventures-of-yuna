import { C } from '../config';
import { CHAPTERS } from '../levels';
import * as art from '../art';
import { captionText } from '../textOverrides';
import { MENU, menuCardX, menuRowWidth } from './chapterMenuLayout';
import type { GameCtx } from './context';

const { CARD_W, CARD_H } = MENU;

// A little picture for each chapter — no reading needed to tell them apart.
function drawChapterPicture(gc: GameCtx, kind: string): void {
  const ctx = gc.ctx;
  if (kind === 'intro') {
    ctx.save();
    ctx.translate(14, 58);
    art.drawFriend(ctx, 'mama', { t: gc.globalT, happy: true, hop: 0, facing: -1 });
    ctx.restore();
    ctx.save();
    ctx.translate(-62, 62);
    ctx.scale(0.8, 0.8);
    art.drawPlayer(ctx, { t: gc.globalT, walk: 0, facing: 1, onGround: true, vy: 0, blink: 0, wings: false, rising: false });
    ctx.restore();
  } else if (kind === 'rainbow') {
    for (let i = 0; i < C.RAINBOW.length; i++) {
      ctx.strokeStyle = C.RAINBOW[i];
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.arc(0, 62, 86 - i * 9, Math.PI * 1.04, Math.PI * 1.96);
      ctx.stroke();
    }
    ctx.save();
    ctx.translate(0, 72);
    ctx.scale(0.9, 0.9);
    art.drawFriend(ctx, 'bunny', { t: gc.globalT, happy: true, hop: 0, facing: 1 });
    ctx.restore();
  } else {
    ctx.save();
    ctx.translate(-34, 66);
    art.drawFriend(ctx, 'puppy', { t: gc.globalT, happy: true, hop: 0, facing: 1 });
    ctx.restore();
    ctx.save();
    ctx.translate(40, 20);
    ctx.scale(0.8, 0.8);
    art.drawFriend(ctx, 'babystar', { t: gc.globalT, happy: true, hop: 0, facing: -1 });
    ctx.restore();
  }
}

// The chapter menu: a quiet night-blue page with one card per chapter. The
// focused card is big and bright; the others wait dimly at its sides.
export function renderChapterMenu(gc: GameCtx): void {
  const ctx = gc.ctx;
  const sky = ctx.createLinearGradient(0, 0, 0, C.VIEW_H);
  sky.addColorStop(0, '#1b2550');
  sky.addColorStop(1, '#3d4f8f');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, C.VIEW_W, C.VIEW_H);
  // a few quiet stars
  for (let i = 0; i < 26; i++) {
    const x = ((i * 193) % 940) + 10;
    const y = ((i * 71) % 170) + 12;
    ctx.globalAlpha = 0.35 + 0.35 * Math.sin(gc.globalT * 1.3 + i);
    ctx.fillStyle = '#fff3c4';
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.globalAlpha = 1;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(246, 236, 217, 0.8)';
  ctx.font = '600 24px "Segoe UI", "Comic Sans MS", sans-serif';
  ctx.fillText('Приключения Юны', C.VIEW_W / 2, 48);

  const total = CHAPTERS.length;
  const rowW = menuRowWidth();
  const lift = gc.menuChosen ? Math.min(1, gc.menuWait / 0.5) : 0;
  CHAPTERS.forEach((ch, i) => {
    const focused = i === gc.menuIndex;
    const cx = menuCardX(i);
    const bounce = focused ? Math.sin(gc.menuT * 3) * 4 : 0;
    const cy = MENU.CY + bounce - (focused ? lift * 26 : 0);
    const scale = focused ? 1.08 + lift * 0.06 : 0.92;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.globalAlpha = focused ? 1 : 0.5 - lift * 0.3;
    // card
    ctx.fillStyle = focused ? '#fffaf0' : '#e9e2d6';
    ctx.strokeStyle = focused ? '#ffd27a' : 'rgba(255,255,255,0.3)';
    ctx.lineWidth = focused ? 5 : 2;
    ctx.beginPath();
    ctx.roundRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 22);
    ctx.fill();
    ctx.stroke();
    // picture window
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(-CARD_W / 2 + 14, -CARD_H / 2 + 14, CARD_W - 28, 150, 16);
    ctx.clip();
    const g = ctx.createLinearGradient(0, -CARD_H / 2, 0, 40);
    g.addColorStop(0, ch.finale === 'night' ? '#2c3a74' : '#9fdcf3');
    g.addColorStop(1, ch.finale === 'night' ? '#4d5f9e' : '#dff6e6');
    ctx.fillStyle = g;
    ctx.fillRect(-CARD_W / 2, -CARD_H / 2, CARD_W, 170);
    ctx.fillStyle = ch.finale === 'night' ? '#2e5548' : '#69b96b';
    ctx.beginPath();
    ctx.ellipse(0, 86, 150, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.translate(0, -CARD_H / 2 + 20);
    drawChapterPicture(gc, ch.name);
    ctx.restore();
    // title, wrapped at the sentence break («Глава первая. Потерянная радуга»)
    const title = captionText(ch.title).shown;
    const parts = title.split('. ');
    ctx.fillStyle = '#33302c';
    ctx.font = '600 17px "Segoe UI", "Comic Sans MS", sans-serif';
    parts.forEach((line, k) => ctx.fillText(line.replace(/\.$/, ''), 0, CARD_H / 2 - 56 + k * 22 - (parts.length - 1) * 8));
    // finished chapters wear a little heart
    if (gc.chapterDone[i]) {
      ctx.save();
      ctx.translate(CARD_W / 2 - 24, -CARD_H / 2 + 24);
      art.drawHeart(ctx, 11, '#f0637f');
      ctx.restore();
    }
    ctx.restore();
  });

  // wordless controls: arrows at the sides, a bouncing space-bar pill below
  const hintA = 0.55 + 0.25 * Math.sin(gc.globalT * 3);
  ctx.fillStyle = `rgba(246, 236, 217, ${hintA})`;
  ctx.font = '600 34px "Segoe UI", sans-serif';
  if (gc.menuIndex > 0) ctx.fillText('←', (C.VIEW_W - rowW) / 2 - MENU.ARROW_PAD, MENU.CY);
  if (gc.menuIndex < total - 1) ctx.fillText('→', (C.VIEW_W + rowW) / 2 + MENU.ARROW_PAD, MENU.CY);
  ctx.fillStyle = 'rgba(246, 236, 217, 0.92)';
  ctx.beginPath();
  ctx.roundRect(MENU.PILL.x, MENU.PILL.y + Math.sin(gc.globalT * 3) * 3, MENU.PILL.w, MENU.PILL.h, 20);
  ctx.fill();
  ctx.fillStyle = '#33302c';
  ctx.font = '600 17px "Segoe UI", "Comic Sans MS", sans-serif';
  ctx.fillText('Пробел — играть', C.VIEW_W / 2, MENU.PILL.y + MENU.PILL.h / 2 + Math.sin(gc.globalT * 3) * 3);
}
