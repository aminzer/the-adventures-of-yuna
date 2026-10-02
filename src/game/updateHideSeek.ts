import { C } from '../config';
import { TEXTS } from '../texts';
import { audio } from '../audio';
import type { GameCtx } from './context';
import { beginGiving } from './beginGiving';
import { showCaption } from './showCaption';
import { dist, playerCX, playerCY } from './utils';

function startRun(gc: GameCtx, toX: number): void {
  const fox = gc.friends[0];
  gc.hideRun = { fromX: fox.x, toX, t: 0, dur: Math.max(0.7, Math.abs(toX - fox.x) / 300) };
}

// Play deed: hide-and-seek. The fox invites Yuna, dashes behind a bush (ears
// and tail peeking and wiggling — a small child can always find it), giggles
// when found and bounds off to the next bush; after the last find it runs to
// Yuna itself, for the hug. Being found is always a joy — never a loss.
export function updateHideSeek(gc: GameCtx, dt: number): void {
  const fox = gc.friends[0];
  if (!fox || fox.satisfied) return;
  const px = playerCX(gc.player);
  const py = playerCY(gc.player);

  // the invitation: the fox meets Yuna, then dashes off to hide
  if (!fox.asked) {
    if (dist(px, py, fox.x, fox.y - 24) < C.ASK_RADIUS) {
      fox.asked = true;
      fox.bounce = 1;
      audio.play('hint');
      showCaption(gc, TEXTS.hidePlea, 6);
      startRun(gc, gc.bushes[0].x);
    }
    return;
  }

  // mid-dash: playful bounding leaps (they carry it safely over any gap)
  if (gc.hideRun) {
    const r = gc.hideRun;
    r.t += dt;
    const p = Math.min(1, r.t / r.dur);
    fox.x = r.fromX + (r.toX - r.fromX) * p;
    fox.hop = Math.abs(Math.sin(p * Math.PI * 4)) * 24;
    if (p >= 1) {
      gc.hideRun = null;
      fox.hop = 0;
    }
    return;
  }

  // every hiding place visited — the fox runs to Yuna itself, for the hug
  if (gc.hideFound >= C.HIDE_ROUNDS) {
    if (dist(px, py, fox.x, fox.y - 24) < 56) beginGiving(gc, fox);
    else startRun(gc, px);
    return;
  }

  // hiding: the fox stands right behind the bush, swaying with impatience.
  // "Found" is generous vertically — standing on a platform above the bush
  // and seeing the ears counts just as much as standing beside it.
  const bush = gc.bushes[Math.min(gc.hideFound, gc.bushes.length - 1)];
  fox.x = bush.x + Math.sin(fox.t * 2.1) * 5;
  fox.hop = Math.max(0, Math.sin(fox.t * 1.6) * 16); // peeks up over the bush now and then
  if (Math.abs(px - bush.x) < C.HIDE_FIND_RADIUS && Math.abs(py - (fox.y - 24)) < 160) {
    gc.hideFound++;
    fox.bounce = 1;
    audio.play('boing');
    for (let i = 0; i < 6; i++) {
      gc.particles.push({ kind: 'heart', x: fox.x, y: fox.y - 50, vx: (Math.random() - 0.5) * 60, vy: -60 - Math.random() * 30, life: 1.2, t: 0 });
    }
    if (gc.hideFound < C.HIDE_ROUNDS) {
      showCaption(gc, TEXTS.hideFound, 4);
      startRun(gc, gc.bushes[gc.hideFound].x);
    } else {
      showCaption(gc, TEXTS.hideLast, 4);
      startRun(gc, px);
    }
  }
}
