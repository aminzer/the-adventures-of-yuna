import type { BubbleIcon } from '../../levels';
import type { Ctx } from '../types';
import { drawHeart } from '../drawHeart';
import { drawCarrot } from './drawCarrot';
import { drawBerry } from './drawBerry';
import { drawFlower } from './drawFlower';
import { drawWateringCan } from './drawWateringCan';
import { drawAcorn } from './drawAcorn';
import { drawGlow } from './drawGlow';
import { drawNote } from './drawNote';
import { drawPearl } from './drawPearl';
import { drawBall } from './drawBall';

// Drawn centered on origin, roughly 26 px tall.
export function drawItem(g: Ctx, kind: BubbleIcon, s = 1): void {
  g.save();
  g.scale(s, s);
  if (kind === 'carrot') drawCarrot(g);
  else if (kind === 'berry') drawBerry(g);
  else if (kind === 'flower') drawFlower(g);
  else if (kind === 'wateringcan') drawWateringCan(g);
  else if (kind === 'acorn') drawAcorn(g);
  else if (kind === 'glow') drawGlow(g);
  else if (kind === 'note') drawNote(g);
  else if (kind === 'pearl') drawPearl(g);
  else if (kind === 'ball') drawBall(g);
  else drawHeart(g, 10, '#f0637f');
  g.restore();
}
