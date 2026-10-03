import { C } from '../config';
import { LEVELS } from '../levels';
import { audio } from '../audio';
import { voice } from '../voice';
import { SPEAKER } from './constants';
import type { GameCtx } from './context';
import { jumpToLevel } from './jumpToLevel';
import { clickChapterMenu } from './clickChapterMenu';
import { menuHit } from './chapterMenuLayout';
import { clickPause } from './clickPause';
import { pauseHit } from './pauseMenuLayout';

export function setupInput(gc: GameCtx): void {
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'Escape'].includes(e.code)) {
      e.preventDefault();
    }
    audio.unlock();
    if (e.repeat) return;
    gc.keys[e.code] = true;
    gc.justPressed.add(e.code);
    // menus use Space/↑ too — those presses must not become a jump later
    const inMenu = gc.state === 'PAUSED' || gc.state === 'CHAPTER_MENU';
    if ((e.code === 'Space' || e.code === 'ArrowUp') && !inMenu) gc.jumpBuf = C.JUMP_BUFFER;
    if (e.code === 'KeyM') voice.setVoiceMuted(audio.toggleMute());
    if (e.code === 'KeyV') voice.toggleVoice(); // narrator on/off, music untouched
    // secret grown-up shortcut: hold Shift + L, then press the level key.
    // The number row in keyboard order: 1..9, then 0 = level 10, - = level 11.
    if (e.shiftKey && gc.keys.KeyL) {
      const LEVEL_KEYS: Record<string, number> = {
        Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3, Digit5: 4, Digit6: 5,
        Digit7: 6, Digit8: 7, Digit9: 8, Digit0: 9, Minus: 10, Equal: 11,
      };
      const idx = LEVEL_KEYS[e.code];
      if (idx !== undefined && idx < LEVELS.length) jumpToLevel(gc, idx);
    }
    gc.anyKeyPressed = true;
    gc.idleT = 0;
  });
  window.addEventListener('keyup', (e: KeyboardEvent) => {
    gc.keys[e.code] = false;
  });
  window.addEventListener('blur', () => {
    for (const k in gc.keys) gc.keys[k] = false;
    audio.suspend();
  });
  window.addEventListener('focus', () => audio.resume());
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) audio.suspend();
    else audio.resume();
  });

  gc.canvas.addEventListener('pointerdown', (e: PointerEvent) => {
    audio.unlock();
    const r = gc.canvas.getBoundingClientRect();
    const mx = (e.clientX - r.left) / gc.cssScale;
    const my = (e.clientY - r.top) / gc.cssScale;
    if (mx >= SPEAKER.x && mx <= SPEAKER.x + SPEAKER.w && my >= SPEAKER.y && my <= SPEAKER.y + SPEAKER.h) {
      voice.setVoiceMuted(audio.toggleMute());
      return;
    }
    clickChapterMenu(gc, mx, my); // chapter cards, the play pill and the side arrows are clickable
    clickPause(gc, mx, my);
  });
  // a pointer cursor over the clickable parts of the chapter menu
  gc.canvas.addEventListener('pointermove', (e: PointerEvent) => {
    const r = gc.canvas.getBoundingClientRect();
    const mx = (e.clientX - r.left) / gc.cssScale;
    const my = (e.clientY - r.top) / gc.cssScale;
    const overSpeaker = mx >= SPEAKER.x && mx <= SPEAKER.x + SPEAKER.w && my >= SPEAKER.y && my <= SPEAKER.y + SPEAKER.h;
    const overMenu = gc.state === 'CHAPTER_MENU' && !gc.menuChosen && menuHit(mx, my) !== null;
    const overPause = gc.state === 'PAUSED' && pauseHit(mx, my) !== null;
    gc.canvas.style.cursor = overSpeaker || overMenu || overPause ? 'pointer' : 'default';
  });
}
