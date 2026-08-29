// Color helpers for the storm's grey: mixing a color toward its own
// luminance grey approximates what the desaturation veil does, letting the
// background be muted directly (so the rainbow can live BEHIND it in color).

export function greyMix(r: number, g: number, b: number, amt: number): [number, number, number] {
  const l = 0.299 * r + 0.587 * g + 0.114 * b;
  return [
    Math.round(r + (l - r) * amt),
    Math.round(g + (l - g) * amt),
    Math.round(b + (l - b) * amt),
  ];
}

export function hexMix(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = greyMix((n >> 16) & 255, (n >> 8) & 255, n & 255, amt);
  return `rgb(${r},${g},${b})`;
}
