import { C } from '../config';
import { LEVELS } from '../levels';
import { audio } from '../audio';
import { ASK_HELP, TEXTS } from '../texts';
import { voice } from '../voice';
import { BELL_COLORS, BELL_NOTES } from './constants';
import type { GameCtx } from './context';
import type { Bell } from './types';
import { beginGiving } from './beginGiving';
import { showCaption } from './showCaption';
import { dist, playerCX, playerCY } from './utils';

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
// the child watches the note itself travel from the singer to the flower.
function launchNote(gc: GameCtx, larkX: number, larkY: number, bell: Bell): void {
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

// The lark starts singing the note Yuna has to answer (after `delay`).
function singCurrent(gc: GameCtx, delay: number): void {
  gc.songPhase = 'sing';
  gc.songDemo = { delay, step: 0 };
}

// Song levels — a duet. The lark has forgotten its song, so they rebuild it
// together, one note at a time: the lark sings a note onto a bell-flower,
// Yuna answers by jumping on that same bell, and the lark sings the next.
// A wrong bell is just another note (the lark patiently sings its note
// again); after the last answer the whole song plays through — and is
// remembered. Nothing can be lost.
export function updateSong(gc: GameCtx, dt: number, landed: boolean): void {
  const level = LEVELS[gc.levelIndex];
  const melody = level.melody!;
  const lark = gc.friends[0];
  const player = gc.player;
  const demo = gc.songDemo;

  if (lark && !lark.satisfied) {
    const current = gc.bells[melody[Math.min(gc.songPos, melody.length - 1)]];

    if (gc.songPhase === 'intro') {
      // meeting the lark: it asks for the duet, and sings once it has finished asking
      if (!lark.asked && dist(playerCX(player), playerCY(player), lark.x, lark.y - 24) < C.ASK_RADIUS) {
        lark.asked = true;
        lark.bounce = 1;
        audio.play('hint');
        const plea = ASK_HELP[lark.kind];
        if (plea) showCaption(gc, plea, 8);
      }
      if (lark.asked && gc.pleaDone) singCurrent(gc, 0.8);
    } else if (gc.songPhase === 'sing') {
      demo.delay -= dt;
      if (demo.delay <= 0) {
        if (demo.step === 0) {
          launchNote(gc, lark.x, lark.y, current);
          demo.step = 1;
          demo.delay = C.DEMO_NOTE_GAP;
        } else {
          ringBell(gc, current); // the flying note lands
          gc.songPhase = 'answer';
          gc.songDemo = { delay: C.DUET_REMIND, step: -1 };
          if (gc.songPos === 0 && !gc.songHinted) {
            gc.songHinted = true;
            showCaption(gc, TEXTS.yourTurn, 3.5);
          }
        }
      }
    } else if (gc.songPhase === 'answer') {
      // the bell to answer on keeps a soft glow until Yuna rings it
      current.lit = Math.max(current.lit, 0.35 + Math.sin(gc.globalT * 5) * 0.12);
      demo.delay -= dt;
      if (demo.delay <= 0) singCurrent(gc, 0.2); // a gentle reminder: the note once more
    } else if (gc.songPhase === 'encore') {
      // the whole song, lark and bells together, then the happy ending
      demo.delay -= dt;
      if (demo.delay <= 0) {
        const k = demo.step;
        if (k > 0) ringBell(gc, gc.bells[melody[k - 1]]);
        if (k < melody.length) {
          launchNote(gc, lark.x, lark.y, gc.bells[melody[k]]);
          demo.step++;
          demo.delay = C.DEMO_NOTE_GAP * 0.8;
        } else {
          gc.songDemo = { delay: 0, step: -1 };
          beginGiving(gc, lark);
        }
      }
    }
  }

  // Yuna lands on a bell → it rings (a toy forever, an answer during the duet)
  if (!landed) return;
  for (const bell of gc.bells) {
    if (Math.abs(playerCX(player) - bell.x) < C.BELL_RADIUS && Math.abs(player.y + player.h - bell.y) < 56) {
      ringBell(gc, bell);
      if (lark && !lark.satisfied && gc.songPhase === 'answer') {
        if (bell.idx === melody[gc.songPos]) {
          gc.songPos++;
          lark.bounce = 1;
          if (gc.songPos >= melody.length) {
            gc.songPhase = 'encore';
            gc.songDemo = { delay: 1, step: 0 };
            showCaption(gc, TEXTS.duetDone, 4);
          } else {
            singCurrent(gc, 0.6);
          }
        } else {
          singCurrent(gc, 1); // not that one — the lark simply sings its note again
          if (!voice.isSpeaking()) showCaption(gc, TEXTS.wrongNote, 2.2);
        }
      }
      break;
    }
  }
}
