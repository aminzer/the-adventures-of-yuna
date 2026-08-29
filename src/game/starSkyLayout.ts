// Where the collected stars shine in the finale's night sky: a jittered
// grid — even coverage of the whole sky at any count, but never stiff rows.
// Deterministic (no per-frame randomness), so the stars can be counted.

export const STAR_SKY = { x: 28, w: 904, y: 24, h: 272 } as const;

function jitter(i: number, salt: number): number {
  const h = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return h - Math.floor(h);
}

export function starSkyLayout(n: number): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  if (n <= 0) return out;
  const cols = Math.max(1, Math.round(Math.sqrt((n * STAR_SKY.w) / STAR_SKY.h)));
  const rows = Math.max(1, Math.ceil(n / cols));
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / cols);
    const inRow = row === rows - 1 ? n - row * cols : cols; // spread the last row too
    const col = i - row * cols;
    const x = STAR_SKY.x + ((col + 0.2 + 0.6 * jitter(i, 1)) * STAR_SKY.w) / inRow;
    const y = STAR_SKY.y + ((row + 0.2 + 0.6 * jitter(i, 2)) * STAR_SKY.h) / rows;
    out.push([x, y]);
  }
  return out;
}
