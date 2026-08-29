import { C } from '../config';
import { LEVELS } from '../levels';
import { audio } from '../audio';
import type { GameCtx } from './context';
import { showCaption } from './showCaption';

export function loadLevel(gc: GameCtx, i: number): void {
  const T = C.TILE;
  const L = LEVELS[i];
  const map = L.map;
  const player = gc.player;
  gc.gridRows = map.length;
  gc.gridCols = map[0].length;
  gc.levelW = gc.gridCols * T;
  gc.levelH = gc.gridRows * T;
  gc.grid = new Uint8Array(gc.gridRows * gc.gridCols);
  gc.friends = [];
  gc.givingFriend = null;
  gc.items = [];
  gc.stars = [];
  gc.decor = [];
  gc.particles = [];
  gc.bloom = null;
  gc.desat = 1;
  gc.hintCooldown = 0;
  gc.butterfly = null;
  gc.idleT = 0;
  gc.wings = null;
  gc.bells = [];
  gc.songPos = 0;
  gc.songDemo = { delay: 2.2, step: -1 };
  gc.airWarned = false;
  gc.wingsTiredShown = false;
  gc.prevHeadUnder = false;
  player.hasWings = false;
  player.flyCharge = 1;
  player.air = 1;
  player.bubbleLift = null;
  gc.introStep = 0;
  gc.introT = 0;
  if (L.practice) gc.desat = 0; // home is still sunny — the grey world waits
  showCaption(gc, L.story, 6.5);
  audio.setMood(L.music); // each level has its own melody, crossfaded in

  for (let r = 0; r < gc.gridRows; r++) {
    if (map[r].length !== gc.gridCols) console.warn(`Level ${L.name} row ${r} has wrong length`);
    for (let c = 0; c < gc.gridCols; c++) {
      const ch = map[r][c];
      const cx = c * T + T / 2;
      const cellBottom = (r + 1) * T;
      if (ch === '#') gc.grid[r * gc.gridCols + c] = 1;
      else if (ch === '=') gc.grid[r * gc.gridCols + c] = 2;
      else if (ch === 'P') {
        player.x = cx - player.w / 2;
        player.y = cellBottom - player.h;
        player.vx = 0;
        player.vy = 0;
        player.facing = 1;
        player.carrying = null;
        player.rescue = null;
        player.safeX = player.x;
        player.safeY = player.y;
      } else if (ch === 'F') {
        gc.friends.push({ kind: L.friend, x: cx, y: cellBottom, satisfied: false, hop: 0, hopV: 0, bounce: 0, dwellT: 0, t: Math.random() * 9 });
      } else if (ch === 'I' && L.item) {
        gc.items.push({ kind: L.item, x: cx, y: cellBottom - 20, homeY: cellBottom - 20, state: 'world', t: Math.random() * 9 });
      } else if (ch === '*') {
        gc.stars.push({ x: cx, y: r * T + T / 2, collected: false, t: Math.random() * 9 });
      } else if (ch === 'W') {
        gc.wings = { x: cx, y: cellBottom - 26, taken: false };
      } else if (ch === 'B') {
        gc.bells.push({ x: cx, y: cellBottom, idx: gc.bells.length, lit: 0 });
      } else if (ch === 'T' || ch === 'f' || ch === 'c' || ch === 'b' || ch === 's') {
        gc.decor.push({ kind: ch, x: cx, y: cellBottom });
      }
    }
  }
  gc.camX = Math.max(0, Math.min(player.x - C.VIEW_W * 0.4, gc.levelW - C.VIEW_W));
  gc.camY = Math.max(0, gc.levelH - C.VIEW_H);
}
