import { C } from '../config';
import { TEXTS } from '../texts';
import { audio } from '../audio';
import type { GameCtx } from './context';
import { showCaption } from './showCaption';

export function updateFadeIn(gc: GameCtx, dt: number): void {
  gc.fade = Math.max(0, gc.fade - dt / C.FADE_TIME);
  if (gc.fade <= 0) {
    if (gc.afterFade === 'FINALE' && gc.state !== 'FINALE') {
      gc.state = 'FINALE';
      audio.fadeMusicIn(2); // the goodnight song rises with the night
      // the stars fly up right away — point at them first, thank Yuna after
      if (gc.totalStars > 0) showCaption(gc, TEXTS.finaleStars, 7);
      else showCaption(gc, TEXTS.finale, 30);
    } else if (gc.afterFade !== 'FINALE') {
      gc.state = 'PLAYING';
      audio.fadeMusicIn(1.6); // the new level's melody rises as it opens
    }
  }
}
