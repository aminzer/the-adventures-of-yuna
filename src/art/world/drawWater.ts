import type { Ctx } from '../types';

// The sea: a translucent blue veil below the waterline with a wavy,
// sparkling surface. Drawn in world coordinates over the world layer,
// so the storm's grey veil dims it too — the blue returns with the bloom.
export function drawWater(g: Ctx, waterY: number, levelW: number, levelH: number, t: number): void {
  const grad = g.createLinearGradient(0, waterY, 0, levelH);
  grad.addColorStop(0, 'rgba(90,160,230,0.22)');
  grad.addColorStop(1, 'rgba(25,70,160,0.5)');
  g.fillStyle = grad;
  g.fillRect(0, waterY, levelW, levelH - waterY);

  // wavy surface line
  g.strokeStyle = 'rgba(255,255,255,0.55)';
  g.lineWidth = 3;
  g.beginPath();
  for (let x = 0; x <= levelW; x += 12) {
    const y = waterY + Math.sin(x * 0.045 + t * 2.2) * 2.5;
    if (x === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.stroke();
}
