// Minimal DOM stubs so the real game code can run under Node.
import { makeStubCtx } from './makeStubCtx';
import type { Listener, SetupOptions, StubDom } from './types';

export function setupDom(opts: SetupOptions = {}): StubDom {
  const listeners: Record<string, Listener[]> = {};
  const on = (ev: string, fn: Listener): void => {
    (listeners[ev] ??= []).push(fn);
  };

  const canvas = (opts.canvas ?? {
    getContext: () => makeStubCtx(),
    width: 960,
    height: 540,
  }) as Record<string, unknown>;
  canvas.style = canvas.style ?? {};
  canvas.addEventListener = on;
  canvas.getBoundingClientRect = () => ({ left: 0, top: 0 });

  const g = globalThis as Record<string, unknown>;
  g.window = g;
  g.addEventListener = on;
  g.removeEventListener = () => undefined;
  g.document = {
    getElementById: () => canvas,
    createElement: opts.createCanvas ?? (() => ({ getContext: () => makeStubCtx() })),
    addEventListener: on,
    hidden: false,
  };
  g.innerWidth = 990; // ~1:1 logical scale
  g.innerHeight = 560;
  g.devicePixelRatio = 1;
  // align the game's clock with the stub rAF timestamps (in a browser both
  // share a timebase; under Node performance.now() is process uptime)
  g.performance = { now: () => 0 };

  let rafCb: ((t: number) => void) | null = null;
  g.requestAnimationFrame = (cb: (t: number) => void) => {
    rafCb = cb;
    return 0;
  };

  return {
    canvas: canvas as unknown as HTMLCanvasElement,
    listeners,
    tick(timeMs: number) {
      const cb = rafCb;
      rafCb = null;
      if (cb) cb(timeMs);
    },
  };
}
