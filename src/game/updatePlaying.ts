import { C } from '../config';
import { LEVELS } from '../levels';
import { audio } from '../audio';
import { TEXTS } from '../texts';
import { BUBBLE_H } from './constants';
import type { GameCtx } from './context';
import { moveX } from './moveX';
import { moveY } from './moveY';
import { solid } from './solid';
import { startRescue } from './startRescue';
import { updateRescue } from './updateRescue';
import { updateBubbleLift } from './updateBubbleLift';
import { updateCarried } from './updateCarried';
import { updateSong } from './updateSong';
import { updateChase } from './updateChase';
import { updateIntro } from './updateIntro';
import { beginGiving } from './beginGiving';
import { showCaption } from './showCaption';
import { dist, lunaCX, lunaCY } from './utils';

export function updatePlaying(gc: GameCtx, dt: number): void {
  const luna = gc.luna;
  if (luna.rescue) {
    updateRescue(gc, dt);
    updateCarried(gc);
    return;
  }
  if (luna.bubbleLift) {
    updateBubbleLift(gc, dt);
    updateCarried(gc);
    return;
  }

  luna.coyote -= dt;
  gc.jumpBuf -= dt;
  gc.hintCooldown -= dt;

  const level = LEVELS[gc.levelIndex];
  const waterY = level.water !== undefined ? level.water * C.TILE : Infinity;
  const inWater = luna.y + 12 > waterY;

  // walk (a little slower along the seabed)
  const dir = (gc.keys.ArrowLeft ? -1 : 0) + (gc.keys.ArrowRight ? 1 : 0);
  const speedMult = inWater ? C.WATER_WALK_MULT : 1;
  luna.vx += (dir * C.MOVE_SPEED * speedMult - luna.vx) * C.MOVE_EASE;
  if (!dir && Math.abs(luna.vx) < 4) luna.vx = 0;
  if (dir) luna.facing = dir > 0 ? 1 : -1;
  luna.walkAmt += ((dir !== 0 && luna.onGround ? 1 : 0) - luna.walkAmt) * 0.2;
  moveX(gc, luna.vx * dt);

  // vertical motion: swim, flutter or fall — always gently
  const jumpHeld = gc.keys.Space || gc.keys.ArrowUp;
  if (inWater) {
    // hold jump to swim up, otherwise drift slowly down
    if (jumpHeld) luna.vy = Math.max(luna.vy - C.SWIM_ACCEL * dt, -C.SWIM_UP);
    else luna.vy = Math.min(luna.vy + C.SINK * dt, C.SINK_MAX);
    if (jumpHeld && Math.random() < dt * 4) {
      gc.particles.push({ kind: 'bubble', x: lunaCX(luna) + (Math.random() - 0.5) * 20, y: luna.y, vx: 0, vy: -60, life: 1.1, t: 0 });
    }
  } else if (luna.hasWings && jumpHeld && !luna.onGround && luna.flyCharge > 0 && luna.vy > -C.FLY_RISE) {
    // magic wings: holding jump flutters Luna gently upward — and slowly
    // spends the wing sparkle; she rests on clouds to get it back
    luna.vy = Math.max(luna.vy - C.FLY_ACCEL * dt, -C.FLY_RISE);
    luna.flyCharge = Math.max(0, luna.flyCharge - dt / C.FLY_STAMINA);
    if (luna.flyCharge === 0 && !gc.wingsTiredShown) {
      gc.wingsTiredShown = true;
      showCaption(gc, TEXTS.wingsTired, 2.8);
      audio.play('hint');
    }
  } else {
    const g = luna.vy < 0 && jumpHeld ? C.GRAVITY_UP : C.GRAVITY_DOWN;
    const maxFall = luna.hasWings ? C.MAX_FALL_WINGS : C.MAX_FALL;
    luna.vy = Math.min(luna.vy + g * dt, maxFall);
  }
  const wasOnGround = luna.onGround;
  moveY(gc, luna.vy * dt);
  const landed = !wasOnGround && luna.onGround;

  if (luna.onGround) {
    luna.coyote = C.COYOTE;
    // remember a safe spot only when standing well within solid ground,
    // a little back from any edge — the rescue cloud should never drop
    // Luna right at the lip of the hole she fell into
    const T = C.TILE;
    const lc = Math.floor((luna.x - 10) / T);
    const rc = Math.floor((luna.x + luna.w + 10) / T);
    const row = Math.floor((luna.y + luna.h + 2) / T);
    if (solid(gc, lc, row) && solid(gc, rc, row)) {
      luna.safeX = luna.x;
      luna.safeY = luna.y;
    }
    // resting re-shimmers tired wings
    if (luna.hasWings && luna.flyCharge < 1) {
      const was = luna.flyCharge;
      luna.flyCharge = Math.min(1, luna.flyCharge + dt / C.FLY_RECHARGE);
      if (was < 1 && luna.flyCharge >= 1) {
        audio.play('shimmer');
        showCaption(gc, TEXTS.wingsReady, 2);
        gc.wingsTiredShown = false;
        for (let i = 0; i < 8; i++) {
          gc.particles.push({
            kind: 'sparkle', x: lunaCX(luna) + (Math.random() - 0.5) * 40, y: luna.y - 20 - Math.random() * 20,
            vx: 0, vy: -30, life: 0.8, t: 0,
          });
        }
      }
    }
  }
  if (gc.jumpBuf > 0 && (luna.onGround || luna.coyote > 0)) {
    luna.vy = -C.JUMP_VEL * (inWater ? C.WATER_JUMP_MULT : 1);
    luna.onGround = false;
    luna.coyote = 0;
    gc.jumpBuf = 0;
    audio.play('jump');
  }

  // breath under water — and the friendly bubble when it runs out
  if (level.water !== undefined) {
    const headUnder = luna.y + 8 > waterY;
    if (headUnder) {
      luna.air = Math.max(0, luna.air - dt / C.AIR_TIME);
      if (luna.air < 0.3 && !gc.airWarned) {
        gc.airWarned = true;
        showCaption(gc, TEXTS.airLow, 2.4);
        audio.play('hint');
      }
      if (luna.air === 0 && !luna.bubbleLift) {
        luna.bubbleLift = { t: 0 };
        audio.play('cloud');
        showCaption(gc, TEXTS.bubbleLift, 2.6);
      }
    } else {
      if (gc.prevHeadUnder && luna.air < 0.7) audio.play('breath');
      luna.air = Math.min(1, luna.air + dt / C.AIR_REFILL);
      if (luna.air >= 1) gc.airWarned = false;
    }
    gc.prevHeadUnder = headUnder;
  }

  // fell below the world → friendly cloud rescue (never a punishment)
  if (luna.y > gc.levelH + 40) startRescue(gc);

  // stars — pure celebration
  for (const s of gc.stars) {
    if (!s.collected && dist(lunaCX(luna), lunaCY(luna), s.x, s.y) < C.STAR_RADIUS) {
      s.collected = true;
      gc.totalStars++;
      audio.play('star');
      if (!gc.caption) showCaption(gc, TEXTS.star, 1.2);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        gc.particles.push({ kind: 'sparkle', x: s.x, y: s.y, vx: Math.cos(a) * 70, vy: Math.sin(a) * 70 - 30, life: 0.7, t: 0 });
      }
    }
  }

  // magic wings pickup — the bird's gift; kindness comes back
  if (gc.wings && !gc.wings.taken && dist(lunaCX(luna), lunaCY(luna), gc.wings.x, gc.wings.y) < C.PICKUP_RADIUS + 10) {
    gc.wings.taken = true;
    luna.hasWings = true;
    luna.flyCharge = 1;
    audio.play('wings');
    showCaption(gc, TEXTS.wings, 4);
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      gc.particles.push({
        kind: 'sparkle', x: gc.wings.x, y: gc.wings.y,
        vx: Math.cos(a) * 90, vy: Math.sin(a) * 90 - 40, life: 1, t: 0,
      });
    }
  }

  // auto pickup
  if (!luna.carrying) {
    for (const it of gc.items) {
      if (it.state === 'world' && dist(lunaCX(luna), lunaCY(luna), it.x, it.y) < C.PICKUP_RADIUS) {
        it.state = 'carried';
        luna.carrying = it;
        audio.play('pickup');
        showCaption(gc, TEXTS.pickup(it.kind), 2.5);
        for (let i = 0; i < 6; i++) {
          gc.particles.push({ kind: 'sparkle', x: it.x, y: it.y, vx: (Math.random() - 0.5) * 80, vy: -Math.random() * 60, life: 0.6, t: 0 });
        }
        break;
      }
    }
  }
  updateCarried(gc);

  // near a friend (song and chase levels drive their friends separately)
  const deed = level.deed;
  if (deed === 'fetch' || deed === 'dwell') {
    for (const f of gc.friends) {
      if (f.satisfied) continue;
      const d = dist(lunaCX(luna), lunaCY(luna), f.x, f.y - 24);
      if (deed === 'fetch') {
        if (luna.carrying && d < C.GIVE_RADIUS) {
          beginGiving(gc, f);
          break;
        }
        if (!luna.carrying && d < C.GIVE_RADIUS + 24 && gc.hintCooldown <= 0) {
          // wordless hint: the friend perks up and its wish-bubble bounces
          gc.hintCooldown = 3;
          f.bounce = 1;
          audio.play('hint');
        }
      } else {
        // dwell deed: staying close for a moment is the kindness itself
        // (extra generous radius, and hopping nearby still counts)
        if (d < C.GIVE_RADIUS + 40) {
          f.dwellT += dt;
          if (Math.random() < dt * 8) {
            gc.particles.push({
              kind: 'sparkle',
              x: f.x + (Math.random() - 0.5) * 44,
              y: f.y - BUBBLE_H[f.kind] + (Math.random() - 0.5) * 30,
              vx: 0,
              vy: -22,
              life: 0.7,
              t: 0,
            });
          }
          if (f.dwellT >= C.DWELL_TIME) {
            beginGiving(gc, f);
            break;
          }
        } else {
          f.dwellT = Math.max(0, f.dwellT - dt * 0.5);
        }
      }
    }
  } else if (deed === 'song') {
    updateSong(gc, dt, landed);
  } else if (deed === 'chase') {
    updateChase(gc, dt);
  }
  if (level.practice) updateIntro(gc, dt);

  // idle charm
  if (dir === 0 && !jumpHeld) gc.idleT += dt;
  if (gc.idleT > 6 && !gc.butterfly) {
    gc.butterfly = { ax: lunaCX(luna) + (luna.facing > 0 ? -70 : 70), ay: luna.y - 60, t: 0, alpha: 0 };
  }
  if (gc.idleT > 25 && Math.random() < dt) {
    const waiting = gc.friends.find((f) => !f.satisfied);
    if (waiting) {
      gc.particles.push({ kind: 'sparkle', x: waiting.x + (Math.random() - 0.5) * 40, y: waiting.y - BUBBLE_H[waiting.kind] + 2, vx: 0, vy: -25, life: 1, t: 0 });
    }
  }
}
