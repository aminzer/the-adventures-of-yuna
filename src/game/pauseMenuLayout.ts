import { C } from '../config';

// Geometry of the pause menu, shared by its renderer and its mouse hit-test.
export const PAUSE = {
  PANEL: { w: 420, h: 250 },
  BTN: { w: 340, h: 58, gap: 18 },
  FIRST_Y: C.VIEW_H / 2 - 10, // centre of the first button
};
export const PAUSE_ITEMS = 2; // «Продолжить», «В главное меню»

export const pauseButtonY = (i: number): number => PAUSE.FIRST_Y + i * (PAUSE.BTN.h + PAUSE.BTN.gap);

// Index of the button under the pointer (game coordinates), or null.
export function pauseHit(mx: number, my: number): number | null {
  for (let i = 0; i < PAUSE_ITEMS; i++) {
    if (Math.abs(mx - C.VIEW_W / 2) <= PAUSE.BTN.w / 2 && Math.abs(my - pauseButtonY(i)) <= PAUSE.BTN.h / 2) return i;
  }
  return null;
}
