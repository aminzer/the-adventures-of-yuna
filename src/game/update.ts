import { C } from '../config';
import type { GameCtx } from './context';
import { updatePlaying } from './updatePlaying';
import { updateGiving } from './updateGiving';
import { updateBlooming } from './updateBlooming';
import { updateLevelDone } from './updateLevelDone';
import { updateFadeOut } from './updateFadeOut';
import { updateFadeIn } from './updateFadeIn';
import { updateFinale } from './updateFinale';
import { updateFriendHops } from './updateFriendHops';
import { lunaCX } from './utils';

export function update(gc: GameCtx, dt: number): void {
  const luna = gc.luna;
  gc.globalT += dt;
  gc.anyKeyFrame = gc.anyKeyPressed;
  gc.anyKeyPressed = false;

  // Luna blink timer
  luna.blinkT -= dt;
  if (luna.blinkT <= 0) {
    luna.blink = 1;
    if (luna.blinkT < -0.15) {
      luna.blink = 0;
      luna.blinkT = 2.5 + Math.random() * 3;
    }
  } else luna.blink = 0;

  // butterfly (idle friend)
  if (gc.butterfly) {
    gc.butterfly.t += dt;
    const leaving = gc.idleT < 4;
    gc.butterfly.alpha += ((leaving ? 0 : 1) - gc.butterfly.alpha) * dt * 3;
    if (leaving && gc.butterfly.alpha < 0.05) gc.butterfly = null;
  }

  switch (gc.state) {
    case 'PLAYING': updatePlaying(gc, dt); break;
    case 'GIVING': updateGiving(gc, dt); break;
    case 'BLOOMING': updateBlooming(gc, dt); break;
    case 'LEVEL_DONE': updateLevelDone(gc, dt); break;
    case 'FADE_OUT': updateFadeOut(gc, dt); break;
    case 'FADE_IN': updateFadeIn(gc, dt); break;
    case 'FINALE': updateFinale(gc, dt); break;
  }
  updateFriendHops(gc, dt);

  // a sleeping owl breathes out little Zzz marks
  for (const f of gc.friends) {
    if (f.kind === 'owl' && !f.satisfied && Math.random() < dt * 0.8) {
      gc.particles.push({ kind: 'zzz', x: f.x + 14, y: f.y - 78, vx: 8, vy: -16, life: 2, t: 0 });
    }
  }

  // camera follows gently
  if (gc.state !== 'FINALE') {
    let target = lunaCX(luna) - C.VIEW_W * 0.45;
    if ((gc.state === 'GIVING' || gc.state === 'BLOOMING') && gc.givingFriend) {
      target = (lunaCX(luna) + gc.givingFriend.x) / 2 - C.VIEW_W / 2;
    }
    target = Math.max(0, Math.min(target, gc.levelW - C.VIEW_W));
    gc.camX += (target - gc.camX) * Math.min(1, dt * 4);
    const targetY = Math.max(0, Math.min(luna.y + luna.h - C.VIEW_H * 0.65, gc.levelH - C.VIEW_H));
    gc.camY += (targetY - gc.camY) * Math.min(1, dt * 4);
  }

  // particles
  for (let i = gc.particles.length - 1; i >= 0; i--) {
    const p = gc.particles[i];
    p.t += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.kind === 'heart') p.x += Math.sin(p.t * 5) * 18 * dt;
    if (p.t >= p.life) gc.particles.splice(i, 1);
  }

  // world item bobbing
  for (const it of gc.items) {
    it.t += dt;
    if (it.state === 'world') it.y = it.homeY + Math.sin(it.t * 2.4) * 4;
  }
  for (const s of gc.stars) s.t += dt;
  for (const f of gc.friends) {
    f.t += dt;
    f.bounce = Math.max(0, f.bounce - dt * 2);
  }
  for (const bell of gc.bells) bell.lit = Math.max(0, bell.lit - dt * 1.6);

  // the landscape rainbow glows fully vivid for the bloom celebration,
  // then eases back to its quiet hazy self
  const glowTarget = gc.state === 'BLOOMING' || gc.state === 'LEVEL_DONE' ? 1 : 0;
  gc.rainbowGlow += (glowTarget - gc.rainbowGlow) * Math.min(1, dt * 3);
  gc.stripeFill = Math.min(1, gc.stripeFill + dt / 2.2);

  // subtitle timer
  if (gc.caption) {
    gc.caption.t += dt;
    if (gc.caption.t >= gc.caption.dur) gc.caption = null;
  }
}
