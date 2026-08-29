import type { Ctx } from '../types';

export function drawCarrot(g: Ctx): void {
  g.fillStyle = '#f07b2e';
  g.strokeStyle = '#d15f18';
  g.lineWidth = 1.2;
  g.beginPath();
  g.moveTo(-6, -7);
  g.quadraticCurveTo(0, -11, 6, -7);
  g.quadraticCurveTo(3.5, 3, 0, 12);
  g.quadraticCurveTo(-3.5, 3, -6, -7);
  g.closePath();
  g.fill();
  g.stroke();
  g.strokeStyle = 'rgba(209,95,24,0.6)';
  g.beginPath();
  g.moveTo(-3.5, -3);
  g.lineTo(2.5, -4);
  g.moveTo(-2.5, 2);
  g.lineTo(2, 1);
  g.stroke();
  g.strokeStyle = '#4f9e51';
  g.lineWidth = 3;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(0, -9);
  g.lineTo(-4, -16);
  g.moveTo(0, -9);
  g.lineTo(0, -17);
  g.moveTo(0, -9);
  g.lineTo(4, -15);
  g.stroke();
}
