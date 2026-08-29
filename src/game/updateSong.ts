import { C } from '../config';
import { LEVELS } from '../levels';
import { audio } from '../audio';
import { TEXTS } from '../texts';
import { BELL_COLORS, BELL_NOTES } from './constants';
import type { GameCtx } from './context';
import type { Bell } from './types';
import { beginGiving } from './beginGiving';
import { showCaption } from './showCaption';
import { playerCX } from './utils';

function ringBell(gc: GameCtx, bell: Bell): void {
  bell.lit = 1;
  audio.playNote(BELL_NOTES[bell.idx]);
  gc.particles.push({
    kind: 'noteP',
    color: BELL_COLORS[bell.idx],
    x: bell.x + (Math.random() - 0.5) * 10,
    y: bell.y - 44,
    vx: (Math.random() - 0.5) * 20,
    vy: -55,
    life: 1.4,
    t: 0,
  });
}

// A colored note takes flight from the lark's beak toward its bell —
// the child watches the song itself travel from the singer to the flowers.
function launchDemoNote(gc: GameCtx, larkX: number, larkY: number, bell: Bell): void {
  const fromX = larkX + 8;
  const fromY = larkY - 34;
  const toX = bell.x;
  const toY = bell.y - 44;
  gc.particles.push({
    kind: 'noteP',
    color: BELL_COLORS[bell.idx],
    x: fromX,
    y: fromY,
    vx: (toX - fromX) / C.DEMO_NOTE_GAP,
    vy: (toY - fromY) / C.DEMO_NOTE_GAP,
    life: C.DEMO_NOTE_GAP,
    t: 0,
  });
}

// Song levels: the lark sings a short melody on the bell-flowers; Yuna
// jumps on the bells in the same order to give the song back.
export function updateSong(gc: GameCtx, dt: number, landed: boolean): void {
  const level = LEVELS[gc.levelIndex];
  const melody = level.melody!;
  const lark = gc.friends[0];
  const player = gc.player;

  // the lark sings the demo: each note flies from its beak to a bell,
  // and the bell rings the moment the note lands
  if (lark && !lark.satisfied) {
    const demo = gc.songDemo;
    demo.delay -= dt;
    if (demo.step < 0 && demo.delay <= 0) {
      demo.step = 0;
      demo.delay = 0;
      showCaption(gc, TEXTS.listen, 1.6);
    }
    if (demo.step >= 0 && demo.delay <= 0) {
      const k = demo.step;
      if (k > 0) ringBell(gc, gc.bells[melody[k - 1]]); // the flying note lands
      if (k < melody.length) {
        launchDemoNote(gc, lark.x, lark.y, gc.bells[melody[k]]);
        demo.delay = C.DEMO_NOTE_GAP;
        demo.step++;
      } else {
        demo.step = -1;
        demo.delay = C.DEMO_REPEAT;
        showCaption(gc, TEXTS.yourTurn, 3);
      }
    }
  }

  // Yuna lands on a bell → it rings (a toy forever, a puzzle until solved)
  if (!landed) return;
  for (const bell of gc.bells) {
    if (Math.abs(playerCX(player) - bell.x) < C.BELL_RADIUS && Math.abs(player.y + player.h - bell.y) < 56) {
      ringBell(gc, bell);
      if (lark && !lark.satisfied) {
        if (bell.idx === melody[gc.songPos]) {
          gc.songPos++;
          if (gc.songPos >= melody.length) beginGiving(gc, lark);
        } else if (bell.idx === melody[0]) {
          gc.songPos = 1; // starting over from the first note is never wrong
        } else {
          gc.songPos = 0;
          gc.songDemo = { delay: 1.4, step: -1 };
          audio.play('boing');
          showCaption(gc, TEXTS.wrongNote, 2.2);
        }
      }
      break;
    }
  }
}
