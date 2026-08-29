// Renders real frames of The Adventures of Yuna to PNG files using node-canvas.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas } from 'canvas';
import { LEVELS } from '../src/levels';
import { startGame } from '../src/game';
import { setupDom, makeBot } from './harness';

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'shots');
fs.mkdirSync(OUT, { recursive: true });

const real = createCanvas(960, 540);
const dom = setupDom({
  canvas: real,
  createCanvas: () => createCanvas(8, 8),
});
const debug = startGame(dom.canvas);
const bot = makeBot(debug, dom.listeners);

let simT = 0;

function snap(name: string): void {
  fs.writeFileSync(path.join(OUT, `${name}.png`), real.toBuffer('image/png'));
  console.log(`saved ${name}.png at t=${simT.toFixed(1)}s, state=${debug.state()}`);
}

let bloomFrames = 0;
let finaleFrames = 0;
const levelStartT: Record<number, number> = {};
const inLevel = (i: number, after: number): boolean =>
  debug.levelIndex() === i && debug.state() === 'PLAYING' && i in levelStartT && simT > levelStartT[i] + after;

const wanted: Record<string, () => boolean> = {
  '00-intro': () => inLevel(0, 1.0),
  '01-grey-world': () => inLevel(1, 1.5),
  '02-carrying': () => debug.levelIndex() === 1 && !!debug.luna.carrying,
  '03-giving': () => debug.levelIndex() === 1 && debug.state() === 'GIVING',
  '04-blooming': () => {
    if (debug.levelIndex() !== 1 || debug.state() !== 'BLOOMING') return false;
    bloomFrames++;
    return bloomFrames > 60;
  },
  '05-level-done': () => debug.levelIndex() === 1 && debug.state() === 'LEVEL_DONE',
  '06-level2-bird': () => inLevel(2, 1.5),
  '07-level4-flowerbed': () => inLevel(4, 1.5),
  '08-level5-squirrels': () => inLevel(5, 1.5),
  '09-level6-owl': () => inLevel(6, 1.0),
  '10-level7-fox-hug': () => debug.levelIndex() === 7 && debug.state() === 'GIVING',
  '11-level8-wings': () => debug.levelIndex() === 8 && !!debug.wings() && !debug.wings()!.taken && inLevel(8, 1.2),
  '12-level8-flying': () =>
    debug.levelIndex() === 8 && debug.luna.hasWings && !debug.luna.onGround && debug.luna.y < 500 && debug.state() === 'PLAYING',
  '13-level9-song': () => inLevel(9, 1.8),
  '14-level10-water': () => debug.levelIndex() === 10 && debug.state() === 'PLAYING' && debug.luna.y > 240,
  '15-level11-chase': () => inLevel(11, 1.2),
  '16-finale': () => {
    if (debug.state() !== 'FINALE') return false;
    finaleFrames++;
    return finaleFrames > 90;
  },
};
const taken = new Set<string>();

let now = 0;
for (let f = 0; f < 60 * 60 * 15 && taken.size < Object.keys(wanted).length; f++) {
  now += 1000 / 60;
  simT = now / 1000;
  if (f % 3 === 0) bot.think(simT);
  dom.tick(now);
  if (!(debug.levelIndex() in levelStartT)) levelStartT[debug.levelIndex()] = simT;
  for (const [name, cond] of Object.entries(wanted)) {
    if (!taken.has(name) && cond()) {
      taken.add(name);
      snap(name);
      break;
    }
  }
}
console.log(`done: ${taken.size}/${Object.keys(wanted).length} shots (levels: ${LEVELS.length})`);
