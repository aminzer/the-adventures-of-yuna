import * as art from '../art';
import type { GameCtx } from './context';

export function renderParticles(gc: GameCtx): void {
  const ctx = gc.ctx;
  for (const p of gc.particles) {
    const a = Math.max(0, 1 - p.t / p.life);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(p.x, p.y);
    if (p.kind === 'heart') {
      const s = 7 + Math.sin(p.t * 8) * 1;
      art.drawHeart(ctx, s, '#f0637f');
    } else if (p.kind === 'zzz') {
      ctx.strokeStyle = '#b8b2d8';
      art.drawZzz(ctx, 5 + p.t * 3);
    } else if (p.kind === 'bubble') {
      ctx.strokeStyle = 'rgba(235,248,255,0.9)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 2.5 + p.t * 2.5, 0, Math.PI * 2);
      ctx.stroke();
    } else if (p.kind === 'noteP') {
      ctx.save();
      ctx.rotate(Math.sin(p.t * 4) * 0.2);
      ctx.scale(0.9, 0.9);
      art.drawNote(ctx, p.color);
      ctx.restore();
    } else {
      ctx.fillStyle = '#fff2b0';
      art.drawSparkle(ctx, 0, 0, 4 + Math.sin(p.t * 12) * 1.5);
    }
    ctx.restore();
  }
}
