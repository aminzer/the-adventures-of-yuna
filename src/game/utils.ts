import type { Luna } from './types';

export const lunaCX = (luna: Luna): number => luna.x + luna.w / 2;
export const lunaCY = (luna: Luna): number => luna.y + luna.h / 2;
export const dist = (x1: number, y1: number, x2: number, y2: number): number => Math.hypot(x2 - x1, y2 - y1);
export const easeOutCubic = (p: number): number => 1 - Math.pow(1 - p, 3);
