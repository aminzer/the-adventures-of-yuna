import { TEXTS } from '../texts';
import type { GameCtx } from './context';
import { showCaption } from './showCaption';

// The tutorial's guided lessons: each hint appears once, when the previous
// skill is actually used (the level's story line already says how to walk).
// Control hints are never repeated — the author found that tiresome; only
// the "bring mama the flower" goal gets a gentle reminder.
export function updateIntro(gc: GameCtx, dt: number): void {
  const player = gc.player;
  gc.introT += dt;

  if (gc.introStep === 0) {
    if (Math.abs(player.vx) > 60) {
      gc.introStep = 1;
      gc.introT = 0;
      showCaption(gc, TEXTS.introJump, 6);
    }
  } else if (gc.introStep === 1) {
    if (!player.onGround) {
      gc.introStep = 2;
      gc.introT = 0;
      showCaption(gc, TEXTS.introGo, 6.5);
    }
  } else if (gc.introStep === 2 && gc.introT > 14 && !player.carrying) {
    // wandering for a while without the flower — a gentle reminder
    gc.introT = 0;
    showCaption(gc, TEXTS.introGo, 6);
  }
}
