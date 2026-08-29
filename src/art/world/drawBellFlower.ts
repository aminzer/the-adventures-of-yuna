import type { Ctx } from '../types';
import { circle } from '../shapes';

// A big bell-flower that plays a note when Yuna jumps on it.
// lit: 0..1 — how brightly it is ringing right now.
export function drawBellFlower(g: Ctx, color: string, t: number, lit: number): void {
  g.save();
  const sway = Math.sin(t * 1.3) * 2;
  const ring = lit > 0 ? Math.sin(lit * Math.PI) : 0;

  // glow while ringing
  if (ring > 0) {
    const halo = g.createRadialGradient(sway, -30, 4, sway, -30, 34);
    halo.addColorStop(0, `rgba(255,255,255,${0.45 * ring})`);
    halo.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = halo;
    circle(g, sway, -30, 34);
    g.fill();
  }

  // stem + leaves
  g.strokeStyle = '#4f9e51';
  g.lineWidth = 3;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(0, 0);
  g.quadraticCurveTo(sway * 0.5, -12, sway, -22);
  g.stroke();
  g.fillStyle = '#7cc860';
  g.beginPath();
  g.ellipse(-5, -6, 5, 2.2, -0.5, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.ellipse(5, -4, 5, 2.2, 0.5, 0, Math.PI * 2);
  g.fill();

  // the bell itself (rings wiggle it)
  g.save();
  g.translate(sway, -22);
  g.rotate(ring * Math.sin(t * 40) * 0.12);
  g.scale(1 + ring * 0.12, 1 + ring * 0.12);
  g.fillStyle = color;
  g.strokeStyle = 'rgba(0,0,0,0.18)';
  g.lineWidth = 1.4;
  g.beginPath();
  g.moveTo(-9, -14);
  g.quadraticCurveTo(0, -20, 9, -14);
  g.lineTo(11, 0);
  // scalloped rim
  g.quadraticCurveTo(8, -3, 5.5, 0);
  g.quadraticCurveTo(2.8, -3, 0, 0);
  g.quadraticCurveTo(-2.8, -3, -5.5, 0);
  g.quadraticCurveTo(-8, -3, -11, 0);
  g.closePath();
  g.fill();
  g.stroke();
  // highlight + clapper
  g.fillStyle = 'rgba(255,255,255,0.35)';
  g.beginPath();
  g.ellipse(-4, -9, 2.4, 5, 0.3, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#fff3c4';
  circle(g, 0, 1.5, 2.6);
  g.fill();
  g.restore();

  g.restore();
}
