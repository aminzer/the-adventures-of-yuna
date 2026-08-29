export type Ctx = CanvasRenderingContext2D;

export interface PlayerPose {
  t: number;
  walk: number; // 0..1
  facing: 1 | -1;
  onGround: boolean;
  vy: number;
  blink: number; // 0..1
  wings?: boolean; // magic wings earned this level
  rising?: boolean; // actively fluttering upward (fast flap)
  wingCharge?: number; // 0..1 — wings fade as their sparkle runs low
  swimming?: boolean; // paddling gently (underwater levels)
}

export interface FriendPose {
  t: number;
  happy: boolean;
  hop: number; // vertical offset in px
  facing?: 1 | -1; // friends that move around (the puppy) can turn
  singing?: boolean; // the lark mid-demo: beak open, head to the sky
}
