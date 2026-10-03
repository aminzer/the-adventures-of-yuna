import { C } from '../config';
import { CHAPTERS } from '../levels';

// Geometry of the chapter menu, shared by its renderer and its mouse hit-test.
export const MENU = {
  CARD_W: 232,
  CARD_H: 250,
  GAP: 46,
  CY: 262, // card centre line
  ARROW_PAD: 44, // the ←/→ hints sit this far outside the row
  PILL: { x: C.VIEW_W / 2 - 110, y: 440, w: 220, h: 40 }, // «Пробел — играть»
};

export const menuRowWidth = (): number => CHAPTERS.length * MENU.CARD_W + (CHAPTERS.length - 1) * MENU.GAP;

export const menuCardX = (i: number): number => (C.VIEW_W - menuRowWidth()) / 2 + MENU.CARD_W / 2 + i * (MENU.CARD_W + MENU.GAP);

export type MenuHit = { kind: 'card'; index: number } | { kind: 'pill' } | { kind: 'arrow'; dir: 1 | -1 } | null;

// What is under the pointer (in game coordinates).
export function menuHit(mx: number, my: number): MenuHit {
  for (let i = 0; i < CHAPTERS.length; i++) {
    const cx = menuCardX(i);
    if (Math.abs(mx - cx) <= MENU.CARD_W / 2 && Math.abs(my - MENU.CY) <= MENU.CARD_H / 2) return { kind: 'card', index: i };
  }
  const p = MENU.PILL;
  if (mx >= p.x && mx <= p.x + p.w && my >= p.y - 6 && my <= p.y + p.h + 6) return { kind: 'pill' };
  const left = (C.VIEW_W - menuRowWidth()) / 2 - MENU.ARROW_PAD;
  const right = (C.VIEW_W + menuRowWidth()) / 2 + MENU.ARROW_PAD;
  if (Math.abs(my - MENU.CY) < 40) {
    if (Math.abs(mx - left) < 30) return { kind: 'arrow', dir: -1 };
    if (Math.abs(mx - right) < 30) return { kind: 'arrow', dir: 1 };
  }
  return null;
}
