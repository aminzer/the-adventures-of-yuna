import { audio } from '../audio';
import type { GameCtx } from './context';
import type { Friend } from './types';
import { playerCX } from './utils';

// Works with or without an item: fetch deeds arc the item over; dwell deeds
// (wake the owl, hug the fox) are the same warm beat with no object at all.
export function beginGiving(gc: GameCtx, f: Friend): void {
  const player = gc.player;
  gc.state = 'GIVING';
  gc.stateT = 0;
  gc.givingFriend = f;
  const it = player.carrying;
  if (it) {
    it.state = 'tween';
    it.sx = it.x;
    it.sy = it.y;
    it.owner = f;
    player.carrying = null;
  }
  player.vx = 0;
  player.facing = f.x > playerCX(player) ? 1 : -1;
  audio.play('give');
}
