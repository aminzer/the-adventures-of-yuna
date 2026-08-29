import { C } from '../config';
import { audio } from '../audio';
import { TEXTS } from '../texts';
import type { GameCtx } from './context';
import { beginGiving } from './beginGiving';
import { showCaption } from './showCaption';
import { solid } from './solid';
import { dist, lunaCX, lunaCY } from './utils';

// Chase levels: the puppy is "it" — it bounds happily after Luna, jumping
// up the platforms right behind her. She is a little faster, so she can keep
// the game going as long as she likes (or hop right over it to turn around);
// the moment she rests, she is caught — and being caught IS the joyful
// ending. Nothing bad can ever happen.
export function updateChase(gc: GameCtx, dt: number): void {
  const pup = gc.friends[0];
  if (!pup || pup.satisfied) return;
  const T = C.TILE;
  const luna = gc.luna;
  const lx = lunaCX(luna);
  const dx = lx - pup.x;

  // the game of tag begins when Luna comes close enough
  if (!pup.fleeing && Math.abs(dx) < C.CHASE_START) {
    pup.fleeing = true; // (here it means: the pup is running)
    audio.play('bark');
    showCaption(gc, TEXTS.chaseOn, 2.5);
  }

  // real little physics, so the pup can follow Luna up and down platforms
  const PUP_HEAD = 42; // how tall the pup stands
  const pupCol = Math.floor(pup.x / T);
  pup.vy = (pup.vy ?? 0) + C.PUP_GRAVITY * dt;
  pup.y += pup.vy * dt;
  let grounded = false;
  if (pup.vy > 0) {
    const row = Math.floor(pup.y / T);
    if (solid(gc, pupCol, row)) {
      pup.y = row * T;
      pup.vy = 0;
      grounded = true;
    }
  } else if (pup.vy < 0) {
    // no jumping THROUGH platforms — a solid tile overhead bonks the jump
    const headRow = Math.floor((pup.y - PUP_HEAD) / T);
    if (solid(gc, pupCol, headRow)) {
      pup.y = (headRow + 1) * T + PUP_HEAD;
      pup.vy = 0;
    }
  }

  if (pup.fleeing) {
    // a real puppy's chase is enthusiastic but imperfect: every second or so
    // it guesses where Luna is going (aiming only NEAR her), it overshoots
    // and skids on its momentum, and sometimes a smell is just too
    // interesting — it stops to sniff, and Luna slips away
    pup.retargetIn = (pup.retargetIn ?? 0) - dt;
    if (pup.retargetIn <= 0) {
      pup.retargetIn = 0.7 + Math.random();
      pup.aimOffset = (Math.random() - 0.5) * C.PUP_AIM_WOBBLE;
      if (Math.random() < C.PUP_DISTRACT_CHANCE) pup.pauseFor = 0.5 + Math.random() * 0.9;
    }

    if ((pup.pauseFor ?? 0) > 0) {
      pup.pauseFor = (pup.pauseFor ?? 0) - dt;
      pup.vx = (pup.vx ?? 0) * (1 - Math.min(1, 6 * dt)); // skid to a sniff
      if (grounded) pup.hop = Math.abs(Math.sin(gc.globalT * 2.5)) * 3; // sniff-sniff
    } else {
      const aim = lx + (pup.aimOffset ?? 0);
      const want = Math.abs(aim - pup.x) < 12 ? 0 : Math.sign(aim - pup.x) * C.PUP_SPEED;
      const dv = want - (pup.vx ?? 0);
      pup.vx = (pup.vx ?? 0) + Math.sign(dv) * Math.min(Math.abs(dv), C.PUP_ACCEL * dt);
      pup.hop = 0; // while running, its real jumps do the bouncing
    }
    const minX = 2 * T;
    const maxX = gc.levelW - 2 * T;
    pup.x = Math.max(minX, Math.min(maxX, pup.x + (pup.vx ?? 0) * dt));

    // a platform is a real (but temporary) refuge: the pup needs a while to
    // work out the climb, and it can never jump THROUGH the platform itself.
    // It only "studies the problem" while Luna is settled up there — her
    // jumping around doesn't count (and doesn't reset its progress either).
    const lunaFeet = luna.y + luna.h;
    if (lunaFeet < pup.y - 40) {
      if (luna.onGround) pup.upFor = (pup.upFor ?? 0) + dt;
    } else {
      pup.upFor = 0;
    }

    if (grounded && (pup.pauseFor ?? 0) <= 0) {
      const feetRow = Math.floor((pup.y - 1) / T);
      let airClear = true;
      for (let r = 1; r <= 3; r++) {
        if (solid(gc, pupCol, feetRow - r)) {
          airClear = false;
          break;
        }
      }
      if (lunaFeet < pup.y - 40 && Math.abs(dx) < 180 && airClear && (pup.upFor ?? 0) > C.PUP_CLIMB_TIME) {
        pup.vy = -C.PUP_JUMP; // finally worked it out — up it goes!
      } else if (Math.abs(pup.vx ?? 0) > 40 && airClear) {
        pup.vy = -C.PUP_BOUNCE; // the happy bounding gait
      }
    }
    if (Math.random() < dt * 0.7) audio.play('bark');
  } else if (grounded) {
    pup.hop = Math.abs(Math.sin(gc.globalT * 4)) * 5; // eager play-bow bouncing
  }

  // caught! (small radius, so hopping over the pup is a real escape)
  if (dist(lx, lunaCY(luna), pup.x, pup.y - 24) < C.CATCH_RADIUS) {
    beginGiving(gc, pup);
  }
}
