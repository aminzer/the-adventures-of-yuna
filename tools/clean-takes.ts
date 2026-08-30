// Cleans every take (voice-takes/<key>/<id>.webm) of background noise,
// sibilance and mouth clicks, and refreshes the active clips the game plays
// (public/voice-actor/). Incremental: takes that already have a cleaned file
// are skipped unless --force is given.
//
//   npm run voice:clean
//   npm run voice:clean -- --force     (after changing FILTER in voice-clean.ts)
import fs from 'node:fs';
import path from 'node:path';
import { cleanTake, ffmpeg, probe, processedName } from './voice-clean';
import { TAKES_DIR, importLegacyClips, readTakes, syncActive, writeTakes } from './voice-store';

const force = process.argv.includes('--force');
if (!(await ffmpeg())) {
  console.error('ffmpeg not available — run `npm install` (ffmpeg-static)');
  process.exit(1);
}

const db = readTakes();
importLegacyClips(db);
let done = 0;
const fmt = (n: number): string => (Number.isFinite(n) ? n.toFixed(1).padStart(6) : '     ?');
console.log('key       take          len before→after   noise floor before→after   peak');
for (const [key, line] of Object.entries(db)) {
  for (const take of line.takes) {
    const raw = path.join(TAKES_DIR, key, take.file);
    if (!fs.existsSync(raw)) continue;
    const processed = processedName(take.file);
    const out = path.join(TAKES_DIR, key, processed);
    if (!force && take.processed === processed && fs.existsSync(out)) continue;
    await cleanTake(raw, out);
    take.processed = processed;
    done++;
    const [a, b] = await Promise.all([probe(raw), probe(out)]);
    console.log(`${key}  ${take.id.padEnd(12)}  ${fmt(a.seconds)}s →${fmt(b.seconds)}s   ${fmt(a.floorDb)} →${fmt(b.floorDb)} dB   ${fmt(b.maxDb)} dB`);
  }
}
writeTakes(db);
for (const key of Object.keys(db)) syncActive(key, db);
console.log(`\n${done} take(s) cleaned; active clips refreshed in public/voice-actor/`);
