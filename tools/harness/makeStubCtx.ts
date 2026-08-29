// A 2D context stand-in: every method is a no-op, every property sticks.
export function makeStubCtx(): CanvasRenderingContext2D {
  const grad = { addColorStop() { /* no-op */ } };
  return new Proxy({} as Record<string, unknown>, {
    get(t, p: string) {
      if (p in t) return t[p];
      if (p === 'createLinearGradient' || p === 'createRadialGradient') return () => grad;
      if (p === 'measureText') return () => ({ width: 100 });
      return () => undefined;
    },
    set(t, p: string, v) {
      t[p] = v;
      return true;
    },
  }) as unknown as CanvasRenderingContext2D;
}
