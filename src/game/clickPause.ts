import type { GameCtx } from './context';
import { pauseHit } from './pauseMenuLayout';
import { choosePauseItem, focusPauseItem } from './updatePause';

// Mouse / touch in the pause menu: a button both focuses and picks itself.
export function clickPause(gc: GameCtx, mx: number, my: number): void {
  if (gc.state !== 'PAUSED') return;
  const i = pauseHit(mx, my);
  if (i === null) return;
  focusPauseItem(gc, i);
  choosePauseItem(gc);
}
