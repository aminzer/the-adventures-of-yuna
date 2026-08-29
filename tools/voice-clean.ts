// Noise cleaning for the actor's takes, with ffmpeg (the static binary from
// the `ffmpeg-static` dev dependency — nothing to install by hand).
//
// The chain, in order:
//   highpass/lowpass  — drop rumble below the voice and hiss above it
//   adeclick          — removes short impulsive clicks: lip smacks, tongue
//                       clicks, saliva pops (articulation artifacts)
//   afftdn            — FFT denoiser: learns the steady background (fan, hum,
//                       hiss) and subtracts ~12 dB of it
//   deesser           — softens harsh sibilants («с», «ш», «ц», «ч») without
//                       dulling the rest of the voice
//   loudnorm          — every take at the same loudness (-18 LUFS), peaks capped;
//                       done early so the thresholds below mean the same thing
//                       whatever microphone (and gain) the take came from
//   agate             — gentle gate: rustles between words fall to silence,
//                       speech (far above the threshold) passes untouched
//   silenceremove ×2  — trim the dead air before the first word and after the
//                       last (leaving a short natural pause on both sides)
//   aresample 48 kHz  — loudnorm works at 192 kHz internally; bring it back
// Tweak here; `npm run voice:clean -- --force` re-cleans every take.
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);

export const FILTER = [
  'highpass=f=80',
  'lowpass=f=12000',
  'adeclick=w=55:o=75:a=2:t=2:b=2:m=a',
  'afftdn=nr=12:nf=-40:tn=1',
  'deesser=i=0.4:m=0.5:f=0.5:s=o',
  'loudnorm=I=-18:TP=-1.5:LRA=11',
  'agate=threshold=0.008:ratio=2.5:attack=8:release=250:knee=4', // opens ≈ -42 dBFS
  'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.15',
  'areverse',
  'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.3',
  'areverse',
  'aresample=48000',
].join(',');

let ffmpegPath: string | null | undefined;

// Path to the ffmpeg binary, or null when the dependency is not installed.
export async function ffmpeg(): Promise<string | null> {
  if (ffmpegPath !== undefined) return ffmpegPath;
  try {
    const mod = (await import('ffmpeg-static')) as { default?: string | null };
    const p = typeof mod.default === 'string' ? mod.default : null;
    ffmpegPath = p && fs.existsSync(p) ? p : null;
  } catch {
    ffmpegPath = null;
  }
  return ffmpegPath;
}

// Cleaned file name for a raw take: «usb.webm» → «usb.clean.webm»
export function cleanName(file: string): string {
  const ext = path.extname(file);
  return `${file.slice(0, -ext.length)}.clean${ext || '.webm'}`;
}

// Write the cleaned version of `input` to `output` (Opus in WebM, mono, 64 kbps).
export async function cleanTake(input: string, output: string): Promise<void> {
  const bin = await ffmpeg();
  if (!bin) throw new Error('ffmpeg not available — run `npm install` (ffmpeg-static)');
  fs.mkdirSync(path.dirname(output), { recursive: true });
  const tmp = `${output}.tmp.webm`;
  await run(bin, ['-y', '-hide_banner', '-loglevel', 'error', '-i', input, '-af', FILTER, '-c:a', 'libopus', '-b:a', '64k', '-ar', '48000', '-ac', '1', '-f', 'webm', tmp], {
    windowsHide: true,
  });
  fs.renameSync(tmp, output);
}

export interface AudioStats {
  seconds: number;
  meanDb: number; // average level (volumedetect mean_volume)
  maxDb: number; // peak level
  floorDb: number; // level of the quietest 0.3 s window ≈ background noise
}

// Quick measurements for before/after comparisons in the CLI.
export async function probe(file: string): Promise<AudioStats> {
  const bin = await ffmpeg();
  if (!bin) throw new Error('ffmpeg not available');
  const { stderr } = await run(bin, ['-hide_banner', '-i', file, '-af', 'volumedetect,astats=metadata=1:reset=0.3,ametadata=print:key=lavfi.astats.Overall.RMS_level', '-f', 'null', '-'], {
    windowsHide: true,
    maxBuffer: 16 * 1024 * 1024,
  });
  const num = (re: RegExp): number => Number(re.exec(stderr)?.[1] ?? NaN);
  const times = [...stderr.matchAll(/time=(\d+):(\d+):([\d.]+)/g)];
  const last = times[times.length - 1];
  const seconds = last ? Number(last[1]) * 3600 + Number(last[2]) * 60 + Number(last[3]) : NaN;
  const rms = [...stderr.matchAll(/lavfi\.astats\.Overall\.RMS_level=(-?[\d.]+|-inf)/g)].map((m) => (m[1] === '-inf' ? -99 : Number(m[1])));
  return { seconds, meanDb: num(/mean_volume: (-?[\d.]+) dB/), maxDb: num(/max_volume: (-?[\d.]+) dB/), floorDb: rms.length ? Math.min(...rms) : NaN };
}
