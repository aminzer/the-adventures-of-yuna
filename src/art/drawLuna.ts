import type { Ctx, LunaPose } from './types';
import { circle, ellipse } from './shapes';
import { drawSparkle } from './drawSparkle';

const MANE = ['#ff9ab5', '#ffc98a', '#fff3a0', '#a5e6b0', '#9ecbff', '#d5a8ff'];

export function drawLuna(g: Ctx, o: LunaPose): void {
  g.save();
  if (o.facing < 0) g.scale(-1, 1);
  const t = o.t;
  const bob = o.onGround ? Math.abs(Math.sin(t * 9)) * o.walk * 2.5 : 0;
  const tilt = o.onGround ? 0 : Math.max(-0.16, Math.min(0.16, o.vy / 2600));
  g.rotate(tilt);
  g.translate(0, -bob);

  // magic wings — raised proudly above Luna's back (behind everything else).
  // Their golden edge fades as the flying sparkle runs low.
  if (o.wings) {
    const charge = o.wingCharge ?? 1;
    const flap = o.rising ? Math.sin(t * 18) * 0.5 : Math.sin(t * 4) * 0.15;
    for (const s of [-1, 1]) {
      // s = -1: far wing (smaller, peeking over the back), s = 1: near wing
      g.save();
      g.translate(s === -1 ? 5 : -2, -38);
      if (s === -1) {
        g.scale(0.8, 0.8);
        g.globalAlpha = 0.85;
      }
      g.fillStyle = s === -1 ? '#eeebff' : '#ffffff';
      g.strokeStyle = `rgba(240,180,60,${0.25 + 0.7 * charge})`;
      g.lineWidth = 1.8;
      for (let k = 0; k < 3; k++) {
        // feathers fan from straight-up to up-and-back
        const a = -1.72 - k * 0.32 + flap;
        g.save();
        g.rotate(a);
        ellipse(g, 15 + k * 2, 0, 15 + k * 2.5, 6 - k * 0.9);
        g.fill();
        g.stroke();
        g.restore();
      }
      g.restore();
    }
  }

  // rainbow tail
  g.lineCap = 'round';
  g.lineWidth = 4;
  for (let i = 0; i < 5; i++) {
    const sway = Math.sin(t * 2 + i * 0.7) * 4;
    g.strokeStyle = MANE[i];
    g.beginPath();
    g.moveTo(-16, -30 + i * 1.6);
    g.quadraticCurveTo(-29 + sway, -27 + i * 3, -26 + sway, -8 + i * 4);
    g.stroke();
  }

  // legs (thick soft lines with little hooves)
  const legs: Array<[number, number]> = [[-11, 0], [-5, Math.PI], [7, Math.PI], [13, 0]];
  for (const [lx, ph] of legs) {
    let sw = Math.sin(t * 10 + ph) * 7 * o.walk;
    if (o.swimming && !o.onGround) sw = Math.sin(t * 6 + ph) * 6; // gentle paddling
    else if (!o.onGround) sw = lx < 0 ? -4 : 5; // tucked in the air
    g.strokeStyle = '#f4e8f4';
    g.lineWidth = 7;
    g.beginPath();
    g.moveTo(lx, -24);
    g.lineTo(lx + sw * 0.7, -3);
    g.stroke();
    g.fillStyle = '#cbb3e0';
    circle(g, lx + sw * 0.7, -3, 3.4);
    g.fill();
  }

  // body
  g.fillStyle = '#ffffff';
  g.strokeStyle = '#e6d7ec';
  g.lineWidth = 1.5;
  ellipse(g, 1, -28, 19, 13);
  g.fill();
  g.stroke();

  // neck
  g.strokeStyle = '#ffffff';
  g.lineWidth = 12;
  g.beginPath();
  g.moveTo(10, -32);
  g.lineTo(16, -48);
  g.stroke();

  // head + muzzle
  g.fillStyle = '#ffffff';
  g.strokeStyle = '#e6d7ec';
  g.lineWidth = 1.5;
  circle(g, 18, -52, 9);
  g.fill();
  g.stroke();
  g.fillStyle = '#ffe9f0';
  ellipse(g, 25, -49, 5.5, 4.5);
  g.fill();
  g.fillStyle = '#d9a8b8';
  circle(g, 27, -49, 0.9);
  g.fill();

  // ear
  g.fillStyle = '#ffffff';
  g.beginPath();
  g.moveTo(11, -58);
  g.lineTo(13.5, -67);
  g.lineTo(17, -58.5);
  g.closePath();
  g.fill();
  g.stroke();

  // golden horn with a tiny sparkle
  const horn = g.createLinearGradient(19, -60, 26, -74);
  horn.addColorStop(0, '#ffd977');
  horn.addColorStop(1, '#ffaf3d');
  g.fillStyle = horn;
  g.beginPath();
  g.moveTo(17.5, -59);
  g.lineTo(26, -75);
  g.lineTo(22.5, -58);
  g.closePath();
  g.fill();
  const sp = 0.6 + 0.4 * Math.sin(t * 5);
  g.fillStyle = `rgba(255,255,255,${sp})`;
  drawSparkle(g, 27, -76, 3);

  // mane — a run of pastel puffs down the neck
  const manePts: Array<[number, number]> = [[14, -62], [10, -56], [7, -49], [4, -42], [2, -36]];
  manePts.forEach((p, i) => {
    g.fillStyle = MANE[i % MANE.length];
    circle(g, p[0], p[1], 4.6);
    g.fill();
  });

  // eye (blinks)
  if (o.blink > 0.5) {
    g.strokeStyle = '#5a4a5f';
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(18, -53);
    g.lineTo(22, -53);
    g.stroke();
  } else {
    g.fillStyle = '#4a3d50';
    circle(g, 20, -53, 2.6);
    g.fill();
    g.fillStyle = '#ffffff';
    circle(g, 21, -54, 1);
    g.fill();
  }

  // blush
  g.fillStyle = 'rgba(255,150,170,0.45)';
  circle(g, 15, -48, 2.2);
  g.fill();

  g.restore();
}
