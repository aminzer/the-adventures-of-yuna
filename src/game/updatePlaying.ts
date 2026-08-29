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
import { dist, playerCX, playerCY } from './utils';

export function updatePlaying(gc: GameCtx, dt: number): void {
  const player = gc.player;
  if (player.rescue) {
    updateRescue(gc, dt);
    updateCarried(gc);
    return;
  }
  if (player.bubbleLift) {
    updateBubbleLift(gc, dt);
    updateCarried(gc);
    return;
  }

  player.coyote -= dt;
  gc.jumpBuf -= dt;
  gc.hintCooldown -= dt;

  const level = LEVELS[gc.levelIndex];
  const waterY = level.water !== undefined ? level.water * C.TILE : Infinity;
  const inWater = player.y + 12 > waterY;

  // walk (a little slower along the seabed)
  const dir = (gc.keys.ArrowLeft ? -1 : 0) + (gc.keys.ArrowRight ? 1 : 0);
  const speedMult = inWater ? C.WATER_WALK_MULT : 1;
  player.vx += (dir * C.MOVE_SPEED * speedMult - player.vx) * C.MOVE_EASE;
  if (!dir && Math.abs(player.vx) < 4) player.vx = 0;
  if (dir) player.facing = dir > 0 ? 1 : -1;
  player.walkAmt += ((dir !== 0 && player.onGround ? 1 : 0) - player.walkAmt) * 0.2;
  moveX(gc, player.vx * dt);

  // vertical motion: swim, flutter or fall — always gently
  const jumpHeld = gc.keys.Space || gc.keys.ArrowUp;
  if (inWater) {
    // hold jump to swim up, otherwise drift slowly down
    if (jumpHeld) player.vy = Math.max(player.vy - C.SWIM_ACCEL * dt, -C.SWIM_UP);
    else player.vy = Math.min(player.vy + C.SINK * dt, C.SINK_MAX);
    if (jumpHeld && Math.random() < dt * 4) {
      gc.particles.push({ kind: 'bubble', x: playerCX(player) + (Math.random() - 0.5) * 20, y: player.y, vx: 0, vy: -60, life: 1.1, t: 0 });
    }
  } else if (player.hasWings && jumpHeld && !player.onGround && player.flyCharge > 0 && player.vy > -C.FLY_RISE) {
    // magic wings: holding jump flutters Yuna gently upward — and slowly
    // spends the wing sparkle; she rests on clouds to get it back
    player.vy = Math.max(player.vy - C.FLY_ACCEL * dt, -C.FLY_RISE);
    player.flyCharge = Math.max(0, player.flyCharge - dt / C.FLY_STAMINA);
    if (player.flyCharge === 0 && !gc.wingsTiredShown) {
      gc.wingsTiredShown = true;
      showCaption(gc, TEXTS.wingsTired, 2.8);
      audio.play('hint');
    }
  } else {
    const g = player.vy < 0 && jumpHeld ? C.GRAVITY_UP : C.GRAVITY_DOWN;
    const maxFall = player.hasWings ? C.MAX_FALL_WINGS : C.MAX_FALL;
    player.vy = Math.min(player.vy + g * dt, maxFall);
  }
  const wasOnGround = player.onGround;
  moveY(gc, player.vy * dt);
  const landed = !wasOnGround && player.onGround;

  if (player.onGround) {
    player.coyote = C.COYOTE;
    // remember a safe spot only when standing well within solid ground,
    // a little back from any edge — the rescue cloud should never drop
    // Yuna right at the lip of the hole she fell into
    const T = C.TILE;
    const lc = Math.floor((player.x - 10) / T);
    const rc = Math.floor((player.x + player.w + 10) / T);
    const row = Math.floor((player.y + player.h + 2) / T);
    if (solid(gc, lc, row) && solid(gc, rc, row)) {
      player.safeX = player.x;
      player.safeY = player.y;
    }
    // resting re-shimmers tired wings
    if (player.hasWings && player.flyCharge < 1) {
      const was = player.flyCharge;
      player.flyCharge = Math.min(1, player.flyCharge + dt / C.FLY_RECHARGE);
      if (was < 1 && player.flyCharge >= 1) {
        audio.play('shimmer');
        showCaption(gc, TEXTS.wingsReady, 2);
        gc.wingsTiredShown = false;
        for (let i = 0; i < 8; i++) {
          gc.particles.push({
            kind: 'sparkle', x: playerCX(player) + (Math.random() - 0.5) * 40, y: player.y - 20 - Math.random() * 20,
            vx: 0, vy: -30, life: 0.8, t: 0,
          });
        }
      }
    }
  }
  if (gc.jumpBuf > 0 && (player.onGround || player.coyote > 0)) {
    player.vy = -C.JUMP_VEL * (inWater ? C.WATER_JUMP_MULT : 1);
    player.onGround = false;
    player.coyote = 0;
    gc.jumpBuf = 0;
    audio.play('jump');
  }

  // breath under water — and the friendly bubble when it runs out
  if (level.water !== undefined) {
    const headUnder = player.y + 8 > waterY;
    if (headUnder) {
      player.air = Math.max(0, player.air - dt / C.AIR_TIME);
      if (player.air < 0.3 && !gc.airWarned) {
        gc.airWarned = true;
        showCaption(gc, TEXTS.airLow, 2.4);
        audio.play('hint');
      }
      if (player.air === 0 && !player.bubbleLift) {
        player.bubbleLift = { t: 0 };
        audio.play('cloud');
        showCaption(gc, TEXTS.bubbleLift, 2.6);
      }
    } else {
      if (gc.prevHeadUnder && player.air < 0.7) audio.play('breath');
      player.air = Math.min(1, player.air + dt / C.AIR_REFILL);
      if (player.air >= 1) gc.airWarned = false;
    }
    gc.prevHeadUnder = headUnder;
  }

  // fell below the world → friendly cloud rescue (never a punishment)
  if (player.y > gc.levelH + 40) startRescue(gc);

  // stars — pure celebration
  for (const s of gc.stars) {
    if (!s.collected && dist(playerCX(player), playerCY(player), s.x, s.y) < C.STAR_RADIUS) {
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
  if (gc.wings && !gc.wings.taken && dist(playerCX(player), playerCY(player), gc.wings.x, gc.wings.y) < C.PICKUP_RADIUS + 10) {
    gc.wings.taken = true;
    player.hasWings = true;
    player.flyCharge = 1;
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
  if (!player.carrying) {
    for (const it of gc.items) {
      if (it.state === 'world' && dist(playerCX(player), playerCY(player), it.x, it.y) < C.PICKUP_RADIUS) {
        it.state = 'carried';
        player.carrying = it;
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
      const d = dist(playerCX(player), playerCY(player), f.x, f.y - 24);
      if (deed === 'fetch') {
        if (player.carrying && d < C.GIVE_RADIUS) {
          beginGiving(gc, f);
          break;
        }
        if (!player.carrying && d < C.GIVE_RADIUS + 24 && gc.hintCooldown <= 0) {
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
    gc.butterfly = { ax: playerCX(player) + (player.facing > 0 ? -70 : 70), ay: player.y - 60, t: 0, alpha: 0 };
  }
  if (gc.idleT > 25 && Math.random() < dt) {
    const waiting = gc.friends.find((f) => !f.satisfied);
    if (waiting) {
      gc.particles.push({ kind: 'sparkle', x: waiting.x + (Math.random() - 0.5) * 40, y: waiting.y - BUBBLE_H[waiting.kind] + 2, vx: 0, vy: -25, life: 1, t: 0 });
    }
  }
}
