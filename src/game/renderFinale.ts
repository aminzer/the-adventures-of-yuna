import { C } from '../config';
import type { FriendKind } from '../levels';
import * as art from '../art';
import type { GameCtx } from './context';
import { finaleStarFlights } from './finaleStarFlight';
import { renderParticles } from './renderParticles';
import { renderUI } from './renderUI';

export function renderFinale(gc: GameCtx): void {
  const ctx = gc.ctx;

  // the party goes on into the night — a calm, moonlit sky
  const sky = ctx.createLinearGradient(0, 0, 0, C.VIEW_H);
  sky.addColorStop(0, '#1c2854');
  sky.addColorStop(1, '#41599c');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, C.VIEW_W, C.VIEW_H);

  ctx.save();
  ctx.translate(820, 92);
  art.drawMoon(ctx, gc.globalT);
  ctx.restore();

  // dark, sleepy hills
  art.drawHills(ctx, 0, 330, 40, '#2f4a6e', C.VIEW_W, C.VIEW_H);
  art.drawHills(ctx, 400, 400, 34, '#263e5e', C.VIEW_W, C.VIEW_H);

  art.drawRainbow(ctx, gc.colorsRestored, C.VIEW_W, true);

  // every star Yuna collected on her journey now shines in this sky —
  // exactly as many as she gathered. They fly up from their old HUD row,
  // one by one, to their evenly spread places in the night (drawn in front
  // of the rainbow so every single one stays countable)
  finaleStarFlights(gc.totalStars, gc.finaleT).forEach((s, i) => {
    const arrived = s.p >= 1;
    const tw = arrived ? 0.7 + 0.3 * Math.sin(gc.globalT * (1.5 + (i % 5) * 0.4) + i) : 1;
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.globalAlpha = tw;
    ctx.scale(0.9, 0.9);
    art.drawStar(ctx, s.size, arrived ? 0.5 * tw : 0.85);
    ctx.restore();
  });

  // big soft hill, moonlit
  ctx.fillStyle = '#2e5548';
  ctx.beginPath();
  ctx.moveTo(0, C.VIEW_H);
  ctx.quadraticCurveTo(C.VIEW_W / 2, 330, C.VIEW_W, C.VIEW_H);
  ctx.closePath();
  ctx.fill();

  // flowers on the hill
  for (let i = 0; i < 6; i++) {
    ctx.save();
    ctx.translate(180 + i * 120, 480 - Math.sin((i / 5) * Math.PI) * 45);
    art.drawFlowerPatch(ctx, gc.globalT + i);
    ctx.restore();
  }

  const bob = (ph: number): number => Math.abs(Math.sin(gc.finaleT * 3 + ph)) * 14;

  // every friend Yuna helped celebrates with her — one per completed level.
  // The baby star came down to the party too, right beside Yuna — so the
  // night sky above holds ONLY the collected stars, exactly countable.
  const cast: Array<{ kind: FriendKind; x: number; ph: number }> = [
    { kind: 'bunny', x: 250, ph: 0 },
    { kind: 'bird', x: 330, ph: 1.1 },
    { kind: 'turtle', x: 395, ph: 2.2 },
    { kind: 'flowerbed', x: 560, ph: 0.6 },
    { kind: 'squirrel', x: 630, ph: 1.7 },
    { kind: 'owl', x: 705, ph: 2.8 },
    { kind: 'fox', x: 790, ph: 3.9 },
    { kind: 'babystar', x: 505, ph: 4.6 },
    { kind: 'lark', x: 195, ph: 1.4 },
    { kind: 'octopus', x: 880, ph: 2.5 },
    { kind: 'puppy', x: 855, ph: 3.2 },
  ];
  for (const f of cast.slice(0, Math.max(1, gc.colorsRestored))) {
    ctx.save();
    ctx.translate(f.x, 452 - Math.sin(((f.x - 100) / 760) * Math.PI) * 40);
    art.drawFriend(ctx, f.kind, { t: gc.globalT + f.ph, happy: true, hop: bob(f.ph), facing: f.x > 480 ? -1 : 1 });
    ctx.restore();
  }

  // Yuna in the middle (with her magic wings, if she earned them)
  ctx.save();
  ctx.translate(470, 428);
  art.drawPlayer(ctx, {
    t: gc.globalT, walk: 0.4, facing: 1, onGround: true, vy: 0, blink: gc.player.blink,
    wings: gc.colorsRestored >= 8, rising: false,
  });
  ctx.restore();

  renderParticles(gc);
  renderUI(gc);
}
