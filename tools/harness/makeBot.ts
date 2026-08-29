// A very simple "bot child" driver: walk toward the goal, hop now and then.
// If the dumb bot can finish a level, a 5-year-old has a fair chance.
import { LEVELS } from '../../src/levels';
import type { GameDebug } from '../../src/game';
import type { Listener } from './types';

export interface Bot {
  think: (simT: number) => void;
}

export function makeBot(debug: GameDebug, listeners: Record<string, Listener[]>): Bot {
  const down: Record<string, boolean> = {};
  let lastJump = 0;
  let nextHop = 0.7; // randomized so rescue loops can't phase-lock the bot
  let blockedN = 0; // consecutive ticks of "trying to rise but pinned under a cloud"
  let sideDir = 1;
  let sidestepUntil = 0;

  function setKey(code: string, want: boolean): void {
    if (want && !down[code]) {
      down[code] = true;
      for (const f of listeners.keydown ?? []) f({ code, preventDefault() { /* no-op */ }, repeat: false });
    } else if (!want && down[code]) {
      down[code] = false;
      for (const f of listeners.keyup ?? []) f({ code });
    }
  }

  return {
    think(simT: number) {
      const player = debug.player;

      // riding the rescue cloud or the breath bubble: sit calmly, and walk a
      // little before the next hop after landing (bouncing straight off the
      // drop point just repeats the same doomed arc forever)
      if (player.rescue || player.bubbleLift) {
        lastJump = simT;
        setKey('ArrowRight', false);
        setKey('ArrowLeft', false);
        setKey('Space', false);
        return;
      }

      const cx = player.x + 20;
      const level = LEVELS[debug.levelIndex()];

      // song levels: walk to the next bell of the melody and hop on it —
      // no random hopping on the way (a stray stomp is a wrong note)
      if (level.deed === 'song') {
        const singer = debug.friends()[0];
        if (singer && !singer.satisfied && level.melody) {
          const pos = Math.min(debug.songPos(), level.melody.length - 1);
          const bell = debug.bells()[level.melody[pos]];
          if (bell) {
            const dx = bell.x - cx;
            setKey('ArrowRight', dx > 8);
            setKey('ArrowLeft', dx < -8);
            if (Math.abs(dx) <= 8 && player.onGround && simT - lastJump > 0.6) {
              lastJump = simT;
              setKey('Space', true);
            }
            if (simT - lastJump > 0.35) setKey('Space', false);
            return;
          }
        }
      }

      const byDistance = <T extends { x: number }>(list: T[]): T | undefined =>
        list.slice().sort((a, b) => Math.abs(a.x - player.x) - Math.abs(b.x - player.x))[0];
      const item = byDistance(debug.items().filter((i) => i.state === 'world'));
      const friend = byDistance(debug.friends().filter((f) => !f.satisfied));
      const wings = debug.wings();
      let tx: number | null = null;
      let ty: number | null = null;
      if (wings && !wings.taken) { tx = wings.x; ty = wings.y; } // wings first — nothing else is reachable
      else if (player.carrying && friend) { tx = friend.x; ty = friend.y; }
      else if (item) { tx = item.x; ty = item.y; }
      else if (friend) { tx = friend.x; ty = friend.y; }
      if (tx === null) {
        setKey('ArrowRight', false);
        setKey('ArrowLeft', false);
        return;
      }

      // with magic wings, flying is easy: steer sideways, hold jump to rise
      // until level with the goal, release to float down onto it — but rest
      // on whatever you're standing on until the wing sparkle is back
      if (player.hasWings && ty !== null && ty < player.y + 60) {
        const wantRise = player.y + 22 > ty - 6;
        if (player.onGround && wantRise && player.flyCharge < 0.95) {
          // tired wings: stand still and let them re-shimmer
          setKey('ArrowRight', false);
          setKey('ArrowLeft', false);
          setKey('Space', false);
          return;
        }
        if (!player.onGround && player.flyCharge <= 0.03) {
          // out of sparkle mid-air: float down onto something, keep steering
          setKey('ArrowRight', tx > cx + 10);
          setKey('ArrowLeft', tx < cx - 10);
          setKey('Space', false);
          return;
        }
        // pinned under a cloud while trying to rise? sidestep around it
        if (simT < sidestepUntil) {
          setKey('ArrowRight', sideDir > 0);
          setKey('ArrowLeft', sideDir < 0);
          setKey('Space', true);
          return;
        }
        if (wantRise && !player.onGround && player.vy > -8) blockedN++;
        else blockedN = 0;
        if (blockedN > 7) {
          blockedN = 0;
          sideDir = -sideDir; // try the other way next time
          sidestepUntil = simT + 0.9;
        }
        setKey('ArrowRight', tx > cx + 10);
        setKey('ArrowLeft', tx < cx - 10);
        setKey('Space', wantRise);
        return;
      }

      // standing next to a friend is the goal itself (dwell deeds) — be still
      if (!item && friend && Math.abs(friend.x - cx) < 40 && Math.abs(friend.y - (player.y + 22)) < 60) {
        setKey('ArrowRight', false);
        setKey('ArrowLeft', false);
        setKey('Space', false);
        return;
      }

      // goal on a platform overhead AND nearby: hopping right underneath only
      // bonks the head — back off for a run-up, then jump while running in
      // from the side. (When the goal is still far away, fall through to
      // normal travel so edge sense keeps working on the way there.)
      if (ty !== null && ty < player.y - 40 && player.onGround && Math.abs(tx - cx) < 240) {
        const dx = tx - cx;
        const adx = Math.abs(dx);
        if (adx < 90) {
          // too far underneath — step away to make room
          setKey('ArrowLeft', dx > 0);
          setKey('ArrowRight', dx < 0);
          setKey('Space', false);
          return;
        }
        setKey('ArrowRight', dx > 0);
        setKey('ArrowLeft', dx < 0);
        if (adx <= 150 && simT - lastJump > 0.45) {
          lastJump = simT;
          setKey('Space', true);
        }
        if (simT - lastJump > 0.35) setKey('Space', false);
        return;
      }

      // the friend is waiting right below us (we're camped on a platform
      // above it) — step off the ledge instead of standing there forever
      if (!item && friend && player.onGround && friend.y > player.y + player.h + 40 && Math.abs(tx - cx) < 30) {
        setKey('ArrowRight', true);
        setKey('ArrowLeft', false);
        setKey('Space', false);
        return;
      }

      setKey('ArrowRight', tx > cx + 10);
      setKey('ArrowLeft', tx < cx - 10);

      // edge sense: a gap right ahead in the walking direction → jump NOW
      // (like a child learns: you jump when you reach the edge)
      const dir = tx > cx + 10 ? 1 : tx < cx - 10 ? -1 : 0;
      let mustJump = false;
      if (dir !== 0 && player.onGround) {
        const aheadX = dir > 0 ? player.x + player.w + 30 : player.x - 30;
        const feetY = player.y + player.h + 6;
        // no ground anywhere within 4 tiles below the path ahead = a real,
        // bottomless gap. (Stepping down from a platform onto lower ground
        // is safe to just walk off — don't panic-jump off platform edges.)
        mustJump = ![0, 48, 96, 144].some((dy) => debug.solidAt(aheadX, feetY + dy));
      }

      // otherwise hop occasionally, from the ground, at a randomized cadence
      // (not on chase levels — there are no gaps, and a stray hop onto a
      // platform just parks us out of the pup's reach)
      const noIdleHops = level.deed === 'chase';
      if (player.onGround && (mustJump || (!noIdleHops && simT - lastJump > nextHop))) {
        lastJump = simT;
        nextHop = 0.8 + Math.random() * 0.8;
        setKey('Space', true);
      }
      if (simT - lastJump > 0.35) setKey('Space', false);
    },
  };
}
