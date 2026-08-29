import { audio } from '../audio';
import type { GameCtx } from './context';

// Satisfied friends bounce with joy, whatever else is happening.
export function updateFriendHops(gc: GameCtx, dt: number): void {
  for (const f of gc.friends) {
    if (!f.satisfied) continue;
    f.hopV += 900 * dt;
    f.hop -= f.hopV * dt;
    if (f.hop <= 0) {
      f.hop = 0;
      f.hopV = -160 - Math.random() * 80;
      if (gc.state === 'LEVEL_DONE') audio.play('hop');
    }
  }
}
