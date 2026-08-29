import { audio } from '../audio';
import type { GameCtx } from './context';
import type { Friend } from './types';
import { lunaCX } from './utils';

// Works with or without an item: fetch deeds arc the item over; dwell deeds
// (wake the owl, hug the fox) are the same warm beat with no object at all.
export function beginGiving(gc: GameCtx, f: Friend): void {
  const luna = gc.luna;
  gc.state = 'GIVING';
  gc.stateT = 0;
  gc.givingFriend = f;
  const it = luna.carrying;
  if (it) {
    it.state = 'tween';
    it.sx = it.x;
    it.sy = it.y;
    it.owner = f;
    luna.carrying = null;
  }
  luna.vx = 0;
  luna.facing = f.x > lunaCX(luna) ? 1 : -1;
  audio.play('give');
}
