import type { GameCtx } from './context';
import { lunaCX } from './utils';

export function updateCarried(gc: GameCtx): void {
  const luna = gc.luna;
  const it = luna.carrying;
  if (!it) return;
  const tx = lunaCX(luna) - luna.facing * 17;
  const ty = luna.y - 28 + Math.sin(gc.globalT * 4) * 3;
  it.x += (tx - it.x) * 0.18;
  it.y += (ty - it.y) * 0.18;
}
