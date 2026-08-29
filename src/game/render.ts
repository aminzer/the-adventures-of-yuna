import { C } from '../config';
import type { GameCtx } from './context';
import { renderWorld } from './renderWorld';
import { renderFinale } from './renderFinale';
import { renderCaption } from './renderCaption';

export function render(gc: GameCtx): void {
  const ctx = gc.ctx;
  ctx.setTransform(gc.scaleX, 0, 0, gc.scaleY, 0, 0);
  if (gc.state === 'FINALE' || (gc.state === 'FADE_IN' && gc.afterFade === 'FINALE')) renderFinale(gc);
  else renderWorld(gc);

  // fade curtain
  if (gc.fade > 0) {
    ctx.fillStyle = `rgba(20, 18, 32, ${gc.fade})`;
    ctx.fillRect(0, 0, C.VIEW_W, C.VIEW_H);
  }

  // subtitles stay readable even through the fades
  renderCaption(gc);
}
