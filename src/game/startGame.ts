// The Adventures of Yuna — game bootstrap: wires input, runs the fixed-timestep
// loop over update/render, and returns the read-only debug handle.
// No enemies, no dying, no timers: the world always waits for the player.
import { C } from '../config';
import { createGameCtx } from './context';
import { setupResize } from './setupResize';
import { setupInput } from './setupInput';
import { enterChapterCard } from './enterChapterCard';
import { update } from './update';
import { render } from './render';
import { solid } from './solid';
import type { GameDebug } from './types';

export function startGame(canvas: HTMLCanvasElement): GameDebug {
  const gc = createGameCtx(canvas);
  setupResize(gc);
  setupInput(gc);

  let last = performance.now();
  let acc = 0;
  const STEP = 1 / 60;

  function frame(now: number): void {
    // clamp so tab-switches or long pauses never "catch up" — the world just waits
    acc += Math.min((now - last) / 1000, 0.1);
    last = now;
    while (acc >= STEP) {
      update(gc, STEP);
      acc -= STEP;
    }
    render(gc);
    requestAnimationFrame(frame);
  }

  // the game opens like a book — on the first chapter's title page
  gc.levelIndex = 0;
  enterChapterCard(gc);
  requestAnimationFrame(frame);

  // Read-only debug handle (used by the headless test tools; harmless in the browser).
  return {
    player: gc.player,
    items: () => gc.items,
    friends: () => gc.friends,
    state: () => gc.state,
    levelIndex: () => gc.levelIndex,
    colorsRestored: () => gc.colorsRestored,
    finaleChapter: () => gc.finaleChapter,
    totalStars: () => gc.totalStars,
    wings: () => gc.wings,
    bells: () => gc.bells,
    songPos: () => gc.songPos,
    solidAt: (px, py) => solid(gc, Math.floor(px / C.TILE), Math.floor(py / C.TILE)),
  };
}
