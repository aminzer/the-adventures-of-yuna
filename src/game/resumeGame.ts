import { audio } from '../audio';
import type { GameCtx } from './context';

// Back from the pause menu to exactly where the game was.
export function resumeGame(gc: GameCtx): void {
  gc.state = gc.pausePrevState;
  gc.jumpBuf = 0; // nothing pressed in the menu may replay as a jump
  gc.anyKeyPressed = false; // …or skip a celebration
  audio.duckMusic(false);
}
