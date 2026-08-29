import { C } from '../config';
import { LEVELS } from '../levels';
import * as art from '../art';
import { BELL_COLORS, BUBBLE_H } from './constants';
import type { GameCtx } from './context';
import { solid } from './solid';
import { ensureLayer } from './ensureLayer';
import { renderSkyAndHills } from './renderSkyAndHills';
import { renderParticles } from './renderParticles';
import { renderUI } from './renderUI';
import { lunaCX } from './utils';

export function renderWorld(gc: GameCtx): void {
  const ctx = gc.ctx;
  const T = C.TILE;
  const luna = gc.luna;
  renderSkyAndHills(gc);

  // ---- world layer, on its own offscreen buffer: drawn in full color, then
  // desaturated there — so the rainbow behind the hills keeps its color
  const off = ensureLayer(gc, 'off');
  const og = off.g;
  og.setTransform(1, 0, 0, 1, 0, 0);
  og.clearRect(0, 0, off.cv.width, off.cv.height);
  og.setTransform(gc.scaleX, 0, 0, gc.scaleY, 0, 0);
  og.translate(-Math.round(gc.camX), -Math.round(gc.camY));

  // decor behind tiles (the bird 'b' is drawn later, in color)
  for (const d of gc.decor) {
    if (d.kind === 'b') continue;
    og.save();
    if (d.kind === 'c') {
      og.translate(d.x + Math.sin(gc.globalT * 0.15 + d.x) * 14, d.y - T / 2);
      art.drawBgCloud(og);
    } else if (d.kind === 'T') {
      og.translate(d.x, d.y);
      art.drawTree(og, gc.globalT);
    } else if (d.kind === 's') {
      og.translate(d.x, d.y);
      art.drawSeaweed(og, gc.globalT + d.x);
    } else {
      og.translate(d.x, d.y);
      art.drawFlowerPatch(og, gc.globalT);
    }
    og.restore();
  }

  // tiles (only the visible range)
  const c0 = Math.max(0, Math.floor(gc.camX / T) - 1);
  const c1 = Math.min(gc.gridCols - 1, Math.ceil((gc.camX + C.VIEW_W) / T) + 1);
  for (let r = 0; r < gc.gridRows; r++) {
    for (let c = c0; c <= c1; c++) {
      const v = gc.grid[r * gc.gridCols + c];
      if (v === 1) {
        art.drawGroundTile(og, c * T, r * T, T, !solid(gc, c, r - 1), r * gc.gridCols + c);
      } else if (v === 2) {
        const leftEnd = gc.grid[r * gc.gridCols + c - 1] !== 2;
        const rightEnd = gc.grid[r * gc.gridCols + c + 1] !== 2;
        if (LEVELS[gc.levelIndex].sky) art.drawCloudPlatformTile(og, c * T, r * T, T, leftEnd, rightEnd);
        else art.drawPlatformTile(og, c * T, r * T, T, leftEnd, rightEnd);
      }
    }
  }

  // the friends (part of the grey world until color returns)
  for (const f of gc.friends) {
    og.save();
    og.translate(f.x, f.y);
    const squash = 1 + f.bounce * 0.12 * Math.sin(f.bounce * 12);
    og.scale(2 - squash, squash);
    // the puppy always turns toward Luna — waiting for her or chasing her
    const facing: 1 | -1 = lunaCX(luna) < f.x ? -1 : 1;
    const singing = f.kind === 'lark' && gc.songDemo.step >= 0;
    art.drawFriend(og, f.kind, { t: f.t, happy: f.satisfied, hop: f.hop, facing, singing });
    og.restore();
    // the given item resting in the friend's paws
    const given = gc.items.find((i) => i.state === 'given' && i.owner === f);
    if (given) {
      og.save();
      og.translate(f.x + 8, f.y - 28 - f.hop);
      art.drawItem(og, given.kind, 0.9);
      og.restore();
    }
  }

  // the sea, over everything in it (its blue also returns with the bloom)
  const level = LEVELS[gc.levelIndex];
  if (level.water !== undefined) {
    art.drawWater(og, level.water * T, gc.levelW, gc.levelH, gc.globalT);
  }

  // ---- the storm's grey veil, applied to the world layer only
  og.setTransform(gc.scaleX, 0, 0, gc.scaleY, 0, 0);
  if (gc.desat > 0) {
    // keep the layer's own transparency: remember it, veil, then restore it
    // (blend modes also tint empty pixels, which would haze the background)
    const mask = ensureLayer(gc, 'mask');
    mask.g.setTransform(1, 0, 0, 1, 0, 0);
    mask.g.clearRect(0, 0, mask.cv.width, mask.cv.height);
    mask.g.drawImage(off.cv, 0, 0);

    og.save();
    if (gc.bloom && gc.bloom.r > 0) {
      og.beginPath();
      og.rect(0, 0, C.VIEW_W, C.VIEW_H);
      og.arc(gc.bloom.x - gc.camX, gc.bloom.y - gc.camY, gc.bloom.r, 0, Math.PI * 2);
      og.clip('evenodd');
    }
    if (gc.saturationOK) {
      og.globalCompositeOperation = 'saturation';
      og.globalAlpha = gc.desat * C.DESAT_ALPHA;
      og.fillStyle = '#808080';
    } else {
      og.globalAlpha = gc.desat * 0.55;
      og.fillStyle = '#9a9aa5';
    }
    og.fillRect(0, 0, C.VIEW_W, C.VIEW_H);
    og.restore();

    og.save();
    og.setTransform(1, 0, 0, 1, 0, 0);
    og.globalCompositeOperation = 'destination-in';
    og.drawImage(mask.cv, 0, 0);
    og.restore();
  }

  // blit the (possibly greyed) world over the background
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(off.cv, 0, 0);
  ctx.restore();

  // soft glowing rim on the growing circle of color
  if (gc.desat > 0 && gc.bloom && gc.bloom.r > 0 && gc.bloom.r < 1600) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(gc.bloom.x - gc.camX, gc.bloom.y - gc.camY, gc.bloom.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // ---- always-in-color layer: the magic
  ctx.save();
  ctx.translate(-Math.round(gc.camX), -Math.round(gc.camY));

  // bell-flowers (song levels) — always in color: they are the melody
  for (const bell of gc.bells) {
    ctx.save();
    ctx.translate(bell.x, bell.y);
    art.drawBellFlower(ctx, BELL_COLORS[bell.idx], gc.globalT + bell.idx * 0.7, bell.lit);
    ctx.restore();
  }

  // the happy little bird who brings the wings — a splash of restored color
  for (const d of gc.decor) {
    if (d.kind !== 'b') continue;
    ctx.save();
    ctx.translate(d.x, d.y);
    art.drawFriend(ctx, 'bird', { t: gc.globalT, happy: true, hop: Math.abs(Math.sin(gc.globalT * 3)) * 5 });
    ctx.restore();
  }

  // the magic wings, waiting
  if (gc.wings && !gc.wings.taken) {
    ctx.save();
    ctx.translate(gc.wings.x, gc.wings.y + Math.sin(gc.globalT * 2.2) * 4);
    art.drawWingsPickup(ctx, gc.globalT);
    ctx.restore();
  }

  // items waiting in the world — drawn in color so they are easy to spot
  for (const it of gc.items) {
    if (it.state === 'world') {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      art.ellipse(ctx, it.x, it.homeY + 18, 12, 3.5);
      ctx.fill();
      ctx.translate(it.x, it.y);
      art.drawItem(ctx, it.kind, 1);
      ctx.restore();
    }
  }

  // sparkle stars (little bits of magic the storm couldn't steal)
  for (const s of gc.stars) {
    if (!s.collected) {
      ctx.save();
      ctx.translate(s.x, s.y + Math.sin(s.t * 2) * 3);
      const tw = 0.85 + Math.sin(s.t * 3) * 0.15;
      ctx.scale(tw, tw);
      art.drawStar(ctx, 11, 0.6 + Math.sin(s.t * 3) * 0.4);
      ctx.restore();
    }
  }

  // rescue cloud under Luna
  if (luna.rescue) {
    ctx.save();
    ctx.translate(lunaCX(luna), luna.y + luna.h + 6);
    art.drawRescueCloud(ctx, gc.globalT);
    ctx.restore();
  }

  // Luna — a walking splash of color in the grey world
  const inWater = level.water !== undefined && luna.y + 12 > level.water * T;
  ctx.save();
  ctx.translate(lunaCX(luna), luna.y + luna.h);
  art.drawLuna(ctx, {
    t: gc.globalT,
    walk: luna.walkAmt,
    facing: luna.facing,
    onGround: luna.onGround || !!luna.rescue,
    vy: luna.vy,
    blink: luna.blink,
    wings: luna.hasWings,
    rising: luna.hasWings && !luna.onGround && luna.vy < -20,
    wingCharge: luna.flyCharge,
    swimming: inWater,
  });
  ctx.restore();

  // the friendly bubble carrying Luna up for a breath
  if (luna.bubbleLift) {
    ctx.save();
    ctx.translate(lunaCX(luna), luna.y + 16);
    ctx.fillStyle = 'rgba(175,220,255,0.3)';
    art.circle(ctx, 0, 0, 48);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 2;
    art.circle(ctx, 0, 0, 48);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-14, -14, 22, Math.PI * 0.9, Math.PI * 1.35);
    ctx.stroke();
    ctx.restore();
  }


  // carried / tweening item
  for (const it of gc.items) {
    if (it.state === 'carried' || it.state === 'tween') {
      ctx.save();
      ctx.translate(it.x, it.y);
      ctx.rotate(Math.sin(gc.globalT * 3) * 0.12);
      art.drawItem(ctx, it.kind, 1);
      ctx.restore();
    }
  }

  // thought bubbles — each waiting friend's wordless wish
  for (const f of gc.friends) {
    const isGiving = gc.state === 'GIVING' && gc.givingFriend === f;
    if (f.satisfied && !isGiving) continue;
    const heartAmt = isGiving ? Math.min(1, gc.stateT / C.GIVE_TIME) : 0;
    const dwellPulse = level.deed === 'dwell' ? Math.min(0.18, f.dwellT * 0.15) : 0;
    const pulse = 1 + Math.sin(f.t * 2.5) * 0.05 + f.bounce * 0.18 + dwellPulse + (gc.idleT > 25 ? Math.sin(gc.globalT * 6) * 0.06 : 0);
    const icon = level.deed === 'fetch' ? level.item! : level.bubble!;
    ctx.save();
    ctx.translate(f.x + 6, f.y - BUBBLE_H[f.kind]);
    art.drawThoughtBubble(ctx, icon, pulse, heartAmt);
    ctx.restore();
  }

  // butterfly (idle companion)
  if (gc.butterfly) {
    ctx.save();
    const bx = gc.butterfly.ax + Math.sin(gc.butterfly.t * 0.9) * 46;
    const by = gc.butterfly.ay + Math.sin(gc.butterfly.t * 1.7) * 22 - gc.butterfly.t * 1.2;
    ctx.translate(bx, by);
    art.drawButterfly(ctx, gc.butterfly.t, gc.butterfly.alpha);
    ctx.restore();
  }

  renderParticles(gc);
  ctx.restore();

  renderUI(gc);
}
