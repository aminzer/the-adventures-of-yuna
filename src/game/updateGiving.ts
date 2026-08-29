import { C } from '../config';
import { LEVELS } from '../levels';
import { audio } from '../audio';
import { satisfiedText } from '../texts';
import type { GameCtx } from './context';
import { settlePlayer } from './settlePlayer';
import { showCaption } from './showCaption';
import { easeOutCubic } from './utils';

export function updateGiving(gc: GameCtx, dt: number): void {
  gc.stateT += dt;
  settlePlayer(gc, dt);
  const p = Math.min(1, gc.stateT / C.GIVE_TIME);
  const f = gc.givingFriend!;
  const it = gc.items.find((i) => i.state === 'tween');
  if (it) {
    const e = easeOutCubic(p);
    const tx = f.x;
    const ty = f.y - 30;
    const mx = (it.sx! + tx) / 2;
    const my = Math.min(it.sy!, ty) - 70;
    const u = 1 - e;
    it.x = u * u * it.sx! + 2 * u * e * mx + e * e * tx;
    it.y = u * u * it.sy! + 2 * u * e * my + e * e * ty;
  }
  if (p >= 1) {
    if (it) it.state = 'given';
    f.satisfied = true;
    f.hopV = -180;
    showCaption(gc, satisfiedText(LEVELS[gc.levelIndex], f.kind), 3);
    for (let i = 0; i < 10; i++) {
      gc.particles.push({
        kind: 'heart',
        x: f.x + (Math.random() - 0.5) * 40,
        y: f.y - 30 - Math.random() * 20,
        vx: (Math.random() - 0.5) * 50,
        vy: -40 - Math.random() * 50,
        life: 1.6,
        t: 0,
      });
    }
    if (gc.friends.every((fr) => fr.satisfied)) {
      // the last kind deed of the level brings the color back
      gc.state = 'BLOOMING';
      gc.stateT = 0;
      gc.bloom = { x: f.x, y: f.y - 20, r: 0 };
      audio.play('bloom');
    } else {
      // more friends still waiting — celebrate softly and play on
      gc.state = 'PLAYING';
      gc.stateT = 0;
      audio.play('star');
    }
  }
}
