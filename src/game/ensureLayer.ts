import type { GameCtx, Layer } from './context';

// Lazily create (and keep sized to the canvas) an offscreen drawing layer.
export function ensureLayer(gc: GameCtx, key: 'off' | 'mask'): Layer {
  let layer = gc[key];
  if (!layer) {
    const cv = document.createElement('canvas');
    layer = { cv, g: cv.getContext('2d')! };
    gc[key] = layer;
  }
  if (layer.cv.width !== gc.canvas.width || layer.cv.height !== gc.canvas.height) {
    layer.cv.width = gc.canvas.width;
    layer.cv.height = gc.canvas.height;
  }
  return layer;
}
