import type { FriendKind, ItemKind } from '../levels';

export type GameState = 'PLAYING' | 'GIVING' | 'BLOOMING' | 'LEVEL_DONE' | 'FADE_OUT' | 'FADE_IN' | 'FINALE';

export interface Friend {
  kind: FriendKind;
  x: number;
  y: number;
  satisfied: boolean;
  hop: number;
  hopV: number;
  bounce: number;
  dwellT: number;
  t: number;
  fleeing?: boolean; // chase levels: the pup is mid-scamper
  vy?: number; // chase levels: the pup really jumps and falls
  vx?: number; // chase levels: run momentum (it overshoots and skids)
  aimOffset?: number; // chase levels: where it THINKS Luna is going
  retargetIn?: number; // chase levels: seconds until its next guess
  pauseFor?: number; // chase levels: seconds of being adorably distracted
  upFor?: number; // chase levels: how long Luna has been up on a platform
}

export interface Bell {
  x: number;
  y: number;
  idx: number; // 0..n left to right — its note and color
  lit: number; // 1 → 0 while it is ringing
}

export interface Caption {
  text: string;
  t: number;
  dur: number;
}

export interface Item {
  kind: ItemKind;
  x: number;
  y: number;
  homeY: number;
  state: 'world' | 'carried' | 'tween' | 'given';
  t: number;
  sx?: number;
  sy?: number;
  owner?: Friend; // set when given, so it rests with the right friend
}

export interface Star {
  x: number;
  y: number;
  collected: boolean;
  t: number;
}

export interface Decor {
  kind: 'T' | 'f' | 'c' | 'b' | 's';
  x: number;
  y: number;
}

export interface Wings {
  x: number;
  y: number;
  taken: boolean;
}

export interface Particle {
  kind: 'heart' | 'sparkle' | 'zzz' | 'bubble' | 'noteP';
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  t: number;
  color?: string; // noteP: the bell color it came from
}

export interface Rescue {
  t: number;
  sx: number;
  sy: number;
  tx: number;
  ty: number;
}

export interface Luna {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  facing: 1 | -1;
  onGround: boolean;
  coyote: number;
  hasWings: boolean;
  flyCharge: number; // 0..1 — wing sparkle; drains while fluttering, refills at rest
  air: number; // 0..1 — breath under water
  bubbleLift: { t: number } | null; // the friendly bubble carrying Luna up for air
  carrying: Item | null;
  rescue: Rescue | null;
  safeX: number;
  safeY: number;
  blinkT: number;
  blink: number;
  walkAmt: number;
}

export interface Butterfly {
  ax: number;
  ay: number;
  t: number;
  alpha: number;
}

export interface Bloom {
  x: number;
  y: number;
  r: number;
}

/** Read-only view of the running game, used by the headless test tools. */
export interface GameDebug {
  luna: Luna;
  items: () => Item[];
  friends: () => Friend[];
  state: () => GameState;
  levelIndex: () => number;
  colorsRestored: () => number;
  totalStars: () => number;
  wings: () => Wings | null;
  bells: () => Bell[];
  songPos: () => number;
  /** Is the world tile at this pixel position solid? (for test-bot edge sense) */
  solidAt: (px: number, py: number) => boolean;
}
