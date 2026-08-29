import { C } from '../config';
import { LEVELS } from '../levels';
import { audio } from '../audio';
import * as art from '../art';
import { BELL_COLORS, SPEAKER } from './constants';
import type { GameCtx } from './context';

export function renderUI(gc: GameCtx): void {
  const ctx = gc.ctx;
  const luna = gc.luna;
  const level = LEVELS[gc.levelIndex];

  // collected stars — a gentle row, no numbers
  // (hidden in the finale: there they shine in the night sky instead)
  if (gc.state !== 'FINALE') {
    for (let i = 0; i < gc.totalStars; i++) {
      ctx.save();
      ctx.translate(28 + (i % 12) * 26, 30 + Math.floor(i / 12) * 26);
      art.drawStar(ctx, 8, 0);
      ctx.restore();
    }
  }
  // speaker
  ctx.save();
  ctx.translate(SPEAKER.x, SPEAKER.y);
  art.drawSpeaker(ctx, audio.isMuted());
  ctx.restore();

  // stamina meters — fixed at the bottom of the view, just above the
  // subtitle line, big enough to watch from the corner of an eye
  const meterY = C.VIEW_H - 78;

  // breath (underwater levels): a blue bar with a little bubble in front
  if (level.water !== undefined && luna.air < 1) {
    ctx.save();
    ctx.translate(140, meterY);
    art.drawMeter(ctx, luna.air, '#5ec8f0', gc.globalT, 200, 16);
    ctx.strokeStyle = 'rgba(240,250,255,0.95)';
    ctx.lineWidth = 2;
    art.circle(ctx, -118, 0, 6.5);
    ctx.stroke();
    ctx.restore();
  }

  // wing sparkle (flying levels): a golden bar with a star in front
  if (luna.hasWings && !luna.rescue) {
    ctx.save();
    ctx.translate(140, meterY);
    art.drawMeter(ctx, luna.flyCharge, '#ffcf3d', gc.globalT, 200, 16);
    ctx.translate(-118, 0);
    art.drawStar(ctx, 9, luna.flyCharge >= 1 ? 0.6 : 0);
    ctx.restore();
  }

  // the melody card (song levels): the notes to play, always visible at the
  // top of the screen — done ones bright, the NEXT one bouncing (its color
  // says which bell), the rest waiting dimly
  if (level.deed === 'song' && level.melody && gc.friends[0] && !gc.friends[0].satisfied) {
    const melody = level.melody;
    const n = melody.length;
    const gap = 40;
    const w = n * gap + 36;
    const cx = C.VIEW_W / 2;
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.strokeStyle = 'rgba(120,110,150,0.4)';
    ctx.lineWidth = 1.5;
    art.rr(ctx, cx - w / 2, 14, w, 52, 16);
    ctx.fill();
    ctx.stroke();
    for (let k = 0; k < n; k++) {
      const x = cx - ((n - 1) * gap) / 2 + k * gap;
      const isNext = k === gc.songPos;
      const bounce = isNext ? Math.abs(Math.sin(gc.globalT * 4)) * 5 : 0;
      ctx.save();
      ctx.translate(x, 42 - bounce);
      if (isNext) {
        ctx.fillStyle = 'rgba(255,240,160,0.65)';
        art.circle(ctx, 0, 0, 17);
        ctx.fill();
      }
      ctx.globalAlpha = k <= gc.songPos ? 1 : 0.3;
      ctx.scale(1.1, 1.1);
      art.drawNote(ctx, BELL_COLORS[melody[k]]);
      ctx.restore();
      if (k < gc.songPos) {
        ctx.save();
        ctx.translate(x + 10, 30);
        ctx.fillStyle = '#fff2b0';
        art.drawSparkle(ctx, 0, 0, 4 + Math.sin(gc.globalT * 6 + k) * 1.5);
        ctx.restore();
      }
    }
    ctx.restore();
  }
}
