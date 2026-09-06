import { C } from '../config';
import { CHAPTERS } from '../levels';
import { TEXTS } from '../texts';
import { audio } from '../audio';
import type { GameCtx } from './context';
import { finaleStarFlights } from './finaleStarFlight';
import { showCaption } from './showCaption';

// Each chapter closes with its own scene. The night scene (the whole game's
// finale) stays forever; the other scenes rest for a while and then turn the
// page to the next chapter — a key press turns it a little sooner.
export function updateFinale(gc: GameCtx, dt: number): void {
  const kind = CHAPTERS[gc.finaleChapter].finale;
  const prevT = gc.finaleT;
  gc.finaleT += dt;

  if (kind === 'night') {
    // the stars had their moment first — now the goodnight wish
    if (prevT < 7 && gc.finaleT >= 7 && gc.totalStars > 0) {
      showCaption(gc, TEXTS.goodnight, 30);
    }
    // flying stars leave a little sparkle trail on their way up
    for (const s of finaleStarFlights(gc.totalStars, gc.finaleT)) {
      if (s.p > 0 && s.p < 1 && Math.random() < dt * 10) {
        gc.particles.push({ kind: 'sparkle', x: s.x, y: s.y + 5, vx: 0, vy: 14, life: 0.5, t: 0 });
      }
    }
    if (Math.random() < dt * 4) {
      gc.particles.push({
        kind: 'sparkle',
        x: Math.random() * C.VIEW_W,
        y: 60 + Math.random() * 380,
        vx: 0,
        vy: -12,
        life: 1.2,
        t: 0,
      });
    }
  } else if (kind === 'rainbowParty' && prevT < 6.5 && gc.finaleT >= 6.5) {
    showCaption(gc, TEXTS.rainbowNext, 5);
  }

  if (Math.random() < dt * 3) {
    gc.particles.push({
      kind: 'heart',
      x: 150 + Math.random() * 660,
      y: 430 - Math.random() * 60,
      vx: (Math.random() - 0.5) * 25,
      vy: -35 - Math.random() * 25,
      life: 2.4,
      t: 0,
    });
  }

  if (kind !== 'night' && (gc.finaleT > C.CHAPTER_FINALE_TIME || (gc.anyKeyFrame && gc.finaleT > 4))) {
    gc.state = 'FADE_OUT';
    gc.stateT = 0;
    gc.afterFade = 'CHAPTER_CARD';
    audio.fadeMusicOut(C.FADE_TIME);
  }
}
