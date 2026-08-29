import type { FriendKind } from '../../levels';
import type { Ctx, FriendPose } from '../types';
import { drawBunny } from './drawBunny';
import { drawBird } from './drawBird';
import { drawTurtle } from './drawTurtle';
import { drawFlowerbed } from './drawFlowerbed';
import { drawSquirrel } from './drawSquirrel';
import { drawOwl } from './drawOwl';
import { drawFox } from './drawFox';
import { drawBabystar } from './drawBabystar';
import { drawLark } from './drawLark';
import { drawOctopus } from './drawOctopus';
import { drawPuppy } from './drawPuppy';
import { drawMama } from './drawMama';

const FRIEND_DRAW: Record<FriendKind, (g: Ctx, o: FriendPose) => void> = {
  bunny: drawBunny,
  bird: drawBird,
  turtle: drawTurtle,
  flowerbed: drawFlowerbed,
  squirrel: drawSquirrel,
  owl: drawOwl,
  fox: drawFox,
  babystar: drawBabystar,
  lark: drawLark,
  octopus: drawOctopus,
  puppy: drawPuppy,
  mama: drawMama,
};

export function drawFriend(g: Ctx, kind: FriendKind, o: FriendPose): void {
  FRIEND_DRAW[kind](g, o);
}
