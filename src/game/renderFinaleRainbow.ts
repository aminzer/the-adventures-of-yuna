import { C } from '../config';
import type { FriendKind } from '../levels';
import * as art from '../art';
import type { GameCtx } from './context';
import { renderParticles } from './renderParticles';
import { renderUI } from './renderUI';

// Chapter 1's final scene: the day party under the whole restored rainbow,
// with every friend of the rainbow levels.
export function renderFinaleRainbow(gc: GameCtx): void {
  const ctx = gc.ctx;

  const sky = ctx.createLinearGradient(0, 0, 0, C.VIEW_H);
  sky.addColorStop(0, '#79ccef');
  sky.addColorStop(1, '#e6f9ee');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, C.VIEW_W, C.VIEW_H);

  ctx.save();
  ctx.translate(830, 100);
  art.drawSun(ctx, gc.globalT);
  ctx.restore();

  art.drawHills(ctx, 0, 330, 40, '#9fd6a8', C.VIEW_W, C.VIEW_H);
  art.drawHills(ctx, 400, 400, 34, '#8bc796', C.VIEW_W, C.VIEW_H);

  // all seven stripes, big and vivid — the reason for the party
  art.drawRainbow(ctx, C.RAINBOW.length, C.VIEW_W, true);

  ctx.fillStyle = '#63b568';
  ctx.beginPath();
  ctx.moveTo(0, C.VIEW_H);
  ctx.quadraticCurveTo(C.VIEW_W / 2, 330, C.VIEW_W, C.VIEW_H);
  ctx.closePath();
  ctx.fill();

  for (let i = 0; i < 6; i++) {
    ctx.save();
    ctx.translate(180 + i * 120, 480 - Math.sin((i / 5) * Math.PI) * 45);
    art.drawFlowerPatch(ctx, gc.globalT + i);
    ctx.restore();
  }

  const bob = (ph: number): number => Math.abs(Math.sin(gc.finaleT * 3 + ph)) * 14;
  const cast: Array<{ kind: FriendKind; x: number; ph: number }> = [
    { kind: 'bunny', x: 240, ph: 0 },
    { kind: 'bird', x: 320, ph: 1.1 },
    { kind: 'turtle', x: 390, ph: 2.2 },
    { kind: 'flowerbed', x: 555, ph: 0.6 },
    { kind: 'squirrel', x: 630, ph: 1.7 },
    { kind: 'owl', x: 710, ph: 2.8 },
    { kind: 'fox', x: 790, ph: 3.9 },
  ];
  for (const f of cast) {
    ctx.save();
    ctx.translate(f.x, 452 - Math.sin(((f.x - 100) / 760) * Math.PI) * 40);
    art.drawFriend(ctx, f.kind, { t: gc.globalT + f.ph, happy: true, hop: bob(f.ph), facing: f.x > 480 ? -1 : 1 });
    ctx.restore();
  }

  ctx.save();
  ctx.translate(470, 428);
  art.drawPlayer(ctx, {
    t: gc.globalT, walk: 0.4, facing: 1, onGround: true, vy: 0, blink: gc.player.blink,
    wings: false, rising: false,
  });
  ctx.restore();

  renderParticles(gc);
  renderUI(gc);
}
