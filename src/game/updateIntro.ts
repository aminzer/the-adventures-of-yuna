import { TEXTS } from '../texts';
import type { GameCtx } from './context';
import { showCaption } from './showCaption';

// The tutorial's guided lessons: each hint appears when the previous skill
// is actually used — and patiently repeats if the little player forgot it.
export function updateIntro(gc: GameCtx, dt: number): void {
  const luna = gc.luna;
  gc.introT += dt;

  if (gc.introStep === 0) {
    if (Math.abs(luna.vx) > 60) {
      gc.introStep = 1;
      gc.introT = 0;
      showCaption(gc, TEXTS.introJump, 6);
    } else if (gc.introT > 8) {
      gc.introT = 0;
      showCaption(gc, TEXTS.introWalk, 6);
    }
  } else if (gc.introStep === 1) {
    if (!luna.onGround) {
      gc.introStep = 2;
      gc.introT = 0;
      showCaption(gc, TEXTS.introGo, 6.5);
    } else if (gc.introT > 8) {
      gc.introT = 0;
      showCaption(gc, TEXTS.introJump, 6);
    }
  } else if (gc.introStep === 2 && gc.introT > 14 && !luna.carrying) {
    // wandering for a while without the flower — a gentle reminder
    gc.introT = 0;
    showCaption(gc, TEXTS.introGo, 6);
  }
}
