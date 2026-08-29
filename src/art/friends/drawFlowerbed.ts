import type { Ctx, FriendPose } from '../types';
import { circle, ellipse } from '../shapes';

// A bed of three flowers: drooping and thirsty when sad, blooming when happy.
export function drawFlowerbed(g: Ctx, o: FriendPose): void {
  g.save();
  const t = o.t;
  const bounce = 1 + Math.min(o.hop, 10) * 0.012;
  g.scale(1, bounce);
  const cols = ['#ff8ab0', '#ffd23e', '#b795ff'];
  for (let i = -1; i <= 1; i++) {
    const x = i * 15;
    const sway = Math.sin(t * 1.4 + i) * (o.happy ? 2.5 : 0.8);
    g.strokeStyle = '#4f9e51';
    g.lineWidth = 2.5;
    g.lineCap = 'round';
    if (o.happy) {
      // upright, open, gently swaying
      const hy = -26 - Math.abs(i) * -4 - (i === 0 ? 6 : 0);
      g.beginPath();
      g.moveTo(x, 0);
      g.quadraticCurveTo(x + sway, hy / 2, x + sway, hy);
      g.stroke();
      g.fillStyle = cols[i + 1];
      for (let p = 0; p < 6; p++) {
        g.save();
        g.translate(x + sway, hy);
        g.rotate((p / 6) * Math.PI * 2 + t * 0.3);
        ellipse(g, 0, -5.5, 3, 5);
        g.fill();
        g.restore();
      }
      g.fillStyle = '#fff3c4';
      circle(g, x + sway, hy, 3.8);
      g.fill();
      // tiny happy face
      g.strokeStyle = '#8a6d3a';
      g.lineWidth = 0.9;
      g.beginPath();
      g.arc(x + sway, hy + 0.5, 1.6, Math.PI * 0.15, Math.PI * 0.85);
      g.stroke();
    } else {
      // drooping: stem arcs over, head hangs down
      const dir = i === 0 ? 1 : i;
      g.beginPath();
      g.moveTo(x, 0);
      g.quadraticCurveTo(x + sway, -20, x + dir * 9 + sway, -12);
      g.stroke();
      // closed dull head, pointing at the ground
      g.fillStyle = '#c9a0b4';
      g.save();
      g.translate(x + dir * 9 + sway, -10);
      for (let p = -1; p <= 1; p++) {
        ellipse(g, p * 2.4, 3, 2, 4.6, p * 0.25);
        g.fill();
      }
      g.restore();
    }
    // leaf
    g.fillStyle = '#7cc860';
    ellipse(g, x + 5, -6, 4, 1.8, -0.5);
    g.fill();
  }
  g.restore();
}
