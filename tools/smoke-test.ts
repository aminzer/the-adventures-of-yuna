// Headless smoke test for The Adventures of Yuna.
// Stubs the DOM, loads the real game code, and lets a very simple
// "bot child" (walk toward the goal, hop now and then) try to finish all levels.

import { LEVELS } from '../src/levels';
import { startGame } from '../src/game';
import { setupDom, makeBot } from './harness';

const dom = setupDom();
const debug = startGame(dom.canvas);
const bot = makeBot(debug, dom.listeners);

const MAX_MINUTES = 15;
const FRAMES = MAX_MINUTES * 60 * 60;
let now = 0;
let simT = 0;
let done = false;
let lastState = '';
let lastLevel = -1;
const events: string[] = [];

try {
  for (let f = 0; f < FRAMES; f++) {
    now += 1000 / 60;
    simT = now / 1000;
    if (f % 3 === 0) bot.think(simT);
    dom.tick(now);

    if (debug.state() !== lastState || debug.levelIndex() !== lastLevel) {
      lastState = debug.state();
      lastLevel = debug.levelIndex();
      events.push(`${simT.toFixed(1)}s  level ${lastLevel} (${LEVELS[lastLevel].name})  ->  ${lastState}`);
    }
    if (debug.state() === 'FINALE') {
      done = true;
      break;
    }
  }
} catch (err) {
  console.log(`RUNTIME ERROR at t=${simT.toFixed(1)}s:`);
  console.log(err instanceof Error ? err.stack : String(err));
  process.exit(1);
}

console.log(events.join('\n'));
console.log(`colors restored: ${debug.colorsRestored()}`);
if (done) {
  console.log(`PASS — bot finished all ${LEVELS.length} levels and reached the finale in ${simT.toFixed(0)}s of play`);
} else {
  console.log(`FAIL — bot did not reach the finale within ${MAX_MINUTES} simulated minutes (stuck at level ${debug.levelIndex()}, state ${debug.state()})`);
  process.exit(1);
}
