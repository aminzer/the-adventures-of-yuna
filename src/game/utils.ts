import type { Player } from './types';

export const playerCX = (player: Player): number => player.x + player.w / 2;
export const playerCY = (player: Player): number => player.y + player.h / 2;
export const dist = (x1: number, y1: number, x2: number, y2: number): number => Math.hypot(x2 - x1, y2 - y1);
export const easeOutCubic = (p: number): number => 1 - Math.pow(1 - p, 3);
