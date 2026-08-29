// Cleans every raw recording (voice-takes/<key>.webm) of background noise,
// sibilance and mouth clicks, writing the result the game plays to
// public/voice-actor/<key>.webm. Incremental: lines whose clean clip is newer
// than the raw take are skipped unless --force is given.
//
//   npm run voice:clean
//   npm run voice:clean -- --force     (after changing FILTER in voice-clean.ts)
import fs from 'node:fs';
import path from 'node:path';
import { cleanTake, ffmpeg, probe } from './voice-clean';
import { ACTOR_DIR, RAW_DIR, actorClips, importLegacyClips, rawClips, removeClip, writeManifest } from './voice-store';

const force = process.argv.includes('--force');
if (!(await ffmpeg())) {
  console.error('ffmpeg not available — run `npm install` (ffmpeg-static)');
  process.exit(1);
}

importLegacyClips();
const clean = actorClips();
let done = 0;
const fmt = (n: number): string => (Number.isFinite(n) ? n.toFixed(1).padStart(6) : '     ?');
console.log('key       len before→after   noise floor before→after   peak');
for (const [key, file] of Object.entries(rawClips())) {
  const raw = path.join(RAW_DIR, file);
  const out = path.join(ACTOR_DIR, `${key}.webm`);
  if (!force && clean[key] && fs.statSync(path.join(ACTOR_DIR, clean[key])).mtimeMs >= fs.statSync(raw).mtimeMs) continue;
  removeClip(ACTOR_DIR, key);
  await cleanTake(raw, out);
  done++;
  const [a, b] = await Promise.all([probe(raw), probe(out)]);
  console.log(`${key}  ${fmt(a.seconds)}s →${fmt(b.seconds)}s   ${fmt(a.floorDb)} →${fmt(b.floorDb)} dB   ${fmt(b.maxDb)} dB`);
}
writeManifest();
console.log(`\n${done} recording(s) cleaned → public/voice-actor/`);
