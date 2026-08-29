import type { GameCtx } from './context';
import { playerCX } from './utils';

export function updateCarried(gc: GameCtx): void {
  const player = gc.player;
  const it = player.carrying;
  if (!it) return;
  const tx = playerCX(player) - player.facing * 17;
  const ty = player.y - 28 + Math.sin(gc.globalT * 4) * 3;
  it.x += (tx - it.x) * 0.18;
  it.y += (ty - it.y) * 0.18;
}
