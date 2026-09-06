import { chapterOfLevel } from '../levels';
import { captionText } from '../textOverrides';
import { voice } from '../voice';
import type { GameCtx } from './context';

// Turn to the chapter's title page: a calm black screen with the chapter
// name, read aloud — like a parent turning the page of a picture book.
// The level itself loads when the card is done (updateChapterCard).
export function enterChapterCard(gc: GameCtx): void {
  gc.state = 'CHAPTER_CARD';
  gc.stateT = 0;
  gc.fade = 1;
  gc.caption = null; // the title is drawn big in the middle, not as a subtitle
  const { slot, shown } = captionText(chapterOfLevel(gc.levelIndex).title);
  voice.speak(shown, slot);
}
