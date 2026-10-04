import { C } from '../config';
import { audio } from '../audio';
import type { GameCtx } from './context';
import { dist, playerCX, playerCY } from './utils';

// Leaf piles rustle when Yuna brushes through them — a few leaves fly up.
// The ones with an acorn underneath give it up through the normal pickup;
// the empty ones are simply fun to rummage in.
export function updatePiles(gc: GameCtx, dt: number): void {
  const px = playerCX(gc.player);
  const py = playerCY(gc.player);
  for (const pile of gc.piles) {
    pile.shake = Math.max(0, pile.shake - dt * 2.5);
    pile.cool = Math.max(0, pile.cool - dt);
    if (pile.cool <= 0 && dist(px, py, pile.x, pile.y - 14) < C.PICKUP_RADIUS) {
      pile.shake = 1;
      pile.cool = 1.4;
      audio.play('hint');
      for (let i = 0; i < 7; i++) {
        gc.particles.push({
          kind: 'leaf',
          x: pile.x + (Math.random() - 0.5) * 30,
          y: pile.y - 10 - Math.random() * 12,
          vx: (Math.random() - 0.5) * 120,
          vy: -90 - Math.random() * 80,
          life: 0.9 + Math.random() * 0.4,
          t: 0,
        });
      }
    }
  }
}
