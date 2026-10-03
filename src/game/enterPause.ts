import { audio } from '../audio';
import { voice } from '../voice';
import type { GameCtx } from './context';

// Esc during play: freeze the world under a soft curtain and offer
// «Продолжить» / «В главное меню». Nothing is lost — the level waits.
export function enterPause(gc: GameCtx): void {
  gc.pausePrevState = gc.state;
  gc.state = 'PAUSED';
  gc.pauseIndex = 0;
  gc.pauseT = 0;
  audio.duckMusic(true);
  voice.cancelSpeech(); // the level's narration pauses with the level
}
