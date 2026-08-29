import { audio } from '../audio';
import { TEXTS } from '../texts';
import type { GameCtx } from './context';
import { showCaption } from './showCaption';

export function startRescue(gc: GameCtx): void {
  const luna = gc.luna;
  const sy = Math.min(luna.y, gc.levelH + 60);
  luna.rescue = { t: 0, sx: luna.x, sy, tx: luna.safeX, ty: luna.safeY - 6 };
  luna.vx = 0;
  luna.vy = 0;
  audio.play('cloud');
  showCaption(gc, TEXTS.rescue, 2.2);
}
