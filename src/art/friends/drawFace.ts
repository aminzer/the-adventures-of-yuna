import type { Ctx, FriendPose } from '../types';
import { circle } from '../shapes';

// Shared face: sad (down-turned) or happy (closed ∪ eyes + smile).
// eye2/mouth coords may be null for one-eyed profile friends.
export function drawFace(
  g: Ctx, o: FriendPose,
  ex1: number, ey1: number,
  ex2: number | null, ey2: number | null,
  mx: number | null, my: number | null,
): void {
  g.strokeStyle = '#4a3d3d';
  g.lineWidth = 1.6;
  g.lineCap = 'round';
  const eyes: Array<[number, number]> = [[ex1, ey1]];
  if (ex2 !== null && ey2 !== null) eyes.push([ex2, ey2]);
  const midX = eyes.length === 2 ? (ex1 + ex2!) / 2 : ex1 + 1;
  for (const [x, y] of eyes) {
    g.beginPath();
    if (o.happy) {
      g.arc(x, y + 1.2, 2.2, Math.PI * 1.15, Math.PI * 1.85); // ∪ happy closed eye
      g.stroke();
    } else {
      g.fillStyle = '#4a3d3d';
      circle(g, x, y, 1.8);
      g.fill();
      // sad little brow, raised toward the middle of the face
      const inner = x >= midX ? -1 : 1;
      g.beginPath();
      g.moveTo(x - inner * 2.5, y - 4);
      g.lineTo(x + inner * 2.2, y - 5.5);
      g.stroke();
    }
  }
  if (mx !== null && my !== null) {
    g.beginPath();
    if (o.happy) g.arc(mx, my - 1, 2.6, Math.PI * 0.15, Math.PI * 0.85);
    else g.arc(mx, my + 2.2, 2.4, Math.PI * 1.2, Math.PI * 1.8);
    g.stroke();
  }
}
