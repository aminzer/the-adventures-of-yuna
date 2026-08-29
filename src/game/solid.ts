import type { GameCtx } from './context';

export function solid(gc: GameCtx, col: number, row: number): boolean {
  if (col < 0 || col >= gc.gridCols) return true; // level edges are walls
  if (row < 0 || row >= gc.gridRows) return false; // open sky above, open pit below
  return gc.grid[row * gc.gridCols + col] > 0;
}
