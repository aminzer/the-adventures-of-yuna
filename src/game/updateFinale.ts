import { C } from '../config';
import { TEXTS } from '../texts';
import type { GameCtx } from './context';
import { finaleStarFlights } from './finaleStarFlight';
import { showCaption } from './showCaption';

export function updateFinale(gc: GameCtx, dt: number): void {
  const prevT = gc.finaleT;
  gc.finaleT += dt;

  // the stars had their moment first — now the big thank-you
  if (prevT < 7 && gc.finaleT >= 7 && gc.totalStars > 0) {
    showCaption(gc, TEXTS.finale, 30);
  }

  // flying stars leave a little sparkle trail on their way up
  for (const s of finaleStarFlights(gc.totalStars, gc.finaleT)) {
    if (s.p > 0 && s.p < 1 && Math.random() < dt * 10) {
      gc.particles.push({ kind: 'sparkle', x: s.x, y: s.y + 5, vx: 0, vy: 14, life: 0.5, t: 0 });
    }
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
}
