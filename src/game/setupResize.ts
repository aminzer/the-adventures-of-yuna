import { C } from '../config';
import type { GameCtx } from './context';

export function setupResize(gc: GameCtx): void {
  function resize(): void {
    const dpr = window.devicePixelRatio || 1;
    gc.cssScale = Math.min(window.innerWidth / C.VIEW_W, window.innerHeight / C.VIEW_H) * 0.97;
    const cssW = Math.floor(C.VIEW_W * gc.cssScale);
    const cssH = Math.floor(C.VIEW_H * gc.cssScale);
    gc.canvas.style.width = `${cssW}px`;
    gc.canvas.style.height = `${cssH}px`;
    gc.canvas.width = Math.round(cssW * dpr);
    gc.canvas.height = Math.round(cssH * dpr);
    gc.scaleX = gc.canvas.width / C.VIEW_W;
    gc.scaleY = gc.canvas.height / C.VIEW_H;
  }
  window.addEventListener('resize', resize);
  resize();
}
