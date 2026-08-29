export type Listener = (e: unknown) => void;

export interface StubDom {
  canvas: HTMLCanvasElement;
  listeners: Record<string, Listener[]>;
  /** Fire the pending requestAnimationFrame callback. */
  tick: (timeMs: number) => void;
}

export interface SetupOptions {
  /** A real node-canvas element (for screenshot rendering). */
  canvas?: unknown;
  /** Factory for document.createElement('canvas') results. */
  createCanvas?: () => unknown;
}
