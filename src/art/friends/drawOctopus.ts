import type { Ctx, FriendPose } from '../types';
import { circle, ellipse } from '../shapes';
import { drawFace } from './drawFace';

// A round little octopus. Sad = tentacles hanging limp; happy = they dance.
export function drawOctopus(g: Ctx, o: FriendPose): void {
  g.save();
  g.translate(0, -o.hop);
  const t = o.t;

  // tentacles
  g.strokeStyle = '#b06cb8';
  g.lineWidth = 5.5;
  g.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    const x = -15 + i * 6;
    const sway = o.happy
      ? Math.sin(t * 6 + i * 1.1) * 6
      : Math.sin(t * 1.2 + i) * 1.5;
    const lift = o.happy ? Math.abs(Math.sin(t * 6 + i)) * 6 : 0;
    g.beginPath();
    g.moveTo(x, -18);
    g.quadraticCurveTo(x + sway * 0.4, -8, x + sway, -2 - lift);
    g.stroke();
  }

  // head
  g.fillStyle = '#c78ac2';
  g.strokeStyle = '#a266a0';
  g.lineWidth = 1.6;
  ellipse(g, 0, -26, 16, 14);
  g.fill();
  g.stroke();
  // lighter face patch
  g.fillStyle = '#e3b5de';
  ellipse(g, 0, -22, 10, 7);
  g.fill();
  // little head spots
  g.fillStyle = 'rgba(162,102,160,0.55)';
  circle(g, -8, -34, 1.8);
  g.fill();
  circle(g, 1, -37, 1.6);
  g.fill();
  circle(g, 9, -33, 1.8);
  g.fill();

  drawFace(g, o, -5, -24, 5, -24, 0, -18.5);
  g.restore();
}
