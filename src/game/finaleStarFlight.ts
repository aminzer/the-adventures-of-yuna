import { starSkyLayout } from './starSkyLayout';

// The collected stars' journey on the finale: they lift off from their
// familiar top-left HUD row and glide, one after another, along gentle
// arcs to their places in the night sky.
export interface StarFlight {
  x: number;
  y: number;
  p: number; // 0 = still in the HUD row, 1 = arrived in the sky
  size: number;
}

const LIFTOFF = 0; // the first star lifts off the moment the finale appears
const FLIGHT = 1.6; // seconds each star is in the air

export function finaleStarFlights(n: number, finaleT: number): StarFlight[] {
  const stagger = Math.min(0.15, 3 / Math.max(1, n)); // long tails lift off faster
  return starSkyLayout(n).map(([tx, ty], i) => {
    const hx = 28 + (i % 12) * 26; // its old spot in the HUD row
    const hy = 30 + Math.floor(i / 12) * 26;
    const p = Math.max(0, Math.min(1, (finaleT - LIFTOFF - i * stagger) / FLIGHT));
    const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; // easeInOutQuad
    // a gentle arc through a lifted midpoint
    const mx = (hx + tx) / 2;
    const my = Math.min(hy, ty) - 50 - (i % 4) * 15;
    const u = 1 - e;
    const x = u * u * hx + 2 * u * e * mx + e * e * tx;
    const y = u * u * hy + 2 * u * e * my + e * e * ty;
    const size = 8 + (6 + ((i * 7) % 5) - 8) * e;
    return { x, y, p, size };
  });
}
