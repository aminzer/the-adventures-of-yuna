import { C } from '../config';
import type { Bell, Bloom, Butterfly, Caption, Decor, Friend, GameState, Item, Player, Particle, Star, Wings } from './types';

// All mutable game state, shared by every update/render function.
export interface GameCtx {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  scaleX: number;
  scaleY: number;
  cssScale: number;
  /** Does this browser support the 'saturation' composite (the grey-world trick)? */
  saturationOK: boolean;

  // input
  keys: Record<string, boolean | undefined>;
  jumpBuf: number;
  anyKeyPressed: boolean;
  anyKeyFrame: boolean;

  // flow
  state: GameState;
  stateT: number;
  fade: number; // 0 = clear, 1 = black
  afterFade: 'PLAYING' | 'NEXT_LEVEL' | 'FINALE';
  levelIndex: number;
  colorsRestored: number;
  totalStars: number;
  globalT: number;
  idleT: number;

  // per-level world
  grid: Uint8Array;
  gridCols: number;
  gridRows: number;
  levelW: number;
  levelH: number;
  friends: Friend[];
  givingFriend: Friend | null;
  items: Item[];
  stars: Star[];
  decor: Decor[];
  particles: Particle[];
  desat: number;
  bloom: Bloom | null;
  camX: number;
  camY: number;
  hintCooldown: number;
  butterfly: Butterfly | null;
  finaleT: number;
  wings: Wings | null;
  player: Player;

  // song levels
  bells: Bell[];
  songPos: number;
  songDemo: { delay: number; step: number }; // step -1 = not singing right now

  // subtitles
  caption: Caption | null;

  // 0 = the landscape rainbow rests hazy and quiet; 1 = fully vivid
  // (eases up for the bloom celebration and back down afterwards)
  rainbowGlow: number;

  // the newest stripe sweeps along the arc left-to-right as it is earned
  // (0 → 1 right after each bloom; 1 = fully drawn)
  stripeFill: number;

  // the tutorial's step-by-step lessons
  introStep: number;
  introT: number;

  // one-time gentle warnings
  airWarned: boolean;
  wingsTiredShown: boolean;
  prevHeadUnder: boolean;

  // offscreen buffers: the world layer is desaturated on its own layer so the
  // rainbow can live behind the hills and still keep its color
  off: Layer | null;
  mask: Layer | null;
}

export interface Layer {
  cv: HTMLCanvasElement;
  g: CanvasRenderingContext2D;
}

export function createGameCtx(canvas: HTMLCanvasElement): GameCtx {
  const saturationOK = (() => {
    const c = document.createElement('canvas');
    const g = c.getContext('2d')!;
    g.globalCompositeOperation = 'saturation';
    return (g.globalCompositeOperation as string) === 'saturation';
  })();

  return {
    canvas,
    ctx: canvas.getContext('2d')!,
    scaleX: 1,
    scaleY: 1,
    cssScale: 1,
    saturationOK,

    keys: {},
    jumpBuf: 0,
    anyKeyPressed: false,
    anyKeyFrame: false,

    state: 'FADE_IN',
    stateT: 0,
    fade: 1,
    afterFade: 'PLAYING',
    levelIndex: 0,
    colorsRestored: 0,
    totalStars: 0,
    globalT: 0,
    idleT: 0,

    grid: new Uint8Array(0),
    gridCols: 0,
    gridRows: 0,
    levelW: 0,
    levelH: 0,
    friends: [],
    givingFriend: null,
    items: [],
    stars: [],
    decor: [],
    particles: [],
    desat: 1,
    bloom: null,
    camX: 0,
    camY: 0,
    hintCooldown: 0,
    butterfly: null,
    finaleT: 0,
    wings: null,
    player: {
      x: 0, y: 0, vx: 0, vy: 0,
      w: C.PLAYER_W, h: C.PLAYER_H,
      facing: 1, onGround: false, coyote: 0,
      hasWings: false, flyCharge: 1, air: 1, bubbleLift: null,
      carrying: null, rescue: null,
      safeX: 0, safeY: 0,
      blinkT: 2, blink: 0, walkAmt: 0,
    },

    bells: [],
    songPos: 0,
    songDemo: { delay: 1.2, step: -1 },

    caption: null,

    rainbowGlow: 0,
    stripeFill: 1,

    introStep: 0,
    introT: 0,

    airWarned: false,
    wingsTiredShown: false,
    prevHeadUnder: false,

    off: null,
    mask: null,
  };
}
