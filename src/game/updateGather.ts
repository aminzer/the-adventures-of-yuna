import { C } from '../config';
import { ASK_HELP, TEXTS } from '../texts';
import { audio } from '../audio';
import { voice } from '../voice';
import type { GameCtx } from './context';
import { beginGiving } from './beginGiving';
import { showCaption } from './showCaption';
import { dist, playerCX, playerCY } from './utils';

// Gather deed: each firefly joins Yuna when she comes close and flies along
// behind her in a little glowing procession; brought to the sleeping owl they
// settle into a gentle orbit around it, and with the last one home the owl
// wakes to a softly lit night. Nothing can be lost or done wrong.
export function updateGather(gc: GameCtx, dt: number): void {
  const owl = gc.friends[0];
  if (!owl || owl.satisfied) return;
  const px = playerCX(gc.player);
  const py = playerCY(gc.player);

  // the first meeting: the lonely owl asks Yuna to bring her friends back
  if (!owl.asked && dist(px, py, owl.x, owl.y - 24) < C.ASK_RADIUS) {
    owl.asked = true;
    owl.bounce = 1;
    audio.play('hint');
    const plea = ASK_HELP[owl.kind];
    if (plea) showCaption(gc, plea, 9);
  }

  // the owl has finished asking — the fireflies light up all along the road
  if (!gc.pleaDone) return;
  if (!gc.firefliesOut) {
    gc.firefliesOut = true;
    for (const fl of gc.fireflies) {
      for (let i = 0; i < 8; i++) {
        gc.particles.push({ kind: 'sparkle', x: fl.x, y: fl.y, vx: (Math.random() - 0.5) * 90, vy: (Math.random() - 0.5) * 90, life: 0.8, t: 0 });
      }
    }
  }

  for (const fl of gc.fireflies) {
    fl.t += dt;
    if (fl.state === 'waiting') {
      fl.x = fl.homeX + Math.sin(fl.t * 1.5) * 10;
      fl.y = fl.homeY + Math.sin(fl.t * 2.3) * 8;
      if (dist(px, py, fl.x, fl.y) < C.FIREFLY_RADIUS) {
        fl.order = gc.fireflies.filter((o) => o.state !== 'waiting').length;
        fl.state = 'following';
        audio.play('shimmer');
        // (unless the owl is still speaking — never cut her plea short)
        if (fl.order === 0 && !voice.isSpeaking()) showCaption(gc, TEXTS.fireflyFollow, 4.5);
        for (let i = 0; i < 6; i++) {
          gc.particles.push({ kind: 'sparkle', x: fl.x, y: fl.y, vx: (Math.random() - 0.5) * 70, vy: -Math.random() * 50, life: 0.6, t: 0 });
        }
      }
    } else if (fl.state === 'following') {
      const tx = px - gc.player.facing * (34 + fl.order * 22);
      const ty = py - 24 + Math.sin(fl.t * 3 + fl.order * 2) * 8;
      fl.x += (tx - fl.x) * Math.min(1, dt * 3.2);
      fl.y += (ty - fl.y) * Math.min(1, dt * 3.2);
    } else {
      // delivered: a calm little orbit around the sleeping owl
      const a = fl.t * 0.9 + fl.order * 2.1;
      const tx = owl.x + Math.cos(a) * 36;
      const ty = owl.y - 46 + Math.sin(a * 1.4) * 14;
      fl.x += (tx - fl.x) * Math.min(1, dt * 2.4);
      fl.y += (ty - fl.y) * Math.min(1, dt * 2.4);
    }
  }

  // bringing the little lights home
  if (gc.fireflies.some((f) => f.state === 'following') && dist(px, py, owl.x, owl.y - 24) < C.GIVE_RADIUS + 30) {
    let delivered = gc.fireflies.filter((f) => f.state === 'delivered').length;
    for (const fl of gc.fireflies) {
      if (fl.state === 'following') {
        fl.state = 'delivered';
        fl.order = delivered++;
      }
    }
    owl.bounce = 1;
    audio.play('give');
    if (gc.fireflies.every((f) => f.state === 'delivered')) beginGiving(gc, owl);
    else showCaption(gc, TEXTS.fireflyHome, 3.5);
  }
}
