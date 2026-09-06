import { C } from '../config';
import * as art from '../art';
import type { GameCtx } from './context';
import { renderParticles } from './renderParticles';
import { renderUI } from './renderUI';

// Chapter 0's final scene: the sunny home meadow — mama proud, Yuna ready
// for the road. A calm, bright counterpart of the night finale.
export function renderFinaleMeadow(gc: GameCtx): void {
  const ctx = gc.ctx;

  const sky = ctx.createLinearGradient(0, 0, 0, C.VIEW_H);
  sky.addColorStop(0, '#8ed8f2');
  sky.addColorStop(1, '#eafbf1');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, C.VIEW_W, C.VIEW_H);

  ctx.save();
  ctx.translate(830, 100);
  art.drawSun(ctx, gc.globalT);
  ctx.restore();

  art.drawHills(ctx, 0, 330, 40, '#a5d9a0', C.VIEW_W, C.VIEW_H);
  art.drawHills(ctx, 400, 400, 34, '#8ecb8d', C.VIEW_W, C.VIEW_H);

  // the big soft home hill
  ctx.fillStyle = '#69b96b';
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

  // mama and Yuna together on the hilltop
  const bob = Math.abs(Math.sin(gc.finaleT * 3)) * 10;
  ctx.save();
  ctx.translate(560, 420);
  art.drawFriend(ctx, 'mama', { t: gc.globalT, happy: true, hop: bob, facing: -1 });
  ctx.restore();
  ctx.save();
  ctx.translate(430, 428);
  art.drawPlayer(ctx, {
    t: gc.globalT, walk: 0.4, facing: 1, onGround: true, vy: 0, blink: gc.player.blink,
    wings: false, rising: false,
  });
  ctx.restore();

  renderParticles(gc);
  renderUI(gc);
}
