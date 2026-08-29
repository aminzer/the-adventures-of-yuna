// Validates The Adventures of Yuna level maps against the gentleness rules.
import { LEVELS } from '../src/levels';

let ok = true;
const fail = (msg: string): void => {
  ok = false;
  console.log(`FAIL: ${msg}`);
};

for (const L of LEVELS) {
  const map = L.map;
  const rows = map.length;
  const cols = map[0].length;
  const counts: Record<'P' | 'F' | 'I', number> = { P: 0, F: 0, I: 0 };

  map.forEach((row, r) => {
    if (row.length !== cols) fail(`${L.name} row ${r}: length ${row.length} != ${cols}`);
    for (const ch of row) if (ch in counts) counts[ch as keyof typeof counts]++;
  });
  if (counts.P !== 1) fail(`${L.name}: expected 1 P, got ${counts.P}`);
  if (counts.F < 1) fail(`${L.name}: expected at least 1 F, got ${counts.F}`);
  const bellCount = map.flatMap((r) => [...r]).filter((ch) => ch === 'B').length;
  if (L.deed === 'fetch') {
    if (counts.I !== counts.F) fail(`${L.name}: fetch level needs one I per F (${counts.I} I vs ${counts.F} F)`);
    if (!L.item) fail(`${L.name}: fetch level needs an item kind`);
  } else {
    if (counts.I !== 0) fail(`${L.name}: ${L.deed} level must have no I, got ${counts.I}`);
    if (!L.bubble) fail(`${L.name}: ${L.deed} level needs a bubble icon`);
  }
  if (L.deed === 'song') {
    if (!L.melody || L.melody.length === 0) fail(`${L.name}: song level needs a melody`);
    for (const m of L.melody ?? []) {
      if (m >= bellCount) fail(`${L.name}: melody references bell ${m} but there are only ${bellCount} bells`);
    }
  } else if (bellCount > 0) {
    fail(`${L.name}: only song levels may have bells`);
  }

  const solid = (c: number, r: number): boolean =>
    r >= 0 && r < rows && c >= 0 && c < cols && (map[r][c] === '#' || map[r][c] === '=');

  // ground gaps <= 3 wide (check the top ground row);
  // chase levels must have none at all — the pup only knows how to run
  const groundRow = rows - 3;
  let gap = 0;
  let gapCount = 0;
  for (let c = 0; c < cols; c++) {
    if (!solid(c, groundRow)) gap++;
    else {
      if (gap > 0) gapCount++;
      if (gap > 3) fail(`${L.name}: ground gap of ${gap} tiles ending at col ${c}`);
      gap = 0;
    }
  }
  if (L.deed === 'chase' && gapCount > 0) fail(`${L.name}: chase levels must have no gaps`);

  // every platform must be reachable: some other standable surface within
  // jump range (<= 3 tiles up, <= 6 tiles horizontally)
  const standable: Array<[number, number]> = []; // air cell you can stand IN (above a solid)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (solid(c, r) && !solid(c, r - 1)) standable.push([c, r - 1]);
    }
  }

  // group contiguous standable cells at the same height into runs (one platform)
  // — skipped on wings and underwater levels, where any height is reachable
  const hasWings = map.some((row) => row.includes('W')) || L.water !== undefined;
  interface Run { r: number; c0: number; c1: number }
  const runs: Run[] = [];
  for (const [c, r] of standable.slice().sort((a, b) => a[1] - b[1] || a[0] - b[0])) {
    const run = runs.find((x) => x.r === r && c === x.c1 + 1);
    if (run) run.c1 = c;
    else runs.push({ r, c0: c, c1: c });
  }
  for (const run of runs) {
    if (hasWings) break;
    if (run.r === groundRow - 1) continue; // ground level is always fine
    const reachable = standable.some(
      ([c2, r2]) => r2 > run.r && r2 - run.r <= 3 && c2 >= run.c0 - 6 && c2 <= run.c1 + 6,
    );
    if (!reachable) fail(`${L.name}: platform at cols ${run.c0}-${run.c1}, row ${run.r} may be unreachable`);
  }

  // no low platform (< 4 tiles clearance) may overhang a gap's jump runway
  // (the 2 columns either side of a gap plus the gap itself) — head-bonk trap
  gap = 0;
  for (let c = 0; c <= cols; c++) {
    const open = c < cols && !solid(c, groundRow);
    if (open) gap++;
    else {
      if (gap > 0) {
        for (let cc = c - gap - 2; cc <= c + 1; cc++) {
          for (let r = groundRow - 4; r < groundRow; r++) {
            if (r >= 0 && solid(cc, r)) {
              fail(`${L.name}: platform at col ${cc}, row ${r} overhangs the gap runway ending at col ${c}`);
            }
          }
        }
      }
      gap = 0;
    }
  }

  // items/friends/bells/stars must sit in air, most standing on ground
  map.forEach((row, r) => {
    for (let c = 0; c < cols; c++) {
      const ch = row[c];
      if ('PFI*B'.includes(ch)) {
        if (solid(c, r)) fail(`${L.name}: ${ch} at ${c},${r} is inside a solid tile`);
        if (ch !== '*' && !solid(c, r + 1)) fail(`${L.name}: ${ch} at col ${c}, row ${r} is not standing on ground`);
      }
    }
  });

  const starCount = map.flatMap((r) => [...r]).filter((ch) => ch === '*').length;
  console.log(`${L.name} (${L.deed}): ${counts.P}P ${counts.F}F ${counts.I}I, ${starCount} stars — checked`);
}

console.log(ok ? 'ALL LEVELS OK' : 'PROBLEMS FOUND');
process.exit(ok ? 0 : 1);
