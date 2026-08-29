import { C } from '../config';
import * as art from '../art';
import type { GameCtx } from './context';

// The background — sky, sun, the RAINBOW (part of the landscape, rising from
// behind the hills), then the hills in front of it. The storm mutes these
// colors directly, so the restored rainbow stripes stay vivid behind the
// grey world; during the bloom, the circle of returning color re-paints the
// background inside it too.
function paint(gc: GameCtx, mute: number): void {
  const ctx = gc.ctx;
  const sky = ctx.createLinearGradient(0, 0, 0, C.VIEW_H);
  sky.addColorStop(0, art.hexMix('#9fd9f0', mute));
  sky.addColorStop(1, art.hexMix('#e8f7fb', mute));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, C.VIEW_W, C.VIEW_H);

  ctx.save();
  ctx.translate(820, 92);
  art.drawSun(ctx, gc.globalT, mute);
  ctx.restore();

  // when flying high (tall sky levels), the horizon sinks away
  const sink = gc.state === 'FINALE' ? 0 : Math.max(0, gc.levelH - C.VIEW_H - gc.camY) * 0.35;

  // the rainbow lives BEHIND the hills — a distant part of the landscape,
  // hazy and quiet in normal play, fully vivid for the bloom celebration
  // (the finale draws its own huge celebratory arch instead)
  if (gc.state !== 'FINALE') {
    art.drawRainbow(ctx, gc.colorsRestored, C.VIEW_W, false, sink, 1 - gc.rainbowGlow, gc.stripeFill);
  }

  art.drawHills(ctx, gc.camX * 0.25, 330 + sink, 40, art.hexMix('#b6dfae', mute), C.VIEW_W, C.VIEW_H);
  art.drawHills(ctx, gc.camX * 0.5 + 400, 400 + sink * 1.4, 34, art.hexMix('#93cf8d', mute), C.VIEW_W, C.VIEW_H);
}

export function renderSkyAndHills(gc: GameCtx): void {
  const mute = gc.state === 'FINALE' ? 0 : gc.desat * C.DESAT_ALPHA;
  paint(gc, mute);
  // the growing circle of returning color re-colors the background too
  if (gc.bloom && gc.bloom.r > 0 && mute > 0) {
    const ctx = gc.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.arc(gc.bloom.x - gc.camX, gc.bloom.y - gc.camY, gc.bloom.r, 0, Math.PI * 2);
    ctx.clip();
    paint(gc, 0);
    ctx.restore();
  }
}
