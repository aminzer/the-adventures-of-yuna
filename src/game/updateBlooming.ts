import { C } from '../config';
import { LEVELS } from '../levels';
import { TEXTS } from '../texts';
import { audio } from '../audio';
import type { GameCtx } from './context';
import { settlePlayer } from './settlePlayer';
import { showCaption } from './showCaption';
import { easeOutCubic } from './utils';

export function updateBlooming(gc: GameCtx, dt: number): void {
  gc.stateT += dt;
  settlePlayer(gc, dt);
  const p = Math.min(1, gc.stateT / C.BLOOM_TIME);
  gc.bloom!.r = easeOutCubic(p) * 1900;
  // sparkles along the growing rim of color
  if (p < 1 && Math.random() < 0.6) {
    const a = Math.PI + Math.random() * Math.PI;
    const rim = Math.min(gc.bloom!.r, 500);
    gc.particles.push({
      kind: 'sparkle',
      x: gc.bloom!.x + Math.cos(a) * rim,
      y: Math.max(40, gc.bloom!.y + Math.sin(a) * rim),
      vx: 0,
      vy: -20,
      life: 0.8,
      t: 0,
    });
  }
  if (p >= 1) {
    gc.desat = 0;
    gc.bloom = null;
    if (!LEVELS[gc.levelIndex].practice) {
      gc.colorsRestored++;
      gc.stripeFill = 0; // the new stripe sweeps into the rainbow, left to right
      showCaption(gc, TEXTS.bloom, 3);
    }
    gc.state = 'LEVEL_DONE';
    gc.stateT = 0;
    // the melody bows out gently across the celebration, reaching silence
    // right at the switch to the next level
    audio.fadeMusicOut(C.LEVEL_DONE_TIME + C.FADE_TIME);
  }
}
