import { C } from '../config';
import type { FriendKind } from '../levels';

// How high above a friend's feet its thought bubble floats (per body shape).
export const BUBBLE_H: Record<FriendKind, number> = {
  bunny: 88,
  bird: 66,
  turtle: 60,
  flowerbed: 68,
  squirrel: 82,
  owl: 100,
  fox: 78,
  babystar: 72,
  lark: 62,
  octopus: 78,
  puppy: 70,
  mama: 108,
};

export const SPEAKER = { x: 960 - 56, y: 14, w: 40, h: 40 };

// Bell-flowers (song levels): pentatonic notes, one rainbow color each.
export const BELL_NOTES = [523, 587, 659, 784, 880];
export const BELL_COLORS = C.RAINBOW.slice(0, 5);
