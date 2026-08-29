import { audio } from '../audio';
import { TEXTS } from '../texts';
import type { GameCtx } from './context';
import { showCaption } from './showCaption';

export function startRescue(gc: GameCtx): void {
  const player = gc.player;
  const sy = Math.min(player.y, gc.levelH + 60);
  player.rescue = { t: 0, sx: player.x, sy, tx: player.safeX, ty: player.safeY - 6 };
  player.vx = 0;
  player.vy = 0;
  audio.play('cloud');
  showCaption(gc, TEXTS.rescue, 2.2);
}
